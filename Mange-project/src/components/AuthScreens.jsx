// src/components/AuthScreens.jsx - v4
import TFLogo from "./Logo.jsx";
import { GInput, Btn } from "./UI.jsx";

const authWrap = {
  background:"#030503", minHeight:"100vh",
  display:"flex", flexDirection:"column",
  alignItems:"center", justifyContent:"flex-start",
  fontFamily:"'Share Tech Mono',monospace",
  padding:"30px 16px 80px",
  "--sc":"#00ff88", "--scr":"0,255,136",
  backgroundImage:"linear-gradient(rgba(0,255,136,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.03) 1px,transparent 1px)",
  backgroundSize:"60px 60px",
};
const card = {
  width:"100%", maxWidth:480, background:"#0a0f0a",
  border:"1px solid rgba(0,255,136,0.22)", borderRadius:16,
  padding:24, boxShadow:"0 10px 40px rgba(0,255,136,0.07)",
};
function FL({ children, color="rgba(0,255,136,0.55)" }) {
  return <div style={{ fontSize:9, color, marginBottom:5, letterSpacing:1.5 }}>{children}</div>;
}
function Err({ msg }) {
  return <div style={{ color:"#ff4444", fontSize:12, padding:"9px 13px", background:"#ff000020", border:"1px solid #ff444444", borderRadius:8 }}>{msg}</div>;
}
function Footer() {
  return <div style={{ marginTop:22, fontSize:9, color:"rgba(0,255,136,0.15)", letterSpacing:2, textAlign:"center" }}>All rights reserved TeamFlow | by HassKariyawasam</div>;
}

// MEMBER / LEADER toggle
function RoleToggle({ isLeader, setIsLeader }) {
  return (
    <div>
      <FL>I AM A *</FL>
      <div style={{ display:"flex", borderRadius:9, overflow:"hidden", border:"1px solid rgba(0,255,136,0.2)" }}>
        <button onClick={()=>setIsLeader(false)} style={{
          flex:1, padding:"12px 8px", border:"none", cursor:"pointer",
          fontFamily:"'Share Tech Mono',monospace",
          borderRight:"1px solid rgba(0,255,136,0.15)",
          background: !isLeader ? "rgba(0,204,255,0.15)" : "transparent",
          color: !isLeader ? "#00ccff" : "rgba(0,255,136,0.3)",
          transition:"all 0.18s",
        }}>
          <div style={{ fontSize:13, fontWeight:"bold", letterSpacing:1 }}>MEMBER</div>
          <div style={{ fontSize:9, marginTop:3, opacity:0.6 }}>Join a team</div>
        </button>
        <button onClick={()=>setIsLeader(true)} style={{
          flex:1, padding:"12px 8px", border:"none", cursor:"pointer",
          fontFamily:"'Share Tech Mono',monospace",
          background: isLeader ? "rgba(0,255,136,0.13)" : "transparent",
          color: isLeader ? "#00ff88" : "rgba(0,255,136,0.3)",
          transition:"all 0.18s",
        }}>
          <div style={{ fontSize:13, fontWeight:"bold", letterSpacing:1 }}>LEADER</div>
          <div style={{ fontSize:9, marginTop:3, opacity:0.6 }}>Create a team</div>
        </button>
      </div>
    </div>
  );
}

