import React, { useEffect, useMemo, useRef, useState } from "react";

import useAppStore, { GamePhase } from "../../zustand/store";
import { useStarknetConnect } from "../../dojo/hooks/useStarknetConnect";
import { useGameData } from "../../dojo/hooks/useGameData";
import { useInitializePlayer } from "../../dojo/hooks/useInitializePlayer";
import { useStartGame } from "../../dojo/hooks/useStartGame";
import { TutorialVideo } from "./TutorialVideo";
import { useEndGame } from "../../dojo/hooks/useEndGame";
import { LoadingScreen } from "./LoadingScreen";
 

type Move = "up" | "down" | "left" | "right";

const BGM_SRC = "/audio/mainmenu.mp3";

export function MainMenu(): JSX.Element {
  // BGM refs/state
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [bgmReady, setBgmReady] = useState(false);
  const [bgmPlaying, setBgmPlaying] = useState(false);

  // Prepare and aggressively autoplay on page load
  useEffect(() => {
    const a = new Audio(BGM_SRC);
    a.loop = true;
    a.preload = "auto";
    a.volume = 0.6;
    a.crossOrigin = "anonymous";
    bgmRef.current = a;

    const onCanPlay = () => setBgmReady(true);
    a.addEventListener("canplaythrough", onCanPlay);

    let unlocked = false;

    const clearUnlockers = () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      document.removeEventListener("visibilitychange", onVis);
    };

    const markPlaying = () => {
      if (!unlocked) {
        unlocked = true;
        setBgmPlaying(true);
        clearUnlockers();
      }
    };

    const tryAutoplay = async () => {
      if (!bgmRef.current) return;
      try {
        // Chrome allows muted autoplay; unmute after starting.
        a.muted = true;
        await a.play();
        markPlaying();
        // Unmute shortly after stable start
        setTimeout(() => {
          if (bgmRef.current) bgmRef.current.muted = false;
        }, 150);
      } catch {
        // Autoplay blocked: wait for first user gesture
      }
    };

    const unlock = () => {
      if (!bgmRef.current || unlocked) return;
      // Start with muted= false here; the gesture should permit audio
      bgmRef.current.muted = false;
      bgmRef.current.play().then(markPlaying).catch(() => void 0);
    };

    const onVis = () => {
      if (document.visibilityState === "visible" && !unlocked) {
        tryAutoplay();
      }
    };

    // Attempt immediately if visible; otherwise on first visibility
    if (document.visibilityState === "visible") {
      void tryAutoplay();
    } else {
      document.addEventListener("visibilitychange", onVis);
    }

    // Fallback unlockers if autoplay is blocked
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      clearUnlockers();
      a.removeEventListener("canplaythrough", onCanPlay);
      a.pause();
      // @ts-ignore
      bgmRef.current = null;
    };
  }, []);

  // Start on first meaningful click to satisfy autoplay policies
  const ensureBgm = async (): Promise<void> => {
    if (!bgmRef.current || bgmPlaying === true) return;
    try {
      // Some browsers require play() to be directly in a user gesture call chain
      await bgmRef.current.play();
      setBgmPlaying(true);
    } catch {}
  };

  // Fade out BGM and stop
  const stopBgmWithFade = (ms: number = 700): void => {
    const a = bgmRef.current;
    if (!a) return;
    const startVol = a.volume;
    const steps = 14;
    const step = Math.max(1, Math.floor(ms / steps));
    let i = 0;
    const id = setInterval(() => {
      i++;
      const v = Math.max(0, startVol * (1 - i / steps));
      a.volume = v;
      if (i >= steps) {
        clearInterval(id);
        a.pause();
        a.currentTime = 0;
        a.volume = startVol;
        setBgmPlaying(false);
      }
    }, step);
  };

  const { status, address, handleConnect, isConnecting } = useStarknetConnect();
  const { playerStats, isLoading: playerLoading, refetch } = useGameData();
  const {
    initializePlayer,
    isLoading: initializing,
    canInitialize,
  } = useInitializePlayer();
  const { startGame, isLoading: startingGame, canStartGame } = useStartGame();
  const { endGame, canEndGame } = useEndGame();

  const {
    setConnectionStatus,
    setLoading,
    gamePhase,
    player,
    startGame: startGameUI,
  } = useAppStore();

  const isConnected = status === "connected";
  const hasPlayerStats = playerStats !== null;
  const isLoading =
    isConnecting || playerLoading || initializing || startingGame;

  const images = useMemo(
    () => [
      "/bk1.png",
      "/bk2.png",
      "/bk3.png",
      "/bk4.png",
      "/bk5.png",
      "/bk6.png",
    ],
    []
  );
  const [bg, setBg] = useState(0);
  const [dir, setDir] = useState<Move>("up");
  const [showTutorial, setShowTutorial] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);

  // Tutorial flow states
  const [showBlackScreen, setShowBlackScreen] = useState(false);
  const [showTutorialVideo, setShowTutorialVideo] = useState(false);

  // Handle tutorial sequence: black screen (4s) -> video -> game
  useEffect(() => {
    if (showBlackScreen) {
      const timer = setTimeout(() => {
        setShowBlackScreen(false);
        setShowTutorialVideo(true);
      }, 4000); // 4 seconds
      return () => clearTimeout(timer);
    }
  }, [showBlackScreen]);

  // Handle ESC key to skip tutorial
  useEffect(() => {
    if (!showBlackScreen && !showTutorialVideo) return;

    const handleEscape = async (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape") {
        setShowBlackScreen(false);
        setShowTutorialVideo(false);
        // Final state refresh before entering game
        await refetch();
        startGameUI();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showBlackScreen, showTutorialVideo, startGameUI, refetch]);

  useEffect(() => {
    setConnectionStatus(
      status === "connected"
        ? "connected"
        : isConnecting
        ? "connecting"
        : "disconnected"
    );
  }, [status, isConnecting, setConnectionStatus]);

  useEffect(() => setLoading(isLoading), [isLoading, setLoading]);

  // tiny ambient background swapper
  useEffect(() => {
    const t = setInterval(() => {
      setBg((b) => (b + 1) % images.length);
      setDir((d) => (d === "up" ? "down" : "up"));
    }, 5000);
    return () => clearInterval(t);
  }, [images.length]);

  const canEnterGame = isConnected && hasPlayerStats && !startingGame;

const handlePlayForFree = async ( ): Promise<void> => {
  await ensureBgm();
 
  // Step 1: Connect wallet if not connected
  if (!isConnected) {
    console.log('🔌 Connecting wallet...');
    await handleConnect();
    await new Promise((r) => setTimeout(r, 1500));
    await refetch();
    // Continue to next step instead of returning
  }

  // Re-check connection status after potential connection
  const currentStatus = useAppStore.getState().connectionStatus;
  if (currentStatus !== 'connected') {
    console.log('❌ Wallet connection failed');
    return; // Stop if connection failed
  }

  // Step 2: Initialize player if needed
  const currentPlayerStats = useAppStore.getState().playerStats;
  if (!currentPlayerStats && canInitialize) {
    console.log('🎮 Initializing player...');
    const res = await initializePlayer();
    if (res?.success) {
      await new Promise((r) => setTimeout(r, 2000));
      await refetch();
      // Continue to next step instead of returning
    } else {
      console.log('❌ Player initialization failed');
      return; // Stop if initialization failed
    }
  }

  // Step 3: Enter the game (with session cleanup if needed)
  console.log('🎬 Starting game...');
  stopBgmWithFade(700);

  // Get fresh state
  const freshState = useAppStore.getState();
  const currentRoomId = freshState.currentRoom?.room_id ? String(freshState.currentRoom.room_id) : "0";
  const isNotInStartingRoom = currentRoomId !== "0";

  // If player is not in room 0 (starting room), end the previous session first
  if (isNotInStartingRoom && canEndGame) {
    console.log(`🔄 Player is in room ${currentRoomId}, ending previous session...`);
    try {
      await endGame();
    } catch(e) {
      console.error("Error ending game:", e);
      // ignore; proceed to refresh and start
    }

    // HARD REFRESH: refetch until player is back in room 0
    console.log("⏳ Waiting for player to return to room 0...");
    try {
      for (let i = 0; i < 18; i++) {
        await refetch();
        await new Promise((r) => setTimeout(r, 400));
        const freshState2 = useAppStore.getState();
        const newRoomId = freshState2.currentRoom?.room_id ? String(freshState2.currentRoom.room_id) : "0";
        console.log(`Room check ${i + 1}/18: Current room = ${newRoomId}`);
        if (newRoomId === "0") {
          console.log("✅ Player back in room 0, proceeding...");
          break;
        }
      }
    } catch(e) {
      console.error("Error during room polling:", e);
      // even if polling fails, still move on
    }
  }

  // Start a fresh session if allowed
  if (canStartGame) {
    console.log('▶️ Starting new game session...');
    try {
      await startGame();
      // Aggressive refetch burst to ensure brand-new session values are loaded
      await refetch();
      await new Promise((r) => setTimeout(r, 400));
      await refetch();
      await new Promise((r) => setTimeout(r, 300));
      await refetch();
      // Final wait to ensure state propagation
      await new Promise((r) => setTimeout(r, 200));
    } catch {
      // swallow; UI flow continues
    }
  }

  // Start tutorial sequence: black screen -> video -> game
  console.log('✅ Launching game UI...');
  setShowBlackScreen(true);
};



    

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `url(${images[bg]})`,
        backgroundSize: "cover",
               backgroundPosition: "right center",

      }}
    >
 
          <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "flex-start",
        }}
      >
        {/* left dark fade panel only (no full overlay) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.75) 18%, rgba(0,0,0,0.55) 32%, rgba(0,0,0,0.0) 55%)",
            pointerEvents: "none",
          }}
        />

        {/* left menu column */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: 920,
            padding: "396px 260px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            color: "white",
            userSelect: "none",
          }}
        >
          

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
             

            {/* PLAY ON MAINNET — handles everything on mainnet */}
            <button
              onClick={() => handlePlayForFree()}
              disabled={isLoading}
              onMouseEnter={() => setHovered(1)}
              onMouseLeave={() => setHovered(null)}
              style={{
                all: "unset",
                cursor: isLoading ? "not-allowed" : "pointer",
                background: hovered === 1 ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.7)",
                border: "2px solid rgba(255, 215, 0, 0.4)",
                borderRadius: 12,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                transition: "all 0.3s ease",
                opacity: isLoading ? 0.6 : 1,
                boxShadow: hovered === 1
                  ? "0 8px 24px rgba(255, 215, 0, 0.3)"
                  : "0 4px 12px rgba(0, 0, 0, 0.3)",
                transform: hovered === 1 ? "translateY(-2px)" : "translateY(0)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#FFD700"
                  strokeWidth="2"
                />
                <path
                  d="M12 6V12L16 14"
                  stroke="#FFD700"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  color: "#FFD700",
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                {isLoading ? "LOADING..." : "PLAY ON MAINNET"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {showTutorial && (
        <TutorialVideo
          onEnded={async () => {
            setShowTutorial(false);
            // Final state refresh before revealing game UI
            await refetch();
            startGameUI();
          }}
        />
      )}

      {/* Loading screen with glitchy effect (4 seconds) */}
      {showBlackScreen && (
        <LoadingScreen
          duration={4000}
          onComplete={() => {
            setShowBlackScreen(false);
            setShowTutorialVideo(true);
          }}
        />
      )}

      {/* Tutorial video after black screen */}
      {showTutorialVideo && (
        <TutorialVideo
          onEnded={async () => {
            setShowTutorialVideo(false);
            // Final state refresh to ensure clean session before revealing game UI
            await refetch();
            await new Promise((r) => setTimeout(r, 100));
            startGameUI();
          }}
        />
      )}
    </div>
  );
}

export default MainMenu;
