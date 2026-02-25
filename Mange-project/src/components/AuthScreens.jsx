import { GInput, Btn } from "./UI.jsx";
import { TEAM_MEMBERS } from "../constants.js";

// ─── SHARED STYLE BLOCK ───────────────────────────────────────
const AuthStyles = ({ sysColor, sysColorRGB }) => (
  <style>{`
    @keyframes text-glow-sweep {
      0%   { text-shadow: 0 0 5px var(--sys-color), 0 0 10px var(--sys-color); }
      50%  { text-shadow: 0 0 15px #ffffff, 0 0 30px #ffffff, 0 0 40px var(--sys-color); }
      100% { text-shadow: 0 0 5px var(--sys-color), 0 0 10px var(--sys-color); }
    }
    .glow-text-smooth { animation: text-glow-sweep 3s ease-in-out infinite; }
    .themed-input {
      border: 1px solid rgba(${sysColorRGB},0.27);
      color: #ffffff !important;
    }
    .themed-input::placeholder { color: rgba(255,255,255,0.3); }
    .themed-input:focus {
      border-color: var(--sys-color) !important;
      box-shadow: 0 0 12px rgba(${sysColorRGB},0.27) !important;
    }
    .neon-btn {
      background: rgba(${sysColorRGB},0.13) !important;
      border: 1px solid var(--sys-color) !important;
      color: var(--sys-color) !important;
      box-shadow: 0 0 10px rgba(${sysColorRGB},0.2) !important;
    }
    .neon-btn:hover {
      background: rgba(${sysColorRGB},0.25) !important;
      box-shadow: 0 0 22px var(--sys-color) !important;
    }
    select.themed-input option { background: #0a0f0a; color: #ffffff; }
  `}</style>
);

