// src/components/AdminPanel.jsx - v3
import { useState, useEffect } from "react";
import {
  collection, onSnapshot, query, orderBy,
  deleteDoc, doc, updateDoc, addDoc, serverTimestamp,
} from "firebase/firestore";
import TFLogo from "./Logo.jsx";
import { CHAT_COL, QUIZZES_COL, USERS_COL, PROJECTS_COL, OWNER_NAME } from "../constants.js";

export default function AdminPanel({
  db, allUsers, allTeams, projects, dbQuizzes,
  toast, showToast, doLogout, loadAdminData,
}) {
  const [tab,      setTab]      = useState("overview");
  const [editUser, setEditUser] = useState(null);
  const [editProj, setEditProj] = useState(null);
  const [showNew,  setShowNew]  = useState(false);
  const [newP,     setNewP]     = useState({ shortName:"", longName:"", description:"", deadline:"" });
  const [qTitle,   setQTitle]   = useState("");
  const [qQs,      setQQs]      = useState([{ q:"",o1:"",o2:"",o3:"",o4:"",ans:0 }]);

  function chQ(i,f,v){ const a=[...qQs]; a[i][f]=v; setQQs(a); }

  const iSt = (bc="#ff444433") => ({
    width:"100%", background:"#000",
    border:`1px solid ${bc}`, borderRadius:6,
    padding:"9px 12px", color:"#fff",
    fontFamily:"'Share Tech Mono',monospace",
    outline:"none", marginBottom:6, fontSize:12,
  });

  // -- USER SAVE ----------------------------------------------------
  async function saveUser(uid) {
    const g = f => document.getElementById(`eu_${f}_${uid}`)?.value||"";
    try {
      await updateDoc(doc(db, USERS_COL, uid), { phone:g("ph"), tgNumber:g("tg"), teamName:g("tm") });
      showToast("User updated!"); setEditUser(null); loadAdminData();
    } catch(e){ showToast("Error: "+e.message); }
  }

  // -- PROJECT CRUD -------------------------------------------------
  async function createProj() {
    if (!newP.shortName.trim()||!newP.longName.trim()){ showToast("Short + long name required"); return; }
    try {
      await addDoc(collection(db, PROJECTS_COL), {
        shortName: newP.shortName.trim().toUpperCase(),
        longName:  newP.longName.trim(),
        description: newP.description.trim(),
        deadline:  newP.deadline,
        ownerId:   "admin", ownerName: OWNER_NAME,
        teamIds:   [], createdAt: serverTimestamp(),
      });
      showToast("Project created!");
      setNewP({ shortName:"",longName:"",description:"",deadline:"" });
      setShowNew(false); loadAdminData();
    } catch(e){ showToast("Error: "+e.message); }
  }

  async function saveProj(id) {
    const g = f => document.getElementById(`ep_${f}_${id}`)?.value||"";
    try {
      await updateDoc(doc(db, PROJECTS_COL, id), { longName:g("ln"), description:g("ds"), deadline:g("dl") });
      showToast("Project updated!"); setEditProj(null); loadAdminData();
    } catch(e){ showToast("Error: "+e.message); }
  }

  async function deleteProj(id) {
    if (!window.confirm("Delete this project? Teams will lose access.")) return;
    try { await deleteDoc(doc(db, PROJECTS_COL, id)); showToast("Deleted!"); loadAdminData(); }
    catch(e){ showToast("Error: "+e.message); }
  }

  // -- OWNER QUIZ ---------------------------------------------------
  async function addOwnerQuiz() {
    if (!qTitle.trim()){ showToast("Title required"); return; }
    try {
      await addDoc(collection(db, QUIZZES_COL), {
        title: qTitle,
        questions: qQs.map(q=>({ q:q.q, opts:[q.o1,q.o2,q.o3,q.o4], ans:Number(q.ans) })),
        addedBy: OWNER_NAME, ts: serverTimestamp(),
      });
      setQTitle(""); setQQs([{q:"",o1:"",o2:"",o3:"",o4:"",ans:0}]);
      showToast("Quiz added!"); loadAdminData();
    } catch(e){ showToast("Error: "+e.message); }
  }

  async function delQuiz(id) {
    if (!window.confirm("Delete quiz?")) return;
    try { await deleteDoc(doc(db, QUIZZES_COL, id)); showToast("Deleted!"); loadAdminData(); }
    catch(e){ showToast("Error: "+e.message); }
  }

  const TABS = ["overview","users","teams","projects","chat","quiz"];

  return (
    <div style={{ background:"#030503", minHeight:"100vh", fontFamily:"'Share Tech Mono',monospace", "--sc":"#ff4444", "--scr":"255,68,68" }}>
      {/* Header */}
      <div style={{ background:"#000", borderBottom:"1px solid #ff444430", padding:"12px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:200 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <TFLogo size="sm" color="#ff4444" showSub={false}/>
          <div style={{ width:1, height:22, background:"#ff444430" }}/>
          <div>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:11, letterSpacing:3, color:"#ff4444" }}>ADMIN PANEL</div>
            <div style={{ fontSize:9, color:"#ff444466", marginTop:1 }}>// {OWNER_NAME}</div>
          </div>
        </div>
        <button onClick={doLogout}
          style={{ background:"#ff000020", border:"1px solid #ff4444", color:"#ff4444", padding:"7px 16px", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:11, fontWeight:"bold" }}>
          LOGOUT
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", background:"#050505", borderBottom:"1px solid #ff444420", overflowX:"auto" }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding:"12px 16px", background:tab===t?"#ff000018":"transparent", border:"none", borderBottom:tab===t?"2px solid #ff4444":"2px solid transparent", color:tab===t?"#ff4444":"rgba(255,68,68,0.38)", fontSize:11, letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", whiteSpace:"nowrap" }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ padding:"18px 14px", maxWidth:920, margin:"0 auto" }}>

        {/* OVERVIEW */}
        {tab==="overview" && (
          <div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:18 }}>
              {[{l:"USERS",v:allUsers.filter(u=>u.email!=="admin@teamflow.internal").length,c:"#00ff88"},
                {l:"TEAMS",v:allTeams.length,c:"#00ccff"},
                {l:"PROJECTS",v:projects.length,c:"#ffaa00"},
                {l:"QUIZZES",v:dbQuizzes.length,c:"#ff66cc"}].map(s=>(
                <div key={s.l} style={{ flex:"1 1 80px", background:"#0a0a0a", border:`1px solid ${s.c}30`, borderRadius:10, padding:"12px 14px", minWidth:75 }}>
                  <div style={{ fontSize:9, color:"#ffffff33", letterSpacing:2, marginBottom:4 }}>{s.l}</div>
                  <div style={{ fontSize:24, fontWeight:"bold", color:s.c, fontFamily:"'Orbitron',monospace" }}>{s.v}</div>
                </div>
              ))}
            </div>
            <button onClick={loadAdminData}
              style={{ padding:"9px 18px", background:"#ff000018", border:"1px solid #ff4444", color:"#ff4444", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:11 }}>
              REFRESH DATA
            </button>
          </div>
        )}

        {/* USERS */}
        {tab==="users" && (
          <div>
            <div style={{ fontSize:11, color:"#ff4444", letterSpacing:3, marginBottom:14 }}>
              USERS ({allUsers.filter(u=>u.email!=="admin@teamflow.internal").length})
            </div>
            {allUsers.filter(u=>u.email!=="admin@teamflow.internal").map(u=>(
              <div key={u.uid} style={{ background:"#0a0a0a", border:"1px solid #ff444420", borderRadius:10, padding:14, marginBottom:10 }}>
                {editUser===u.uid ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <div style={{ fontSize:11, color:"#ff4444", marginBottom:2 }}>Editing: {u.username}</div>
                    {[{f:"ph",l:"PHONE",v:u.phone||""},{f:"tg",l:"TELEGRAM",v:u.tgNumber||""},{f:"tm",l:"TEAM NAME",v:u.teamName||""}].map(({f,l,v})=>(
                      <div key={f}>
                        <div style={{ fontSize:9, color:"rgba(255,68,68,0.55)", marginBottom:3 }}>{l}</div>
                        <input id={`eu_${f}_${u.uid}`} defaultValue={v} style={iSt()}/>
                      </div>
                    ))}
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>saveUser(u.uid)} style={{ flex:1, padding:"9px 0", background:"#ff000028", border:"1px solid #ff4444", color:"#ff4444", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:11 }}>SAVE</button>
                      <button onClick={()=>setEditUser(null)} style={{ flex:1, padding:"9px 0", background:"transparent", border:"1px solid #ff444430", color:"rgba(255,68,68,0.45)", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:11 }}>CANCEL</button>
                    </div>
                  </div>
                ):(
                  <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      {u.photoURL
                        ? <img src={u.photoURL} alt="p" style={{ width:36, height:36, borderRadius:9, border:"2px solid #ff444430" }}/>
                        : <div style={{ width:36, height:36, borderRadius:9, background:"#ff000018", border:"2px solid #ff444430", display:"flex", alignItems:"center", justifyContent:"center", color:"#ff4444", fontSize:15, fontWeight:"bold" }}>{(u.username||"?")[0].toUpperCase()}</div>}
                      <div>
                        <div style={{ fontSize:13, color:"#fff", fontWeight:"bold" }}>{u.username}</div>
                        {/* Show "Member" only - no numbered roles */}
                        <div style={{ fontSize:10, color:"rgba(255,68,68,0.45)", marginTop:2 }}>{u.email} | Member</div>
                        <div style={{ fontSize:10, color:"rgba(255,68,68,0.35)", marginTop:1 }}>
                          TG: {u.tgNumber||"-"} | Phone: {u.phone||"-"} | Team: {u.teamName||"-"}
                        </div>
                      </div>
                    </div>
                    <button onClick={()=>setEditUser(u.uid)}
                      style={{ padding:"6px 12px", background:"#ff000018", border:"1px solid #ff444440", color:"#ff4444", borderRadius:6, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:11, flexShrink:0 }}>
                      EDIT
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TEAMS */}
        {tab==="teams" && (
          <div>
            <div style={{ fontSize:11, color:"#ff4444", letterSpacing:3, marginBottom:14 }}>TEAMS ({allTeams.length})</div>
            {allTeams.map((team,i)=>(
              <div key={i} style={{ background:"#0a0a0a", border:"1px solid #ff444420", borderRadius:12, padding:16, marginBottom:14 }}>
                <div style={{ fontSize:14, color:"#ff4444", fontWeight:"bold", marginBottom:2 }}>{team.teamName||"Unnamed Team"}</div>
                <div style={{ fontSize:10, color:"rgba(255,68,68,0.4)", marginBottom:10 }}>{team.members.length} members</div>
                {team.members.map(m=>(
                  <div key={m.uid} style={{ display:"flex", alignItems:"center", gap:10, background:"#000", padding:"8px 12px", borderRadius:8, border:"1px solid #ff444410", marginBottom:6 }}>
                    {m.photoURL
                      ? <img src={m.photoURL} alt="p" style={{ width:28, height:28, borderRadius:7 }}/>
                      : <div style={{ width:28, height:28, borderRadius:7, background:"#ff000018", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#ff4444" }}>{(m.username||"?")[0]}</div>}
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:"#fff" }}>
                        {m.username}
                        <span style={{ fontSize:10, color:"rgba(255,68,68,0.45)", marginLeft:8 }}>
                          {m.isLeader ? "(Leader)" : "(Member)"}
                        </span>
                      </div>
                      <div style={{ fontSize:10, color:"rgba(255,68,68,0.38)" }}>TG: {m.tgNumber||"-"} | {m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* PROJECTS */}
        {tab==="projects" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#ff4444", letterSpacing:3 }}>PROJECTS ({projects.length})</div>
              <button onClick={()=>setShowNew(!showNew)}
                style={{ padding:"8px 15px", background:"#ff000020", border:"1px solid #ff4444", color:"#ff4444", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:11 }}>
                {showNew ? "CANCEL" : "+ CREATE"}
              </button>
            </div>

            {showNew && (
              <div style={{ background:"#0a0a0a", border:"1px solid #ff444440", borderRadius:12, padding:16, marginBottom:16 }}>
                <div style={{ fontSize:10, color:"#ff4444", letterSpacing:2, marginBottom:12 }}>NEW PROJECT (Owner: {OWNER_NAME})</div>
                <div style={{ display:"flex", gap:9, marginBottom:4 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:9, color:"rgba(255,68,68,0.55)", marginBottom:3 }}>SHORT NAME *</div>
                    <input value={newP.shortName} onChange={e=>setNewP({...newP,shortName:e.target.value.toUpperCase()})} placeholder="DBMS2026" style={iSt()}/>
                  </div>
                  <div style={{ flex:2 }}>
                    <div style={{ fontSize:9, color:"rgba(255,68,68,0.55)", marginBottom:3 }}>LONG NAME *</div>
                    <input value={newP.longName} onChange={e=>setNewP({...newP,longName:e.target.value})} placeholder="Full project name..." style={iSt()}/>
                  </div>
                </div>
                <div style={{ fontSize:9, color:"rgba(255,68,68,0.55)", marginBottom:3 }}>DESCRIPTION</div>
                <input value={newP.description} onChange={e=>setNewP({...newP,description:e.target.value})} placeholder="Short description..." style={iSt()}/>
                <div style={{ fontSize:9, color:"rgba(255,68,68,0.55)", marginBottom:3 }}>DEADLINE</div>
                <input type="date" value={newP.deadline} onChange={e=>setNewP({...newP,deadline:e.target.value})} style={iSt()}/>
                <button onClick={createProj}
                  style={{ width:"100%", padding:"11px 0", background:"#ff000030", border:"1px solid #ff4444", color:"#ff4444", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:12, fontWeight:"bold", marginTop:4 }}>
                  CREATE PROJECT
                </button>
              </div>
            )}

            {projects.map(p=>(
              <div key={p.id} style={{ background:"#0a0a0a", border:"1px solid #ff444420", borderRadius:10, padding:16, marginBottom:10 }}>
                {editProj===p.id ? (
                  <div>
                    <div style={{ fontSize:10, color:"#ff4444", marginBottom:10 }}>EDITING: {p.shortName}</div>
                    {[{f:"ln",l:"LONG NAME",v:p.longName||""},{f:"ds",l:"DESCRIPTION",v:p.description||""}].map(({f,l,v})=>(
                      <div key={f}><div style={{ fontSize:9, color:"rgba(255,68,68,0.55)", marginBottom:3 }}>{l}</div><input id={`ep_${f}_${p.id}`} defaultValue={v} style={iSt()}/></div>
                    ))}
                    <div style={{ fontSize:9, color:"rgba(255,68,68,0.55)", marginBottom:3 }}>DEADLINE</div>
                    <input id={`ep_dl_${p.id}`} type="date" defaultValue={p.deadline||""} style={iSt()}/>
                    <div style={{ display:"flex", gap:8, marginTop:4 }}>
                      <button onClick={()=>saveProj(p.id)} style={{ flex:1, padding:"9px 0", background:"#ff000028", border:"1px solid #ff4444", color:"#ff4444", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:11 }}>SAVE</button>
                      <button onClick={()=>setEditProj(null)} style={{ flex:1, padding:"9px 0", background:"transparent", border:"1px solid #ff444430", color:"rgba(255,68,68,0.45)", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:11 }}>CANCEL</button>
                    </div>
                  </div>
                ):(
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                      <span style={{ fontSize:10, padding:"3px 10px", background:"#ff000020", border:"1px solid #ff444440", borderRadius:20, color:"#ff4444", fontWeight:"bold", letterSpacing:2 }}>{p.shortName}</span>
                      <div style={{ display:"flex", gap:7 }}>
                        <button onClick={()=>setEditProj(p.id)} style={{ padding:"5px 11px", background:"#ff000018", border:"1px solid #ff444440", color:"#ff4444", borderRadius:6, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:10 }}>EDIT</button>
                        <button onClick={()=>deleteProj(p.id)} style={{ padding:"5px 11px", background:"#ff000030", border:"1px solid #ff4444", color:"#ff4444", borderRadius:6, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:10 }}>DEL</button>
                      </div>
                    </div>
                    <div style={{ fontSize:14, color:"#fff", fontWeight:"bold" }}>{p.longName}</div>
                    {p.description && <div style={{ fontSize:11, color:"rgba(255,68,68,0.4)", marginTop:3 }}>{p.description}</div>}
                    <div style={{ fontSize:10, color:"rgba(255,68,68,0.38)", marginTop:5 }}>
                      Owner: {p.ownerName} | Deadline: {p.deadline||"N/A"} | Teams: {p.teamIds?.length||0}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CHAT */}
        {tab==="chat" && <AdminChat db={db} showToast={showToast}/>}

        {/* QUIZ */}
        {tab==="quiz" && (
          <div>
            <div style={{ fontSize:11, color:"#ff4444", letterSpacing:3, marginBottom:14 }}>ADD QUIZ (as {OWNER_NAME})</div>
            <div style={{ background:"#0a0a0a", border:"1px solid #ff444430", borderRadius:12, padding:16, marginBottom:20 }}>
              <input value={qTitle} onChange={e=>setQTitle(e.target.value)} placeholder="Quiz title..." style={iSt()}/>
              {qQs.map((q,i)=>(
                <div key={i} style={{ background:"#000", padding:12, borderRadius:8, border:"1px solid #ff444420", marginBottom:8 }}>
                  <div style={{ fontSize:10, color:"#ff4444", marginBottom:6 }}>Q{i+1}</div>
                  {["q","o1","o2","o3","o4"].map(f=>(
                    <input key={f} value={q[f]} onChange={e=>chQ(i,f,e.target.value)}
                      placeholder={f==="q"?"Question...":"Option "+(f==="o1"?1:f==="o2"?2:f==="o3"?3:4)}
                      style={iSt()}/>
                  ))}
                  <select value={q.ans} onChange={e=>chQ(i,"ans",e.target.value)}
                    style={{ width:"100%", background:"#0a0a0a", border:"1px solid #ff444420", borderRadius:6, padding:9, color:"#fff", fontFamily:"'Share Tech Mono',monospace", outline:"none" }}>
                    {[0,1,2,3].map(n=><option key={n} value={n}>Correct: Option {n+1}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:4 }}>
                <button onClick={()=>setQQs([...qQs,{q:"",o1:"",o2:"",o3:"",o4:"",ans:0}])}
                  style={{ flex:1, padding:10, background:"transparent", border:"1px dashed #ff444440", color:"#ff4444", borderRadius:8, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>
                  + ADD Q
                </button>
                <button onClick={addOwnerQuiz}
                  style={{ flex:2, padding:10, background:"#ff000030", border:"1px solid #ff4444", color:"#ff4444", borderRadius:8, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", fontWeight:"bold" }}>
                  SAVE AS OWNER
                </button>
              </div>
            </div>

            <div style={{ fontSize:11, color:"#ff4444", letterSpacing:3, marginBottom:10 }}>EXISTING ({dbQuizzes.length})</div>
            {dbQuizzes.map(qz=>(
              <div key={qz.id} style={{ background:"#0a0a0a", border:"1px solid #ff444418", borderRadius:8, padding:14, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ color:"#fff", fontSize:13, fontWeight:"bold" }}>{qz.title}</div>
                  <div style={{ fontSize:10, color:"rgba(255,68,68,0.4)", marginTop:3 }}>By: {qz.addedBy} | {qz.questions?.length||0} qs</div>
                </div>
                <button onClick={()=>delQuiz(qz.id)} style={{ padding:"6px 12px", background:"#ff000020", border:"1px solid #ff4444", color:"#ff4444", borderRadius:6, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:11 }}>DEL</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position:"fixed", bottom:20, right:20, background:"#0a0a0a", border:"1px solid #ff4444", borderRadius:10, padding:"11px 20px", color:"#ff4444", fontSize:12, fontWeight:"bold", zIndex:9999, fontFamily:"'Share Tech Mono',monospace", boxShadow:"0 4px 20px #ff000040" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// -- Admin Chat with real-time + delete -----------------------------
function AdminChat({ db, showToast }) {
  const [msgs, setMsgs] = useState([]);

  useEffect(()=>{
    const unsub = onSnapshot(
      query(collection(db, CHAT_COL), orderBy("ts","desc")),
      snap => setMsgs(snap.docs.map(d=>({id:d.id,...d.data()})).slice(0,200))
    );
    return ()=>unsub();
  },[]);

  async function del(id) {
    try { await deleteDoc(doc(db, CHAT_COL, id)); showToast("Deleted!"); }
    catch(e){ showToast("Error: "+e.message); }
  }

  return (
    <div>
      <div style={{ fontSize:11, color:"#ff4444", letterSpacing:3, marginBottom:12 }}>ALL MESSAGES ({msgs.length})</div>
      {msgs.length===0 && <div style={{ color:"rgba(255,68,68,0.28)", textAlign:"center", padding:24, fontSize:12 }}>No messages.</div>}
      {msgs.map(m=>(
        <div key={m.id} style={{ background:"#0a0a0a", border:"1px solid #ff444418", borderRadius:8, padding:12, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, marginBottom:2 }}>
              <span style={{ color:"#ff4444" }}>{m.user}</span>
              <span style={{ color:"rgba(255,68,68,0.38)", fontSize:9, marginLeft:8 }}>{m.teamName} - {m.time}</span>
            </div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", wordBreak:"break-word" }}>{m.text}</div>
          </div>
          <button onClick={()=>del(m.id)}
            style={{ padding:"5px 10px", background:"#ff000020", border:"1px solid #ff4444", color:"#ff4444", borderRadius:6, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:10, flexShrink:0 }}>
            DEL
          </button>
        </div>
      ))}
    </div>
  );
}
