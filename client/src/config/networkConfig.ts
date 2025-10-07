export type NetworkType = 'mainnet' | 'sepolia';

export interface NetworkConfig {
  deployType: string;
  nodeUrl: string;
  toriiUrl: string;
}

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    deployType: 'mainnet',
    nodeUrl: 'https://api.cartridge.gg/x/starknet/mainnet',
    toriiUrl: 'https://api.cartridge.gg/x/blockrooms-main/torii',
  },
  sepolia: {
    deployType: 'sepolia',
    nodeUrl: 'https://api.cartridge.gg/x/starknet/sepolia',
    toriiUrl: 'https://api.cartridge.gg/x/blockrooms/torii',
  },
};

// Store the selected network in localStorage
const NETWORK_KEY = 'selected_network';

export function getStoredNetwork(): NetworkType {
  const stored = localStorage.getItem(NETWORK_KEY);
  return (stored === 'mainnet' || stored === 'sepolia') ? stored : 'sepolia';
}

export function setStoredNetwork(network: NetworkType): void {
  localStorage.setItem(NETWORK_KEY, network);
}

export function getCurrentNetworkConfig(): NetworkConfig {
  return NETWORKS[getStoredNetwork()];
}
