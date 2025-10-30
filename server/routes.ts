import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-db";
import { insertCartItemSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import FlutterwaveService from "./services/flutterwave";
import CryptoService from "./services/crypto";

// Schema for crypto transaction verification
const verifyTransactionSchema = z.object({
  txHash: z.string().min(1, "Transaction hash is required"),
  crypto: z.enum(["bitcoin", "ethereum", "usdt"]),
  amount: z.string().or(z.number()).transform(Number),
  address: z.string().min(1, "Recipient address is required")
});

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    id: string;
  }
}

// Import webhook handlers for transaction confirmation
import { handleTransactionWebhook, monitorTransaction } from './webhooks';

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate session ID if not exists
  app.use((req, res, next) => {
    if (!req.session) {
      req.session = {} as any;
    }
    if (!req.session.id) {
      req.session.id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    next();
  });

  // Get all games
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  // Get game by slug
  app.get("/api/games/:slug", async (req, res) => {
    try {
      const game = await storage.getGameBySlug(req.params.slug);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Get cryptocurrency exchange rates
  app.get("/api/crypto-rates", async (req, res) => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,avalanche-2&vs_currencies=usd');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error fetching crypto rates:', error);
      res.status(500).json({ 
        message: 'Failed to fetch cryptocurrency rates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get cart items
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id!;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  // Add item to cart
  app.post("/api/cart", async (req, res) => {
    console.log('Attempting to add to cart...');
    console.log('Session ID:', req.session.id);
    console.log('Request Body:', req.body);
    try {
      const sessionId = req.session.id!;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        sessionId,
      });
      
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  // Update cart item quantity
  app.put("/api/cart/:gameId", async (req, res) => {
    try {
      const sessionId = req.session.id!;
      const gameId = parseInt(req.params.gameId);
      const { quantity } = req.body;

      if (!Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      await storage.updateCartItemQuantity(sessionId, gameId, quantity);
      res.json({ message: "Cart item updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:gameId", async (req, res) => {
    try {
      const sessionId = req.session.id!;
      const gameId = parseInt(req.params.gameId);
      
      await storage.removeFromCart(sessionId, gameId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // Initialize Flutterwave payment
  app.post("/api/payment/flutterwave/initialize", async (req, res) => {
    try {
      const sessionId = req.session.id!;
      const { orderData } = req.body;
      
      // Create order first
      const order = await storage.createOrder({
        ...orderData,
        sessionId,
        paymentMethod: 'flutterwave',
        status: 'pending'
      });

      // Generate payment reference
      const tx_ref = `RBK_${order.id}_${Date.now()}`;
      
      // Initialize Flutterwave payment
      const paymentData = {
        tx_ref,
        amount: orderData.total / 100, // Convert from kobo to naira
        currency: 'NGN',
        redirect_url: `${process.env.FRONTEND_URL}/payment/callback`,
        customer: {
          email: orderData.customerInfo.email,
          phonenumber: orderData.customerInfo.phone,
          name: orderData.customerInfo.fullName,
        },
        customizations: {
          title: 'Rubikcon Games',
          description: 'Game Purchase',
          logo: `${process.env.FRONTEND_URL}/images/logo.png`,
        },
      };

      const response = await FlutterwaveService.initializePayment(paymentData);
      
      // Create payment record
      await storage.createPayment({
        orderId: order.id,
        paymentMethod: 'flutterwave',
        amount: orderData.total,
        currency: 'NGN',
        reference: tx_ref,
        status: 'pending'
      });

      console.log('Payment response:', response);
      
      res.json({
        orderId: order.id,
        paymentUrl: response.data?.link || response.link,
        reference: tx_ref
      });
    } catch (error) {
      console.error('Flutterwave initialization error:', error);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  // Verify Flutterwave payment
  app.post("/api/payment/flutterwave/verify", async (req, res) => {
    try {
      const { transaction_id, tx_ref } = req.body;
      
      const verification = await FlutterwaveService.verifyPayment(transaction_id);
      
      if (verification.status === 'success' && verification.data.status === 'successful') {
        // Update payment status
        const payment = await storage.getPaymentByReference(tx_ref);
        if (payment) {
          await storage.updatePaymentStatus(payment.id, 'successful', verification.data);
          await storage.updateOrderStatus(payment.orderId, 'paid');
          
          // Clear cart
          const order = await storage.getOrderById(payment.orderId);
          if (order) {
            await storage.clearCart(order.sessionId);
          }
        }
        
        res.json({ success: true, message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Initialize crypto payment
  app.post("/api/payment/crypto/initialize", async (req, res) => {
    try {
      const sessionId = req.session.id!;
      const { orderData, currency, network } = req.body;
      
      // Create order
      const order = await storage.createOrder({
        ...orderData,
        sessionId,
        paymentMethod: 'crypto',
        status: 'pending'
      });

      // Get crypto prices
      const prices = await CryptoService.getCryptoPrices();
      const usdAmount = orderData.total / 100; // Convert kobo to USD (assuming 1 USD = 100 kobo for simplicity)
      const cryptoAmount = CryptoService.convertUSDToCrypto(usdAmount, prices[currency as keyof typeof prices]);
      
      // Generate payment address
      const paymentAddress = CryptoService.generatePaymentAddress(network);
      
      // Create crypto transaction record
      const cryptoTx = await storage.createCryptoTransaction({
        orderId: order.id,
        walletAddress: paymentAddress,
        amount: cryptoAmount,
        currency,
        network,
        status: 'pending'
      });

      res.json({
        orderId: order.id,
        paymentAddress,
        amount: cryptoAmount,
        currency,
        network,
        transactionId: cryptoTx.id
      });
    } catch (error) {
      console.error('Crypto payment initialization error:', error);
      res.status(500).json({ message: "Failed to initialize crypto payment" });
    }
  });

  // Verify crypto transaction
  app.post("/api/payment/crypto/verify", async (req, res) => {
    try {
      const { txHash, transactionId } = req.body;
      
      const cryptoTx = await storage.getCryptoTransactionByHash(txHash);
      if (!cryptoTx) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      const isVerified = await CryptoService.verifyTransaction({
        txHash,
        amount: cryptoTx.amount,
        currency: cryptoTx.currency,
        network: cryptoTx.network,
        confirmed: false,
        confirmations: 0
      });

      if (isVerified) {
        await storage.updateCryptoTransaction(cryptoTx.id, {
          txHash,
          status: 'confirmed'
        });
        
        await storage.updateOrderStatus(cryptoTx.orderId, 'paid');
        
        // Clear cart
        const order = await storage.getOrderById(cryptoTx.orderId);
        if (order) {
          await storage.clearCart(order.sessionId);
        }
        
        res.json({ success: true, message: 'Transaction verified successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Transaction verification failed' });
      }
    } catch (error) {
      console.error('Crypto verification error:', error);
      res.status(500).json({ message: "Failed to verify crypto transaction" });
    }
  });

  // Create order (checkout) - Legacy endpoint
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = req.session.id!;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        sessionId,
      });

      const order = await storage.createOrder(orderData);
      
      // Clear cart after successful order
      await storage.clearCart(sessionId);
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Verify crypto transaction
  app.post("/api/verify-transaction", async (req, res) => {
    try {
      const { txHash, crypto, amount, address } = verifyTransactionSchema.parse(req.body);
      
      // In a real application, you would:
      // 1. Verify the transaction exists on the blockchain
      // 2. Check it's confirmed (required number of confirmations)
      // 3. Verify the amount and recipient address match
      // 4. Check for double-spending
      
      // For demo purposes, we'll simulate a successful verification
      // In production, you would use a blockchain API like BlockCypher, Blockstream, or Infura
      
      // Simulate blockchain verification
      const isVerified = Math.random() > 0.3; // 70% chance of success for demo
      
      if (isVerified) {
        // In a real app, you would create an order record here
        return res.json({
          verified: true,
          confirmations: 3,
          txHash,
          amount: Number(amount),
          currency: crypto.toUpperCase(),
          address
        });
      } else {
        return res.status(400).json({
          verified: false,
          error: "Transaction verification failed"
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          verified: false,
          error: error.errors[0]?.message || "Invalid request"
        });
      }
      return res.status(500).json({
        verified: false,
        error: "Failed to verify transaction"
      });
    }
  });

  // Flutterwave webhook
  app.post('/api/webhook/flutterwave', async (req, res) => {
    try {
      const signature = req.headers['verif-hash'] as string;
      const payload = JSON.stringify(req.body);
      
      if (!FlutterwaveService.verifyWebhookSignature(payload, signature)) {
        return res.status(400).json({ message: 'Invalid signature' });
      }

      const result = await FlutterwaveService.handleWebhook(req.body);
      
      if (result) {
        // Update payment and order status
        const payment = await storage.getPaymentByReference(result.reference);
        if (payment) {
          await storage.updatePaymentStatus(payment.id, result.status, req.body);
          
          if (result.status === 'successful') {
            await storage.updateOrderStatus(payment.orderId, 'paid');
          } else if (result.status === 'failed') {
            await storage.updateOrderStatus(payment.orderId, 'failed');
          }
        }
      }
      
      res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
      console.error('Flutterwave webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });



  // Register legacy webhook handlers
  app.post('/api/monitor-transaction', monitorTransaction);
  app.post('/api/webhook/transaction-confirmed', handleTransactionWebhook);

  const httpServer = createServer(app);
  return httpServer;
}
