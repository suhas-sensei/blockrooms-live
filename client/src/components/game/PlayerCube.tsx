import React, { useRef } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface PlayerCubeProps {
  position: [number, number, number];
  playerId: string;
  color?: string;
  isLocalPlayer?: boolean;
}

/**
 * Simple cube character with player name floating above
 */
export const PlayerCube: React.FC<PlayerCubeProps> = ({
  position,
  playerId,
  color = "#4287f5",
  isLocalPlayer = false,
}) => {
  const cubeRef = useRef<THREE.Mesh>(null);

  // Shorten the player ID for display
  const displayName = `${playerId.slice(0, 6)}...${playerId.slice(-4)}`;

  // Different color for local player
  const cubeColor = isLocalPlayer ? "#42f554" : color;

  return (
    <group position={position}>
      {/* Player cube */}
      <mesh ref={cubeRef} position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={cubeColor}
          emissive={cubeColor}
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Player name label floating above cube */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
        font="/fonts/Inter-Bold.ttf"
      >
        {displayName}
      </Text>

      {/* Optional: point light for visibility */}
      {isLocalPlayer && (
        <pointLight position={[0, 1, 0]} intensity={0.5} distance={5} color={cubeColor} />
      )}
    </group>
  );
};

export default PlayerCube;
