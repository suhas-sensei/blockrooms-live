// client/src/components/game/ShotgunShoot.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import useAppStore from "../zustand/store";
import MuzzleFlash from "../components/game/MuzzleFlash";

type ActionName =
  | "Armature|SG_FPS_Idle"
  | "Armature|SG_FPS_Walk"
  | "Armature|SG_FPS_Shot"
  | "Armature|SG_FPS_Reload";
type GLTFActions = Record<ActionName, THREE.AnimationAction>;

type ShotgunShootProps = {
  muzzleFlashTrigger?: number;
  isVisible?: boolean;
  onShoot?: (hit: THREE.Intersection, cameraPos: THREE.Vector3) => void;
};

export default function ShotgunShoot({ isVisible, onShoot, muzzleFlashTrigger }: ShotgunShootProps) {
  // --- MUZZLE FLASH ---
const muzzleRef = useRef<THREE.Group>(null);
/** bump this to trigger a flash */
const [flashKick, setFlashKick] = useState(0);
const trigger = (muzzleFlashTrigger ?? 0) + flashKick;

  const group = useRef<THREE.Group>(null);
  const { camera, scene } = useThree();
const showGunStore = useAppStore((s) => s.showGun);
const shouldShow = isVisible ?? showGunStore;

  // --- Sound refs ---
  const shootSound = useRef<HTMLAudioElement | null>(null);
  const reloadSound = useRef<HTMLAudioElement | null>(null);

  // --- Load sounds on mount ---
  useEffect(() => {
    console.log("🔊 Loading shotgun sounds...");
    const shoot = new Audio("shot2.mp3");
    shoot.volume = 0.8;
    shootSound.current = shoot;
    console.log("✅ Loaded shotgun shoot sound:", shoot.src);

    const reload = new Audio("shotreloadd.mp3");
    reload.volume = 0.6;
    reloadSound.current = reload;
    console.log("✅ Loaded shotgun reload sound:", reload.src);

    return () => {
      shootSound.current = null;
      reloadSound.current = null;
    };
  }, []);

  // --- load animated rig (hands + shotgun) ---
  const gltf = useGLTF("/shotgunshoot.glb");
  const { actions, mixer } = useAnimations(gltf.animations, group) as { actions: Partial<GLTFActions>; mixer?: THREE.AnimationMixer };

  // --- ammo state (coach gun style 2+reserve) + HUD events ---
  const MAG_SIZE = 4;
  const RELOAD_SPEED = 1.4; // 1 = normal, >1 = faster

  const [mag, setMag] = useState(4);
  const [reserve, setReserve] = useState(8);

  const magRef = useRef(mag);
  const resRef = useRef(reserve);
  useEffect(() => { magRef.current = mag; }, [mag]);
  useEffect(() => { resRef.current = reserve; }, [reserve]);

  const [reloading, setReloading] = useState(false);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("hud:reloading", { detail: { reloading } }));
  }, [reloading]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("hud:ammo", { detail: { mag, reserve } }));
  }, [mag, reserve]);

  useEffect(() => {
    const onAddAmmo = (e: Event) => {
      const ce = e as CustomEvent<{ amount?: number }>;
      const add = Math.max(0, Number(ce?.detail?.amount ?? 0));
      if (add) setReserve(r => r + add);
    };
    window.addEventListener("gun:addAmmo", onAddAmmo as EventListener);
    return () => window.removeEventListener("gun:addAmmo", onAddAmmo as EventListener);
  }, []);

  // --- animation helpers (cross-fade between states) ---
  const current = useRef<ActionName | null>(null);
  const fadeTo = (name: ActionName, fade = 0.12, loop: THREE.AnimationActionLoopStyles = THREE.LoopRepeat) => {
    const next = actions?.[name];
    if (!next) return;
    if (current.current && current.current !== name) {
      actions![current.current]?.fadeOut(fade);
    }
    next.reset().setLoop(loop, Infinity).fadeIn(fade).play();
    current.current = name;
  };

  const playIdle = () => fadeTo("Armature|SG_FPS_Idle");
  // const playWalk = () => fadeTo("Armature|SG_FPS_Walk");
  const playShot = () => {
    const act = actions?.["Armature|SG_FPS_Shot"];
    if (!act) return;
    if (current.current) actions![current.current]!.fadeOut(0.06);
    act.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.06).play();
    const dur = act.getClip().duration;
    setTimeout(() => playIdle(), (dur * 1000) - 40);
  };
 const playReload = (onDone?: () => void) => {
  const act = actions?.["Armature|SG_FPS_Reload"];
  if (!act) { onDone?.(); return; }
  if (current.current) actions![current.current]!.fadeOut(0.06);

  act.reset();
  act.timeScale = RELOAD_SPEED; // speed up reload
  act.setLoop(THREE.LoopOnce, 1).fadeIn(0.06).play();

  const clipDur = act.getClip().duration / RELOAD_SPEED; // adjust for speed
  const ms = Math.max(0, (clipDur * 1000) - 40);
  setTimeout(() => { onDone?.(); playIdle(); }, ms);
};

  // start in Idle when the weapon is shown
  const shownOnce = useRef(false);
  useEffect(() => {
    if (shouldShow && !shownOnce.current) {
      playIdle();
      shownOnce.current = true;
    }
  }, [shouldShow]);

  // --- left click shoot ---
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const center = useMemo(() => new THREE.Vector2(0, 0), []);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (!shouldShow || reloading) return;
           if (magRef.current <= 0) {
        beginReload();      // auto-reload if empty
        return;
      }


      // consume a shell
      setMag(m => Math.max(0, m - 1));
      playShot();

      // Play shotgun shoot sound
      console.log("🔫 Shotgun firing! Sound ref:", shootSound.current);
      if (shootSound.current) {
        try {
          shootSound.current.currentTime = 0;
          const playPromise = shootSound.current.play();
          console.log("▶️ Playing shotgun shoot sound, promise:", playPromise);
          if (playPromise !== undefined) {
            playPromise
              .then(() => console.log("✅ Shotgun shoot sound played successfully"))
              .catch(err => console.log("❌ Failed to play shotgun shoot sound:", err));
          }
        } catch (err) {
          console.log("❌ Failed to play shotgun shoot sound:", err);
        }
      } else {
        console.log("❌ No shootSound ref available!");
      }

      // raycast
      ray.setFromCamera(center, camera);
      const hits = ray.intersectObjects(scene.children, true);
      const first = hits[0];
      // trigger muzzle flash
