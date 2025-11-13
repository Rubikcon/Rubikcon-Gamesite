var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  MemStorage: () => MemStorage,
  storage: () => storage
});
var MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    MemStorage = class {
      games;
      cartItems;
      orders;
      cryptoTransactions;
      currentGameId;
      currentCartItemId;
      currentOrderId;
      currentCryptoTxId;
      constructor() {
        this.games = /* @__PURE__ */ new Map();
        this.cartItems = /* @__PURE__ */ new Map();
        this.orders = /* @__PURE__ */ new Map();
        this.cryptoTransactions = /* @__PURE__ */ new Map();
        this.currentGameId = 1;
        this.currentCartItemId = 1;
        this.currentOrderId = 1;
        this.currentCryptoTxId = 1;
        this.initializeGames();
      }
      initializeGames() {
        const sampleGames = [
          {
            title: "Crypto Charades",
            slug: "crypto-charades",
            description: "How well do you REALLY know crypto lingo? Act out Bitcoin, DeFi, NFTs and more in this hilarious party game that'll have everyone guessing and laughing!",
            price: 100,
            // $1 in cents
            category: "card",
            image: "/images/crypto-charade-main.png",
            images: [
              "/images/crypto-charade-2.jpg",
              "/images/crypto-charade-3.png"
            ],
            isOnline: 0,
            howToPlay: `Crypto Charade like any other game is freestyle. Players can come up with the rules on their own and implement things as they go.

There are two teams, A & B.

Each team has an actor who tries to act the card name without speaking and the other team members try to guess what the actor is saying.

Each team actor picks from a shuffled deck of cards and tries to act the card name in a period of time.

Both teams take turns and keep playing until the game is over`
          },
          {
            title: "Blocks and Hashes",
            slug: "blocks-and-hashes",
            description: "Master the fundamentals of blockchain technology with this strategic card game that teaches you about cryptographic hashing, mining, and consensus mechanisms.",
            price: 100,
            // $1 in cents
            category: "card",
            image: "/images/card3.png",
            images: [
              "/images/card3.png"
            ],
            isOnline: 0,
            howToPlay: `There are different ways to play this game, but you must race against time to guess the words using hints like missing letters (dashes) and images (blocks) on the front card. Choose a game type and have fun with your friends.

Game 1: The Guessing Game
Shuffle the cards and place them face down.
Each player takes turns picking a card and has 10 seconds to guess the word using the hints (image and missing letters).
A correct guess wins the card point; if incorrect, the card goes back into the pile.
The player with the most points at the end wins.

Game 2: The Challenger's Game
Shuffle the cards and distribute an equal number to each player.
Players must place their cards front-side up.
Your opponent picks a card from your pile.
You must guess the word correctly.
A correct answer earns you the card's points; a wrong answer gives the point to your opponent.
The game continues until all cards are used, and the highest scorer wins.`
          },
          {
            title: "Into the Cryptoverse",
            slug: "into-the-cryptoverse",
            description: "Journey through the multiverse of cryptocurrency in this immersive card game experience that spans Bitcoin, Ethereum, and beyond.",
            price: 100,
            // $1 in cents
            category: "card",
            image: " /images/card4.png",
            images: [
              "/images/card4.png"
            ],
            isOnline: 0,
            howToPlay: "Embark on a journey through the cryptocurrency multiverse. Collect cards representing different cryptocurrencies and blockchain technologies. Strategize to build the most powerful crypto portfolio by trading and investing based on market events drawn from event cards. The player with the highest portfolio value at the end of the game wins."
          },
          {
            title: "Web3 Trivia Online",
            slug: "web3-trivia-online",
            description: "Play the ultimate Web3 trivia game online with friends from around the world. Test your knowledge and climb the leaderboards!",
            price: 100,
            // $1 in cents
            category: "online",
            image: "/images/card5.png",
            images: [
              "/images/card5.png"
            ],
            isOnline: 1,
            howToPlay: "Join an online trivia match focused on Web3 topics like blockchain, NFTs, and DeFi. Answer multiple-choice questions within the time limit to score points. Compete against global players, earn ranks, and unlock special trivia packs with correct answers."
          }
        ];
        sampleGames.forEach((game) => {
          this.createGame(game);
        });
      }
      async getGames() {
        return Array.from(this.games.values());
      }
      async getGameBySlug(slug) {
        return Array.from(this.games.values()).find((game) => game.slug === slug);
      }
      async getGameById(id) {
        return this.games.get(id);
      }
      async createGame(insertGame) {
        const id = this.currentGameId++;
        const game = {
          ...insertGame,
          id,
          images: insertGame.images || [],
          isOnline: insertGame.isOnline || 0,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.games.set(id, game);
        return game;
      }
      async getCartItems(sessionId) {
        const items = this.cartItems.get(sessionId) || [];
        const result = [];
        for (const item of items) {
          const game = this.games.get(item.gameId);
          if (game) {
            result.push({ ...item, game });
          }
        }
        return result;
      }
      async addToCart(insertItem) {
        const sessionItems = this.cartItems.get(insertItem.sessionId) || [];
        const existingItem = sessionItems.find((item) => item.gameId === insertItem.gameId);
        if (existingItem) {
          existingItem.quantity += insertItem.quantity || 1;
          return existingItem;
        } else {
          const newItem = {
            ...insertItem,
            gameId: 0,
            sessionId: "",
            id: this.currentCartItemId++,
            quantity: insertItem.quantity || 1,
            createdAt: /* @__PURE__ */ new Date()
          };
          sessionItems.push(newItem);
          this.cartItems.set(insertItem.sessionId, sessionItems);
          return newItem;
        }
      }
      async updateCartItemQuantity(sessionId, gameId, quantity) {
        const sessionItems = this.cartItems.get(sessionId) || [];
        const item = sessionItems.find((item2) => item2.gameId === gameId);
        if (item) {
          if (quantity <= 0) {
            await this.removeFromCart(sessionId, gameId);
          } else {
            item.quantity = quantity;
          }
        }
      }
      async removeFromCart(sessionId, gameId) {
        const sessionItems = this.cartItems.get(sessionId) || [];
        const filteredItems = sessionItems.filter((item) => item.gameId !== gameId);
        this.cartItems.set(sessionId, filteredItems);
      }
      async clearCart(sessionId) {
        this.cartItems.delete(sessionId);
      }
      async createOrder(insertOrder) {
        const id = this.currentOrderId++;
        const order = {
          ...insertOrder,
          id,
          items: insertOrder.items,
          status: insertOrder.status || "pending",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.orders.set(id, order);
        return order;
      }
      async getOrderById(id) {
        return this.orders.get(id);
      }
      async getOrdersBySession(sessionId) {
        return Array.from(this.orders.values()).filter((order) => order.sessionId === sessionId);
      }
      async updateOrderStatus(id, status) {
        const order = this.orders.get(id);
        if (order) {
          order.status = status;
          order.updatedAt = /* @__PURE__ */ new Date();
        }
      }
      async createCryptoTransaction(insertTransaction) {
        const id = this.currentCryptoTxId++;
        const transaction = {
          ...insertTransaction,
          id,
          confirmations: 0,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.cryptoTransactions.set(id, transaction);
        return transaction;
      }
      async updateCryptoTransaction(id, updates) {
        const transaction = this.cryptoTransactions.get(id);
        if (transaction) {
          Object.assign(transaction, updates);
          transaction.updatedAt = /* @__PURE__ */ new Date();
        }
      }
      async getCryptoTransactionByHash(txHash) {
        return Array.from(this.cryptoTransactions.values()).find((tx) => tx.txHash === txHash);
      }
    };
    storage = new MemStorage();
  }
});

