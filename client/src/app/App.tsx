import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import useAppStore, { GamePhase } from "../zustand/store";
import { usePlayerMovement } from "../dojo/hooks/usePlayerMovement";
import { TransactionPopup } from "../components/ui/TransactionPopup";
import { MainMenu } from "../components/ui/MainMenu";
import { PlayerHUD } from "../components/ui/PlayerHUD";
import FloorGrid from "../components/game/FloorGrid";
import { PlayerCube } from "../components/game/PlayerCube";
import { FirstPersonControls } from "../components/systems/FirstPersonControls";
import { useGameData } from "../dojo/hooks/useGameData";

/**
 * Simplified game with just cube characters and a plane floor
 */
function GameScene() {
  const { position, player } = useAppStore();
  const { allPlayers } = useGameData();

  // Get all players from the game data
  const otherPlayers = allPlayers?.filter(
    (p) => p.player_id !== player?.player_id
  ) || [];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <hemisphereLight args={["#87CEEB", "#8B4513", 0.4]} />

      {/* Floor Grid */}
      <FloorGrid />

      {/* Local Player Cube */}
      {player && (
        <PlayerCube
          position={[position.x, position.y, position.z]}
          playerId={player.player_id}
          isLocalPlayer={true}
        />
      )}

      {/* Other Players' Cubes */}
      {otherPlayers.map((otherPlayer) => (
        <PlayerCube
          key={otherPlayer.player_id}
          position={[
            Number(otherPlayer.position.x),
            1.5,
            Number(otherPlayer.position.y), // Contract Y maps to frontend Z
          ]}
          playerId={otherPlayer.player_id}
          color="#4287f5"
          isLocalPlayer={false}
        />
      ))}

      {/* First Person Controls */}
      <FirstPersonControls />

      {/* Pointer Lock Controls */}
      <PointerLockControls />
    </>
  );
}

/**
 * Main App Component
 */
export function App() {
  const { gameStarted, player, gamePhase } = useAppStore();
  const {
    showTransactionPopup,
    transactionError,
    isProcessingTransaction,
    closeTransactionPopup,
  } = usePlayerMovement();

  // Fetch game data when player exists
  const { refetch } = useGameData();

  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        refetch();
      }, 2000); // Refetch every 2 seconds to get other players' positions

      return () => clearInterval(interval);
    }
  }, [player, refetch]);

  // Show main menu if game hasn't started
  if (!gameStarted || gamePhase !== GamePhase.ACTIVE) {
    return <MainMenu />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.7, 0], fov: 75 }}
        gl={{ antialias: false, alpha: false }}
        style={{ background: "#87CEEB" }}
      >
        <GameScene />
      </Canvas>

      {/* UI Overlays */}
      <PlayerHUD />

      {/* Transaction Popup */}
      <TransactionPopup
        isVisible={showTransactionPopup}
        isLoading={isProcessingTransaction}
        error={transactionError}
        onClose={closeTransactionPopup}
      />

      {/* ESC hint */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          background: "rgba(0, 0, 0, 0.7)",
          padding: "8px 16px",
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 14,
          pointerEvents: "none",
        }}
      >
        Press ESC to unlock mouse
      </div>
    </div>
  );
}

export default App;
