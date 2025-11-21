import { useState, useCallback } from "react";

export function usePlayerMovement() {
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);

  const closeTransactionPopup = useCallback(() => {
    setShowTransactionPopup(false);
    setTransactionError(null);
  }, []);

  const movePlayer = useCallback(async (xDelta: number, yDelta: number) => {
    // Local movement - no blockchain
    return { success: true };
  }, []);

  return {
    showTransactionPopup,
    transactionError,
    isProcessingTransaction,
    closeTransactionPopup,
    movePlayer,
  };
}
