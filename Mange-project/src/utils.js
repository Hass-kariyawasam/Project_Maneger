// src/utils.js - TeamFlow Utilities

export const hex2rgb = (c) => {
  let v = c.replace("#","");
  if (v.length === 3) v = v.split("").map(x => x+x).join("");
  return `${parseInt(v.slice(0,2),16)},${parseInt(v.slice(2,4),16)},${parseInt(v.slice(4,6),16)}`;
};

export const genCode = () => Math.random().toString(36).slice(2,8).toUpperCase();

export const fmtDate = (ts) => {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleString([], { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
};

export const urgentStatus = (dueDate, sc, scr) => {
  if (!dueDate) return { color:"#ff4444", text:"Urgent", glow:"0 0 15px #ff444466" };
  const d = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  if (d > 5)  return { color: sc,       text:`${d} days left`,  glow:`0 0 10px rgba(${scr},0.4)` };
  if (d >= 2) return { color:"#ffaa00", text:`${d} days left`,  glow:"0 0 15px #ffaa0066" };
  if (d >= 0) return { color:"#ff4444", text:`${d} days left!`, glow:"0 0 20px #ff444499" };
  return            { color:"#ff0044", text:"OVERDUE!",         glow:"0 0 25px #ff0044aa" };
};

export const makeCSS = () => `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
* { box-sizing: border-box; }
body { margin: 0; background: #030503; }
.g-input::placeholder { color: rgba(255,255,255,0.3) !important; }
.g-input:focus { border-color: var(--sc) !important; box-shadow: 0 0 12px rgba(var(--scr),0.3) !important; outline: none; }
.neon-btn { background: rgba(var(--scr),0.13) !important; border: 1px solid var(--sc) !important; color: var(--sc) !important; box-shadow: 0 0 10px rgba(var(--scr),0.2) !important; }
.neon-btn:hover { background: rgba(var(--scr),0.25) !important; box-shadow: 0 0 22px var(--sc) !important; }
select option { background: #0a0f0a; color: #fff; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #030503; }
::-webkit-scrollbar-thumb { background: rgba(var(--scr),0.3); border-radius: 4px; }
@keyframes glow-pulse { 0%,100% { text-shadow: 0 0 5px var(--sc); } 50% { text-shadow: 0 0 20px #fff, 0 0 30px var(--sc); } }
@keyframes glitch1 { 0%,100% { clip-path:inset(0 0 95% 0); transform:translate(-3px) } 50% { clip-path:inset(40% 0 40% 0); transform:translate(3px) } }
@keyframes glitch2 { 0%,100% { clip-path:inset(80% 0 5% 0); transform:translate(3px) } 50% { clip-path:inset(10% 0 70% 0); transform:translate(-3px) } }
@keyframes spin-ring  { 0% { transform: rotate(0deg); }   100% { transform: rotate(360deg); } }
@keyframes spin-ring2 { 0% { transform: rotate(0deg); }   100% { transform: rotate(-360deg); } }
@keyframes core-pulse { 0%,100% { box-shadow: 0 0 20px #00ff88, inset 0 0 15px #00ff8833; } 50% { box-shadow: 0 0 50px #00ff88, inset 0 0 25px #00ff8855; } }
@keyframes scan-line  { 0% { top: 0%; opacity: 0.7; } 100% { top: 100%; opacity: 0; } }
@keyframes matrix-fade { 0% { opacity:0; transform:translateY(-10px); } 100% { opacity:1; transform:translateY(0); } }
@keyframes flicker { 0%,95%,100% { opacity:1; } 96%,99% { opacity:0.4; } }
@keyframes toast-in { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
@keyframes line-flow { 0% { opacity:0.35; } 50% { opacity:1; } 100% { opacity:0.35; } }
.glow-anim  { animation: glow-pulse 3s ease-in-out infinite; }
.glitch     { position: relative; }
.glitch::before { content: attr(data-text); position:absolute; left:0; top:0; color:#ff00cc; animation: glitch1 2s infinite steps(1); }
.glitch::after  { content: attr(data-text); position:absolute; left:0; top:0; color:#00ccff; animation: glitch2 2s infinite steps(1) reverse; }
.line-anim-1 { animation: line-flow 2s ease-in-out 0.0s infinite; }
.line-anim-2 { animation: line-flow 2s ease-in-out 0.4s infinite; }
.line-anim-3 { animation: line-flow 2s ease-in-out 0.8s infinite; }
`;