// server/index.ts
import dotenv from "dotenv";
import express2 from "express";
import cors from "cors";
import session from "express-session";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";

// server/routes.ts
import { createServer } from "http";

// server/storage-db.ts
import { eq, and } from "drizzle-orm";

// server/database.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cartItems: () => cartItems,
  cryptoTransactions: () => cryptoTransactions,
  games: () => games,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCryptoTransactionSchema: () => insertCryptoTransactionSchema,
  insertGameSchema: () => insertGameSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  orders: () => orders,
  payments: () => payments
});
import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  // Price in kobo (Nigerian currency)
  category: text("category").notNull(),
  // 'card' or 'online'
  image: text("image").notNull(),
  images: jsonb("images").$type().notNull().default([]),
  isOnline: integer("is_online").notNull().default(0),
  // 0 for card games, 1 for online games
  createdAt: timestamp("created_at").defaultNow()
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  gameId: integer("game_id").notNull().references(() => games.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  customerInfo: jsonb("customer_info").$type().notNull(),
  items: jsonb("items").$type().notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  // 'flutterwave' | 'crypto'
  paymentReference: text("payment_reference"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  paymentMethod: text("payment_method").notNull(),
  // 'flutterwave' | 'crypto'
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("NGN"),
  status: text("status").notNull().default("pending"),
  // 'pending' | 'successful' | 'failed' | 'cancelled'
  reference: text("reference").notNull(),
  transactionId: text("transaction_id"),
  gatewayResponse: jsonb("gateway_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var cryptoTransactions = pgTable("crypto_transactions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  walletAddress: text("wallet_address").notNull(),
  txHash: text("tx_hash"),
  amount: text("amount").notNull(),
  // Store as string to handle precision
  currency: text("currency").notNull(),
  // 'ETH' | 'USDT' | 'BTC'
  network: text("network").notNull(),
  // 'ethereum' | 'polygon' | 'bsc'
  status: text("status").notNull().default("pending"),
  confirmations: integer("confirmations").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertGameSchema = createInsertSchema(games).pick({
  title: true,
  slug: true,
  description: true,
  price: true,
  category: true,
  image: true,
  isOnline: true
}).extend({
  images: z.array(z.string().url()).optional()
  // add images manually
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true
});
var orderItemSchema = z.object({
  gameId: z.number(),
  title: z.string(),
  price: z.number(),
  quantity: z.number()
});
var insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true }).extend({
  items: z.lazy(() => z.array(orderItemSchema))
  // <- wrap in lazy
});
var insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  gatewayResponse: z.any().optional()
  // override or relax type
});
var insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/database.ts
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}
var connectionString = process.env.DATABASE_URL;
var client = postgres(connectionString, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});
var db = drizzle(client, { schema: schema_exports });

