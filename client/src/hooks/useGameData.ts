import { useCallback } from "react";

export function useGameData() {
  // Local game data - no blockchain fetching needed
  const refetch = useCallback(async () => {
    // No-op for local game
    return;
  }, []);

  return {
    refetch,
    isLoading: false,
    playerStats: null,
  };
}
