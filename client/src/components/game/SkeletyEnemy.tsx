import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { GLTF } from 'three-stdlib';

type ActionName = 'Lesha_walk' | 'Lesha_attack_1' | 'Lesha_idle' | 'Lesha_hitted_1' | 'Lesha_hitted_2';

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

type GLTFResult = GLTF & {
  nodes: {
    Object_23: THREE.Mesh;
    Object_65: THREE.Mesh;
    Object_67: THREE.Mesh;
    Object_69: THREE.Mesh;
    Object_63: THREE.Mesh;
    Object_7: THREE.SkinnedMesh;
    Object_8: THREE.SkinnedMesh;
    Object_10: THREE.SkinnedMesh;
    Object_12: THREE.SkinnedMesh;
    Object_14: THREE.SkinnedMesh;
    GLTF_created_0_rootJoint: THREE.Bone;
  };
  materials: {
    bgl_mat: THREE.MeshPhysicalMaterial;
    Hilt: THREE.MeshPhysicalMaterial;
    Blade: THREE.MeshPhysicalMaterial;
    Pummel: THREE.MeshStandardMaterial;
    Handle: THREE.MeshStandardMaterial;
    Bones___Vray: THREE.MeshPhysicalMaterial;
    Material: THREE.MeshStandardMaterial;
    Undead_Gear: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

interface SkeletyEnemyProps {
  playerPosition: { x: number; y: number; z: number };
  hasGun: boolean;
  onHit: () => void;
  visible: boolean;
}

type SkeletyState = 'idle' | 'charging' | 'attacking' | 'hit' | 'dead';

export const SkeletyEnemy: React.FC<SkeletyEnemyProps> = ({
  playerPosition,
  hasGun,
  onHit,
  visible
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/skelety.glb');

  // Log loaded animations
  useEffect(() => {
    console.log('📦 Skelety GLTF loaded. Animations:', animations.map(a => a.name));
  }, [animations]);

  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as GLTFResult;
  const { actions } = useAnimations(animations, group);

  const [state, setState] = useState<SkeletyState>('idle');
  const [health, setHealth] = useState(3);
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [hasStartedCharging, setHasStartedCharging] = useState(false);
  const [chargeStartTime, setChargeStartTime] = useState<number | null>(null);
  const [hasSpawned, setHasSpawned] = useState(false);
  const attackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convert player position to Vector3
  const playerPosVec3 = useMemo(
    () => new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z),
    [playerPosition.x, playerPosition.y, playerPosition.z]
  );

  // Initialize position within 10-30 units away from player on mount
  useEffect(() => {
    if (visible && !hasSpawned) {
      // Random angle around player (0-360 degrees)
      const angle = Math.random() * Math.PI * 2;
      // Random distance between 10-30 units
      const distance = 10 + Math.random() * 20; // 10 + (0-20) = 10-30 units

      // Calculate spawn position using polar coordinates
      const direction = new THREE.Vector3(
        Math.cos(angle),
        0,
        Math.sin(angle)
      );

      const spawnPos = playerPosVec3.clone().add(direction.multiplyScalar(distance));
      spawnPos.y = 0; // Keep at ground level
      setPosition(spawnPos);
      setHasSpawned(true);
      console.log('🦴 Skelety spawned at:', spawnPos);
      console.log('🦴 Distance from player:', distance.toFixed(2), 'units');
      console.log('🦴 Player position:', playerPosVec3);
      console.log('🦴 hasGun:', hasGun);
    }
  }, [visible, playerPosVec3, hasSpawned, hasGun]);

  // Start charging 10 seconds after player gets gun
  useEffect(() => {
    if (hasGun && !hasStartedCharging && !chargeStartTime) {
      console.log('⏱️ Skelety will charge in 10 seconds...');
      console.log('⏱️ Current time:', Date.now());
      setChargeStartTime(Date.now());
    }
  }, [hasGun, hasStartedCharging, chargeStartTime]);

  // Debug log for state changes
  useEffect(() => {
    console.log(`🎮 Skelety state changed to: ${state}`);
  }, [state]);

  // Debug log for available animations
  useEffect(() => {
    if (actions) {
      console.log('✅ Actions object:', Object.keys(actions));
      console.log('✅ Action details:', Object.entries(actions).map(([name, action]) => ({
        name,
        exists: !!action,
        duration: action?.getClip().duration
      })));
    } else {
      console.log('❌ No actions object');
    }
  }, [actions]);

  // Update animation based on state
  useEffect(() => {
    if (!actions) {
      console.log('⚠️ No actions available');
      return;
    }

    console.log(`🎬 Playing animation for state: ${state}`);

    // Stop all animations first
    Object.values(actions).forEach((action) => {
      if (action) {
        action.stop();
        action.weight = 0;
      }
    });

    // Play animation based on state
    switch (state) {
      case 'idle':
        if (actions.Lesha_idle) {
          actions.Lesha_idle
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .setLoop(THREE.LoopRepeat, Infinity)
            .fadeIn(0.3)
            .play();
          console.log('▶️ Playing idle animation (looping)');
        } else {
          console.log('❌ Lesha_idle animation not found');
        }
        break;
      case 'charging':
        if (actions.Lesha_walk) {
          actions.Lesha_walk
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .setLoop(THREE.LoopRepeat, Infinity)
            .fadeIn(0.3)
            .play();
          console.log('▶️ Playing walk animation (looping)');
        } else {
          console.log('❌ Lesha_walk animation not found');
        }
        break;
      case 'attacking':
        if (actions.Lesha_attack_1) {
          actions.Lesha_attack_1
            .reset()
            .setEffectiveTimeScale(1.5)
            .setEffectiveWeight(1)
            .setLoop(THREE.LoopRepeat, Infinity)
            .fadeIn(0.1)
            .play();
          console.log('▶️ Playing attack animation (looping)');
          console.log('🔍 Attack action paused?', actions.Lesha_attack_1.paused);
          console.log('🔍 Attack action enabled?', actions.Lesha_attack_1.enabled);
          console.log('🔍 Attack action isRunning?', actions.Lesha_attack_1.isRunning());
          console.log('🔍 Attack action time:', actions.Lesha_attack_1.time);
        } else {
          console.log('❌ Lesha_attack_1 animation not found');
        }
        // Clear any existing timeout
        if (attackTimeoutRef.current) {
          clearTimeout(attackTimeoutRef.current);
        }
        // Return to charging after attack
        attackTimeoutRef.current = setTimeout(() => {
          if (health > 0) {
            setState('charging');
          }
        }, 2000);
        break;
      case 'hit':
        const hitAnim = Math.random() > 0.5 ? actions.Lesha_hitted_1 : actions.Lesha_hitted_2;
        if (hitAnim) {
          hitAnim
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .setLoop(THREE.LoopOnce, 1)
            .fadeIn(0.1)
            .play();
          console.log('▶️ Playing hit animation (once)');
        } else {
          console.log('❌ Hit animations not found');
        }
        // Return to previous state after hit animation
        setTimeout(() => {
          if (health > 0) {
            setState(hasStartedCharging ? 'charging' : 'idle');
          }
        }, 500);
        break;
      case 'dead':
        // Play hit animation and fall down
        if (actions.Lesha_hitted_1) {
          actions.Lesha_hitted_1
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .setLoop(THREE.LoopOnce, 1)
            .fadeIn(0.2)
            .play();
          console.log('💀 Skelety died! Playing death animation (once)');
        } else {
          console.log('❌ Death animation not found');
        }
        break;
    }

    return () => {
      if (attackTimeoutRef.current) {
        clearTimeout(attackTimeoutRef.current);
      }
    };
  }, [state, actions, health, hasStartedCharging]);

  // Handle shooting
  useEffect(() => {
    const handleShot = (event: CustomEvent) => {
      if (!visible || state === 'dead') return;

      const { hit } = event.detail;
      if (!hit || !group.current) return;

      // Check if the hit is on this skelety (simple distance check)
      const skeletyBox = new THREE.Box3().setFromObject(group.current);
      if (skeletyBox.containsPoint(hit.point)) {
        console.log(`🎯 Skelety hit! Health: ${health - 1}/3`);

        setHealth((prev) => {
          const newHealth = prev - 1;
          if (newHealth <= 0) {
            setState('dead');
            onHit();
          } else {
            setState('hit');
          }
          return newHealth;
        });
      }
    };

    window.addEventListener('skelety:shot' as any, handleShot);
    return () => window.removeEventListener('skelety:shot' as any, handleShot);
  }, [visible, state, health, onHit]);

  // Movement and behavior logic
  useFrame((_, delta) => {
    if (!visible || !group.current || health <= 0) return;

    // Check if 10 seconds have passed since gun pickup
    if (chargeStartTime && !hasStartedCharging) {
      const elapsed = (Date.now() - chargeStartTime) / 1000;
      console.log(`⏱️ Elapsed time: ${elapsed.toFixed(1)}s / 10s`);
      if (elapsed >= 10) {
        console.log('⚔️ Skelety starts charging!');
        setHasStartedCharging(true);
        setState('charging');
      }
    }

    if (hasStartedCharging && state === 'charging') {
      // Move towards player
      const direction = new THREE.Vector3()
        .subVectors(playerPosVec3, position)
        .normalize();

      const speed = 2; // Units per second
      const newPos = position.clone().add(direction.multiplyScalar(speed * delta));
      newPos.y = 0.2; // Keep at ground level

      const distanceToPlayer = position.distanceTo(playerPosVec3);
      console.log(`🏃 Moving: distance=${distanceToPlayer.toFixed(2)}, pos=(${newPos.x.toFixed(1)}, ${newPos.y.toFixed(1)}, ${newPos.z.toFixed(1)})`);

      setPosition(newPos);

      // Update group position
      group.current.position.copy(newPos);

      // Rotate to face player
      const angle = Math.atan2(direction.x, direction.z);
      group.current.rotation.y = angle;

      // Check distance for attack (only transition if not already attacking)
      if (distanceToPlayer < 4) {
        console.log('👊 Skelety attacking!');
        setState('attacking');
        // Note: setTimeout to return to charging is handled in the animation useEffect
      }
    } else if (group.current) {
      // Update position even when idle
      group.current.position.copy(position);
    }
  });

  if (!visible || health <= 0) {
    return null;
  }

  return (
    <group ref={group} dispose={null} scale={0.1}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Lesha_-_Skelet_-_armature_64">
                <group name="GLTF_created_0">
                  <primitive object={nodes.GLTF_created_0_rootJoint} />
                  <group name="skeleton_60" />
                  <group name="Undead_Gear_Mesh_61" />
                  <group name="Undead_Gear_Mesh001_62" />
                  <group name="Undead_Gear_Mesh002_63" />
                  <skinnedMesh
                    name="Object_7"
                    geometry={nodes.Object_7.geometry}
                    material={materials.Bones___Vray}
                    skeleton={nodes.Object_7.skeleton}
                  />
                  <skinnedMesh
                    name="Object_8"
                    geometry={nodes.Object_8.geometry}
                    material={materials.Material}
                    skeleton={nodes.Object_8.skeleton}
                  />
                  <skinnedMesh
                    name="Object_10"
                    geometry={nodes.Object_10.geometry}
                    material={materials.Undead_Gear}
                    skeleton={nodes.Object_10.skeleton}
                  />
                  <skinnedMesh
                    name="Object_12"
                    geometry={nodes.Object_12.geometry}
                    material={materials.Undead_Gear}
                    skeleton={nodes.Object_12.skeleton}
                  />
                  <skinnedMesh
                    name="Object_14"
                    geometry={nodes.Object_14.geometry}
                    material={materials.Undead_Gear}
                    skeleton={nodes.Object_14.skeleton}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

useGLTF.preload('/skelety.glb');