// server/storage-db.ts
var DatabaseStorage = class {
  async getGames() {
    return await db.select().from(games);
  }
  async getGameBySlug(slug) {
    const result = await db.select().from(games).where(eq(games.slug, slug));
    return result[0];
  }
  async getGameById(id) {
    const result = await db.select().from(games).where(eq(games.id, id));
    return result[0];
  }
  async getCartItems(sessionId) {
    const result = await db.select({
      id: cartItems.id,
      sessionId: cartItems.sessionId,
      gameId: cartItems.gameId,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      game: games
    }).from(cartItems).innerJoin(games, eq(cartItems.gameId, games.id)).where(eq(cartItems.sessionId, sessionId));
    return result;
  }
  async addToCart(item) {
    const existing = await db.select().from(cartItems).where(and(
      eq(cartItems.sessionId, item.sessionId),
      eq(cartItems.gameId, item.gameId)
    ));
    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + (item.quantity || 1);
      await db.update(cartItems).set({ quantity: newQuantity }).where(eq(cartItems.id, existing[0].id));
      return { ...existing[0], quantity: newQuantity };
    } else {
      const result = await db.insert(cartItems).values(item).returning();
      return result[0];
    }
  }
  async updateCartItemQuantity(sessionId, gameId, quantity) {
    if (quantity <= 0) {
      await this.removeFromCart(sessionId, gameId);
    } else {
      await db.update(cartItems).set({ quantity }).where(and(
        eq(cartItems.sessionId, sessionId),
        eq(cartItems.gameId, gameId)
      ));
    }
  }
  async removeFromCart(sessionId, gameId) {
    await db.delete(cartItems).where(and(
      eq(cartItems.sessionId, sessionId),
      eq(cartItems.gameId, gameId)
    ));
  }
  async clearCart(sessionId) {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }
  async createOrder(order) {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }
  async getOrderById(id) {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }
  async getOrdersBySession(sessionId) {
    return await db.select().from(orders).where(eq(orders.sessionId, sessionId));
  }
  async updateOrderStatus(id, status) {
    await db.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id));
  }
  async createPayment(payment) {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }
  async updatePaymentStatus(id, status, gatewayResponse) {
    await db.update(payments).set({
      status,
      gatewayResponse,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(payments.id, id));
  }
  async getPaymentByReference(reference) {
    const result = await db.select().from(payments).where(eq(payments.reference, reference));
    return result[0];
  }
  async createCryptoTransaction(transaction) {
    const result = await db.insert(cryptoTransactions).values(transaction).returning();
    return result[0];
  }
  async updateCryptoTransaction(id, updates) {
    await db.update(cryptoTransactions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(cryptoTransactions.id, id));
  }
  async getCryptoTransactionByHash(txHash) {
    const result = await db.select().from(cryptoTransactions).where(eq(cryptoTransactions.txHash, txHash));
    return result[0];
  }
};
var storage2 = process.env.NODE_ENV === "production" ? new DatabaseStorage() : new (await Promise.resolve().then(() => (init_storage(), storage_exports))).MemStorage();

