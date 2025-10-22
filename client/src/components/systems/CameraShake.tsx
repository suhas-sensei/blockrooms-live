import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraShakeProps {
  trigger: boolean;
  intensity?: number;
  duration?: number;
  continuous?: boolean; // For continuous dizzy effect
  onComplete?: () => void;
}

export const CameraShake: React.FC<CameraShakeProps> = ({
  trigger,
  intensity = 0.3,
  duration = 1.0,
  continuous = false,
  onComplete
}) => {
  const { camera } = useThree();
  const shakeTimeRef = useRef<number>(0);
  const isShakingRef = useRef<boolean>(false);
  const originalRotationRef = useRef<THREE.Euler | null>(null);

  useEffect(() => {
    if (trigger && !isShakingRef.current) {
      isShakingRef.current = true;
      shakeTimeRef.current = 0;
      originalRotationRef.current = camera.rotation.clone();
    } else if (!trigger && isShakingRef.current) {
      // Stop shaking when trigger becomes false
      if (originalRotationRef.current) {
        camera.rotation.copy(originalRotationRef.current);
      }
      isShakingRef.current = false;
      shakeTimeRef.current = 0;
    }
  }, [trigger, camera]);

  useFrame((state, delta) => {
    if (!isShakingRef.current) return;

    shakeTimeRef.current += delta;

    // For continuous mode, use a gentle sine wave for dizzy effect
    if (continuous) {
      const time = shakeTimeRef.current;
      const dizzyIntensity = intensity * 0.3; // Reduced intensity for continuous effect

      // Gentle sine wave motion for dizzy feel
      const shakeX = Math.sin(time * 2) * dizzyIntensity;
      const shakeY = Math.sin(time * 1.5) * dizzyIntensity * 0.8;
      const shakeZ = Math.sin(time * 2.5) * dizzyIntensity * 0.4;

      if (originalRotationRef.current) {
        camera.rotation.x = originalRotationRef.current.x + shakeX;
        camera.rotation.y = originalRotationRef.current.y + shakeY;
        camera.rotation.z = originalRotationRef.current.z + shakeZ;
      }
      return; // Don't complete in continuous mode
    }

    // Non-continuous mode: normal shake that completes
    if (shakeTimeRef.current >= duration) {
      // Shake complete - restore original rotation
      if (originalRotationRef.current) {
        camera.rotation.copy(originalRotationRef.current);
      }
      isShakingRef.current = false;
      shakeTimeRef.current = 0;
      if (onComplete) onComplete();
      return;
    }

    // Calculate shake intensity that decreases over time
    const progress = shakeTimeRef.current / duration;
    const currentIntensity = intensity * (1 - progress);

    // Apply random rotation shake
    const shakeX = (Math.random() - 0.5) * currentIntensity;
    const shakeY = (Math.random() - 0.5) * currentIntensity;
    const shakeZ = (Math.random() - 0.5) * currentIntensity * 0.5; // Less z-axis shake

    if (originalRotationRef.current) {
      camera.rotation.x = originalRotationRef.current.x + shakeX;
      camera.rotation.y = originalRotationRef.current.y + shakeY;
      camera.rotation.z = originalRotationRef.current.z + shakeZ;
    }
  });

  return null;
};
