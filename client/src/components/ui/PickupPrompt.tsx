import React from "react";

interface PickupPromptProps {
  x: number;
  y: number;
  message: string;
  keyPrompt?: string;
}

export const PickupPrompt: React.FC<PickupPromptProps> = ({
  x,
  y,
  message,
  keyPrompt = "T",
}) => {
  return (
    <div
      style={{
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 3000,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "rgba(0, 0, 0, 0.85)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "4px",
          padding: "10px 16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Key indicator box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "32px",
            height: "32px",
            background: "rgba(255, 255, 255, 0.15)",
            border: "2px solid rgba(255, 255, 255, 0.4)",
            borderRadius: "3px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#ffffff",
            textTransform: "uppercase",
            padding: "0 8px",
          }}
        >
          {keyPrompt}
        </div>

        {/* Message text */}
        <div
          style={{
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: "15px",
            fontWeight: "500",
            color: "#ffffff",
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
            whiteSpace: "nowrap",
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};