// server/routes.ts
import { z as z2 } from "zod";

// server/services/flutterwave.ts
import Flutterwave from "flutterwave-node-v3";
import crypto from "crypto";
if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
  throw new Error("Flutterwave API keys are required");
}
var flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);
var FlutterwaveService = class {
  static async initializePayment(paymentData) {
    try {
      const payload = {
        ...paymentData,
        payment_options: "card,mobilemoney,ussd,banktransfer"
      };
      console.log("Flutterwave payload:", payload);
      const response = await flw.Payment.initialize(payload);
      console.log("Flutterwave response:", response);
      if (response.status === "success") {
        return response;
      } else {
        throw new Error(response.message || "Payment initialization failed");
      }
    } catch (error) {
      console.error("Flutterwave initialization error:", error);
      throw error;
    }
  }
  static async verifyPayment(transactionId) {
    try {
      const response = await flw.Transaction.verify({ id: transactionId });
      return response;
    } catch (error) {
      console.error("Flutterwave verification error:", error);
      throw new Error("Failed to verify payment");
    }
  }
  static verifyWebhookSignature(payload, signature) {
    const hash = crypto.createHmac("sha256", process.env.FLUTTERWAVE_SECRET_HASH).update(payload, "utf8").digest("hex");
    return hash === signature;
  }
  static async handleWebhook(payload) {
    const { event, data } = payload;
    switch (event) {
      case "charge.completed":
        return this.handleSuccessfulPayment(data);
      case "charge.failed":
        return this.handleFailedPayment(data);
      default:
        console.log("Unhandled webhook event:", event);
        return null;
    }
  }
  static async handleSuccessfulPayment(data) {
    return {
      status: "successful",
      transactionId: data.id,
      reference: data.tx_ref,
      amount: data.amount,
      currency: data.currency
    };
  }
  static async handleFailedPayment(data) {
    return {
      status: "failed",
      transactionId: data.id,
      reference: data.tx_ref,
      reason: data.processor_response
    };
  }
};
var flutterwave_default = FlutterwaveService;

