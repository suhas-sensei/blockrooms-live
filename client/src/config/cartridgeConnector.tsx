import { Connector } from "@starknet-react/core";
import { ControllerConnector } from "@cartridge/connector";
import { ControllerOptions } from "@cartridge/controller";
import { constants } from "starknet";
import { manifest } from "./manifest";
import { getStoredNetwork, getCurrentNetworkConfig } from "./networkConfig";

// Get the current network from localStorage
const currentNetwork = getStoredNetwork();
const networkConfig = getCurrentNetworkConfig();

console.log("Current Network:", currentNetwork);

const getRpcUrl = () => {
  switch (currentNetwork) {
    case "mainnet":
        return "https://api.cartridge.gg/x/starknet/mainnet";
    case "sepolia":
        return "https://api.cartridge.gg/x/starknet/sepolia";
    default:
        return "https://api.cartridge.gg/x/starknet/sepolia";
  }
};

const getDefaultChainId = () => {
  switch (currentNetwork) {
    case "mainnet":
        return constants.StarknetChainId.SN_MAIN;
    case "sepolia":
        return constants.StarknetChainId.SN_SEPOLIA;
    default:
        return constants.StarknetChainId.SN_SEPOLIA;
  }
};

const getGameContractAddress = () => {
  return manifest.contracts[0].address;

};

const CONTRACT_ADDRESS_GAME = getGameContractAddress();
console.log("Using game contract address:", CONTRACT_ADDRESS_GAME);

const policies = {
  contracts: {
    [CONTRACT_ADDRESS_GAME]: {
      methods: [
        { name: "initialize_player", entrypoint: "initialize_player" },
        { name: "respawn_player", entrypoint: "respawn_player" },
        { name: "start_game", entrypoint: "start_game" },
        { name: "end_game", entrypoint: "end_game" },
        { name: "move_player", entrypoint: "move_player" },
        { name: "attack_entity", entrypoint: "attack_entity" },
        { name: "enter_door", entrypoint: "enter_door" },
        { name: "exit_door", entrypoint: "exit_door" },
        { name: "collect_shard", entrypoint: "collect_shard" },
        { name: "get_entities_in_room", entrypoint: "get_entities_in_room" },
        { name: "get_game_status", entrypoint: "get_game_status" },
        { name: "get_nearby_doors", entrypoint: "get_nearby_doors" },
        { name: "get_player_state", entrypoint: "get_player_state" },
        { name: "get_room_state", entrypoint: "get_room_state" },
        { name: "get_shards_in_room", entrypoint: "get_shards_in_room" },
      ],
    },
  },
}

const options: ControllerOptions = {
  chains: [{ rpcUrl: getRpcUrl() }],
  defaultChainId: getDefaultChainId(),
  policies,
  namespace: "blockrooms",
  slot: "blockrooms",
};

const cartridgeConnector = new ControllerConnector(
  options,
) as never as Connector;

export default cartridgeConnector; 