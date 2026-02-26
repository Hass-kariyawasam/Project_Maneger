// src/components/LoadingScreen.jsx
import TFLogo from "./Logo.jsx";

export default function LoadingScreen() {
  return (
    <div style={{
      background:"#000", minHeight:"100vh",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Share Tech Mono',monospace",
      position:"relative", overflow:"hidden",
      "--sc":"#00ff88", "--scr":"0,255,136",
    }}>
      {/* Grid bg */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"linear-gradient(rgba(0,255,136,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.04) 1px,transparent 1px)",
        backgroundSize:"40px 40px", pointerEvents:"none",
      }}/>
      {/* Scan line */}
      <div style={{
        position:"absolute", left:0, right:0, height:2,
        background:"linear-gradient(90deg,transparent,#00ff88,transparent)",
        animation:"scan-line 2.5s linear infinite", pointerEvents:"none",
      }}/>

      <div style={{ textAlign:"center", position:"relative", zIndex:10 }}>
        {/* Multi-ring spinner */}
        <div style={{ position:"relative", width:150, height:150, margin:"0 auto 40px" }}>
          {/* Outer ring CW */}
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid transparent", borderTop:"2px solid #00ff88", borderRight:"2px solid #00ff8844", animation:"spin-ring 2.5s linear infinite" }}/>
          {/* Mid ring CCW */}
          <div style={{ position:"absolute", inset:18, borderRadius:"50%", border:"2px solid transparent", borderTop:"2px solid #00ccff", borderLeft:"2px solid #00ccff44", animation:"spin-ring2 1.8s linear infinite" }}/>
          {/* Slow inner ring */}
          <div style={{ position:"absolute", inset:36, borderRadius:"50%", border:"1px solid #00ff8822", animation:"spin-ring 6s linear infinite" }}/>
          {/* Core */}
          <div style={{
            position:"absolute", inset:48, borderRadius:"50%",
            background:"radial-gradient(circle,#0d2d1a,#030503)",
            border:"2px solid #00ff88",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation:"core-pulse 2s ease-in-out infinite",
          }}>
            {/* Mini logo lines in core */}
            <div style={{ position:"relative", width:38, height:38 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:4, paddingTop:5 }}>
                <div className="line-anim-1" style={{ height:2, width:22, background:"#00ff88", borderRadius:2 }}/>
                <div className="line-anim-2" style={{ height:2, width:15, marginLeft:4, background:"#00ff88", borderRadius:2 }}/>
                <div className="line-anim-3" style={{ height:2, width:9, marginLeft:8, background:"#00ff88", borderRadius:2 }}/>
              </div>
              <svg style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", width:10, height:22 }} viewBox="0 0 10 22" fill="none">
                <polyline points="1,1 9,11 1,21" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div style={{ marginBottom:8 }}>
          <TFLogo size="lg" color="#00ff88" showSub={false}/>
        </div>

        {/* Glitch subtitle */}
        <div className="glitch" data-text=" INITIALIZING..." style={{ fontSize:11, letterSpacing:4, color:"#00ff8877", margin:"14px 0 24px", animation:"matrix-fade 0.6s ease both" }}>
          INITIALIZING...
        </div>

        {/* Progress bar */}
        <div style={{ width:300, height:2, background:"#0a1a0a", borderRadius:4, margin:"0 auto 14px", overflow:"hidden", border:"1px solid #00ff8820" }}>
          <div style={{ height:"100%", background:"linear-gradient(90deg,#00ff88,#00ccff,#00ff88)", backgroundSize:"200% 100%", animation:"scan-line 1.2s linear infinite", boxShadow:"0 0 10px #00ff88" }}/>
        </div>

        {/* Status lines */}
        <div style={{ fontSize:10, color:"#00ff8855", letterSpacing:2, lineHeight:2.2 }}>
          <div style={{ animation:"matrix-fade 0.4s ease 0.2s both" }}>CONNECTING TO FIREBASE...</div>
          <div style={{ animation:"matrix-fade 0.4s ease 0.6s both", color:"#00ccff55" }}>LOADING USER SESSION...</div>
          <div style={{ animation:"matrix-fade 0.4s ease 1.0s both" }}>by HassKariyawasam</div>
        </div>
        <div style={{ fontSize:9, color:"#00ff8820", marginTop:16, letterSpacing:2 }}>
          All rights reserved TeamFlow
        </div>
      </div>
    </div>
  );
}
