import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, CartItem } from '@/lib/types';
import { useAccount, useDisconnect, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';

type CryptoCurrency = {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  address: string;
  network: string;
};

const CRYPTOCURRENCIES: CryptoCurrency[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    address: '0xaffcf1e02282b662f425f43a7c320d226781ed7b', 
    network: 'Ethereum Mainnet',
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    icon: '🏔️',
    address: '0xaffcf1e02282b662f425f43a7c320d226781ed7b', 
    network: 'Avalanche C-Chain',
  },
  {
    id: 'usdt-bsc',
    name: 'Tether USD (BSC)',
    symbol: 'USDT',
    icon: '₮',
    address: '0xecc3b1653eacbb657b042c00f0923814ef553996', 
    network: 'BSC (BEP20)',
  },
];

const CRYPTO_ID_TO_RATE_KEY: Record<string, string> = {
  ethereum: 'ETH',
  avalanche: 'AVAX',
  'usdt-bsc': 'USDT',
};

const GAS_FEE_LEVELS = {
  low: { label: 'Low', multiplier: 0.7 },
  medium: { label: 'Medium', multiplier: 1.0 },
  high: { label: 'High', multiplier: 1.3 },
};

export default function CryptoPayment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  console.log('💵 CryptoPayment component loaded');
  // Get cart data from API instead of store
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });
  
  // Calculate total from cart data with discounts
  const calculateTotalPrice = (items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const regularPrice = items.reduce((sum, item) => sum + (item.game.price * item.quantity), 0);
    
    // Apply bulk discounts
    if (totalItems >= 10) {
      return regularPrice * 0.8; // 20% off
    } else if (totalItems >= 5) {
      return regularPrice * 0.85; // 15% off
    } else if (totalItems >= 3) {
      return regularPrice * 0.9; // 10% off
    }
    return regularPrice;
  };
  
  const totalPrice = calculateTotalPrice(cartItems);

  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, { usd: number }>>({ ethereum: { usd: 0 }, 'avalanche-2': { usd: 0 }, tether: { usd: 0 } });
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [hash, setHash] = useState<string | null>(null);
  const [gasFeeLevel, setGasFeeLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedGasFees, setEstimatedGasFees] = useState<{ baseFee: bigint; maxPriorityFee: bigint } | null>(null);

  // RainbowKit and Wagmi hooks
  const { openConnectModal } = useConnectModal();
  const { address: walletAddress, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: sendTxData, isPending: isSending, sendTransaction, error: txError } = useSendTransaction();
  
  console.log('🔗 Wallet state:', {
    isConnected,
    walletAddress,
    chainId: chain?.id,
    chainName: chain?.name,
    openConnectModal: !!openConnectModal,
    sendTransaction: !!sendTransaction,
    isSending
  });

  // Handle transaction success
  useEffect(() => {
    console.log('🔍 Transaction data changed:', { sendTxData, isSending });
    if (sendTxData) {
      console.log('✅ Transaction successful:', sendTxData);
      setHash(sendTxData);
      toast({
        title: "Transaction Sent!",
        description: `Transaction hash: ${sendTxData.slice(0, 10)}...`,
      });
      
      // Quick verification for demo purposes
      // Simple verification that always works
      setTimeout(async () => {
        try {
          console.log('🔍 Starting verification for tx:', sendTxData);
          
          const verifyResponse = await fetch('/api/payment/crypto/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txHash: sendTxData })
          });
          
          const result = await verifyResponse.json();
          console.log('📊 Verification result:', result);
          
          if (result.success) {
            toast({
              title: "Payment Confirmed!",
              description: "Your payment has been processed successfully.",
            });
            // Immediate redirect to success
            setLocation('/payment/callback?status=success');
          } else {
            setLocation('/payment/callback?status=failed&message=' + encodeURIComponent(result.message || 'Verification failed'));
          }
        } catch (error) {
          console.error('💥 Verification error:', error);
          setLocation('/payment/callback?status=failed&message=' + encodeURIComponent('Network error'));
        }
      }, 2000); // Quick 2-second verification
    }
  }, [sendTxData, toast, isSending, setLocation]);

  // Handle transaction error
  useEffect(() => {
    console.log('🔍 Transaction error changed:', { txError });
    if (txError) {
      console.error('❌ Transaction failed:', txError);
      console.error('Error details:', {
        message: txError.message,
        cause: txError.cause,
        code: txError.code
      });
      toast({
        title: "Transaction Failed",
        description: txError.message || "Transaction was rejected",
        variant: "destructive"
      });
    }
  }, [txError, toast]);

  // Fetch crypto prices
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('/api/crypto-rates');
        if (!response.ok) {
          throw new Error('Failed to fetch rates');
        }
        const data = await response.json();
        console.log('Exchange rates received:', data);
        setExchangeRates(data);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        // Set fallback rates
        setExchangeRates({
          ETH: { usd: 3000 },
          USDT: { usd: 1 }
        });
        toast({ title: 'Warning', description: 'Using fallback crypto prices.', variant: 'destructive' });
      } finally {
        setIsLoadingRates(false);
      }
    };
    fetchRates();
  }, [toast]);

  // Fetch dynamic gas fee estimates (placeholder for actual API call)
  useEffect(() => {
    const fetchGasFees = async () => {
      // In a real implementation, use viem or ethers.js to fetch gas estimates
      // e.g., const feeData = await getFeeData();
      // For now, use placeholder values (typical for Ethereum network)
      setEstimatedGasFees({
        baseFee: BigInt(15000000000), // 15 Gwei base fee placeholder
        maxPriorityFee: BigInt(2000000000), // 2 Gwei priority fee placeholder
      });
    };

    if (selectedCrypto) {
      fetchGasFees();
    }
  }, [selectedCrypto]);

  const getCryptoAmount = (cryptoId: string) => {
    if (isLoadingRates) return '...';
    
    const rateKey = CRYPTO_ID_TO_RATE_KEY[cryptoId];
    const rate = exchangeRates[rateKey]?.usd;
    
    console.log('Getting crypto amount:', { cryptoId, rateKey, rate, totalPrice, exchangeRates });
    
    if (!rate || rate === 0) {
      console.warn('No rate found for', rateKey);
      return '...';
    }
    
    if (cryptoId === 'usdt-bsc') {
      return (totalPrice / 100).toFixed(2); // USDT is pegged to USD
    }
    return ((totalPrice / 100) / rate).toFixed(6); // Convert cents to dollars before calculating crypto amount
  };

  const handleConnectWallet = () => {
    console.log('🔗 Connect wallet clicked');
    console.log('OpenConnectModal available:', !!openConnectModal);
    if (openConnectModal) {
      console.log('🔄 Opening connect modal...');
      openConnectModal();
    } else {
      console.log('❌ OpenConnectModal not available');
      toast({
        title: "Connection Error",
        description: "Wallet connection not available",
        variant: "destructive"
      });
    }
  };

  const handlePayNow = async () => {
    console.log('🚀 PayNow clicked - Starting debug...');
    
    if (!selectedCrypto || !walletAddress) {
      console.log('❌ Wallet validation failed:', { selectedCrypto: !!selectedCrypto, walletAddress: !!walletAddress });
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }
    
    // Check if exchange rates are loaded
    if (isLoadingRates) {
      toast({
        title: "Loading Rates",
        description: "Please wait for exchange rates to load",
        variant: "destructive"
      });
      return;
    }
    
    const amount = getCryptoAmount(selectedCrypto.id);
    if (amount === '...' || !amount || isNaN(parseFloat(amount))) {
      toast({
        title: "Rate Error",
        description: "Unable to calculate crypto amount. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('📊 Debug Info:', {
      selectedCrypto,
      walletAddress,
      isConnected,
      chain: chain?.id,
      chainName: chain?.name,
      totalPrice,
      amount,
      sendTransaction: typeof sendTransaction
    });
    
    // Check if user is on correct network for selected cryptocurrency
    const requiredNetworks = {
      'ethereum': [1, 11155111], // Ethereum Mainnet, Sepolia
      'avalanche': [43114], // Avalanche C-Chain
      'usdt-bsc': [56] // BSC
    };
    
    const allowedChains = requiredNetworks[selectedCrypto.id] || [];
    if (chain && !allowedChains.includes(chain.id)) {
      const networkNames = {
        'ethereum': 'Ethereum Mainnet or Sepolia',
        'avalanche': 'Avalanche C-Chain',
        'usdt-bsc': 'BSC (Binance Smart Chain)'
      };
      
      console.log('❌ Wrong network for selected crypto:', { 
        selectedCrypto: selectedCrypto.id,
        currentChain: chain.id, 
        requiredChains: allowedChains 
      });
      
      toast({
        title: "Wrong Network",
        description: `You selected ${selectedCrypto.name} but you're on ${chain.name}. Please switch to ${networkNames[selectedCrypto.id]}`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('💰 Amount calculated:', { amount, crypto: selectedCrypto.symbol, totalPrice });
      
      // Initialize crypto payment on backend first
      const orderData = {
        customerInfo: {
          fullName: 'Crypto User',
          email: 'user@example.com',
          phone: '+1234567890',
          address: 'Crypto Address',
          country: 'Global',
          state: 'Blockchain'
        },
        items: cartItems.map(item => ({
          gameId: item.game.id,
          title: item.game.title,
          price: item.game.price,
          quantity: item.quantity
        })),
        total: totalPrice
      };

      const initResponse = await fetch('/api/payment/crypto/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData,
          currency: selectedCrypto.symbol,
          network: selectedCrypto.id
        })
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initialize crypto payment');
      }

      const { orderId, paymentAddress } = await initResponse.json();
      
      // For ETH and AVAX transactions
      if (selectedCrypto.id === 'ethereum' || selectedCrypto.id === 'avalanche') {
        console.log('⚡ Initiating ETH transaction...');
        
        // Validate address format
        if (!paymentAddress || !paymentAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid payment address format');
        }
        
        console.log('📝 Transaction params:', {
          to: paymentAddress,
          value: parseEther(amount),
          amountInWei: parseEther(amount).toString()
        });
        
        // Check if sendTransaction is available
        if (!sendTransaction) {
          console.log('❌ sendTransaction not available');
          toast({
            title: "Wallet Error",
            description: "Transaction function not available. Try reconnecting wallet.",
            variant: "destructive"
          });
          return;
        }
        
        console.log('🔄 Calling sendTransaction...');
        sendTransaction({
          to: paymentAddress as `0x${string}`,
          value: parseEther(amount),
        });
        console.log('✅ sendTransaction called successfully');
      } else {
        console.log('🪙 Token payment selected:', selectedCrypto.symbol);
        toast({
          title: "Token Payment",
          description: `Please send ${amount} ${selectedCrypto.symbol} to the address manually`,
        });
      }
    } catch (error) {
      console.error('💥 Transaction error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Transaction Error", 
        description: `Failed to initiate transaction: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleCopyAddress = () => {
    if (!selectedCrypto) return;
    navigator.clipboard.writeText(selectedCrypto.address);
    toast({ title: 'Copied!', description: 'Address copied to clipboard.' });
  };

  const handleBack = () => {
    setSelectedCrypto(null);
    setHash(null);
  };

  // Main view for selecting a cryptocurrency
  if (!selectedCrypto) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Button variant="ghost" onClick={() => setLocation('/checkout')} className="mb-6 -ml-2 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Pay with Cryptocurrency</CardTitle>
            <CardDescription>Select your preferred cryptocurrency to complete the payment</CardDescription>
            {isConnected && walletAddress && (
              <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Connected</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {CRYPTOCURRENCIES.map((crypto) => (
                <div
                  key={crypto.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCrypto(crypto)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{crypto.icon}</div>
                    <div>
                      <div className="font-medium">{crypto.name}</div>
                      <div className="text-sm text-muted-foreground">{crypto.network}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {isLoadingRates ? (
                        <Loader2 className="h-4 w-4 animate-spin inline-block" />
                      ) : (
                        `${getCryptoAmount(crypto.id)} ${crypto.symbol}`
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{formatPrice(totalPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // View for handling the payment for the selected cryptocurrency
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Button variant="ghost" onClick={handleBack} className="mb-6 -ml-2 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to selection
      </Button>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">{selectedCrypto.icon}</div>
            <CardTitle className="text-2xl font-bold">Pay with {selectedCrypto.name}</CardTitle>
          </div>
          <CardDescription>
            {isSending
              ? 'Check your wallet to confirm the transaction.'
              : `Complete your payment by sending ${selectedCrypto.symbol} to the address below`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold tracking-tight">
                {getCryptoAmount(selectedCrypto.id)} {selectedCrypto.symbol}
              </p>
              <p className="text-muted-foreground">{formatPrice(totalPrice)}</p>
            </div>

            {isConnected ? (
              <div className="rounded-lg border bg-muted/20 p-3 text-center">
                <p className="text-sm font-medium text-foreground">Connected as</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {`${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`}
                </p>
              </div>
            ) : (
              <Button className="w-full" onClick={handleConnectWallet}>
                Connect Wallet
              </Button>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Send to this address</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm overflow-x-auto no-scrollbar">
                  {`${selectedCrypto.address.slice(0, 10)}...${selectedCrypto.address.slice(-8)}`}
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Network: {selectedCrypto.network}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gas Fee Preference</label>
              <div className="flex gap-2">
                {Object.entries(GAS_FEE_LEVELS).map(([level, { label }]) => (
                  <Button
                    key={level}
                    variant={gasFeeLevel === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGasFeeLevel(level as 'low' | 'medium' | 'high')}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {estimatedGasFees ? (
                  `Estimated fee: ~${(Number(estimatedGasFees.baseFee + (estimatedGasFees.maxPriorityFee * BigInt(Math.floor(GAS_FEE_LEVELS[gasFeeLevel].multiplier * 100))) / BigInt(100)) / 1000000000).toFixed(2)} Gwei`
                ) : (
                  'Estimating gas fees...'
                )}
              </p>
            </div>

            {hash && (
              <div className="pt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing transaction...
                </div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                >
                  View on Etherscan <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {!hash && isConnected && (
              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayNow}
                  disabled={isSending || !isConnected}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Check your wallet...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Click to initiate the transaction in your wallet
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
