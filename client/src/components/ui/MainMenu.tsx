import React, { useEffect, useMemo, useRef, useState } from "react";

import useAppStore from "../../zustand/store";
import { TutorialVideo } from "./TutorialVideo";
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
        a.muted = true;
        await a.play();
        markPlaying();
        setTimeout(() => {
          if (bgmRef.current) bgmRef.current.muted = false;
        }, 150);
      } catch {
        // Autoplay blocked: wait for first user gesture
      }
    };

    const unlock = () => {
      if (!bgmRef.current || unlocked) return;
      bgmRef.current.muted = false;
      bgmRef.current.play().then(markPlaying).catch(() => void 0);
    };

    const onVis = () => {
      if (document.visibilityState === "visible" && !unlocked) {
        tryAutoplay();
      }
    };

    if (document.visibilityState === "visible") {
      void tryAutoplay();
    } else {
      document.addEventListener("visibilitychange", onVis);
    }

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

  const ensureBgm = async (): Promise<void> => {
    if (!bgmRef.current || bgmPlaying === true) return;
    try {
      await bgmRef.current.play();
      setBgmPlaying(true);
    } catch {}
  };

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

  const { startGame: startGameUI } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);

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
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showBlackScreen]);

  // Handle ESC key to skip tutorial
  useEffect(() => {
    if (!showBlackScreen && !showTutorialVideo) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape") {
        setShowBlackScreen(false);
        setShowTutorialVideo(false);
        startGameUI();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showBlackScreen, showTutorialVideo, startGameUI]);

  // tiny ambient background swapper
  useEffect(() => {
    const t = setInterval(() => {
      setBg((b) => (b + 1) % images.length);
      setDir((d) => (d === "up" ? "down" : "up"));
    }, 5000);
    return () => clearInterval(t);
  }, [images.length]);

  const handlePlayGame = async (): Promise<void> => {
    await ensureBgm();
    setIsLoading(true);
    stopBgmWithFade(700);

    // Start tutorial sequence: black screen -> video -> game
    console.log("Starting game...");
    setShowBlackScreen(true);
    setIsLoading(false);
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
            {/* PLAY GAME button */}
            <button
              onClick={() => handlePlayGame()}
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
                <polygon points="5,3 19,12 5,21" fill="#FFD700" />
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
                {isLoading ? "LOADING..." : "PLAY GAME"}
              </span>
            </button>
          </div>
        </div>
      </div>

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
          onEnded={() => {
            setShowTutorialVideo(false);
            startGameUI();
          }}
        />
      )}
    </div>
  );
}

export default MainMenu;
