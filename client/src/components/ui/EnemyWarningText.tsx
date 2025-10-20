import React, { useState, useEffect, useRef, useCallback } from 'react';

const messages = [
  "Do not waste your ammo on them.",
  "They are mere remnants of people like you",
  "Do not obstruct them or be trapped in the walls forever",
  "If they follow you, then it's worth shooting"
];

interface EnemyWarningTextProps {
  onComplete?: () => void;
}

export const EnemyWarningText: React.FC<EnemyWarningTextProps> = ({ onComplete }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated without triggering effects
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Initial delay
  useEffect(() => {
    console.log('EnemyWarningText mounted, starting 1s delay');
    const timer = setTimeout(() => {
      console.log('1s delay complete, setting hasStarted to true');
      setHasStarted(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Message sequence
  useEffect(() => {
    if (!hasStarted) {
      console.log('Not started yet, skipping');
      return;
    }

    if (currentMessageIndex >= messages.length) {
      console.log('All messages complete, calling onComplete');
      const timer = setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    console.log(`Starting message ${currentMessageIndex}: "${messages[currentMessageIndex]}"`);
    setIsFading(false);

    let displayTimer: NodeJS.Timeout;
    let fadeTimer: NodeJS.Timeout;

    // Display for 4 seconds, then fade
    displayTimer = setTimeout(() => {
      console.log(`Starting fade for message ${currentMessageIndex}`);
      setIsFading(true);

      // Wait for fade, then next message
      fadeTimer = setTimeout(() => {
        console.log(`Fade complete, moving to message ${currentMessageIndex + 1}`);
        setCurrentMessageIndex(currentMessageIndex + 1);
      }, 500);
    }, 4000);

    return () => {
      clearTimeout(displayTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [hasStarted, currentMessageIndex]);

  if (!hasStarted || currentMessageIndex >= messages.length) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontStyle: 'italic',
        fontWeight: 500,
        fontSize: '2rem',
        color: '#ffeb3b',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        textAlign: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
        maxWidth: '80%',
        opacity: isFading ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      {messages[currentMessageIndex]}
    </div>
  );
};

export default EnemyWarningText;
