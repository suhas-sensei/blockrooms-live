import React, { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number; // duration in ms
}

export function LoadingScreen({ onComplete, duration = 4000 }: LoadingScreenProps): JSX.Element {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="loading-screen">
      <style>{`
        .loading-screen {
          position: fixed;
          inset: 0;
          background: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: 'Courier New', monospace;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .progress-bar-wrapper {
          width: 280px;
          height: 18px;
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow:
            0 0 15px rgba(255, 255, 255, 0.6),
            inset 0 0 10px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
          animation: borderGlitch 0.3s infinite;
        }

        .progress-bar {
          height: 100%;
          background: rgba(255, 255, 255, 0.95);
          box-shadow:
            0 0 20px rgba(255, 255, 255, 0.8);
          transition: width 0.1s linear;
          position: relative;
        }

        .progress-bar::after {
          display: none;
        }

        .loading-text {
          color: #ffffff;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: 'Courier New', monospace;
          text-shadow: none;
          position: relative;
          margin-bottom: 8px;
        }

        @keyframes glitch {
          0%, 100% {
            transform: translate(0) skew(0deg);
          }
          20% {
            transform: translate(-3px, 2px) skew(-2deg);
          }
          40% {
            transform: translate(-2px, -3px) skew(1deg);
          }
          60% {
            transform: translate(3px, 2px) skew(-1deg);
          }
          80% {
            transform: translate(2px, -2px) skew(2deg);
          }
        }

        @keyframes glitchBefore {
          0%, 100% {
            transform: translate(0);
            opacity: 0.8;
          }
          33% {
            transform: translate(-6px, 0);
            opacity: 0.9;
          }
          66% {
            transform: translate(6px, 0);
            opacity: 0.7;
          }
        }

        @keyframes glitchAfter {
          0%, 100% {
            transform: translate(0);
            opacity: 0.8;
          }
          33% {
            transform: translate(6px, 0);
            opacity: 0.9;
          }
          66% {
            transform: translate(-6px, 0);
            opacity: 0.7;
          }
        }

        @keyframes spookyFlicker {
          0%, 100% {
            opacity: 1;
            filter: contrast(1.3) brightness(1.1);
          }
          10% {
            opacity: 0.8;
            filter: contrast(1.5) brightness(0.9);
          }
          20% {
            opacity: 1;
            filter: contrast(1.2) brightness(1.2);
          }
          30% {
            opacity: 0.9;
            filter: contrast(1.4) brightness(1);
          }
          45% {
            opacity: 0.3;
            filter: contrast(2) brightness(0.5);
          }
          46% {
            opacity: 1;
            filter: contrast(1.3) brightness(1.3);
          }
          70% {
            opacity: 0.85;
            filter: contrast(1.4) brightness(1);
          }
          85% {
            opacity: 0.2;
            filter: contrast(2.5) brightness(0.4);
          }
          86% {
            opacity: 1;
            filter: contrast(1.3) brightness(1.1);
          }
        }

        @keyframes borderGlitch {
          0%, 90%, 100% {
            border-color: rgba(255, 255, 255, 0.9);
          }
          95% {
            border-color: rgba(255, 255, 255, 0.3);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .scanline {
          display: none;
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .noise {
          position: fixed;
          inset: 0;
          opacity: 0.03;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          animation: noise 0.2s infinite;
        }

        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-10%, 5%); }
          60% { transform: translate(15%, 0); }
          70% { transform: translate(0, 10%); }
          80% { transform: translate(-15%, 0); }
          90% { transform: translate(10%, 5%); }
        }
      `}</style>

      <div className="noise" />

      <div className="loading-container">
        <div className="loading-text">
          LOADING...
        </div>

        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <div className="scanline" />
        </div>
      </div>
    </div>
  );
}