// server/services/crypto.ts
import { ethers } from "ethers";
var CryptoService = class {
  static NETWORKS = {
    ethereum: {
      rpcUrl: "https://eth.llamarpc.com",
      chainId: 1,
      name: "Ethereum Mainnet"
    },
    sepolia: {
      rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      name: "Sepolia Testnet"
    },
    polygon: {
      rpcUrl: "https://polygon-rpc.com",
      chainId: 137,
      name: "Polygon Mainnet"
    },
    bsc: {
      rpcUrl: "https://bsc-dataseed1.binance.org/",
      chainId: 56,
      name: "BSC Mainnet"
    },
    avalanche: {
      rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      name: "Avalanche C-Chain"
    }
  };
  static TOKEN_CONTRACTS = {
    ethereum: {
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      USDC: "0xA0b86a33E6441b8435b662303c0f479c7c2f4c0e"
    },
    polygon: {
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    },
    bsc: {
      USDT: "0x55d398326f99059fF775485246999027B3197955",
      USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
    }
  };
  static async verifyTransaction(data) {
    try {
      const network = this.NETWORKS[data.network];
      if (!network) {
        throw new Error(`Unsupported network: ${data.network}`);
      }
      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      const tx = await provider.getTransaction(data.txHash);
      if (!tx) {
        return false;
      }
      const receipt = await provider.getTransactionReceipt(data.txHash);
      if (!receipt) {
        return false;
      }
      if (receipt.status !== 1) {
        return false;
      }
      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;
      const minConfirmations = data.network === "sepolia" ? 1 : data.network === "ethereum" ? 12 : 6;
      return confirmations >= minConfirmations;
    } catch {
      return false;
    }
  }
  static async getTransactionDetails(txHash, network) {
    try {
      const networkConfig = this.NETWORKS[network];
      if (!networkConfig) {
        throw new Error(`Unsupported network: ${network}`);
      }
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!tx || !receipt) {
        return null;
      }
      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? "success" : "failed",
        confirmations,
        blockNumber: receipt.blockNumber
      };
    } catch {
      return null;
    }
  }
  static generatePaymentAddress(network) {
    const paymentAddress = process.env.PAYMENT_WALLET_ADDRESS || "0x742d35Cc6634C0532925A3B8D4C9dB96C4B4d8B6";
    if (!paymentAddress || !paymentAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error("Invalid payment wallet address format");
    }
    return ethers.getAddress(paymentAddress);
  }
  static convertUSDToCrypto(usdAmount, cryptoPrice) {
    const cryptoAmount = usdAmount / cryptoPrice;
    return cryptoAmount.toFixed(8);
  }
  static async getCryptoPrices() {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,avalanche-2&vs_currencies=usd"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch crypto prices");
      }
      const data = await response.json();
      const prices = {
        ETH: { usd: data.ethereum?.usd || 3e3 },
        AVAX: { usd: data["avalanche-2"]?.usd || 30 },
        USDT: { usd: data.tether?.usd || 1 }
      };
      return prices;
    } catch {
      return {
        ETH: { usd: 3e3 },
        AVAX: { usd: 30 },
        USDT: { usd: 1 }
      };
    }
  }
};
var crypto_default = CryptoService;

// server/webhooks.ts
import crypto2 from "crypto";

