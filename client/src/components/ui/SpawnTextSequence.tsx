import React, { useState, useEffect } from 'react';

const messages = [
  "Woah, where am i?",
  "All i remember is driving home talking to my wife",
  "What exactly is this place?",
  "Wait, what's that thing on the table?"
];

interface SpawnTextSequenceProps {
  onComplete: () => void;
}

export const SpawnTextSequence: React.FC<SpawnTextSequenceProps> = ({ onComplete }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Initial 1 second delay before showing first message
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setHasStarted(true);
      console.log('🎭 Spawn text sequence starting...');
    }, 1000); // 1 second delay

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    // Don't start showing messages until after initial delay
    if (!hasStarted) return;

    if (currentMessageIndex >= messages.length) {
      // All messages shown, call onComplete
      console.log('✅ All spawn messages complete');
      setTimeout(() => {
        onComplete();
      }, 500); // Small delay for final fade out
      return;
    }

    console.log(`📝 Showing spawn message ${currentMessageIndex + 1}/${messages.length}: "${messages[currentMessageIndex]}"`);

    // Show current message for 4 seconds
    const showTimer = setTimeout(() => {
      // Start fading out
      setIsFading(true);
      console.log(`👋 Fading out message ${currentMessageIndex + 1}`);

      // After fade out, move to next message
      setTimeout(() => {
        console.log(`➡️  Moving to next message (${currentMessageIndex + 2}/${messages.length})`);
        setCurrentMessageIndex(prev => prev + 1);
        setIsFading(false);
        setIsVisible(true);
      }, 500); // 500ms fade duration to match talkie
    }, 4000); // 4 seconds display time

    return () => clearTimeout(showTimer);
  }, [currentMessageIndex, hasStarted]); // Removed onComplete from dependencies

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

export default SpawnTextSequence;
