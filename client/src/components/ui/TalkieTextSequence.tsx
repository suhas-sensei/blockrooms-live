import React, { useState, useEffect } from 'react';
import useAppStore from '../../zustand/store';

const messages = [
  "Never let go of this tracker, PlayerZero",
  "This is your only way to escape from the rooms",
  "It tracks your movement, your progress, let alone your identity"
];

export const TalkieTextSequence: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const setShowTalkieIntro = useAppStore((state) => state.setShowTalkieIntro);

  // Initial 1 second delay before showing first message
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setHasStarted(true);
    }, 1000); // 1 second delay

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    // Don't start showing messages until after initial delay
    if (!hasStarted) return;

    if (currentMessageIndex >= messages.length) {
      // All messages shown, hide the talkie intro
      setTimeout(() => {
        setShowTalkieIntro(false);
      }, 500); // Small delay for final fade out
      return;
    }

    // Show current message for 4 seconds
    const showTimer = setTimeout(() => {
      // Start fading out
      setIsFading(true);

      // After fade out, move to next message
      setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
        setIsFading(false);
        setIsVisible(true);
      }, 500); // 500ms fade duration
    }, 4000); // 4 seconds display time

    return () => clearTimeout(showTimer);
  }, [currentMessageIndex, setShowTalkieIntro, hasStarted]);

  // Don't render anything until initial delay has passed
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

export default TalkieTextSequence;