// Leader: project select + team name
function LeaderFields({ projects, selectedProjId, setSelectedProjId, regTeam, setRegTeam }) {
  const proj = projects.find(p => p.id === selectedProjId);
  return (
    <div style={{ background:"#001a00", border:"1px solid #00ff8825", borderRadius:10, padding:14, display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ fontSize:9, color:"#00ff88", letterSpacing:2, fontWeight:"bold" }}>TEAM LEADER SETUP</div>
      <div>
        <FL color="#00ff8888">SELECT PROJECT *</FL>
        <select value={selectedProjId||""} onChange={e=>setSelectedProjId(e.target.value)}
          style={{ width:"100%", background:"#0a0f0a", border:"1px solid #00ff8840", borderRadius:8, padding:"12px 13px", color:"#fff", fontFamily:"'Share Tech Mono',monospace", fontSize:13, outline:"none" }}>
          <option value="">-- Choose project --</option>
          {projects.map(p=><option key={p.id} value={p.id}>{p.shortName} - {p.longName}</option>)}
        </select>
        {!projects.length && <div style={{ fontSize:9, color:"#ff4444", marginTop:4 }}>No projects yet. Contact admin.</div>}
        {proj && <div style={{ fontSize:9, color:"#00ff8850", marginTop:3 }}>{proj.longName}</div>}
      </div>
      <div>
        <FL color="#00ff8888">YOUR TEAM NAME *</FL>
        <GInput value={regTeam} onChange={e=>setRegTeam(e.target.value)} placeholder="e.g. Team Alpha"/>
      </div>
      <div style={{ fontSize:9, color:"#00ff8855", lineHeight:1.7, padding:"7px 10px", background:"#00ff8808", borderRadius:7, border:"1px solid #00ff8818" }}>
        After registering, go to TEAM tab to get your invite code and link to share with members.
      </div>
    </div>
  );
}

// Member: project select + join code (team name comes automatically from leader)
function MemberFields({ joinCode, setJoinCode }) {
  return (
    <div style={{ background:"#0d0d00", border:"1px solid #ffaa0025", borderRadius:10, padding:14, display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ fontSize:9, color:"#ffaa00", letterSpacing:2, fontWeight:"bold" }}>JOIN A TEAM</div>
      <div>
        <FL color="#ffaa0088">JOIN CODE * (get from your leader)</FL>
        <GInput value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. ABC123"/>
        {joinCode && <div style={{ fontSize:9, color:"#00ff8877", marginTop:3 }}>Code entered! Project and team name will be set automatically.</div>}
      </div>
      <div style={{ fontSize:9, color:"#ffaa0055", lineHeight:1.7, padding:"7px 10px", background:"#ffaa0008", borderRadius:7, border:"1px solid #ffaa0018" }}>
        Just enter the code or use the invite link from your leader. Everything else is automatic.
      </div>
    </div>
  );
}

