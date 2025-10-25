import { ethers } from 'ethers';

export interface CryptoPaymentData {
  orderId: number;
  amount: string;
  currency: 'ETH' | 'USDT' | 'USDC';
  network: 'ethereum' | 'polygon' | 'bsc';
  recipientAddress: string;
}

export interface TransactionVerification {
  txHash: string;
  amount: string;
  currency: string;
  network: string;
  confirmed: boolean;
  confirmations: number;
}

export class CryptoService {
  private static readonly NETWORKS = {
    ethereum: {
      rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
      chainId: 1,
      name: 'Ethereum Mainnet'
    },
    polygon: {
      rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/your-api-key',
      chainId: 137,
      name: 'Polygon Mainnet'
    },
    bsc: {
      rpcUrl: 'https://bsc-dataseed1.binance.org/',
      chainId: 56,
      name: 'BSC Mainnet'
    }
  };

  private static readonly TOKEN_CONTRACTS = {
    ethereum: {
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      USDC: '0xA0b86a33E6441b8435b662303c0f479c7c2f4c0e'
    },
    polygon: {
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
    },
    bsc: {
      USDT: '0x55d398326f99059fF775485246999027B3197955',
      USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
    }
  };

  static async verifyTransaction(data: TransactionVerification): Promise<boolean> {
    try {
      const network = this.NETWORKS[data.network as keyof typeof this.NETWORKS];
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

      // Verify transaction success
      if (receipt.status !== 1) {
        return false;
      }

      // Get current block number for confirmation count
      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;

      // Require minimum confirmations (adjust as needed)
      const minConfirmations = data.network === 'ethereum' ? 12 : 20;
      
      return confirmations >= minConfirmations;
    } catch (error) {
      console.error('Transaction verification error:', error);
      return false;
    }
  }

  static async getTransactionDetails(txHash: string, network: string) {
    try {
      const networkConfig = this.NETWORKS[network as keyof typeof this.NETWORKS];
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
        status: receipt.status === 1 ? 'success' : 'failed',
        confirmations,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  }

  static generatePaymentAddress(network: string): string {
    // In production, you would generate or retrieve a unique address for each payment
    // For now, return a placeholder address
    const addresses = {
      ethereum: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      polygon: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      bsc: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    };

    return addresses[network as keyof typeof addresses] || addresses.ethereum;
  }

  static convertUSDToCrypto(usdAmount: number, cryptoPrice: number): string {
    const cryptoAmount = usdAmount / cryptoPrice;
    return cryptoAmount.toFixed(8);
  }

  static async getCryptoPrices() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,usd-coin&vs_currencies=usd'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }

      const data = await response.json();
      
      return {
        ETH: data.ethereum?.usd || 0,
        USDT: data.tether?.usd || 1,
        USDC: data['usd-coin']?.usd || 1,
      };
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      // Return fallback prices
      return {
        ETH: 2000,
        USDT: 1,
        USDC: 1,
      };
    }
  }
}

export default CryptoService;