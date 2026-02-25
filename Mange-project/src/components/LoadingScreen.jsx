// ─── LOADING SCREEN ───────────────────────────────────────────
export default function LoadingScreen() {
  return (
    <div
      style={{
        background: "#030503",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      <style>{`
        :root { --sys-color: #00ff88; }
        @keyframes glitch {
          0%   { clip-path: inset(0 0 95% 0); transform: translate(-4px, 0); }
          10%  { clip-path: inset(30% 0 50% 0); transform: translate(4px, 0); }
          20%  { clip-path: inset(60% 0 10% 0); transform: translate(-2px, 0); }
          30%  { clip-path: inset(80% 0 5%  0); transform: translate(2px, 0); }
          40%  { clip-path: inset(10% 0 70% 0); transform: translate(-4px, 0); }
          50%  { clip-path: inset(50% 0 30% 0); transform: translate(0, 0); }
          100% { clip-path: inset(0 0 95% 0); transform: translate(0, 0); }
        }
        @keyframes scanline {
          0%   { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .glitch-text { position: relative; display: inline-block; }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute; left: 0; top: 0; width: 100%;
          color: inherit; font: inherit;
        }
        .glitch-text::before {
          color: #ff00cc;
          animation: glitch 2s infinite steps(1);
        }
        .glitch-text::after {
          color: #00ccff;
          animation: glitch 2s infinite steps(1) reverse;
        }
      `}</style>

      <div style={{ textAlign: "center" }}>
        {/* Pulsing ring + icon */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 32 }}>
          <div style={{
            position: "absolute", inset: -10, borderRadius: "50%",
            border: "2px solid #00ff88",
            animation: "pulse-ring 1.4s ease-out infinite",
          }} />
          <div style={{
            width: 90, height: 90, borderRadius: "50%",
            background: "radial-gradient(circle, #0a2a1a, #030503)",
            border: "2px solid #00ff88",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 42, color: "#00ff88",
            boxShadow: "0 0 30px #00ff8866, inset 0 0 20px #00ff8822",
          }}>⬡</div>
        </div>

        {/* Glitch title */}
        <div
          className="glitch-text"
          data-text="SYSTEM LOADING"
          style={{
            fontSize: 28, letterSpacing: 6, color: "#ffffff",
            fontFamily: "'Orbitron', monospace", fontWeight: "bold",
            textShadow: "0 0 20px #ffffff44",
            animation: "fadeInUp 0.6s ease both",
          }}
        >
          SYSTEM LOADING
        </div>

        {/* Progress bar */}
        <div style={{
          width: 260, height: 2, background: "#0a2a1a",
          borderRadius: 4, margin: "24px auto 16px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            background: "linear-gradient(90deg, #00ff88, #00ccff)",
            boxShadow: "0 0 10px #00ff88",
            animation: "scanline 1.8s linear infinite",
          }} />
        </div>

        <div style={{
          fontSize: 13, color: "#00ff88", letterSpacing: 3,
          animation: "fadeInUp 0.8s ease 0.3s both",
        }}>
          MADE BY HASS KARIYAWASAM
        </div>
        <div style={{ fontSize: 11, color: "#00ff8866", marginTop: 8, letterSpacing: 2 }}>
          DBMS PRACTICUM 2026 // UNIVERSITY OF RUHUNA
        </div>
      </div>
    </div>
  );
}
