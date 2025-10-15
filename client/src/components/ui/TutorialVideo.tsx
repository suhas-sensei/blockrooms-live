import React, { useEffect, useRef } from "react";

type Props = {
  onEnded: () => void;
  onError?: (err?: unknown) => void;
};

export function TutorialVideo({ onEnded, onError }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const bgRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    const bgV = bgRef.current;
    if (!v || !bgV) return;

    // Sync background video with main video
    const syncVideos = () => {
      if (Math.abs(bgV.currentTime - v.currentTime) > 0.1) {
        bgV.currentTime = v.currentTime;
      }
    };

    const tryPlay = async () => {
      try {
        // Play both videos together
        await Promise.all([v.play(), bgV.play()]);
      } catch {
        // ignore; user already clicked the "Enter Game" button so this should work
      }
    };

    // Keep videos in sync
    v.addEventListener('timeupdate', syncVideos);
    v.addEventListener('play', () => bgV.play());
    v.addEventListener('pause', () => bgV.pause());
    v.addEventListener('seeked', syncVideos);

    const t = setTimeout(tryPlay, 0);
    return () => {
      clearTimeout(t);
      v.removeEventListener('timeupdate', syncVideos);
      v.removeEventListener('play', () => bgV.play());
      v.removeEventListener('pause', () => bgV.pause());
      v.removeEventListener('seeked', syncVideos);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Blurred background video */}
      <video
        ref={bgRef}
        src="/tutorial.mp4"
        autoPlay
        muted
        playsInline
        loop={false}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(20px)",
          opacity: 0.6,
          transform: "scale(1.1)",
        }}
      />

      {/* Main video */}
      <video
        ref={ref}
        src="/tutorial.mp4"
        autoPlay
        playsInline
        style={{
          position: "relative",
          maxWidth: "100%",
          maxHeight: "100%",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          zIndex: 1,
        }}
        onEnded={onEnded}
        onError={() => onError?.()}
      />
    </div>
  );
}
