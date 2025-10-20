import React from 'react';

interface DoorStatusMessageProps {
  message: string;
}

export const DoorStatusMessage: React.FC<DoorStatusMessageProps> = ({ message }) => {
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
      }}
    >
      {message}
    </div>
  );
};

export default DoorStatusMessage;
