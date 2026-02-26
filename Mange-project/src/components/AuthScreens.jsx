// src/components/AuthScreens.jsx - v3
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
  return <div style={{ fontSize:9, color, marginBottom:5, letterSpacing:1.5, fontFamily:"'Share Tech Mono',monospace" }}>{children}</div>;
}
function Err({ msg }) {
  return <div style={{ color:"#ff4444", fontSize:12, padding:"9px 13px", background:"#ff000020", border:"1px solid #ff444444", borderRadius:8 }}>{msg}</div>;
}
function Footer() {
  return <div style={{ marginTop:22, fontSize:9, color:"rgba(0,255,136,0.15)", letterSpacing:2, textAlign:"center" }}>All rights reserved TeamFlow | by HassKariyawasam</div>;
}

// Shared project+team+code join block
function JoinBlock({ projects, selectedProjId, setSelectedProjId, regTeam, setRegTeam, joinCode, setJoinCode }) {
  const proj = projects.find(p => p.id === selectedProjId);
  return (
    <div style={{ background:"#0d0d00", border:"1px solid #ffaa0033", borderRadius:10, padding:14, display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ fontSize:10, color:"#ffaa00", letterSpacing:2, fontWeight:"bold" }}>PROJECT + TEAM</div>

      <div>
        <FL color="#ffaa0099">SELECT PROJECT *</FL>
        <select
          value={selectedProjId||""}
          onChange={e=>setSelectedProjId(e.target.value)}
          style={{ width:"100%", background:"#0a0f0a", border:"1px solid #ffaa0044", borderRadius:8, padding:"12px 14px", color:"#fff", fontFamily:"'Share Tech Mono',monospace", fontSize:13, outline:"none" }}
        >
          <option value="">-- Choose a project --</option>
          {projects.map(p=>(
            <option key={p.id} value={p.id}>{p.shortName} - {p.longName}</option>
          ))}
        </select>
        {projects.length===0 && <div style={{ fontSize:9, color:"#ff4444", marginTop:4 }}>No projects yet. Contact admin to create one.</div>}
        {proj && <div style={{ fontSize:9, color:"#ffaa0066", marginTop:4 }}>Joining: {proj.longName}</div>}
      </div>

      <div>
        <FL color="#ffaa0099">YOUR TEAM NAME *</FL>
        <GInput value={regTeam} onChange={e=>setRegTeam(e.target.value)} placeholder="e.g. Team Alpha..."/>
      </div>

      <div>
        <FL color="#ffaa0099">JOIN CODE * (from your leader)</FL>
        <GInput value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. ABC123 or NEWLEADER"/>
        {joinCode && joinCode!=="NEWLEADER" && <div style={{ fontSize:9, color:"#00ff8877", marginTop:4 }}>Code filled from invite link!</div>}
        {joinCode==="NEWLEADER" && <div style={{ fontSize:9, color:"#00ff88", marginTop:4, fontWeight:"bold" }}>Leader mode: You will create a new team!</div>}
        <div style={{ fontSize:9, color:"#ffaa0055", marginTop:4 }}>Use NEWLEADER to register as team leader</div>
      </div>
    </div>
  );
}

// Google onboard
export function GoogleOnboardScreen({
  regUser, setRegUser, regPhone, setRegPhone,
  regEmail, regTg, setRegTg, regPhoto,
  joinCode, setJoinCode,
  regTeam, setRegTeam,
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
            : <div style={{ width:48, height:48, borderRadius:24, background:"#00ff8822", border:"2px solid #00ff88", display:"flex", alignItems:"center", justifyContent:"center", color:"#00ff88", fontSize:18, margin:"0 auto 8px" }}>?</div>}
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
          <JoinBlock projects={projects} selectedProjId={selectedProjId} setSelectedProjId={setSelectedProjId}
            regTeam={regTeam} setRegTeam={setRegTeam} joinCode={joinCode} setJoinCode={setJoinCode}/>
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

// Main Login / Register
export function AuthScreen({
  authTab, setAuthTab,
  loginId, setLoginId, loginPass, setLoginPass,
  regUser, setRegUser, regPass, setRegPass,
  regEmail, setRegEmail, regTg, setRegTg, regPhone, setRegPhone,
  regTeam, setRegTeam,
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
          {/* Tabs */}
          <div style={{ display:"flex", background:"#000", borderRadius:10, padding:4, marginBottom:18, border:"1px solid rgba(0,255,136,0.12)" }}>
            {["login","register"].map(s=>(
              <button key={s} onClick={()=>setAuthTab(s)}
                style={{ flex:1, padding:"10px 0", background:authTab===s?"rgba(0,255,136,0.12)":"transparent", border:"none", color:authTab===s?"#00ff88":"rgba(0,255,136,0.38)", fontSize:12, fontWeight:"bold", letterSpacing:2, borderRadius:6, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
                {s==="login"?"[ LOGIN ]":"[ REGISTER ]"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={doGoogleLogin}
            style={{ width:"100%", padding:12, background:"#fff", color:"#000", border:"none", borderRadius:8, fontSize:13, fontWeight:"bold", display:"flex", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", marginBottom:14 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width:18 }}/>
            Continue with Google
          </button>
          <div style={{ textAlign:"center", marginBottom:14, color:"rgba(0,255,136,0.22)", fontSize:10, letterSpacing:1 }}>-- OR WITH EMAIL --</div>

          {authTab==="login" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div><FL>USERNAME OR EMAIL</FL><GInput value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="username or email..."/></div>
              <div><FL>PASSWORD</FL><GInput type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")doLogin();}} placeholder="password..."/></div>
              {formErr && <Err msg={formErr}/>}
              <Btn onClick={doLogin}>{formLoad?"CONNECTING...":"ENTER SYSTEM"}</Btn>
              <div style={{ textAlign:"center", fontSize:9, color:"rgba(0,255,136,0.18)", marginTop:4 }}>admin / admin1234</div>
            </div>
          ):(
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
              <JoinBlock projects={projects} selectedProjId={selectedProjId} setSelectedProjId={setSelectedProjId}
                regTeam={regTeam} setRegTeam={setRegTeam} joinCode={joinCode} setJoinCode={setJoinCode}/>
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
