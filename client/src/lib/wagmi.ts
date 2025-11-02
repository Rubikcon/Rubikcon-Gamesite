import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, bsc, avalanche } from 'wagmi/chains';

// Get project ID from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set');
}

// Create wagmiConfig with multiple chains for crypto payments
export const wagmiConfig = getDefaultConfig({
  appName: 'Rubikcon Games',
  projectId,
  chains: [mainnet, polygon, bsc, avalanche, sepolia],
  ssr: false,
});

// Supported tokens for payments
export const SUPPORTED_TOKENS = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    chains: [mainnet.id, sepolia.id]
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    contracts: {
      [mainnet.id]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      [polygon.id]: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      [bsc.id]: '0x55d398326f99059fF775485246999027B3197955'
    }
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    contracts: {
      [mainnet.id]: '0xA0b86a33E6441b8435b662303c0f479c7c2f4c0e',
      [polygon.id]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      [bsc.id]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
    }
  }
};

export const PAYMENT_WALLET_ADDRESS = '0x742d35Cc6634C0532925A3B8D4C9dB96C4B4d8B6'; // Payment wallet address 