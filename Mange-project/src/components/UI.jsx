// ─── SHARED UI COMPONENTS ─────────────────────────────────────

export const GInput = ({
  value, onChange, placeholder, type = "text", onKeyDown, disabled = false,
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    disabled={disabled}
    className="themed-input"
    style={{
      width: "100%",
      background: disabled ? "#111" : "#0a0f0a",
      borderRadius: 8,
      padding: "14px 16px",
      fontSize: 15,
      fontFamily: "'Share Tech Mono', monospace",
      outline: "none",
      transition: "all 0.3s",
      opacity: disabled ? 0.6 : 1,
      color: "#ffffff",           // ← always white so text is visible
      caretColor: "var(--sys-color)",
    }}
  />
);

export const Btn = ({ onClick, children, style = {}, variant = "primary" }) => (
  <button
    className={variant === "primary" ? "neon-btn" : "neon-btn-outline"}
    onClick={onClick}
    style={{
      borderRadius: 8,
      padding: "14px 0",
      width: "100%",
      fontSize: 16,
      fontWeight: "bold",
      letterSpacing: 2,
      fontFamily: "'Share Tech Mono', monospace",
      cursor: "pointer",
      transition: "all 0.3s",
      ...style,
    }}
  >
    {children}
  </button>
);
