import { createDojoConfig } from "@dojoengine/core";

import { manifest } from "../config/manifest";
import { getCurrentNetworkConfig } from "../config/networkConfig";

const {
    VITE_PUBLIC_MASTER_ADDRESS,
    VITE_PUBLIC_MASTER_PRIVATE_KEY,
    VITE_PUBLIC_NODE_URL,
    VITE_PUBLIC_TORII,
    VITE_PUBLIC_DEPLOY_TYPE,
  } = import.meta.env;

// Prioritize env variables if set, otherwise use networkConfig from localStorage
const getConfig = () => {
  // If env variables are explicitly set, use them (for mainnet env file)
  if (VITE_PUBLIC_NODE_URL && VITE_PUBLIC_TORII) {
    console.log('Using env-based config:', VITE_PUBLIC_DEPLOY_TYPE);
    return {
      rpcUrl: VITE_PUBLIC_NODE_URL,
      toriiUrl: VITE_PUBLIC_TORII,
    };
  }

  // Otherwise use networkConfig (for button-based switching)
  const networkConfig = getCurrentNetworkConfig();
  console.log('Using localStorage-based config:', networkConfig.deployType);
  return {
    rpcUrl: networkConfig.nodeUrl,
    toriiUrl: networkConfig.toriiUrl,
  };
};

const config = getConfig();

export const dojoConfig = createDojoConfig({
    manifest,
    masterAddress: VITE_PUBLIC_MASTER_ADDRESS || '',
    masterPrivateKey: VITE_PUBLIC_MASTER_PRIVATE_KEY || '',
    rpcUrl: config.rpcUrl,
    toriiUrl: config.toriiUrl,
});