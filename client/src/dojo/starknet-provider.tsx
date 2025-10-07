import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
    jsonRpcProvider,
    StarknetConfig,
    starkscan,
} from "@starknet-react/core";
import { createCartridgeConnectorDynamic } from "../config/cartridgeConnector";
import useAppStore from "../zustand/store";

export default function StarknetProvider({ children }: PropsWithChildren) {
    const selectedNetwork = useAppStore((state) => state.selectedNetwork);

    // Default to sepolia for free play
    const effectiveNetwork = selectedNetwork || "sepolia";

    // Get RPC URL based on selected network
    const getRpcUrl = useMemo(() => {
        return effectiveNetwork === "sepolia"
            ? "https://api.cartridge.gg/x/starknet/sepolia"
            : "https://api.cartridge.gg/x/starknet/mainnet";
    }, [effectiveNetwork]);

    // Create provider with the correct RPC URL
    const provider = useMemo(() => jsonRpcProvider({
        rpc: () => ({ nodeUrl: getRpcUrl }),
    }), [getRpcUrl]);

    // Determine which chain to use
    const chains = useMemo(() =>
        effectiveNetwork === "mainnet" ? [mainnet] : [sepolia],
        [effectiveNetwork]
    );

    // Create connector based on selected network
    const connector = useMemo(() =>
        createCartridgeConnectorDynamic(effectiveNetwork),
        [effectiveNetwork]
    );

    return (
        <StarknetConfig
            autoConnect
            chains={chains}
            connectors={[connector]}
            explorer={starkscan}
            provider={provider}
        >
            {children}
        </StarknetConfig>
    );
}