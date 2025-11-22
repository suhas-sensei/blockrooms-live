import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BloodEffectProps } from "../../types/game";

export function BloodEffect({
  position,
  onComplete,
}: BloodEffectProps): JSX.Element {
  const bloodRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null!);
  const startTimeRef = useRef<number>(Date.now());
  const FADE_DURATION = 3000; // 3 seconds in milliseconds

  useEffect(() => {
    // Load blood texture with GPU optimizations
    const textureLoader = new THREE.TextureLoader();
    const bloodTexture = textureLoader.load("/blood.png", (texture) => {
      // Enable mipmapping for better GPU performance
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    });

    if (materialRef.current) {
      materialRef.current.map = bloodTexture;
      materialRef.current.transparent = true;
      materialRef.current.needsUpdate = true;
    }

    startTimeRef.current = Date.now();
  }, []);

  // GPU-based animation using useFrame instead of setInterval
  useFrame(() => {
    if (!materialRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const progress = elapsed / FADE_DURATION;

    if (progress >= 1) {
      if (onComplete) onComplete();
      return;
    }

    // Smoothly fade out on GPU
    materialRef.current.opacity = 1 - progress;
  });

  return (
    <mesh ref={bloodRef} position={position}>
      <planeGeometry args={[0.7, 0.7]} />
      <meshBasicMaterial ref={materialRef} side={THREE.DoubleSide} transparent />
    </mesh>
  );
}
