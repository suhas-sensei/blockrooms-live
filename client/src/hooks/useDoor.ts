import { useState, useCallback } from "react";
import useAppStore from "../zustand/store";

export function useOpenDoor() {
  const [isLoading, setIsLoading] = useState(false);
  const { updateRoom, currentRoom } = useAppStore();

  const enterDoor = useCallback(async (doorId: string) => {
    setIsLoading(true);
    try {
      // Simulate door entry - local only
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, error: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exitDoor = useCallback(async (doorId: string) => {
    setIsLoading(true);
    try {
      // Simulate door exit - local only
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, error: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    enterDoor,
    exitDoor,
  };
}
