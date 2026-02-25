import { GInput, Btn } from "./UI.jsx";
import { THEME_COLORS } from "../constants.js";

// ─── SETTINGS TAB ─────────────────────────────────────────────
export default function SettingsTab({
  sysColor, sysColorRGB, profile,
  editData, setEditData,
  formLoading, updateProfileData, updateTheme, doLogout,
}) {
  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ fontSize: 12, color: sysColor, letterSpacing: 3, marginBottom: 20, fontWeight: "bold" }}>
        SYSTEM SETTINGS
      </div>

      {/* Theme selector */}
      <div style={{
        background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.2)`,
        borderRadius: 12, padding: "20px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, letterSpacing: 2, marginBottom: 16 }}>
          CHOOSE YOUR COLOR
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {THEME_COLORS.map(c => (
            <div key={c} onClick={() => updateTheme(c)} style={{
              width: 40, height: 40, borderRadius: 20, background: c, cursor: "pointer",
              border: sysColor === c ? "3px solid #fff" : "2px solid transparent",
              boxShadow: sysColor === c ? `0 0 18px ${c}` : `0 0 6px ${c}44`,
              transition: "all 0.2s",
            }} />
          ))}
        </div>
      </div>

      {/* Profile config */}
      <div style={{
        background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.2)`,
        borderRadius: 12, padding: "20px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, letterSpacing: 2, marginBottom: 16 }}>
          PROFILE CONFIG
        </div>

        {/* Avatar row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          {profile.photoURL ? (
            <img src={profile.photoURL} alt="p" style={{ width: 56, height: 56, borderRadius: 14, border: `2px solid ${sysColor}` }} />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `rgba(${sysColorRGB},0.2)`, border: `2px solid ${sysColor}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: sysColor, fontSize: 24, fontWeight: "bold",
            }}>
              {profile.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: 16,  fontWeight: "bold" }}>{profile.username}</div>
            <div style={{ fontSize: 12, color: `rgba(${sysColorRGB},0.53)`, marginTop: 2 }}>{profile.role}</div>
            <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.4)`, marginTop: 2 }}>{profile.teamName}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 4 }}>USERNAME (READ ONLY)</div>
            <GInput value={profile.username} disabled={true} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 4 }}>EMAIL ADDRESS (READ ONLY)</div>
            <GInput value={profile.email} disabled={true} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 4 }}>PHONE NUMBER</div>
              <GInput value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} placeholder="07X..." />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 4 }}>TELEGRAM NO.</div>
              <GInput value={editData.tgNumber} onChange={e => setEditData({ ...editData, tgNumber: e.target.value })} placeholder="TG/..." />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#ffaa00", marginBottom: 4 }}>NEW PASSWORD (OPTIONAL)</div>
            <GInput type="password" value={editData.newPassword} onChange={e => setEditData({ ...editData, newPassword: e.target.value })} placeholder="Leave blank to keep current password" />
          </div>
          <Btn onClick={updateProfileData} style={{ marginTop: 10 }}>
            {formLoading ? "UPDATING..." : "SAVE PROFILE"}
          </Btn>
        </div>
      </div>

      {/* Logout */}
      <div style={{
        background: "#ff444411", border: "1px solid #ff444455",
        borderRadius: 12, padding: "20px",
      }}>
        <div style={{ fontSize: 11, color: "#ff4444", letterSpacing: 2, marginBottom: 12 }}>DANGER ZONE</div>
        <button onClick={doLogout} style={{
          width: "100%", background: "#ff000022",
          border: "2px solid #ff4444", borderRadius: 8,
          color: "#ff4444", fontSize: 14, fontWeight: "bold",
          padding: "16px", letterSpacing: 2,
          fontFamily: "'Share Tech Mono',monospace",
          cursor: "pointer", transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}
          onMouseOver={e => { e.currentTarget.style.background = "#ff000044"; e.currentTarget.style.boxShadow = "0 0 20px #ff4444aa"; }}
          onMouseOut={e => { e.currentTarget.style.background = "#ff000022"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <span style={{ fontSize: 20 }}>⏻</span>
          LOGOUT / EXIT SYSTEM
        </button>
      </div>
    </div>
  );
}
