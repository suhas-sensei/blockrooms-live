import { createDojoConfig } from "@dojoengine/core";

import { manifest } from "../config/manifest";
import { getCurrentNetworkConfig } from "../config/networkConfig";

const {
    VITE_PUBLIC_MASTER_ADDRESS,
    VITE_PUBLIC_MASTER_PRIVATE_KEY,
  } = import.meta.env;

// Get network config from localStorage or default to sepolia
const networkConfig = getCurrentNetworkConfig();

export const dojoConfig = createDojoConfig({
    manifest,
    masterAddress: VITE_PUBLIC_MASTER_ADDRESS || '',
    masterPrivateKey: VITE_PUBLIC_MASTER_PRIVATE_KEY || '',
    rpcUrl: networkConfig.nodeUrl,
    toriiUrl: networkConfig.toriiUrl,
});