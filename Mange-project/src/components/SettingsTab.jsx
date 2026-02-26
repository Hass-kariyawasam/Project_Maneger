// src/components/SettingsTab.jsx
import { useState, useEffect } from "react";
import { THEME_COLORS } from "../constants.js";
import { GInput, Btn } from "./UI.jsx";

export default function SettingsTab({ profile, sc, scr, doLogout, updateProfile, updateTheme, formLoad }) {
  const [editData, setEditData] = useState({ phone:"", tgNumber:"", newPassword:"" });

  useEffect(() => {
    if (profile) setEditData({ phone:profile.phone||"", tgNumber:profile.tgNumber||"", newPassword:"" });
  }, [profile]);

  return (
    <div style={{ padding:"16px 14px" }}>
      <div style={{ fontSize:11, color:sc, letterSpacing:3, marginBottom:16, fontWeight:"bold" }}>SETTINGS</div>

      {/* Theme */}
      <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:12, padding:16, marginBottom:14 }}>
        <div style={{ fontSize:10, color:`rgba(${scr},0.6)`, letterSpacing:2, marginBottom:12 }}>THEME COLOR</div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {THEME_COLORS.map(c => (
            <div key={c} onClick={() => updateTheme(c)} style={{ width:36, height:36, borderRadius:18, background:c, cursor:"pointer", border:sc===c?"3px solid #fff":"2px solid transparent", boxShadow:sc===c?`0 0 14px ${c}`:`0 0 4px ${c}44`, transition:"all 0.2s" }}/>
          ))}
        </div>
      </div>

      {/* Profile */}
      <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:12, padding:16, marginBottom:14 }}>
        <div style={{ fontSize:10, color:`rgba(${scr},0.6)`, letterSpacing:2, marginBottom:12 }}>PROFILE</div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          {profile.photoURL
            ? <img src={profile.photoURL} alt="p" style={{ width:50, height:50, borderRadius:13, border:`2px solid ${sc}` }}/>
            : <div style={{ width:50, height:50, borderRadius:13, background:`rgba(${scr},0.2)`, border:`2px solid ${sc}`, display:"flex", alignItems:"center", justifyContent:"center", color:sc, fontSize:20, fontWeight:"bold" }}>{profile.username[0].toUpperCase()}</div>}
          <div>
            <div style={{ fontSize:14, color:profile.color, fontWeight:"bold" }}>{profile.username}</div>
            <div style={{ fontSize:10, color:`rgba(${scr},0.5)`, marginTop:2 }}>{profile.isLeader ? "Team Leader" : "Member"} - {profile.teamName}</div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div>
            <div style={{ fontSize:9, color:`rgba(${scr},0.6)`, marginBottom:3 }}>USERNAME (READ ONLY)</div>
            <GInput value={profile.username} disabled/>
          </div>
          <div>
            <div style={{ fontSize:9, color:`rgba(${scr},0.6)`, marginBottom:3 }}>EMAIL (READ ONLY)</div>
            <GInput value={profile.email} disabled/>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9, color:`rgba(${scr},0.6)`, marginBottom:3 }}>PHONE</div>
              <GInput value={editData.phone} onChange={e=>setEditData({...editData,phone:e.target.value})} placeholder="07X..."/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9, color:`rgba(${scr},0.6)`, marginBottom:3 }}>TELEGRAM</div>
              <GInput value={editData.tgNumber} onChange={e=>setEditData({...editData,tgNumber:e.target.value})} placeholder="TG/..."/>
            </div>
          </div>
          <div>
            <div style={{ fontSize:9, color:"#ffaa00", marginBottom:3 }}>NEW PASSWORD (OPTIONAL)</div>
            <GInput type="password" value={editData.newPassword} onChange={e=>setEditData({...editData,newPassword:e.target.value})} placeholder="Leave blank to keep current"/>
          </div>
          <Btn onClick={() => updateProfile(editData)} style={{ marginTop:4 }}>
            {formLoad ? "SAVING..." : "SAVE PROFILE"}
          </Btn>
        </div>
      </div>

      {/* Logout */}
      <div style={{ background:"#ff444411", border:"1px solid #ff444455", borderRadius:12, padding:16 }}>
        <div style={{ fontSize:9, color:"#ff4444", letterSpacing:2, marginBottom:10 }}>DANGER ZONE</div>
        <button onClick={doLogout} style={{ width:"100%", background:"#ff000022", border:"2px solid #ff4444", borderRadius:8, color:"#ff4444", fontSize:12, fontWeight:"bold", padding:14, letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
          LOGOUT / EXIT SYSTEM
        </button>
      </div>

      <div style={{ marginTop:24, textAlign:"center", fontSize:9, color:`rgba(${scr},0.2)`, letterSpacing:2 }}>
        All rights reserved TeamFlow | by HassKariyawasam
      </div>
    </div>
  );
}
