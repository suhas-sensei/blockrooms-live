import { useState, useCallback } from "react";
import useAppStore from "../zustand/store";

export function useAttackEntity() {
  const [isLoading, setIsLoading] = useState(false);
  const { removeEntity } = useAppStore();

  const attackEntity = useCallback(async (entityId: string) => {
    setIsLoading(true);
    try {
      // Local attack - just remove the entity
      removeEntity(entityId);
      return { success: true, error: null };
    } finally {
      setIsLoading(false);
    }
  }, [removeEntity]);

  return {
    attackEntity,
    isLoading,
  };
}