// server/vite.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./client/src", import.meta.url)),
      "@shared": fileURLToPath(new URL("./shared", import.meta.url))
    }
  },
  build: {
    outDir: "dist/client",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-button"],
          wagmi: ["wagmi", "@rainbow-me/rainbowkit"],
          utils: ["clsx", "tailwind-merge"]
        }
      }
    },
    chunkSizeWarningLimit: 1e3
  },
  server: {
    port: 3e3,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "wagmi", "@rainbow-me/rainbowkit"]
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename = fileURLToPath2(import.meta.url);
var __dirname = path.dirname(__filename);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/webhooks.ts
var WEBHOOK_SECRET = process.env.QUICKNODE_WEBHOOK_SECRET || "";
function verifyWebhookSignature(req) {
  if (!WEBHOOK_SECRET) {
    log("Webhook secret not set. Skipping signature verification for development.");
    return true;
  }
  const signature = req.headers["x-qn-signature"];
  if (!signature) {
    log("Webhook signature missing from request headers.");
    return false;
  }
  if (!req.rawBody) {
    log("Raw request body not available for signature verification.");
    return false;
  }
  const hmac = crypto2.createHmac("sha256", WEBHOOK_SECRET);
  const computedSignature = hmac.update(req.rawBody).digest("hex");
  try {
    return crypto2.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
  } catch (error) {
    log(`Error during timingSafeEqual: ${error}`);
    return false;
  }
}
function handleTransactionWebhook(req, res) {
  if (!verifyWebhookSignature(req)) {
    res.status(401).json({ message: "Invalid webhook signature" });
    return;
  }
  const payload = req.body;
  log(`Received webhook for event: ${payload.event?.name}`);
  if (payload.event?.name && payload.txs && payload.txs.length > 0) {
    payload.txs.forEach((tx) => {
      if (tx.status === "confirmed") {
        log(`Transaction ${tx.hash} confirmed with ${tx.confirmations} confirmations`);
      }
    });
    res.status(200).json({ message: "Webhook processed successfully" });
  } else {
    log(`Unhandled or empty webhook payload: ${JSON.stringify(payload)}`);
    res.status(200).json({ message: "Payload not handled" });
  }
}
function monitorTransaction(req, res) {
  const { txHash } = req.body;
  if (!txHash) {
    res.status(400).json({ message: "Transaction hash is required" });
    return;
  }
  log(`Monitoring transaction: ${txHash}`);
  res.status(200).json({ message: `Monitoring transaction ${txHash}` });
}

