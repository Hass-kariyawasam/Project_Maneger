// src/components/ResourcesTab.jsx
import { useState } from "react";
import { GInput, Btn } from "./UI.jsx";

export default function ResourcesTab({ resources, profile, sc, scr, addResource, deleteResource, seedTasks, deleteAllTasks }) {
  const [resTitle,   setResTitle]   = useState("");
  const [resUrl,     setResUrl]     = useState("");
  const [resNote,    setResNote]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [migrating,  setMigrating]  = useState(false);
  const [migrateMsg, setMigrateMsg] = useState("");

  async function handleAdd() {
    if (!resTitle.trim() || !resUrl.trim()) return;
    setLoading(true);
    await addResource({ title:resTitle.trim(), url:resUrl.trim(), note:resNote.trim() });
    setResTitle(""); setResUrl(""); setResNote("");
    setLoading(false);
  }

  async function handleSeed() {
    setMigrating(true); setMigrateMsg("Seeding...");
    const msg = await seedTasks();
    setMigrateMsg(msg);
    setMigrating(false);
  }

  async function handleReset() {
    if (!window.confirm("Delete ALL tasks for this project?")) return;
    setMigrating(true); setMigrateMsg("Deleting...");
    const msg = await deleteAllTasks();
    setMigrateMsg(msg);
    setMigrating(false);
  }

  return (
    <div style={{ padding:"16px 14px" }}>
      <div style={{ fontSize:11, color:sc, letterSpacing:3, marginBottom:16, fontWeight:"bold" }}>TEAM RESOURCES</div>

      {/* Add form */}
      <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.33)`, borderRadius:12, padding:14, marginBottom:20 }}>
        <div style={{ fontSize:10, color:`rgba(${scr},0.6)`, letterSpacing:2, marginBottom:9 }}>ADD RESOURCE LINK</div>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          <GInput value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="Title (e.g. MySQL Tutorial)"/>
          <GInput value={resUrl}   onChange={e=>setResUrl(e.target.value)}   placeholder="URL (https://...)" type="url"/>
          <GInput value={resNote}  onChange={e=>setResNote(e.target.value)}  placeholder="Short note (optional)"/>
          <Btn onClick={handleAdd}>{loading ? "ADDING..." : "ADD TO TEAM"}</Btn>
        </div>
      </div>

      {/* Resources list */}
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {resources.length === 0 && (
          <div style={{ textAlign:"center", padding:28, color:`rgba(${scr},0.27)`, fontSize:12 }}>NO RESOURCES YET</div>
        )}
        {resources.map(r => (
          <div key={r.id} style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:10, padding:13 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14, color:"#fff", fontWeight:"bold", marginBottom:4 }}>{r.title}</div>
                <div style={{ fontSize:10, color:`rgba(${scr},0.4)` }}>By {r.addedBy}</div>
              </div>
              <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ padding:"6px 13px", background:`rgba(${scr},0.13)`, color:sc, borderRadius:6, textDecoration:"none", fontSize:11, fontWeight:"bold", fontFamily:"'Share Tech Mono',monospace" }}>OPEN</a>
                {(profile.isLeader || r.addedBy === profile.username) && (
                  <button onClick={() => deleteResource(r.id)} style={{ background:"transparent", border:"1px solid #ff444455", color:"#ff4444", borderRadius:6, padding:"6px 10px", cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", fontSize:11 }}>DEL</button>
                )}
              </div>
            </div>
            {r.note && (
              <div style={{ marginTop:8, background:"#000", borderLeft:`3px solid ${sc}`, padding:"6px 10px", fontSize:11, color:`rgba(${scr},0.6)`, borderRadius:"0 8px 8px 0" }}>{r.note}</div>
            )}
          </div>
        ))}
      </div>

      {/* Leader tools */}
      {profile.isLeader && (
        <div style={{ marginTop:32, borderTop:"1px dashed #ff444455", paddingTop:16 }}>
          <div style={{ fontSize:9, color:"#ff4444", marginBottom:9, letterSpacing:2 }}>LEADER TOOLS</div>
          <button onClick={handleSeed} disabled={migrating} style={{ width:"100%", padding:"10px 0", background:`rgba(${scr},0.07)`, border:`1px solid rgba(${scr},0.33)`, borderRadius:8, color:sc, fontSize:11, letterSpacing:1, fontFamily:"'Share Tech Mono',monospace", cursor:migrating?"not-allowed":"pointer", marginBottom:7 }}>
            SEED DEFAULT TASKS
          </button>
          <button onClick={handleReset} disabled={migrating} style={{ width:"100%", padding:"10px 0", background:"#ff444411", border:"1px solid #ff4444", borderRadius:8, color:"#ff4444", fontSize:11, letterSpacing:1, fontFamily:"'Share Tech Mono',monospace", cursor:migrating?"not-allowed":"pointer" }}>
            DELETE ALL TASKS (RESET)
          </button>
          {migrateMsg && <div style={{ marginTop:9, padding:9, background:`rgba(${scr},0.07)`, border:`1px solid rgba(${scr},0.2)`, borderRadius:6, fontSize:11, color:sc }}>{migrateMsg}</div>}
        </div>
      )}
    </div>
  );
}
