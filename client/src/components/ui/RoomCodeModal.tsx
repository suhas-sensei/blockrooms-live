import React, { useState } from "react";

interface RoomCodeModalProps {
  onClose: () => void;
  onJoinRoom: (roomCode: string, isCreator: boolean) => void;
}

/**
 * Modal for creating or joining a room with a code
 */
export const RoomCodeModal: React.FC<RoomCodeModalProps> = ({ onClose, onJoinRoom }) => {
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [roomCode, setRoomCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");

  const generateRoomCode = () => {
    // Generate a 6-character alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars like 0, O, 1, I
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = () => {
    const newCode = generateRoomCode();
    setCreatedCode(newCode);
    setMode("create");
  };

  const handleJoinWithCreatedCode = () => {
    onJoinRoom(createdCode, true);
  };

  const handleJoinWithEnteredCode = () => {
    if (roomCode.trim().length >= 4) {
      onJoinRoom(roomCode.trim().toUpperCase(), false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          border: "3px solid #0f3460",
          borderRadius: 16,
          padding: 48,
          maxWidth: 500,
          width: "90%",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Main Menu */}
        {mode === "menu" && (
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "'Joystix', monospace",
                fontSize: 28,
                color: "#e94560",
                marginBottom: 32,
                letterSpacing: 2,
              }}
            >
              MULTIPLAYER
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <button
                onClick={handleCreateRoom}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "16px 24px",
                  background: "#0f3460",
                  color: "white",
                  border: "2px solid #16a085",
                  borderRadius: 8,
                  fontSize: 18,
                  fontFamily: "'Joystix', monospace",
                  letterSpacing: 1,
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#16a085";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#0f3460";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                CREATE A CODE
              </button>

              <button
                onClick={() => setMode("join")}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "16px 24px",
                  background: "#0f3460",
                  color: "white",
                  border: "2px solid #3498db",
                  borderRadius: 8,
                  fontSize: 18,
                  fontFamily: "'Joystix', monospace",
                  letterSpacing: 1,
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#3498db";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#0f3460";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                ENTER A CODE
              </button>

              <button
                onClick={onClose}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "12px 24px",
                  background: "transparent",
                  color: "#888",
                  border: "2px solid #555",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "'Joystix', monospace",
                  letterSpacing: 1,
                  textAlign: "center",
                  marginTop: 16,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#e94560";
                  e.currentTarget.style.color = "#e94560";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#555";
                  e.currentTarget.style.color = "#888";
                }}
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {/* Create Room Mode */}
        {mode === "create" && (
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "'Joystix', monospace",
                fontSize: 24,
                color: "#16a085",
                marginBottom: 24,
                letterSpacing: 2,
              }}
            >
              YOUR ROOM CODE
            </h2>

            <div
              style={{
                padding: "24px",
                background: "#0f3460",
                border: "3px solid #16a085",
                borderRadius: 12,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  fontFamily: "'Joystix', monospace",
                  fontSize: 42,
                  color: "#16a085",
                  letterSpacing: 8,
                  textShadow: "0 0 10px rgba(22, 160, 133, 0.5)",
                }}
              >
                {createdCode}
              </div>
            </div>

            <p
              style={{
                color: "#aaa",
                fontSize: 14,
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Share this code with other players.
              <br />
              They can join by entering this code.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button
                onClick={handleJoinWithCreatedCode}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "16px 24px",
                  background: "#16a085",
                  color: "white",
                  border: "2px solid #16a085",
                  borderRadius: 8,
                  fontSize: 18,
                  fontFamily: "'Joystix', monospace",
                  letterSpacing: 1,
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1abc9c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#16a085";
                }}
              >
                JOIN ROOM
              </button>

              <button
                onClick={() => setMode("menu")}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "12px 24px",
                  background: "transparent",
                  color: "#888",
                  border: "2px solid #555",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "'Joystix', monospace",
                  letterSpacing: 1,
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#e94560";
                  e.currentTarget.style.color = "#e94560";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#555";
                  e.currentTarget.style.color = "#888";
                }}
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {/* Join Room Mode */}
        {mode === "join" && (
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "'Joystix', monospace",
                fontSize: 24,
                color: "#3498db",
                marginBottom: 24,
                letterSpacing: 2,
              }}
            >
              ENTER ROOM CODE
            </h2>

            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              maxLength={10}
              style={{
                width: "100%",
                padding: "16px",
                background: "#0f3460",
                border: "3px solid #3498db",
                borderRadius: 8,
                color: "#3498db",
                fontSize: 24,
                fontFamily: "'Joystix', monospace",
                letterSpacing: 4,
                textAlign: "center",
                marginBottom: 32,
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#5dade2";
                e.currentTarget.style.boxShadow = "0 0 10px rgba(52, 152, 219, 0.3)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#3498db";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button
                onClick={handleJoinWithEnteredCode}
                disabled={roomCode.trim().length < 4}
                style={{
                  all: "unset",
                  cursor: roomCode.trim().length >= 4 ? "pointer" : "not-allowed",
                  padding: "16px 24px",
                  background: roomCode.trim().length >= 4 ? "#3498db" : "#2c3e50",
                  color: roomCode.trim().length >= 4 ? "white" : "#666",
                  border: `2px solid ${roomCode.trim().length >= 4 ? "#3498db" : "#555"}`,
                  borderRadius: 8,
                  fontSize: 18,
                  fontFamily: "'Joystix', monospace",
                  letterSpacing: 1,
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (roomCode.trim().length >= 4) {
                    e.currentTarget.style.background = "#5dade2";
                  }
                }}
                onMouseLeave={(e) => {
                  if (roomCode.trim().length >= 4) {
                    e.currentTarget.style.background = "#3498db";
                  }
                }}
              >
                JOIN ROOM
              </button>

              <button
                onClick={() => setMode("menu")}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "12px 24px",
                  background: "transparent",
                  color: "#888",
                  border: "2px solid #555",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "'Joystix', monospace",
                  letterSpacing: 1,
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#e94560";
                  e.currentTarget.style.color = "#e94560";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#555";
                  e.currentTarget.style.color = "#888";
                }}
              >
                BACK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCodeModal;
