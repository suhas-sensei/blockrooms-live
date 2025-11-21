import { useState, useCallback } from "react";
import useAppStore from "../zustand/store";

export function useCollectShard() {
  const [isLoading, setIsLoading] = useState(false);
  const { updateShardLocation, player, setPlayer } = useAppStore();

  const collectShard = useCallback(async (shardId: string) => {
    setIsLoading(true);
    try {
      // Local shard collection
      updateShardLocation({
        shard_id: shardId,
        room_id: 0,
        numbered_shard: shardId,
        collected: true,
      });

      // Update player shards count
      if (player) {
        setPlayer({
          ...player,
          shards: player.shards + 1,
        });
      }

      return { success: true, error: null };
    } finally {
      setIsLoading(false);
    }
  }, [updateShardLocation, player, setPlayer]);

  return {
    collectShard,
    isLoading,
  };
}