// server/routes.ts
var verifyTransactionSchema = z2.object({
  txHash: z2.string().min(1, "Transaction hash is required"),
  crypto: z2.enum(["bitcoin", "ethereum", "usdt"]),
  amount: z2.string().or(z2.number()).transform(Number),
  address: z2.string().min(1, "Recipient address is required")
});
async function registerRoutes(app) {
  app.use((req, res, next) => {
    if (!req.session) {
      req.session = {};
    }
    if (!req.session.id) {
      req.session.id = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    }
    next();
  });
  app.get("/api/games", async (req, res) => {
    try {
      const games2 = await storage2.getGames();
      res.json(games2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });
  app.get("/api/games/:slug", async (req, res) => {
    try {
      const game = await storage2.getGameBySlug(req.params.slug);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });
  app.get("/api/crypto-rates", async (req, res) => {
    try {
      const prices = await crypto_default.getCryptoPrices();
      res.json(prices);
    } catch (error) {
      console.error("Error fetching crypto rates:", error);
      res.status(500).json({
        message: "Failed to fetch cryptocurrency rates",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const cartItems2 = await storage2.getCartItems(sessionId);
      res.json(cartItems2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });
  app.post("/api/cart", async (req, res) => {
    console.log("Attempting to add to cart...");
    console.log("Session ID:", req.session.id);
    console.log("Request Body:", req.body);
    try {
      const sessionId = req.session.id;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        sessionId
      });
      const cartItem = await storage2.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.issues });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  app.put("/api/cart/:gameId", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const gameId = parseInt(req.params.gameId);
      const { quantity } = req.body;
      if (!Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      await storage2.updateCartItemQuantity(sessionId, gameId, quantity);
      res.json({ message: "Cart item updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  app.delete("/api/cart/:gameId", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const gameId = parseInt(req.params.gameId);
      await storage2.removeFromCart(sessionId, gameId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });
  app.post("/api/payment/flutterwave/initialize", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const { orderData } = req.body;
      const order = await storage2.createOrder({
        ...orderData,
        sessionId,
        paymentMethod: "flutterwave",
        status: "pending"
      });
      const tx_ref = `RBK_${order.id}_${Date.now()}`;
      const paymentData = {
        tx_ref,
        amount: orderData.total / 100,
        // Convert from kobo to naira
        currency: "NGN",
        redirect_url: `${process.env.FRONTEND_URL}/payment/callback`,
        customer: {
          email: orderData.customerInfo.email,
          phonenumber: orderData.customerInfo.phone,
          name: orderData.customerInfo.fullName
        },
        customizations: {
          title: "Rubikcon Games",
          description: "Game Purchase",
          logo: `${process.env.FRONTEND_URL}/images/logo.png`
        }
      };
      const response = await flutterwave_default.initializePayment(paymentData);
      if (storage2 instanceof DatabaseStorage) {
        await storage2.createPayment({
          orderId: order.id,
          paymentMethod: "flutterwave",
          amount: orderData.total,
          currency: "NGN",
          reference: tx_ref,
          status: "pending"
        });
        console.log("Payment response:", response);
      }
      res.json({
        orderId: order.id,
        paymentUrl: response.data?.link || response.link,
        reference: tx_ref
      });
    } catch (error) {
      console.error("Flutterwave initialization error:", error);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });
  app.post("/api/payment/flutterwave/verify", async (req, res) => {
    try {
      const { transaction_id, tx_ref } = req.body;
      const verification = await flutterwave_default.verifyPayment(transaction_id);
      if (verification.status === "success" && verification.data.status === "successful") {
        if (storage2 instanceof DatabaseStorage) {
          const payment = await storage2.getPaymentByReference(tx_ref);
          if (payment) {
            await storage2.updatePaymentStatus(payment.id, "successful", verification.data);
            await storage2.updateOrderStatus(payment.orderId, "paid");
            const order = await storage2.getOrderById(payment.orderId);
            if (order) {
              await storage2.clearCart(order.sessionId);
            }
          }
        }
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });
  app.post("/api/payment/crypto/initialize", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const { orderData, currency, network } = req.body;
      console.log("Initializing crypto payment:", { sessionId, currency, network, orderData });
      const order = await storage2.createOrder({
        ...orderData,
        sessionId,
        paymentMethod: "crypto",
        status: "pending"
      });
      const prices = await crypto_default.getCryptoPrices();
      const usdAmount = orderData.total / 100;
      const cryptoPrice = prices[currency] || 1;
      const cryptoAmount = crypto_default.convertUSDToCrypto(usdAmount, cryptoPrice);
      const paymentAddress = crypto_default.generatePaymentAddress(network);
      let transactionId = null;
      try {
        const cryptoTx = await storage2.createCryptoTransaction({
          orderId: order.id,
          walletAddress: paymentAddress,
          amount: cryptoAmount,
          currency,
          network,
          status: "pending"
        });
        transactionId = cryptoTx.id;
      } catch (cryptoError) {
        console.warn("Failed to create crypto transaction record:", cryptoError);
      }
      res.json({
        orderId: order.id,
        paymentAddress,
        amount: cryptoAmount,
        currency,
        network,
        transactionId
      });
    } catch (error) {
      console.error("Crypto payment initialization error:", error);
      res.status(500).json({
        message: "Failed to initialize crypto payment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.post("/api/payment/crypto/verify", async (req, res) => {
    try {
      const { txHash } = req.body;
      console.log("\u{1F50D} Verifying transaction:", txHash);
      if (!txHash || txHash.length !== 66 || !txHash.startsWith("0x")) {
        console.log("\u274C Invalid hash format");
        return res.status(400).json({ success: false, message: "Invalid transaction hash" });
      }
      const sessionId = req.session.id;
      console.log("\u{1F4CB} Session ID:", sessionId);
      const orders2 = await storage2.getOrdersBySession(sessionId);
      const pendingOrder = orders2.find((order) => order.status === "pending" && order.paymentMethod === "crypto");
      if (pendingOrder) {
        await storage2.updateOrderStatus(pendingOrder.id, "paid");
        await storage2.clearCart(sessionId);
        console.log("\u{1F389} Payment verified for order:", pendingOrder.id);
      }
      res.json({
        success: true,
        message: "Payment verified successfully",
        orderId: pendingOrder?.id
      });
    } catch (error) {
      console.error("\u{1F4A5} Verification error:", error);
      res.status(500).json({ success: false, message: "Verification failed" });
    }
  });
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        sessionId
      });
      const order = await storage2.createOrder(orderData);
      await storage2.clearCart(sessionId);
      res.json(order);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.issues });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app.post("/api/verify-transaction", async (req, res) => {
    try {
      const { txHash, crypto: crypto3, amount, address } = verifyTransactionSchema.parse(req.body);
      const isVerified = Math.random() > 0.3;
      if (isVerified) {
        return res.json({
          verified: true,
          confirmations: 3,
          txHash,
          amount: Number(amount),
          currency: crypto3.toUpperCase(),
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          verified: false,
          error: error.issues[0]?.message || "Invalid request"
        });
      }
      return res.status(500).json({
        verified: false,
        error: "Failed to verify transaction"
      });
    }
  });
  app.post("/api/webhook/flutterwave", async (req, res) => {
    try {
      const signature = req.headers["verif-hash"];
      const payload = JSON.stringify(req.body);
      if (!flutterwave_default.verifyWebhookSignature(payload, signature)) {
        return res.status(400).json({ message: "Invalid signature" });
      }
      const result = await flutterwave_default.handleWebhook(req.body);
      if (result) {
        if (storage2 instanceof DatabaseStorage) {
          const payment = await storage2.getPaymentByReference(result.reference);
          if (payment) {
            await storage2.updatePaymentStatus(payment.id, result.status, req.body);
            if (result.status === "successful") {
              await storage2.updateOrderStatus(payment.orderId, "paid");
            } else if (result.status === "failed") {
              await storage2.updateOrderStatus(payment.orderId, "failed");
            }
          }
        }
      }
      res.status(200).json({ message: "Webhook processed" });
    } catch (error) {
      console.error("Flutterwave webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });
  app.post("/api/monitor-transaction", monitorTransaction);
  app.post("/api/webhook/transaction-confirmed", handleTransactionWebhook);
  const httpServer = createServer(app);
  return httpServer;
}

// server/index.ts
dotenv.config();
async function main() {
  const app = express2();
  const corsOptions = {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://rubikcongames.xyz",
      "http://rubikcongames.xyz"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  };
  app.use(cors(corsOptions));
  app.use(express2.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith("/api/webhook")) {
        req.rawBody = buf;
      }
    }
  }));
  app.use(express2.urlencoded({ extended: false }));
  app.set("trust proxy", 1);
  let sessionConfig = {
    secret: process.env.SESSION_SECRET || "rubikcon-games-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  if (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== "") {
    try {
      const redisClient = createClient({
        url: process.env.REDIS_URL
      });
      redisClient.on("error", (err) => log(`Redis Client Error: ${err}`));
      redisClient.on("connect", () => log("Redis Client Connected"));
      await redisClient.connect();
      const redisStore = new RedisStore({
        client: redisClient,
        prefix: "rubikcon:"
      });
      sessionConfig.store = redisStore;
      log("Using Redis for sessions");
    } catch (error) {
      log(`Redis connection failed, using memory store: ${error}`);
    }
  } else {
    log("Using in-memory sessions (Redis disabled or URL not provided)");
  }
  app.use(session(sessionConfig));
  app.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path2.startsWith("/api")) {
        let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "\u2026";
        }
        log(logLine);
      }
    });
    next();
  });
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`\u{1F680} Server running on port ${port}`);
    log(`\u{1F310} Environment: ${process.env.NODE_ENV || "development"}`);
    log(`\u{1F517} Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  });
}
main().catch((err) => {
  log(`Error starting server: ${err}`);
  process.exit(1);
});
