

import mainnet from "../config/manifest_mainnet.json";
import sepolia from "../config/manifest_sepolia.json";
import useAppStore from "../zustand/store";


// Define valid deploy types
type DeployType = keyof typeof manifests;

// Create the manifests object
const manifests = {
  mainnet,
  sepolia
};

// Function to get the manifest based on the selected network
export const getManifest = () => {
  const selectedNetwork = useAppStore.getState().selectedNetwork;

  // Use selected network from store, default to sepolia for free play
  if (selectedNetwork && selectedNetwork in manifests) {
    const manifest = manifests[selectedNetwork as DeployType];
    console.log(`📋 Using ${selectedNetwork} manifest with world address: ${manifest.world.address}`);
    return manifest;
  }

  // Default to sepolia for free play
  return manifests.sepolia;
};

// Export the appropriate manifest with a fallback
export const manifest = getManifest();
export type Manifest = typeof manifest;