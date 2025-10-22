import React from "react";

interface HazyOverlayProps {
  intensity?: number;
}

export const HazyOverlay: React.FC<HazyOverlayProps> = ({ intensity = 0.5 }) => {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: `rgba(255, 255, 255, ${intensity * 0.15})`,
          backdropFilter: `blur(${intensity * 8}px)`,
          WebkitBackdropFilter: `blur(${intensity * 8}px)`,
          zIndex: 900,
          pointerEvents: "none",
          transition: "all 0.5s ease-in-out",
        }}
      />
      <style>{`
        @keyframes hazyPulse {
          0%, 100% { opacity: ${intensity}; }
          50% { opacity: ${intensity * 0.7}; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "radial-gradient(circle at center, transparent 20%, rgba(200, 200, 200, 0.3) 100%)",
          zIndex: 901,
          pointerEvents: "none",
          animation: "hazyPulse 3s ease-in-out infinite",
        }}
      />
    </>
  );
};
