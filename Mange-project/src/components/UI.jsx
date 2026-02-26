// src/components/UI.jsx - Shared UI Components

export function GInput({ value, onChange, placeholder, type="text", onKeyDown, disabled=false, style={} }) {
  return (
    <input
      type={type} value={value} onChange={onChange}
      onKeyDown={onKeyDown} placeholder={placeholder}
      disabled={disabled} className="g-input"
      style={{
        width:"100%", background: disabled ? "#111" : "#0a0f0a",
        borderRadius:8, padding:"13px 15px", fontSize:14,
        fontFamily:"'Share Tech Mono',monospace", outline:"none",
        transition:"all 0.3s", opacity: disabled ? 0.6 : 1,
        color:"#ffffff", caretColor:"var(--sc)",
        border:"1px solid rgba(var(--scr),0.3)",
        ...style,
      }}
    />
  );
}

export function Btn({ onClick, children, style={}, color=null, disabled=false }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className={color ? "" : "neon-btn"}
      style={{
        borderRadius:8, padding:"13px 0", width:"100%",
        fontSize:14, fontWeight:"bold", letterSpacing:2,
        fontFamily:"'Share Tech Mono',monospace",
        cursor: disabled ? "not-allowed" : "pointer",
        transition:"all 0.3s", opacity: disabled ? 0.5 : 1,
        ...(color ? { background:`${color}22`, border:`1px solid ${color}`, color } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children, style={} }) {
  return (
    <div style={{
      background:"#0a0f0a",
      border:"1px solid rgba(var(--scr),0.2)",
      borderRadius:12, padding:16,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionLabel({ children, color="var(--sc)" }) {
  return (
    <div style={{
      fontSize:11, color, letterSpacing:3,
      fontWeight:"bold", marginBottom:14,
    }}>
      {children}
    </div>
  );
}
