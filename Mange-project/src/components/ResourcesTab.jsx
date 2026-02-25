import { GInput, Btn } from "./UI.jsx";

// ─── RESOURCES (DATA) TAB ─────────────────────────────────────
export default function ResourcesTab({
  sysColor, sysColorRGB, profile,
  resources,
  newResTitle, setNewResTitle,
  newResUrl, setNewResUrl,
  newResNote, setNewResNote,
  formLoading, addResource, deleteResource,
  migrating, migrateMsg, seedTasks, deleteAllTasks,
}) {
  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ fontSize: 12, color: sysColor, letterSpacing: 3, marginBottom: 20, fontWeight: "bold" }}>
        TEAM RESOURCES
      </div>

      {/* Add resource form */}
      <div style={{
        background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.33)`,
        borderRadius: 12, padding: 16, marginBottom: 24,
        boxShadow: `0 0 15px rgba(${sysColorRGB},0.07)`,
      }}>
        <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, letterSpacing: 2, marginBottom: 12 }}>
          ADD NEW RESOURCE LINK
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <GInput value={newResTitle} onChange={e => setNewResTitle(e.target.value)} placeholder="Title (e.g. MySQL Tutorial)" />
          <GInput value={newResUrl} onChange={e => setNewResUrl(e.target.value)} placeholder="URL (https://...)" type="url" />
          <GInput value={newResNote} onChange={e => setNewResNote(e.target.value)} placeholder="Short note about this link..." />
          <Btn onClick={addResource}>{formLoading ? "SENDING..." : "ADD TO TEAM"}</Btn>
        </div>
      </div>

      {/* Resource list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {resources.length === 0 && (
          <div style={{ textAlign: "center", padding: 30, color: `rgba(${sysColorRGB},0.27)`, fontSize: 14 }}>
            NO RESOURCES YET
          </div>
        )}
        {resources.map(r => (
          <div key={r.id} style={{
            background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.2)`,
            borderRadius: 10, padding: "16px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 16, color: "#fff", fontWeight: "bold", marginBottom: 6 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.4)` }}>Added by {r.addedBy}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "8px 16px", background: `rgba(${sysColorRGB},0.13)`, color: sysColor, borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: "bold" }}>
                  OPEN LINK ↗
                </a>
                {(profile.role === "Group Leader" || r.addedBy === profile.username) && (
                  <button onClick={() => deleteResource(r.id)}
                    style={{ background: "transparent", border: "1px solid #ff444455", color: "#ff4444", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", fontSize: 12 }}>
                    DELETE
                  </button>
                )}
              </div>
            </div>
            {r.note && (
              <div style={{ background: "#000", borderLeft: `3px solid ${sysColor}`, padding: "8px 12px", fontSize: 13, color: `rgba(${sysColorRGB},0.67)`, borderRadius: "0 8px 8px 0" }}>
                {r.note}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Leader tools */}
      {profile.role === "Group Leader" && (
        <div style={{ marginTop: 40, borderTop: "1px dashed #ff444455", paddingTop: 20 }}>
          <div style={{ fontSize: 10, color: "#ff4444", marginBottom: 10, letterSpacing: 2 }}>
            SYSTEM OVERRIDE — LEADER ONLY
          </div>
          <button onClick={seedTasks} disabled={migrating}
            style={{ width: "100%", padding: "12px 0", background: `rgba(${sysColorRGB},0.07)`, border: `1px solid rgba(${sysColorRGB},0.33)`, borderRadius: 8, color: sysColor, fontSize: 12, letterSpacing: 1, fontFamily: "'Share Tech Mono',monospace", cursor: migrating ? "not-allowed" : "pointer", marginBottom: 10 }}>
            SEED DEFAULT TASKS
          </button>
          <button onClick={deleteAllTasks} disabled={migrating}
            style={{ width: "100%", padding: "12px 0", background: "#ff444411", border: "1px solid #ff4444", borderRadius: 8, color: "#ff4444", fontSize: 12, letterSpacing: 1, fontFamily: "'Share Tech Mono',monospace", cursor: migrating ? "not-allowed" : "pointer" }}>
            DELETE ALL TASKS (RESET)
          </button>
          {migrateMsg && (
            <div style={{ marginTop: 12, padding: "10px", background: `rgba(${sysColorRGB},0.07)`, border: `1px solid rgba(${sysColorRGB},0.27)`, borderRadius: 6, fontSize: 12, color: sysColor }}>
              {migrateMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
