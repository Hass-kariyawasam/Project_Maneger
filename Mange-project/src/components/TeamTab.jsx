// src/components/TeamTab.jsx - v3
import { useState } from "react";

export default function TeamTab({
  profile, activeProject, teamUsers, tasks,
  sc, scr,
  copyInvite, inviteCopied,
  projects, onSwitchProject,
}) {
  const [showInvite, setShowInvite] = useState(false);

  // stats
  const pubTasks = tasks.filter(t => !t.isPrivate);
  const stats = teamUsers.map(u => {
    const ut = pubTasks.filter(t =>
      t.assignee === "All" || t.assignee === u.username ||
      (u.isLeader && t.assignee === "Leader") ||
      (!u.isLeader && t.assignee === "Member")
    );
    return { ...u, done: ut.filter(t=>t.done).length, total: ut.length, pts: ut.filter(t=>t.done).length * 10 };
  }).sort((a,b) => b.pts - a.pts);

  const buildInvite = () => {
    if (!profile || !activeProject) return null;
    const code = profile.joinCode || "N/A";
    const base = window.location.origin + window.location.pathname;
    const link = `${base}?join=${code}`;
    return {
      code, link,
      msg: `You are invited to join TeamFlow!\n\nProject : ${activeProject.longName} [${activeProject.shortName}]\nTeam    : ${profile.teamName}\nLeader  : ${profile.username}\n\nJoin link: ${link}\n\n(Or enter code manually at registration: ${code})\n\n-- TeamFlow | by HassKariyawasam`,
    };
  };
  const inv = buildInvite();

  const S = (isActive) => ({
    background: isActive ? `rgba(${scr},0.07)` : "#0a0f0a",
    border: `1px solid ${isActive ? sc : `rgba(${scr},0.18)`}`,
    borderRadius: 12, padding: 14,
    boxShadow: isActive ? `0 0 14px rgba(${scr},0.12)` : "none",
    marginBottom: 10,
    transition: "all 0.2s",
  });

  return (
    <div style={{ padding:"16px 14px 80px" }}>

      {/* -- PROJECTS -- */}
      <div style={{ fontSize:11, color:sc, letterSpacing:3, fontWeight:"bold", marginBottom:12 }}>PROJECTS</div>

      {projects.length === 0 && (
        <div style={{ textAlign:"center", padding:28, background:"#0a0f0a", border:`1px solid rgba(${scr},0.12)`, borderRadius:12, color:`rgba(${scr},0.3)`, fontSize:12, marginBottom:20 }}>
          No projects available. Contact admin.
        </div>
      )}

      {projects.map(proj => {
        const isActive = activeProject?.id === proj.id;
        return (
          <div key={proj.id} style={S(isActive)}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap", marginBottom:6 }}>
                  <span style={{ fontSize:10, padding:"3px 10px", background:`rgba(${scr},0.12)`, border:`1px solid rgba(${scr},0.28)`, borderRadius:20, color:sc, fontWeight:"bold", letterSpacing:2 }}>
                    {proj.shortName}
                  </span>
                  {isActive && <span style={{ fontSize:9, padding:"2px 8px", background:`rgba(${scr},0.2)`, border:`1px solid ${sc}`, borderRadius:10, color:sc }}>ACTIVE</span>}
                </div>
                <div style={{ fontSize:14, color:"#fff", fontWeight:"bold" }}>{proj.longName}</div>
                {proj.description && <div style={{ fontSize:11, color:`rgba(${scr},0.45)`, marginTop:3 }}>{proj.description}</div>}
                {proj.deadline && <div style={{ fontSize:10, color:"#ffaa00", marginTop:4 }}>Deadline: {proj.deadline}</div>}
                <div style={{ fontSize:10, color:`rgba(${scr},0.3)`, marginTop:3 }}>Owner: {proj.ownerName}</div>
              </div>
              {!isActive && (
                <button onClick={()=>onSwitchProject(proj)}
                  style={{ padding:"8px 16px", background:`rgba(${scr},0.1)`, border:`1px solid rgba(${scr},0.28)`, borderRadius:8, color:sc, fontSize:11, fontWeight:"bold", fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", flexShrink:0 }}>
                  SWITCH
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ fontSize:10, color:`rgba(${scr},0.25)`, textAlign:"center", padding:"8px 0 20px", letterSpacing:1 }}>
        Contact admin to add new projects
      </div>

      <div style={{ height:1, background:`rgba(${scr},0.1)`, marginBottom:20 }}/>

      {/* -- INVITE (leader only) -- */}
      {profile.isLeader && inv && (
        <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:12, padding:14, marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:showInvite?14:0 }}>
            <div>
              <div style={{ fontSize:12, color:sc, fontWeight:"bold" }}>INVITE MEMBERS</div>
              <div style={{ fontSize:9, color:`rgba(${scr},0.38)`, marginTop:2 }}>Share join link with team</div>
            </div>
            <button onClick={()=>setShowInvite(!showInvite)}
              style={{ padding:"7px 14px", background:`rgba(${scr},0.12)`, border:`1px solid rgba(${scr},0.28)`, borderRadius:8, color:sc, fontSize:11, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
              {showInvite ? "HIDE" : "SHOW INVITE"}
            </button>
          </div>
          {showInvite && (
            <div>
              <div style={{ background:"#000", borderRadius:10, padding:14, border:`1px solid rgba(${scr},0.18)`, marginBottom:10 }}>
                <div style={{ fontSize:9, color:`rgba(${scr},0.45)`, letterSpacing:2, marginBottom:6 }}>JOIN CODE</div>
                <div style={{ fontSize:30, color:sc, fontFamily:"'Orbitron',monospace", fontWeight:900, letterSpacing:7, marginBottom:8 }}>{inv.code}</div>
                <div style={{ fontSize:9, color:`rgba(${scr},0.28)`, wordBreak:"break-all" }}>{inv.link}</div>
              </div>
              <div style={{ background:"#000", borderRadius:8, padding:12, border:`1px solid rgba(${scr},0.12)`, marginBottom:10, fontSize:11, color:`rgba(${scr},0.6)`, lineHeight:1.9, whiteSpace:"pre-wrap", fontFamily:"'Share Tech Mono',monospace" }}>
                {inv.msg}
              </div>
              <button onClick={()=>copyInvite(inv.msg)}
                style={{ width:"100%", padding:"12px 0", background:inviteCopied?`rgba(${scr},0.18)`:`rgba(${scr},0.08)`, border:`1px solid ${inviteCopied?sc:`rgba(${scr},0.28)`}`, borderRadius:8, color:sc, fontSize:12, fontWeight:"bold", letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", transition:"all 0.3s" }}>
                {inviteCopied ? "COPIED!" : "COPY INVITE MESSAGE"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* -- TEAM MEMBERS -- */}
      <div style={{ fontSize:11, color:sc, letterSpacing:3, fontWeight:"bold", marginBottom:12 }}>TEAM MEMBERS</div>

      {stats.length===0 && (
        <div style={{ textAlign:"center", padding:24, color:`rgba(${scr},0.28)`, fontSize:12 }}>No members in this project yet.</div>
      )}

      {stats.map((u, i) => {
        const top = i===0 && u.pts>0;
        const uc = u.color || sc;
        return (
          <div key={u.uid||i} style={{ background:"#0a0f0a", border:`1px solid ${uc}44`, borderRadius:12, padding:14, marginBottom:12, boxShadow:top?`0 0 14px ${uc}1a`:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {u.photoURL
                ? <img src={u.photoURL} alt="p" style={{ width:46, height:46, borderRadius:12, border:`2px solid ${uc}66`, flexShrink:0 }}/>
                : <div style={{ width:46, height:46, borderRadius:12, background:uc+"22", border:`2px solid ${uc}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:uc, flexShrink:0, fontWeight:"bold" }}>
                    {(u.username||"?")[0].toUpperCase()}
                  </div>}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:14, color:uc, fontWeight:"bold", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {u.username}{u.uid===profile.uid?" (YOU)":""}
                  </div>
                  <div style={{ fontSize:15, color:sc, fontWeight:"bold", fontFamily:"'Orbitron',monospace", flexShrink:0, marginLeft:8 }}>{u.pts} PTS</div>
                </div>
                <div style={{ fontSize:10, color:`rgba(${scr},0.38)`, marginTop:2 }}>
                  {u.isLeader ? "Team Leader" : "Member"} - {u.teamName}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8, background:"#000", padding:"6px 10px", borderRadius:7, border:`1px solid rgba(${scr},0.1)` }}>
                  {u.phone && <div style={{ fontSize:10, color:"#fff" }}>Phone: {u.phone}</div>}
                  <div style={{ fontSize:10, color:"#00ccff" }}>TG: {u.tgNumber||"-"}</div>
                  <div style={{ fontSize:10, color:"#ffaa00" }}>{u.done}/{u.total} Tasks</div>
                </div>
                <div style={{ marginTop:8, height:2.5, background:"#000", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width: u.total>0?`${(u.done/u.total)*100}%`:"0%", background:`linear-gradient(90deg,${uc},${uc}88)`, borderRadius:4, transition:"width 0.6s" }}/>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
