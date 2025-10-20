import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Model as TalkieModel } from '../../models/Talkie';
import * as THREE from 'three';

export const TalkieIntro: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const containerRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Rotate the talkie, pulse the glow, and follow camera
  useFrame((state, delta) => {
    // Position in front of camera
    if (containerRef.current) {
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      // Position 3 units in front of camera
      const targetPosition = camera.position.clone().add(cameraDirection.multiplyScalar(1.5));
      containerRef.current.position.copy(targetPosition);
      

      // Make it face the camera
      containerRef.current.lookAt(camera.position);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 1.2; // Smooth rotation speed
    }

    // Pulsing glow effect
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.9;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={containerRef}>
      {/* Large glowing aura backdrop - orange/yellow - 2x increased */}
      <mesh ref={glowRef} position={[0, 0, -0.106]}>
        <circleGeometry args={[0.334, 64]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Middle glow layer - 2x increased */}
      <mesh position={[0, 0, -0.08]}>
        <circleGeometry args={[0.266, 64]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Inner bright glow - 2x increased */}
      <mesh position={[0, 0, -0.054]}>
        <circleGeometry args={[0.174, 64]} />
        <meshBasicMaterial
          color="#ffdd44"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Rotating Talkie model - 5x smaller (1.2 / 5 = 0.24) */}
      <group ref={groupRef} scale={0.06}>
        <TalkieModel />

        {/* Strong point lights to illuminate the model - adjusted for smaller scale */}
        <pointLight position={[0, 0, 0.4]} intensity={1.5} color="#ffaa00" distance={2} />
        <pointLight position={[0.4, 0.4, 0.2]} intensity={1} color="#ffffff" distance={1.6} />
        <pointLight position={[-0.4, 0.2, 0.2]} intensity={0.8} color="#ff8800" distance={1.6} />

        {/* Rim light from behind */}
        <pointLight position={[0, 0, -0.4]} intensity={1} color="#ffcc00" distance={1.2} />
      </group>

      {/* Ambient light for overall visibility */}
      <ambientLight intensity={0.3} color="#ffffff" />
    </group>
  );
};

export default TalkieIntro;