//  GOOGLE ONBOARD 
export function GoogleOnboardScreen({
  regUser, setRegUser, regPhone, setRegPhone,
  regEmail, regTg, setRegTg, regPhoto,
  joinCode, setJoinCode,
  regTeam, setRegTeam,
  regIsLeader, setRegIsLeader,
  projects, selectedProjId, setSelectedProjId,
  formErr, formLoad, doRegister, doCancel,
}) {
  return (
    <div style={authWrap}>
      <div style={{ marginBottom:24, marginTop:10 }}><TFLogo size="md" color="#00ff88"/></div>
      <div style={card}>
        <div style={{ textAlign:"center", marginBottom:18 }}>
          {regPhoto
            ? <img src={regPhoto} alt="p" style={{ width:58, height:58, borderRadius:29, border:"2px solid #00ff88", marginBottom:8 }}/>
            : <div style={{ width:46, height:46, borderRadius:23, background:"#00ff8818", border:"2px solid #00ff88", display:"flex", alignItems:"center", justifyContent:"center", color:"#00ff88", fontSize:18, margin:"0 auto 8px" }}>?</div>}
          <div style={{ fontSize:15, color:"#00ff88", letterSpacing:1 }}>COMPLETE SETUP</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><FL>USERNAME</FL><GInput value={regUser} onChange={e=>setRegUser(e.target.value)} placeholder="Name..."/></div>
            <div style={{ flex:1 }}><FL>PHONE *</FL><GInput value={regPhone} onChange={e=>setRegPhone(e.target.value)} placeholder="07X..."/></div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><FL>EMAIL</FL><GInput type="email" value={regEmail} disabled/></div>
            <div style={{ flex:1 }}><FL>TELEGRAM *</FL><GInput value={regTg} onChange={e=>setRegTg(e.target.value)} placeholder="TG/..."/></div>
          </div>
          <RoleToggle isLeader={regIsLeader} setIsLeader={setRegIsLeader}/>
          {regIsLeader
            ? <LeaderFields projects={projects} selectedProjId={selectedProjId} setSelectedProjId={setSelectedProjId} regTeam={regTeam} setRegTeam={setRegTeam}/>
            : <MemberFields joinCode={joinCode} setJoinCode={setJoinCode}/>
          }
          {formErr && <Err msg={formErr}/>}
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>doRegister(true)} style={{ flex:2 }}>{formLoad?"SAVING...":"COMPLETE"}</Btn>
            <button onClick={doCancel} style={{ flex:1, background:"transparent", border:"1px solid #ff444433", color:"#ff4444", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>CANCEL</button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

//  MAIN AUTH 
export function AuthScreen({
  authTab, setAuthTab,
  loginId, setLoginId, loginPass, setLoginPass,
  regUser, setRegUser, regPass, setRegPass,
  regEmail, setRegEmail, regTg, setRegTg, regPhone, setRegPhone,
  regTeam, setRegTeam,
  regIsLeader, setRegIsLeader,
  joinCode, setJoinCode,
  projects, selectedProjId, setSelectedProjId,
  formErr, formLoad,
  doLogin, doRegister, doGoogleLogin,
}) {
  return (
    <div style={authWrap}>
      <div style={{ marginBottom:20, marginTop:10 }}><TFLogo size="md" color="#00ff88"/></div>
      <div style={{ width:"100%", maxWidth:480 }}>
        <div style={card}>
          <div style={{ display:"flex", background:"#000", borderRadius:10, padding:4, marginBottom:18, border:"1px solid rgba(0,255,136,0.12)" }}>
            {["login","register"].map(s=>(
              <button key={s} onClick={()=>setAuthTab(s)}
                style={{ flex:1, padding:"10px 0", background:authTab===s?"rgba(0,255,136,0.12)":"transparent", border:"none", color:authTab===s?"#00ff88":"rgba(0,255,136,0.38)", fontSize:12, fontWeight:"bold", letterSpacing:2, borderRadius:6, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
                {s==="login" ? "[ LOGIN ]" : "[ REGISTER ]"}
              </button>
            ))}
          </div>
          <button onClick={doGoogleLogin}
            style={{ width:"100%", padding:12, background:"#fff", color:"#000", border:"none", borderRadius:8, fontSize:13, fontWeight:"bold", display:"flex", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", marginBottom:14 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width:18 }}/>
            Continue with Google
          </button>
          <div style={{ textAlign:"center", marginBottom:14, color:"rgba(0,255,136,0.2)", fontSize:10 }}>-- OR WITH EMAIL --</div>

          {authTab==="login" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div><FL>USERNAME OR EMAIL</FL><GInput value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="username or email..."/></div>
              <div><FL>PASSWORD</FL><GInput type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")doLogin();}} placeholder="password..."/></div>
              {formErr && <Err msg={formErr}/>}
              <Btn onClick={doLogin}>{formLoad?"CONNECTING...":"ENTER SYSTEM"}</Btn>
              <div style={{ textAlign:"center", fontSize:9, color:"rgba(0,255,136,0.18)", marginTop:4 }}>admin / admin1234</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}><FL>USERNAME</FL><GInput value={regUser} onChange={e=>setRegUser(e.target.value)} placeholder="Name..."/></div>
                <div style={{ flex:1 }}><FL>PASSWORD</FL><GInput type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="4+ chars..."/></div>
              </div>
              <div><FL>PHONE *</FL><GInput value={regPhone} onChange={e=>setRegPhone(e.target.value)} placeholder="07X..."/></div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}><FL>EMAIL</FL><GInput type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="Email..."/></div>
                <div style={{ flex:1 }}><FL>TELEGRAM *</FL><GInput value={regTg} onChange={e=>setRegTg(e.target.value)} placeholder="TG/..."/></div>
              </div>
              <RoleToggle isLeader={regIsLeader} setIsLeader={setRegIsLeader}/>
              {regIsLeader
                ? <LeaderFields projects={projects} selectedProjId={selectedProjId} setSelectedProjId={setSelectedProjId} regTeam={regTeam} setRegTeam={setRegTeam}/>
                : <MemberFields joinCode={joinCode} setJoinCode={setJoinCode}/>
              }
              {formErr && <Err msg={formErr}/>}
              <Btn onClick={()=>doRegister(false)}>{formLoad?"CREATING...":"CREATE ACCOUNT"}</Btn>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}
