// src/components/ProjectSelect.jsx
import { useState } from "react";
import TFLogo from "./Logo.jsx";
import { GInput, Btn } from "./UI.jsx";

export default function ProjectSelect({ profile, projects, sc, scr, onSelect, onCreate, formLoad }) {
  const [showNew,  setShowNew]  = useState(false);
  const [newProj,  setNewProj]  = useState({ shortName:"", longName:"", description:"", deadline:"" });

  const handleCreate = () => {
    if (!newProj.shortName.trim() || !newProj.longName.trim()) return;
    onCreate({ ...newProj, shortName: newProj.shortName.trim().toUpperCase() }, () => {
      setNewProj({ shortName:"", longName:"", description:"", deadline:"" });
      setShowNew(false);
    });
  };

  const wrap = {
    background:"#030503", minHeight:"100vh",
    display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"flex-start",
    fontFamily:"'Share Tech Mono',monospace",
    padding:"30px 16px 80px",
    "--sc": sc, "--scr": scr,
    backgroundImage:"linear-gradient(rgba(var(--scr),0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--scr),0.02) 1px,transparent 1px)",
    backgroundSize:"60px 60px",
  };

  return (
    <div style={wrap}>
      <div style={{ marginBottom:20, marginTop:10 }}><TFLogo size="md" color={sc}/></div>
      <div style={{ width:"100%", maxWidth:500 }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:14, color:"#fff", fontWeight:"bold" }}>
            Welcome, <span style={{ color:sc }}>{profile?.username}</span>
          </div>
          <div style={{ fontSize:11, color:`rgba(${scr},0.5)`, marginTop:4, letterSpacing:2 }}>
            SELECT A PROJECT TO CONTINUE
          </div>
        </div>

        {/* Owner: create project */}
        {profile?.role === "Group Leader" && (
          <div style={{ marginBottom:14 }}>
            <button onClick={()=>setShowNew(!showNew)} className="neon-btn"
              style={{ width:"100%", padding:"12px 0", background:`rgba(${scr},0.07)`, border:`1px dashed rgba(${scr},0.4)`, borderRadius:10, color:sc, fontSize:13, fontWeight:"bold", letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
              {showNew ? "[ CANCEL ]" : "[ + CREATE NEW PROJECT ]"}
            </button>
            {showNew && (
              <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.33)`, borderRadius:12, padding:18, marginTop:10 }}>
                <div style={{ fontSize:11, color:sc, letterSpacing:3, marginBottom:12 }}>NEW PROJECT</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ display:"flex", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:9, color:`rgba(${scr},0.6)`, marginBottom:4 }}>SHORT NAME *</div>
                      <GInput value={newProj.shortName} onChange={e=>setNewProj({...newProj,shortName:e.target.value.toUpperCase()})} placeholder="e.g. DBMS2026"/>
                    </div>
                    <div style={{ flex:2 }}>
                      <div style={{ fontSize:9, color:`rgba(${scr},0.6)`, marginBottom:4 }}>LONG NAME *</div>
                      <GInput value={newProj.longName} onChange={e=>setNewProj({...newProj,longName:e.target.value})} placeholder="e.g. Database Management System Practicum"/>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:`rgba(${scr},0.6)`, marginBottom:4 }}>DESCRIPTION</div>
                    <GInput value={newProj.description} onChange={e=>setNewProj({...newProj,description:e.target.value})} placeholder="What is this project about?"/>
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:`rgba(${scr},0.6)`, marginBottom:4 }}>DEADLINE</div>
                    <GInput type="date" value={newProj.deadline} onChange={e=>setNewProj({...newProj,deadline:e.target.value})}/>
                  </div>
                  <Btn onClick={handleCreate}>{formLoad?"CREATING...":"CREATE PROJECT"}</Btn>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Project list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {projects.length === 0 && (
            <div style={{ textAlign:"center", padding:32, background:"#0a0f0a", border:`1px solid rgba(${scr},0.15)`, borderRadius:12, color:`rgba(${scr},0.3)`, fontSize:12 }}>
              {profile?.role === "Group Leader"
                ? "No projects yet. Create one above!"
                : "No projects available. Ask your leader for a join link."}
            </div>
          )}
          {projects.map(proj => (
            <div key={proj.id} onClick={()=>onSelect(proj)}
              style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.25)`, borderRadius:12, padding:18, cursor:"pointer", transition:"all 0.2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <span style={{ fontSize:10, padding:"3px 10px", background:`rgba(${scr},0.13)`, border:`1px solid rgba(${scr},0.3)`, borderRadius:20, color:sc, fontWeight:"bold", letterSpacing:2 }}>
                      {proj.shortName}
                    </span>
                    {proj.ownerId === profile?.uid && (
                      <span style={{ fontSize:9, color:"#ffaa00", padding:"2px 8px", background:"#ffaa0022", border:"1px solid #ffaa0033", borderRadius:10 }}>OWNER</span>
                    )}
                  </div>
                  <div style={{ fontSize:14, color:"#fff", fontWeight:"bold" }}>{proj.longName}</div>
                  {proj.description && <div style={{ fontSize:11, color:`rgba(${scr},0.5)`, marginTop:4 }}>{proj.description}</div>}
                </div>
                <div style={{ padding:"8px 16px", background:`rgba(${scr},0.13)`, border:`1px solid rgba(${scr},0.3)`, borderRadius:8, color:sc, fontSize:11, fontWeight:"bold", flexShrink:0, fontFamily:"'Share Tech Mono',monospace" }}>
                  SELECT
                </div>
              </div>
              {proj.deadline && <div style={{ fontSize:10, color:"#ffaa00" }}>Deadline: {proj.deadline}</div>}
              <div style={{ fontSize:10, color:`rgba(${scr},0.4)`, marginTop:4 }}>Owner: {proj.ownerName}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop:24, fontSize:9, color:`rgba(${scr},0.15)`, letterSpacing:2, textAlign:"center" }}>
        All rights reserved TeamFlow | by HassKariyawasam
      </div>
    </div>
  );
}
