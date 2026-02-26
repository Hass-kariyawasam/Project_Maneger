// src/components/Logo.jsx - TeamFlow Logo Component

export default function TFLogo({ size = "md", color = "#00ff88", showSub = true }) {
  const sc = color;
  const S = {
    sm: { icon:28, lines:[18,12,8],  chevH:18, chevW:9,  sepH:24, sepM:"0 10px", font:13, sub:6,   gap:4 },
    md: { icon:40, lines:[28,20,13], chevH:26, chevW:12, sepH:34, sepM:"0 14px", font:18, sub:7.5, gap:5 },
    lg: { icon:56, lines:[38,28,18], chevH:36, chevW:16, sepH:46, sepM:"0 18px", font:26, sub:9,   gap:7 },
  }[size];

  return (
    <div style={{ display:"inline-flex", alignItems:"center" }}>
      {/* Icon - flow lines + chevron */}
      <div style={{ position:"relative", width:S.icon, height:S.icon, flexShrink:0 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:S.gap, paddingTop:Math.floor(S.icon*0.12) }}>
          {S.lines.map((w, i) => (
            <div key={i} style={{
              height: 2.5, width: w,
              marginLeft: i * Math.floor(S.icon * 0.12),
              background: sc, borderRadius: 2,
              opacity: i === 0 ? 1 : i === 1 ? 0.65 : 0.35,
              boxShadow: i === 0 ? `0 0 6px ${sc}` : "none",
            }}/>
          ))}
        </div>
        <svg style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", width:S.chevW, height:S.chevH }}
          viewBox="0 0 14 30" fill="none">
          <polyline points="2,2 12,15 2,28" stroke={sc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Separator */}
      <div style={{ width:1, height:S.sepH, background:`${sc}25`, margin:S.sepM, flexShrink:0 }}/>

      {/* Wordmark */}
      <div>
        <div style={{
          fontFamily:"'Orbitron',monospace", fontSize:S.font, fontWeight:900,
          letterSpacing:2, lineHeight:1,
          background:`linear-gradient(90deg,${sc},#00ddff)`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          backgroundClip:"text", filter:`drop-shadow(0 0 6px ${sc}88)`,
        }}>
          TEAM<span style={{ WebkitTextFillColor:sc, opacity:0.4, fontWeight:400 }}>FLOW</span>
        </div>
        {showSub && (
          <div style={{ fontSize:S.sub, letterSpacing:3, color:`${sc}50`, marginTop:3, fontFamily:"'Share Tech Mono',monospace" }}>
            by HassKariyawasam
          </div>
        )}
      </div>
    </div>
  );
}
