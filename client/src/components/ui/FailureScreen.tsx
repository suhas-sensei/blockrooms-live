import React from "react";

export const FailureScreen: React.FC = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: "2rem",
          fontWeight: "bold",
          textAlign: "center",
          padding: "2rem",
          fontFamily: "monospace",
        }}
      >
        Your stats are not enough to play this level. Restarting!
      </div>
    </div>
  );
};
