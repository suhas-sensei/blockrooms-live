import type { PropsWithChildren } from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
    jsonRpcProvider,
    StarknetConfig,
    starkscan,
} from "@starknet-react/core";
import cartridgeConnector from "../config/cartridgeConnector";
import { getStoredNetwork } from "../config/networkConfig";

export default function StarknetProvider({ children }: PropsWithChildren) {
    const { VITE_PUBLIC_DEPLOY_TYPE, VITE_PUBLIC_NODE_URL } = import.meta.env;

    // Determine network: env variable takes priority, then localStorage, then default to sepolia
    const getNetwork = () => {
        // If env is explicitly set (for mainnet .env file), use that
        if (VITE_PUBLIC_DEPLOY_TYPE && VITE_PUBLIC_NODE_URL) {
            console.log('StarknetProvider: Using env-based network:', VITE_PUBLIC_DEPLOY_TYPE);
            return VITE_PUBLIC_DEPLOY_TYPE;
        }

        // Otherwise use localStorage (for button switching)
        const storedNetwork = getStoredNetwork();
        console.log('StarknetProvider: Using localStorage network:', storedNetwork);
        return storedNetwork;
    };

    const network = getNetwork();

    // Get RPC URL based on network
    const getRpcUrl = () => {
        // If env has explicit NODE_URL, use that
        if (VITE_PUBLIC_NODE_URL) {
            return VITE_PUBLIC_NODE_URL;
        }

        // Otherwise use default URLs
        switch (network) {
            case "mainnet":
                return "https://api.cartridge.gg/x/starknet/mainnet";
            case "sepolia":
                return "https://api.cartridge.gg/x/starknet/sepolia";
            default:
                return "https://api.cartridge.gg/x/starknet/sepolia";
        }
    };

    // Create provider with the correct RPC URL
    const provider = jsonRpcProvider({
        rpc: () => ({ nodeUrl: getRpcUrl() }),
    });

    // Determine which chain to use
    const chains = network === "mainnet"
        ? [mainnet]
        : [sepolia];

    return (
        <StarknetConfig
            autoConnect
            chains={chains}
            connectors={[cartridgeConnector]}
            explorer={starkscan}
            provider={provider}
        >
            {children}
        </StarknetConfig>
    );
}