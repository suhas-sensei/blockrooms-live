

import mainnet from "../config/manifest_mainnet.json";
import sepolia from "../config/manifest_sepolia.json";


// Define valid deploy types
type DeployType = keyof typeof manifests;

// Create the manifests object
const manifests = {
  mainnet,
  sepolia
};

// Get deployment type from localStorage or fallback to sepolia
const getDeployType = (): DeployType => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('selected_network');
    if (stored === 'mainnet' || stored === 'sepolia') {
      return stored;
    }
  }
  return 'sepolia';
};

const deployType = getDeployType();

// Export the appropriate manifest with a fallback
export const manifest = manifests[deployType];
export type Manifest = typeof manifest;