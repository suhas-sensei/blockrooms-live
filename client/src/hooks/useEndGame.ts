import { useState, useCallback } from "react";
import useAppStore from "../zustand/store";

export function useEndGame() {
  const [isLoading, setIsLoading] = useState(false);
  const { resetGame } = useAppStore();

  const endGame = useCallback(async () => {
    setIsLoading(true);
    try {
      // Local game end - reset state
      resetGame();
      return { success: true, error: null };
    } finally {
      setIsLoading(false);
    }
  }, [resetGame]);

  const canEndGame = true;

  return {
    endGame,
    isLoading,
    canEndGame,
  };
}
