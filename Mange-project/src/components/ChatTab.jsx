// src/components/ChatTab.jsx
import { useRef, useEffect, useState } from "react";

export default function ChatTab({ messages, profile, sc, scr, activeProject, sendMsg, deleteMsg }) {
  const [chatMsg, setChatMsg] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const el = document.getElementById("chat-messages");
    if (el) el.scrollTop = el.scrollHeight;
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!chatMsg.trim()) return;
    sendMsg(chatMsg.trim());
    setChatMsg("");
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 130px)" }}>
      {/* Chat header */}
      <div style={{ padding:"10px 14px", background:"#000", borderBottom:`1px solid rgba(${scr},0.2)`, textAlign:"center", flexShrink:0 }}>
        <div style={{ fontSize:12, color:sc, letterSpacing:3, fontFamily:"'Orbitron',monospace", fontWeight:"bold" }}>PROJECT CHAT</div>
        <div style={{ fontSize:9, color:`rgba(${scr},0.5)`, marginTop:2 }}>
          {activeProject?.shortName} - {profile.teamName}
        </div>
      </div>

      {/* Messages */}
      <div id="chat-messages" style={{ flex:1, overflowY:"scroll", overflowX:"hidden", padding:13, display:"flex", flexDirection:"column", gap:9 }}>
        {messages.length === 0 && (
          <div style={{ textAlign:"center", color:`rgba(${scr},0.13)`, padding:36, fontSize:12 }}>NO MESSAGES YET</div>
        )}
        {messages.map(msg => {
          const me      = msg.user === profile.username;
          const canDel  = profile.isLeader || msg.user === profile.username;
          return (
            <div key={msg.id} style={{ display:"flex", flexDirection:me?"row-reverse":"row", gap:8, alignItems:"flex-end" }}>
              {/* Avatar */}
              {msg.photoURL
                ? <img src={msg.photoURL} alt="p" style={{ width:28, height:28, borderRadius:7, border:`2px solid ${msg.color||sc}55`, flexShrink:0 }}/>
                : <div style={{ width:28, height:28, borderRadius:7, flexShrink:0, background:(msg.color||sc)+"22", border:`2px solid ${msg.color||sc}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:msg.color||sc }}>
                    {(msg.user||"?")[0].toUpperCase()}
                  </div>}

              <div style={{ maxWidth:"73%" }}>
                {!me && <div style={{ fontSize:9, color:msg.color||sc, marginBottom:3 }}>{msg.user} <span style={{ color:`rgba(${scr},0.33)` }}>- {msg.teamName}</span></div>}
                <div style={{ background:me?`rgba(${scr},0.13)`:"#0a0f0a", border:`1px solid ${me?`rgba(${scr},0.4)`:`rgba(${scr},0.13)`}`, borderRadius:me?"12px 4px 12px 12px":"4px 12px 12px 12px", padding:"8px 12px", fontSize:13, color:me?sc:"#ccffcc", lineHeight:1.6, wordBreak:"break-word" }}>
                  {msg.text}
                </div>
                <div style={{ fontSize:9, color:`rgba(${scr},0.3)`, marginTop:3, display:"flex", gap:8, justifyContent:me?"flex-end":"flex-start", alignItems:"center" }}>
                  <span>{msg.time}</span>
                  {canDel && <button onClick={() => deleteMsg(msg.id)} style={{ background:"transparent", border:"none", color:"#ff444455", fontSize:9, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", padding:0 }}>del</button>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:"11px 13px", background:"#0a0f0a", borderTop:`1px solid rgba(${scr},0.2)`, display:"flex", gap:9, flexShrink:0 }}>
        <input type="text" value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message... (Enter to send)"
          style={{ flex:1, background:"#000", border:`1px solid rgba(${scr},0.27)`, borderRadius:8, padding:"12px 14px", color:"#fff", fontSize:13, fontFamily:"'Share Tech Mono',monospace", outline:"none" }}/>
        <button className="neon-btn" onClick={handleSend} style={{ padding:"10px 20px", background:`rgba(${scr},0.13)`, border:`1px solid ${sc}`, borderRadius:8, color:sc, fontSize:13, fontWeight:"bold", fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
          SEND
        </button>
      </div>
    </div>
  );
}
