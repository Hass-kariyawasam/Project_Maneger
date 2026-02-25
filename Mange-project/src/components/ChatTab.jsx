import { useEffect, useRef } from "react";

// ─── CHAT TAB ─────────────────────────────────────────────────
export default function ChatTab({
  sysColor, sysColorRGB, profile,
  messages, chatMsg, setChatMsg, sendMsg,
}) {
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", background: "#000",
        borderBottom: `1px solid rgba(${sysColorRGB},0.2)`,
        textAlign: "center", flexShrink: 0,
      }}>
        <div style={{ fontSize: 14, color: sysColor, letterSpacing: 3, fontFamily: "'Orbitron',monospace", fontWeight: "bold" }}>
          GLOBAL NETWORK CHAT
        </div>
        <div style={{ fontSize: 10, color: `rgba(${sysColorRGB},0.53)`, marginTop: 4 }}>
          All teams can see this chat
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: `rgba(${sysColorRGB},0.13)`, padding: 40, fontSize: 14 }}>
            NETWORK SILENT
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.user === profile.username;
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
              {/* Avatar */}
              {msg.photoURL ? (
                <img src={msg.photoURL} alt="p" style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${msg.color || sysColor}55`, flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: (msg.color || sysColor) + "22",
                  border: `2px solid ${msg.color || sysColor}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: msg.color || sysColor,
                }}>
                  {(msg.user || "?")[0].toUpperCase()}
                </div>
              )}

              <div style={{ maxWidth: "75%" }}>
                {!isMe && (
                  <div style={{ fontSize: 10, color: msg.color || sysColor, marginBottom: 4, letterSpacing: 1 }}>
                    {msg.user} <span style={{ color: `rgba(${sysColorRGB},0.33)` }}>• {msg.teamName}</span>
                  </div>
                )}
                <div style={{
                  background: isMe ? `rgba(${sysColorRGB},0.13)` : "#0a0f0a",
                  border: `1px solid ${isMe ? `rgba(${sysColorRGB},0.4)` : `rgba(${sysColorRGB},0.13)`}`,
                  borderRadius: isMe ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                  padding: "10px 14px", fontSize: 14,
                  color: isMe ? sysColor : "#ccffcc",
                  lineHeight: 1.6, wordBreak: "break-word",
                  boxShadow: isMe ? `0 0 10px rgba(${sysColorRGB},0.13)` : "none",
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: `rgba(${sysColorRGB},0.3)`, marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}
        {/* Scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: "14px 16px", background: "#0a0f0a",
        borderTop: `1px solid rgba(${sysColorRGB},0.2)`,
        display: "flex", gap: 10, flexShrink: 0,
      }}>
        <input
          type="text"
          value={chatMsg}
          onChange={e => setChatMsg(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
          placeholder="Type a message... (Enter to send)"
          className="themed-input"
          style={{
            flex: 1, background: "#000",
            border: `1px solid rgba(${sysColorRGB},0.27)`,
            borderRadius: 8, padding: "14px 16px",
            color: "#ffffff", fontSize: 14,
            fontFamily: "'Share Tech Mono',monospace", outline: "none",
          }}
        />
        <button className="neon-btn" onClick={sendMsg}
          style={{
            padding: "12px 24px", background: `rgba(${sysColorRGB},0.13)`,
            border: `1px solid ${sysColor}`, borderRadius: 8,
            color: sysColor, fontSize: 14, fontWeight: "bold",
            fontFamily: "'Share Tech Mono',monospace", cursor: "pointer",
          }}>
          SEND
        </button>
      </div>
    </div>
  );
}
