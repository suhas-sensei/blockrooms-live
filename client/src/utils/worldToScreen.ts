import * as THREE from "three";

/**
 * Converts a 3D world position to 2D screen coordinates
 * @param worldPosition - The 3D position in world space
 * @param camera - The Three.js camera
 * @returns Object with x, y screen coordinates and isVisible flag
 */
export function worldToScreen(
  worldPosition: THREE.Vector3,
  camera: THREE.Camera
): { x: number; y: number; isVisible: boolean } {
  // Clone to avoid modifying the original
  const vector = worldPosition.clone();

  // Project to normalized device coordinates (-1 to +1)
  vector.project(camera);

  // Check if the point is behind the camera
  const isVisible = vector.z < 1;

  // Convert to screen coordinates
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

  return { x, y, isVisible };
}
