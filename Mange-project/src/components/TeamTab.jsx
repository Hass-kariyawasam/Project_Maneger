// ─── TEAM TAB ─────────────────────────────────────────────────
export default function TeamTab({ sysColor, sysColorRGB, profile, userStats }) {
  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{
        fontSize: 12, color: sysColor, letterSpacing: 3, marginBottom: 16,
        fontWeight: "bold", borderBottom: `1px solid rgba(${sysColorRGB},0.2)`, paddingBottom: 8,
      }}>
        TEAM MEMBERS
      </div>

      {userStats.map((u, index) => {
        const isTop = index === 0 && u.points > 0;
        return (
          <div key={u.username} style={{
            background: "#0a0f0a", border: `1px solid ${u.color}44`,
            borderRadius: 12, padding: "16px", marginBottom: 14,
            position: "relative", overflow: "hidden",
            boxShadow: isTop ? `0 0 15px ${u.color}33` : "none",
          }}>
            {isTop && (
              <div style={{ position: "absolute", top: -10, right: -10, fontSize: 50, opacity: 0.1 }}>👑</div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Avatar */}
              {u.photoURL ? (
                <img src={u.photoURL} alt="p" style={{ width: 50, height: 50, borderRadius: 12, border: `2px solid ${u.color}66`, boxShadow: isTop ? `0 0 15px ${u.color}` : "none" }} />
              ) : (
                <div style={{
                  width: 50, height: 50, borderRadius: 12, flexShrink: 0,
                  background: u.color + "22", border: `2px solid ${u.color}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, color: u.color,
                  boxShadow: isTop ? `0 0 15px ${u.color}` : "none",
                }}>
                  {isTop ? "👑" : u.username[0].toUpperCase()}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 16, color: u.color, letterSpacing: 1, fontWeight: "bold" }}>
                    {u.username}{u.username === profile.username && " (YOU)"}
                  </div>
                  <div style={{ fontSize: 18, color: sysColor, fontWeight: "bold", fontFamily: "'Orbitron',monospace" }}>
                    {u.points} PTS
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#00ff8588", marginTop: 4 }}>{u.role}</div>

                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10,
                  background: "#000", padding: "8px 12px", borderRadius: 8,
                  border: `1px solid rgba(${sysColorRGB},0.13)`,
                }}>
                  {u.phone && <div style={{ fontSize: 11, color: "#fff" }}>PHONE: {u.phone}</div>}
                  <div style={{ fontSize: 11, color: "#00ccff" }}>TG: {u.tgNumber}</div>
                  <div style={{ fontSize: 11, color: "#ffaa00" }}>⚡ {u.doneCount}/{u.totalCount} Tasks Done</div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: 10, height: 4, background: "#000", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: u.totalCount > 0 ? `${(u.doneCount / u.totalCount) * 100}%` : "0%",
                    background: `linear-gradient(90deg, ${u.color}, ${u.color}88)`,
                    borderRadius: 4, transition: "width 0.6s ease",
                    boxShadow: `0 0 8px ${u.color}`,
                  }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
