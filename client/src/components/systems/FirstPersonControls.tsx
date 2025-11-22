import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import * as THREE from "three";
import { FirstPersonControlsProps, Keys } from "../../types/game";
import useAppStore from "../../zustand/store";

export function FirstPersonControls({
  onPositionUpdate, // Keep for backward compatibility
  onRotationUpdate, // Keep for backward compatibility
  disabled = false, // Disable controls during spawn sequence
}: FirstPersonControlsProps): null {
  const { camera, scene } = useThree();
  
  // Get player state and actions from store
  const { 
    position: playerPosition,
    rotation: playerRotation,
    updatePosition, 
    updateRotation,
    setMoving,
    setVelocity 
  } = useAppStore();
  
  const moveSpeed = 8;
  const playerRadius = 0.7; // Collision radius around player
  const baseHeight = 1.5; // Base camera height (eye level)
  const bobAmplitude = 0.08; // How much the camera bobs up and down
  const bobFrequency = 1; // How fast the bobbing occurs
  const bobTimeRef = useRef<number>(0); // Track time for bobbing animation
  const isMovingRef = useRef<boolean>(false); // Track if player is moving

  // ADD (right after isMovingRef):
const lastPushRef = useRef(0);                 // throttle store updates (~20Hz)
const raycasterRef = useRef(new THREE.Raycaster()); // reuse one raycaster

  // Reusable Vector3s for movement (avoid allocations every frame)
  const velocityRef = useRef(new Vector3());
  const directionRef = useRef(new Vector3());
  const rightRef = useRef(new Vector3());
  const newPositionRef = useRef(new Vector3());
  const xMovementRef = useRef(new Vector3());
  const zMovementRef = useRef(new Vector3());
  const xPositionRef = useRef(new Vector3());
  const zPositionRef = useRef(new Vector3());
  const tempPosRef = useRef(new Vector3()); // For legacy callback

  // Cache collision check directions (create once, reuse forever)
  const collisionDirections = useRef([
    new Vector3(1, 0, 0),           // right
    new Vector3(-1, 0, 0),          // left
    new Vector3(0, 0, 1),           // forward
    new Vector3(0, 0, -1),          // backward
    new Vector3(0.707, 0, 0.707),   // diagonal
    new Vector3(-0.707, 0, 0.707),  // diagonal
    new Vector3(0.707, 0, -0.707),  // diagonal
    new Vector3(-0.707, 0, -0.707), // diagonal
  ]);

  // Cache collidable objects (walls, floors, obstacles only - NOT lights, cameras, entities)
  const collidableObjects = useRef<THREE.Object3D[]>([]);

  const keys = useRef<Keys>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Sync camera position with store on mount and when store position changes
  useEffect(() => {
    camera.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
  }, [camera, playerPosition]);

// Ensure gun starts hidden so table props render (overrides any cached value)
useEffect(() => {
  useAppStore.setState({ showGun: false });
}, []);

  // Build collision cache: only walls, floors, obstacles (NOT lights/cameras/entities)
  useEffect(() => {
    const buildCollisionCache = () => {
      const collidables: THREE.Object3D[] = [];

      scene.traverse((obj) => {
        // Filter: only meshes with geometry, exclude lights, cameras, entities, invisible objects
        if (
          (obj as THREE.Mesh).geometry &&
          (obj as THREE.Mesh).material &&
          !(obj as THREE.Light).isLight &&
          !(obj as THREE.Camera).isCamera &&
          !obj.userData?.isEntity && // Exclude entities (enemies, pickups)
          obj.visible
        ) {
          collidables.push(obj);
        }
      });

      collidableObjects.current = collidables;
      console.log(`🔧 Collision cache built: ${collidables.length} objects (vs ${scene.children.length} total)`);
    };

    // Build cache on mount
    buildCollisionCache();

    // Rebuild cache every 2 seconds (in case doors open, objects spawn, etc.)
    const interval = setInterval(buildCollisionCache, 2000);
    return () => clearInterval(interval);
  }, [scene]);


// Handle keyboard input
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent): void => {
    // Ignore all input if controls are disabled
    if (disabled) {
      console.log('🚫 Controls disabled - ignoring key:', event.code);
      return;
    }

    switch (event.code) {
      // 👇 NEW: press T to pick up / show the gun
      case "KeyT":
        // Only trigger if gun not already shown or intro not playing
        const currentState = useAppStore.getState();
        if (currentState.showGun || currentState.showTalkieIntro) return;

        // Show talkie intro animation - PERMANENT FOR DEBUGGING
        useAppStore.setState({ showTalkieIntro: true });

        // TODO: Re-enable this after debugging size
        // After 4 seconds, hide talkie and show gun/UI
        // setTimeout(() => {
        //   useAppStore.setState({
        //     showTalkieIntro: false,
        //     showGun: true
        //   });
        // }, 4000);
        return;

      case "KeyW":
      case "ArrowUp":
        keys.current.forward = true;
        break;
      case "KeyS":
      case "ArrowDown":
        keys.current.backward = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        keys.current.left = true;
        break;
      case "KeyD":
      case "ArrowRight":
        keys.current.right = true;
        break;
      default:
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent): void => {
    // Ignore all input if controls are disabled
    if (disabled) return;

    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        keys.current.forward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        keys.current.backward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        keys.current.left = false;
        break;
      case "KeyD":
      case "ArrowRight":
        keys.current.right = false;
        break;
      default:
        break;
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
  };
}, [disabled]);


  // Check for collisions using raycasting
  const checkCollision = (newPosition: Vector3): boolean => {
    const raycaster = raycasterRef.current;

    // Use cached directions (no allocations!)
    const directions = collisionDirections.current;

    // Use cached collidable objects (HUGE optimization - only walls/floors, not entire scene!)
    const collidables = collidableObjects.current;

    // Early exit if cache not built yet
    if (collidables.length === 0) return false;

    // Check collision in multiple directions around the player
    for (const direction of directions) {
      raycaster.set(newPosition, direction);

      // OPTIMIZED: Only raycast against cached collidables (NOT scene.children!)
      // This is 10-100x faster depending on scene complexity
      const intersects = raycaster.intersectObjects(collidables, false); // false = non-recursive (already flat list)

      if (intersects.length > 0 && intersects[0].distance < playerRadius) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  };

  // Update camera position based on input with collision detection and running animation
  useFrame((state, delta: number) => {
    // If controls are disabled, skip all movement logic
    if (disabled) {
      return;
    }

    const dt = delta; // don't clamp for movement

    // Reuse Vector3s (no allocations!)
    const velocity = velocityRef.current;
    const direction = directionRef.current;
    const right = rightRef.current;

    // Reset velocity to zero
    velocity.set(0, 0, 0);

    camera.getWorldDirection(direction);
    direction.y = 0; // Keep movement horizontal
    direction.normalize();

    right.crossVectors(direction, camera.up).normalize();

    if (keys.current.forward) velocity.add(direction);
    if (keys.current.backward) velocity.sub(direction);
    if (keys.current.right) velocity.add(right);
    if (keys.current.left) velocity.sub(right);

    // Check if player is moving
    const isMoving = velocity.length() > 0;

    // Only update if state changed
    if (isMovingRef.current !== isMoving) {
      isMovingRef.current = isMoving;
      setMoving(isMoving);
    }

    if (isMoving) {
      velocity.normalize();
      velocity.multiplyScalar(moveSpeed * delta);

      // Calculate new position (reuse ref, no allocation!)
      const newPosition = newPositionRef.current;
      newPosition.copy(camera.position).add(velocity);

      // Check for collision before moving
      if (!checkCollision(newPosition)) {
        camera.position.copy(newPosition);
      } else {
        // Try moving in individual axes if diagonal movement is blocked (reuse refs!)
        const xMovement = xMovementRef.current;
        const zMovement = zMovementRef.current;
        const xPosition = xPositionRef.current;
        const zPosition = zPositionRef.current;

        xMovement.set(velocity.x, 0, 0);
        zMovement.set(0, 0, velocity.z);

        xPosition.copy(camera.position).add(xMovement);
        zPosition.copy(camera.position).add(zMovement);

        if (!checkCollision(xPosition)) {
          camera.position.add(xMovement);
        } else if (!checkCollision(zPosition)) {
          camera.position.add(zMovement);
        }
        // If both individual axes are blocked, don't move
      }
    }

    // Handle running animation (head bob)
    if (isMovingRef.current) {
      // Increment bob time when moving
      bobTimeRef.current += delta * bobFrequency;

      // Calculate bobbing offset using sine wave
      const bobOffset = Math.sin(bobTimeRef.current) * bobAmplitude;

      // Apply bobbing to camera Y position
      camera.position.y = baseHeight + bobOffset;
    } else {
      // When not moving, gradually return to base height
      const currentHeight = camera.position.y;
      const heightDiff = baseHeight - currentHeight;

      // Smooth interpolation back to base height
      if (Math.abs(heightDiff) > 0.001) {
 camera.position.y += heightDiff * delta * 5;

      } else {
        camera.position.y = baseHeight;
      }

      // Reset bob time when not moving
      bobTimeRef.current = 0;
    }

    // Throttle store updates to ~20Hz instead of 60Hz
    const rotation = camera.rotation.y;
    const now = performance.now();
    if (now - lastPushRef.current > 50) {
      lastPushRef.current = now;

      updatePosition({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      });

      updateRotation(rotation);
    }

    // Call legacy callbacks for backward compatibility
    if (onPositionUpdate) {
      // Reuse temp vector to avoid allocation
      tempPosRef.current.copy(camera.position);
      onPositionUpdate(tempPosRef.current);
    }
    if (onRotationUpdate) {
      onRotationUpdate(rotation);
    }
  });

  return null;
}