setFlashKick((n) => n + 1);

      if (first) onShoot?.(first, camera.position.clone());

    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [shouldShow, reloading, camera, scene, onShoot, ray, center]);


    // Centralized reload logic (fills up to MAG_SIZE)
  const beginReload = () => {
    if (reloading) return;
    if (magRef.current >= MAG_SIZE) return;
    if (resRef.current <= 0) return;

    setReloading(true);

    // Play shotgun reload sound
    if (reloadSound.current) {
      try {
        reloadSound.current.currentTime = 0;
        const playPromise = reloadSound.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => console.log("Failed to play shotgun reload sound:", err));
        }
      } catch (err) {
        console.log("Failed to play shotgun reload sound:", err);
      }
    }

    playReload(() => {
      const need = MAG_SIZE - magRef.current;
      const take = Math.min(need, resRef.current);
      setMag(m => m + take);
      setReserve(r => r - take);
      setReloading(false);
    });
  };

  // --- R reload (manual) ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key.toLowerCase?.() === "r" || e.code === "KeyR")) {
        beginReload();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reloading]);
  // Auto-reload as soon as the magazine is empty and we have reserve
  useEffect(() => {
    if (!shouldShow) return;
    if (reloading) return;
    if (mag === 0 && reserve > 0) beginReload();
  }, [mag, reserve, reloading, shouldShow]);


  // --- anchor weapon to camera with slight sway ---
  const base = new THREE.Vector3(0.15, -0.28, -0.05); // screen placement
  const tmp = new THREE.Vector3();
  const prevPlayer = useRef<THREE.Vector3 | null>(null);
  const walkTimer = useRef<number>(0);
 useFrame((_, dt) => {
  if (!group.current) return;

  // attach to camera
group.current.position.copy(camera.position);
tmp.copy(base).applyQuaternion(camera.quaternion);
group.current.position.add(tmp);
group.current.quaternion.copy(camera.quaternion);

  // ✅ read the latest position WITHOUT subscribing/re-rendering
  const p = useAppStore.getState().position;

  if (!prevPlayer.current) {
    prevPlayer.current = new THREE.Vector3(p.x, p.y ?? 0, p.z);
  }
  const speed =
    prevPlayer.current.distanceTo(new THREE.Vector3(p.x, p.y ?? 0, p.z)) /
    Math.max(dt, 1e-4);
  prevPlayer.current.set(p.x, p.y ?? 0, p.z);

  const moving = speed > 0.3;
  if (!reloading && shouldShow) {
    if (moving) {
      walkTimer.current += dt;
      // if (current.current !== "Armature|SG_FPS_Walk") playWalk();
    } else {
      if (current.current !== "Armature|SG_FPS_Idle") playIdle();
    }
  }
});


  if (!shouldShow) return null;

return (
  <group ref={group} dispose={null}>
    {/* rotate the rig 180° around Y */}
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={(gltf as any).scene} />
            {/* muzzle flash — tweak position to your muzzle */}
      <group ref={muzzleRef} position={[0.22, -0.06, -0.6]}>
        <MuzzleFlash trigger={trigger} />
      </group>

    </group>
  </group>
);

}

useGLTF.preload("/shotgunshoot.glb");
