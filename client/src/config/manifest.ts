

import mainnet from "../config/manifest_mainnet.json";
import sepolia from "../config/manifest_sepolia.json";


// Define valid deploy types
type DeployType = keyof typeof manifests;

// Create the manifests object
const manifests = {
  mainnet,
  sepolia
};

// Get deployment type: env variable takes priority, then localStorage, then default to sepolia
const getDeployType = (): DeployType => {
  // Check if env variable is set (for mainnet .env file)
  const envDeployType = import.meta.env.VITE_PUBLIC_DEPLOY_TYPE;
  const envNodeUrl = import.meta.env.VITE_PUBLIC_NODE_URL;

  if (envDeployType && envNodeUrl) {
    console.log('Manifest: Using env-based deployment:', envDeployType);
    if (envDeployType === 'mainnet' || envDeployType === 'sepolia') {
      return envDeployType;
    }
  }

  // Otherwise check localStorage (for button switching)
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('selected_network');
    if (stored === 'mainnet' || stored === 'sepolia') {
      console.log('Manifest: Using localStorage deployment:', stored);
      return stored;
    }
  }

  console.log('Manifest: Using default deployment: sepolia');
  return 'sepolia';
};

const deployType = getDeployType();

// Export the appropriate manifest with a fallback
export const manifest = manifests[deployType];
export type Manifest = typeof manifest;