// ─── GOOGLE ONBOARD ───────────────────────────────────────────
export function GoogleOnboardScreen({
  sysColor, sysColorRGB,
  regPhoto, regUser, setRegUser,
  regPhone, setRegPhone,
  regEmail, setRegEmail,
  regTgNumber, setRegTgNumber,
  regRole, setRegRole,
  regTeamName, setRegTeamName,
  regToken, setRegToken,
  formErr, formLoading,
  doRegister, cancelGoogleOnboard,
}) {
  return (
    <div style={{
      background: "#030503", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Share Tech Mono',monospace", padding: 20,
      "--sys-color": sysColor, "--sys-color-rgb": sysColorRGB,
    }}>
      <AuthStyles sysColor={sysColor} sysColorRGB={sysColorRGB} />
      <div style={{
        width: "100%", maxWidth: 450,
        background: "#0a0f0a",
        border: `1px solid rgba(${sysColorRGB},0.2)`,
        borderRadius: 16, padding: 30,
        boxShadow: `0 10px 30px rgba(${sysColorRGB},0.1)`,
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          {regPhoto
            ? <img src={regPhoto} alt="profile" style={{ width: 60, height: 60, borderRadius: 30, border: `2px solid ${sysColor}`, marginBottom: 10 }} />
            : <div style={{ fontSize: 40 }}>👤</div>}
          <div style={{ fontSize: 18, color: sysColor, letterSpacing: 1 }}>COMPLETE YOUR PROFILE</div>
          <div style={{ fontSize: 12, color: `rgba(${sysColorRGB},0.4)`, marginTop: 4 }}>
            We need a few more details to set up your workspace.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 6, letterSpacing: 1 }}>USERNAME</div>
              <GInput value={regUser} onChange={e => setRegUser(e.target.value)} placeholder="Your name..." />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 6, letterSpacing: 1 }}>PHONE NUMBER *</div>
              <GInput value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="07X..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 6, letterSpacing: 1 }}>EMAIL</div>
              <GInput type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email..." disabled={true} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 6, letterSpacing: 1 }}>TELEGRAM NO. *</div>
              <GInput value={regTgNumber} onChange={e => setRegTgNumber(e.target.value)} placeholder="TG/..." />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 8, letterSpacing: 2 }}>TEAM ROLE</div>
            <select value={regRole} onChange={e => setRegRole(e.target.value)}
              className="themed-input"
              style={{ width: "100%", background: "#0a0f0a", borderRadius: 8, padding: "14px 16px", fontSize: 15, fontFamily: "'Share Tech Mono',monospace", outline: "none" }}>
              {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {regRole === "Group Leader" ? (
            <div style={{ background: `rgba(${sysColorRGB},0.05)`, padding: 16, borderRadius: 8, border: `1px solid rgba(${sysColorRGB},0.2)` }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#ffffff", marginBottom: 6, letterSpacing: 1 }}>TEAM NAME</div>
                <GInput value={regTeamName} onChange={e => setRegTeamName(e.target.value)} placeholder="Team name..." />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#ffaa00", marginBottom: 6, letterSpacing: 1 }}>CREATE SECRET TOKEN</div>
                <GInput type="password" value={regToken} onChange={e => setRegToken(e.target.value)} placeholder="e.g. 1234" />
              </div>
            </div>
          ) : (
            <div style={{ background: "#ffaa0011", padding: 16, borderRadius: 8, border: "1px solid #ffaa0044" }}>
              <div style={{ fontSize: 11, color: "#ffaa00", marginBottom: 6, letterSpacing: 1 }}>ENTER SECRET TOKEN FROM YOUR LEADER</div>
              <GInput type="password" value={regToken} onChange={e => setRegToken(e.target.value)} placeholder="Secret token..." />
            </div>
          )}

          {formErr && (
            <div style={{ color: "#ff4444", fontSize: 14, padding: "10px", background: "#ff000022", border: "1px solid #ff444455", borderRadius: 8 }}>
              {formErr}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Btn onClick={() => doRegister(true)} style={{ flex: 2 }}>
              {formLoading ? "SAVING..." : "COMPLETE SETUP"}
            </Btn>
            <button onClick={cancelGoogleOnboard} style={{ flex: 1, background: "transparent", border: "1px solid #ff444444", color: "#ff4444", borderRadius: 8, fontFamily: "'Share Tech Mono',monospace", cursor: "pointer" }}>
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN / REGISTER ─────────────────────────────────────────
export function AuthScreen({
  sysColor, sysColorRGB, screen, setScreen,
  loginIdentifier, setLoginIdentifier, loginPass, setLoginPass,
  regUser, setRegUser, regPass, setRegPass,
  regEmail, setRegEmail, regTgNumber, setRegTgNumber,
  regPhone, setRegPhone, regRole, setRegRole,
  regTeamName, setRegTeamName, regToken, setRegToken,
  formErr, setFormErr, formLoading,
  doLogin, doRegister, doGoogleLogin,
}) {
  return (
    <div style={{
      background: "#030503", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Share Tech Mono',monospace", padding: 20,
      "--sys-color": sysColor, "--sys-color-rgb": sysColorRGB,
    }}>
      <AuthStyles sysColor={sysColor} sysColorRGB={sysColorRGB} />

      <div style={{ width: "100%", maxWidth: 450 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 70, height: 70,
            border: `3px solid ${sysColor}`, borderRadius: 16, marginBottom: 16,
            background: "#0a0f0a", fontSize: 35, color: sysColor,
            boxShadow: `0 0 20px rgba(${sysColorRGB},0.4)`,
          }}>⬡</div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 26, color: "#ffffff", letterSpacing: 3, textShadow: "0 0 10px #ffffff66" }}>
            TEAM WORKSPACE
          </div>
          <div style={{ fontSize: 12, color: sysColor, marginTop: 12, letterSpacing: 2 }} className="glow-text-smooth">
            MADE BY HASS KARIYAWASAM
          </div>
          <div style={{ fontSize: 10, color: `rgba(${sysColorRGB},0.4)`, marginTop: 4, letterSpacing: 1 }}>
            DBMS PRACTICUM 2026 // UNIVERSITY OF RUHUNA
          </div>
        </div>

        <div style={{
          background: "#0a0f0a",
          border: `1px solid rgba(${sysColorRGB},0.2)`,
          borderRadius: 16, padding: 30,
          boxShadow: `0 10px 30px rgba(${sysColorRGB},0.1)`,
        }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#000", borderRadius: 10, padding: 6, marginBottom: 20, border: `1px solid rgba(${sysColorRGB},0.13)` }}>
            {["login", "register"].map(s => (
              <button key={s} onClick={() => { setScreen(s); setFormErr(""); }}
                style={{
                  flex: 1, padding: "12px 0",
                  background: screen === s ? `rgba(${sysColorRGB},0.13)` : "transparent",
                  border: "none",
                  color: screen === s ? sysColor : `rgba(${sysColorRGB},0.4)`,
                  fontSize: 14, fontWeight: "bold", letterSpacing: 2,
                  borderRadius: 6, fontFamily: "'Share Tech Mono',monospace",
                  cursor: "pointer", transition: "all 0.3s",
                }}>
                {s === "login" ? "[ LOGIN ]" : "[ REGISTER ]"}
              </button>
            ))}
          </div>

          {/* Google button */}
          <div style={{ marginBottom: 20 }}>
            <button onClick={doGoogleLogin} style={{
              width: "100%", padding: "14px",
              background: "#ffffff", color: "#000", border: "none",
              borderRadius: 8, fontSize: 15, fontWeight: "bold",
              fontFamily: "sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, cursor: "pointer",
            }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: 18 }} />
              Continue with Google
            </button>
            <div style={{ textAlign: "center", margin: "16px 0", color: `rgba(${sysColorRGB},0.33)`, fontSize: 12, letterSpacing: 1 }}>
              OR WITH EMAIL
            </div>
          </div>

          {/* Login Form */}
          {screen === "login" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 8, letterSpacing: 2 }}>USERNAME OR EMAIL</div>
                <GInput value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} placeholder="Enter username or email..." />
              </div>
              <div>
                <div style={{ fontSize: 12, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 8, letterSpacing: 2 }}>PASSWORD</div>
                <GInput type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Enter password..." />
              </div>
              {formErr && <div style={{ color: "#ff4444", fontSize: 14, padding: "10px 14px", background: "#ff000022", border: "1px solid #ff444455", borderRadius: 8 }}>{formErr}</div>}
              <Btn onClick={doLogin} style={{ marginTop: 6 }}>
                {formLoading ? "CONNECTING..." : "ENTER SYSTEM"}
              </Btn>
            </div>
          ) : (
            /* Register Form */
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 6, letterSpacing: 1 }}>USERNAME</div>
                  <GInput value={regUser} onChange={e => setRegUser(e.target.value)} placeholder="Name..." />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 6, letterSpacing: 1 }}>PASSWORD</div>
                  <GInput type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="4+ chars..." />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 6, letterSpacing: 1 }}>PHONE NUMBER *</div>
                <GInput value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="07X..." />
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 6, letterSpacing: 1 }}>EMAIL</div>
                  <GInput type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email..." />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 6, letterSpacing: 1 }}>TELEGRAM NO. *</div>
                  <GInput value={regTgNumber} onChange={e => setRegTgNumber(e.target.value)} placeholder="TG/..." />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 8, letterSpacing: 2 }}>TEAM ROLE</div>
                <select value={regRole} onChange={e => setRegRole(e.target.value)}
                  className="themed-input"
                  style={{ width: "100%", background: "#0a0f0a", borderRadius: 8, padding: "14px 16px", fontSize: 15, fontFamily: "'Share Tech Mono',monospace", outline: "none" }}>
                  {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {regRole === "Group Leader" ? (
                <div style={{ background: `rgba(${sysColorRGB},0.05)`, padding: 16, borderRadius: 8, border: `1px solid rgba(${sysColorRGB},0.2)` }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#ffffff", marginBottom: 6, letterSpacing: 1 }}>TEAM NAME</div>
                    <GInput value={regTeamName} onChange={e => setRegTeamName(e.target.value)} placeholder="Team name..." />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#ffaa00", marginBottom: 6, letterSpacing: 1 }}>CREATE SECRET TOKEN</div>
                    <GInput type="password" value={regToken} onChange={e => setRegToken(e.target.value)} placeholder="e.g. 1234" />
                  </div>
                </div>
              ) : (
                <div style={{ background: "#ffaa0011", padding: 16, borderRadius: 8, border: "1px solid #ffaa0044" }}>
                  <div style={{ fontSize: 11, color: "#ffaa00", marginBottom: 6, letterSpacing: 1 }}>ENTER SECRET TOKEN FROM YOUR LEADER</div>
                  <GInput type="password" value={regToken} onChange={e => setRegToken(e.target.value)} placeholder="Secret token..." />
                </div>
              )}

              {formErr && <div style={{ color: "#ff4444", fontSize: 14, padding: "10px", background: "#ff000022", border: "1px solid #ff444455", borderRadius: 8 }}>{formErr}</div>}
              <Btn onClick={() => doRegister(false)} style={{ marginTop: 6 }}>
                {formLoading ? "CREATING..." : "CREATE WORKSPACE"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
