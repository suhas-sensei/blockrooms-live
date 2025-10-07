import { createDojoConfig } from "@dojoengine/core";
import { getManifest } from "../config/manifest";
import useAppStore from "../zustand/store";

const {
    VITE_PUBLIC_MASTER_ADDRESS,
    VITE_PUBLIC_MASTER_PRIVATE_KEY,
  } = import.meta.env;

// Function to get network-specific URLs
const getNetworkUrls = () => {
  const selectedNetwork = useAppStore.getState().selectedNetwork;
  // Default to sepolia for free play
  const network = selectedNetwork || "sepolia";

  const rpcUrl = network === "sepolia"
    ? "https://api.cartridge.gg/x/starknet/sepolia"
    : "https://api.cartridge.gg/x/starknet/mainnet";

  const toriiUrl = network === "sepolia"
    ? "https://api.cartridge.gg/x/blockrooms-sepolia/torii"
    : "https://api.cartridge.gg/x/blockrooms-main/torii";

  console.log(`🔧 Dojo Config - Network: ${network}`);
  console.log(`   RPC URL: ${rpcUrl}`);
  console.log(`   Torii URL: ${toriiUrl}`);

  return { rpcUrl, toriiUrl };
};

export const createDojoConfigDynamic = () => {
  const { rpcUrl, toriiUrl } = getNetworkUrls();

  return createDojoConfig({
    manifest: getManifest(),
    masterAddress: VITE_PUBLIC_MASTER_ADDRESS || '',
    masterPrivateKey: VITE_PUBLIC_MASTER_PRIVATE_KEY || '',
    rpcUrl: rpcUrl,
    toriiUrl: toriiUrl,
  });
};

// Default export for backwards compatibility (uses Sepolia by default)
export const dojoConfig = createDojoConfigDynamic();