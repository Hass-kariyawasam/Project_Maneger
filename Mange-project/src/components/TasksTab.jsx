// src/components/TasksTab.jsx
import { useState } from "react";
import { ASSIGNEE_OPTS, WEEK_INFO } from "../constants.js";
import { fmtDate, urgentStatus } from "../utils.js";
import { GInput, Btn } from "./UI.jsx";

export default function TasksTab({
  tasks, profile, sc, scr, activeProject,
  addTask, toggleDone, deleteTask, saveNote,
  weekDone, toggleWeekDone,
}) {
  const [taskFilter, setTaskFilter] = useState("All");
  const [showAdd,    setShowAdd]    = useState(false);
  const [newTask,    setNewTask]    = useState({ title:"", week:1, assignee:"All", isPrivate:false, deadline:false, dueDate:"" });
  const [editNote,   setEditNote]   = useState(null);
  const [noteText,   setNoteText]   = useState("");

  const pubTasks    = tasks.filter(t => !t.isPrivate);
  const totalDone   = pubTasks.filter(t => t.done).length;
  const pct         = pubTasks.length ? Math.round(totalDone / pubTasks.length * 100) : 0;
  const urgentTasks = pubTasks.filter(t => t.deadline && !t.done);

  const visible = tasks.filter(t => {
    if (t.isPrivate && t.createdBy !== profile?.username) return false;
    if (taskFilter === "MY") return t.assignee === (profile?.isLeader ? "Leader" : "Member") || t.assignee === profile?.username || t.createdBy === profile?.username;
    return true;
  });

  const allWeeks  = [...new Set(visible.map(t => t.week))].sort((a,b) => a-b);
  const activeWks = allWeeks.filter(w => !weekDone.includes(w));
  const doneWks   = allWeeks.filter(w =>  weekDone.includes(w));

  function handleAdd() {
    if (!newTask.title.trim()) return;
    addTask(newTask);
    setNewTask({ title:"", week:1, assignee:"All", isPrivate:false, deadline:false, dueDate:"" });
    setShowAdd(false);
  }

  const renderWeek = (week, isDone) => {
    const wt = visible.filter(t => t.week === week);
    const wd = wt.filter(t => t.done).length;
    if (!wt.length) return null;
    return (
      <div key={week} style={{ marginBottom:22, opacity:isDone?0.6:1, transition:"all 0.3s" }}>
        {/* Week header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10, background:isDone?`rgba(${scr},0.07)`:"transparent", padding:isDone?"10px":"0", borderRadius:8 }}>
          <div style={{ fontSize:14, color:sc, letterSpacing:2, fontFamily:"'Orbitron',monospace", flexShrink:0 }}>WEEK {week}</div>
          <div style={{ fontSize:10, color:`rgba(${scr},0.4)` }}>{WEEK_INFO[week]?.dates}</div>
          <div style={{ flex:1, height:2, background:`rgba(${scr},0.13)` }}/>
          <div style={{ fontSize:11, color:wd===wt.length?sc:`rgba(${scr},0.67)`, fontWeight:"bold" }}>{wd}/{wt.length}</div>
          {profile.isLeader && (
            <button onClick={() => toggleWeekDone(week)} style={{ padding:"5px 11px", background:isDone?"#ffaa0022":`rgba(${scr},0.13)`, border:`1px solid ${isDone?"#ffaa00":sc}`, borderRadius:6, color:isDone?"#ffaa00":sc, fontSize:10, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>
              {isDone ? "REOPEN" : "MARK DONE"}
            </button>
          )}
        </div>

        {/* Tasks */}
        {wt.map(task => {
          const isUrgent = task.deadline && !task.done;
          const canDel   = profile.isLeader || task.createdBy === profile.username;
          const us       = isUrgent ? urgentStatus(task.dueDate, sc, scr) : null;
          const taskKey  = task.fsId || task.id;

          return (
            <div key={taskKey} style={{ background:"#0a0f0a", border:`1px solid ${isUrgent?us.color:task.isPrivate?"#ffaa0033":`rgba(${scr},0.13)`}`, boxShadow:isUrgent?us.glow:"none", borderRadius:10, padding:15, marginBottom:10, transition:"all 0.3s" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                {/* Checkbox */}
                <button onClick={() => toggleDone(task)} style={{ width:26, height:26, borderRadius:8, flexShrink:0, marginTop:2, cursor:"pointer", border:`2px solid ${task.done?sc:isUrgent?us.color:`rgba(${scr},0.27)`}`, background:task.done?sc:"#030503", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                  {task.done && <span style={{ color:"#000", fontSize:13, fontWeight:"bold" }}>v</span>}
                </button>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
                    {isUrgent && <span style={{ color:us.color, fontSize:11, fontWeight:"bold", padding:"2px 8px", background:`${us.color}22`, borderRadius:12 }}>! {us.text}</span>}
                    {task.isPrivate && <span style={{ fontSize:10, padding:"2px 8px", background:"#ffaa0022", border:"1px solid #ffaa0044", borderRadius:20, color:"#ffaa00" }}>PRIVATE</span>}
                    <span style={{ fontSize:14, color:task.done?`rgba(${scr},0.27)`:isUrgent?"#fff":sc, textDecoration:task.done?"line-through":"none", wordBreak:"break-word" }}>{task.title}</span>
                  </div>

                  <div style={{ display:"flex", gap:8, marginTop:7, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, padding:"3px 11px", borderRadius:20, background:sc+"22", border:`1px solid ${sc}44`, color:MEMBER_COLORS[task.assignee]||sc, fontWeight:"bold" }}>
                      {task.assignee}
                    </span>
                  </div>

                  <div style={{ fontSize:10, color:`rgba(${scr},0.4)`, marginTop:7, display:"flex", gap:12, flexWrap:"wrap" }}>
                    <span>Added by: <strong style={{ color:`rgba(${scr},0.67)` }}>{task.createdBy}</strong></span>
                    {task.createdAt && <span>Time: {fmtDate(task.createdAt)}</span>}
                    {task.done && task.completedAt && <span style={{ color:"#00ccffaa" }}>Done: {fmtDate(task.completedAt)}</span>}
                  </div>

                  {/* Note editor */}
                  {editNote === taskKey && (
                    <div style={{ marginTop:11 }}>
                      <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3} placeholder="Write a note..."
                        style={{ width:"100%", background:"#000", border:`1px solid ${sc}`, borderRadius:8, padding:11, color:"#fff", fontSize:12, resize:"vertical", fontFamily:"'Share Tech Mono',monospace", outline:"none" }}/>
                      <div style={{ display:"flex", gap:9, marginTop:7 }}>
                        <button onClick={() => { saveNote(task, noteText); setEditNote(null); setNoteText(""); }} style={{ padding:"7px 14px", background:`rgba(${scr},0.13)`, border:`1px solid ${sc}`, borderRadius:6, color:sc, fontSize:11, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>SAVE</button>
                        <button onClick={() => { setEditNote(null); setNoteText(""); }} style={{ padding:"7px 14px", background:"transparent", border:`1px solid rgba(${scr},0.27)`, borderRadius:6, color:`rgba(${scr},0.5)`, fontSize:11, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>CANCEL</button>
                      </div>
                    </div>
                  )}

                  {/* Note display */}
                  {task.note && editNote !== taskKey && (
                    <div style={{ marginTop:9, fontSize:12, color:"#00ccff", background:"#00ccff11", borderLeft:"3px solid #00ccff55", padding:"8px 12px", borderRadius:"0 8px 8px 0", whiteSpace:"pre-wrap" }}>
                      NOTE: {task.note}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                  <button onClick={() => { setEditNote(taskKey); setNoteText(task.note||""); }} style={{ background:"transparent", border:`1px solid rgba(${scr},0.2)`, borderRadius:6, color:`rgba(${scr},0.67)`, fontSize:11, padding:"6px 9px", cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>NOTE</button>
                  {canDel && <button onClick={() => deleteTask(task)} style={{ background:"transparent", border:"1px solid #ff444433", borderRadius:6, color:"#ff4444aa", fontSize:11, padding:"6px 9px", cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>DEL</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding:"16px 14px 0" }}>
      {/* Urgent banner */}
      {urgentTasks.length > 0 && (
        <div style={{ marginBottom:14, background:"#ff444411", border:"1px solid #ff444444", borderRadius:8, padding:10 }}>
          <div style={{ fontSize:11, color:"#ff4444", fontWeight:"bold", marginBottom:6 }}>! URGENT DEADLINES</div>
          {urgentTasks.map(t => {
            const s = urgentStatus(t.dueDate, sc, scr);
            return (
              <div key={t.fsId||t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 9px", background:"#000", borderRadius:6, marginBottom:4, border:`1px solid ${s.color}33` }}>
                <div style={{ fontSize:11, color:"#fff" }}>{t.title}</div>
                <div style={{ fontSize:9, padding:"2px 8px", borderRadius:10, background:`${s.color}22`, color:s.color, fontWeight:"bold" }}>{s.text}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        {[
          { l:"TOTAL TASKS", v:pubTasks.length,              c:sc       },
          { l:"COMPLETED",   v:totalDone,                    c:"#00ccff"},
          { l:"REMAINING",   v:pubTasks.length - totalDone,  c:"#ffaa00"},
          { l:"PROGRESS",    v:pct+"%",                      c:"#ff66cc"},
        ].map(s => (
          <div key={s.l} style={{ flex:"1 1 70px", background:"#0a0f0a", border:`1px solid ${s.c}33`, borderRadius:10, padding:"10px 13px", minWidth:80 }}>
            <div style={{ fontSize:9, color:"#ffffff55", letterSpacing:2, marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:20, fontWeight:"bold", color:s.c, fontFamily:"'Orbitron',monospace" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ marginBottom:14, display:"flex", gap:10, alignItems:"center", background:"#0a0f0a", padding:11, borderRadius:10, border:`1px solid rgba(${scr},0.13)` }}>
        <div style={{ fontSize:11, color:sc, letterSpacing:2, fontWeight:"bold" }}>FILTER:</div>
        <button onClick={() => setTaskFilter("All")} style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${taskFilter==="All"?sc:`rgba(${scr},0.2)`}`, background:taskFilter==="All"?`rgba(${scr},0.13)`:"transparent", color:taskFilter==="All"?sc:`rgba(${scr},0.4)`, fontSize:11, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>ALL TASKS</button>
        <button onClick={() => setTaskFilter("MY")}  style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${taskFilter==="MY"?"#00ccff":"#00ccff33"}`, background:taskFilter==="MY"?"#00ccff22":"transparent", color:taskFilter==="MY"?"#00ccff":`rgba(${scr},0.4)`, fontSize:11, fontWeight:"bold", fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>MY TASKS</button>
      </div>

      {/* Add task toggle */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
        <button className="neon-btn" onClick={() => setShowAdd(!showAdd)} style={{ padding:"10px 26px", background:`rgba(${scr},0.07)`, border:`1px dashed rgba(${scr},0.33)`, borderRadius:22, color:sc, fontSize:13, fontWeight:"bold", letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
          {showAdd ? "[ CANCEL ]" : "[ + ADD NEW TASK ]"}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.33)`, borderRadius:12, padding:16, marginBottom:18 }}>
          <div style={{ fontSize:11, color:sc, letterSpacing:3, marginBottom:10 }}>NEW TASK</div>
          <input value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} placeholder="Describe the task..."
            style={{ width:"100%", background:"#000", border:`1px solid rgba(${scr},0.27)`, borderRadius:8, padding:12, color:"#fff", fontSize:13, marginBottom:11, fontFamily:"'Share Tech Mono',monospace", outline:"none" }}/>
          <div style={{ display:"flex", gap:10, marginBottom:11, flexWrap:"wrap" }}>
            <select value={newTask.week} onChange={e=>setNewTask({...newTask,week:Number(e.target.value)})}
              style={{ flex:1, minWidth:90, background:"#000", border:`1px solid rgba(${scr},0.27)`, borderRadius:8, padding:10, color:"#fff", fontFamily:"'Share Tech Mono',monospace", outline:"none" }}>
              {Object.keys(WEEK_INFO).map(w=><option key={w} value={w}>Week {w}</option>)}
            </select>
            <select value={newTask.assignee} onChange={e=>setNewTask({...newTask,assignee:e.target.value})}
              style={{ flex:1, minWidth:90, background:"#000", border:`1px solid rgba(${scr},0.27)`, borderRadius:8, padding:10, color:"#fff", fontFamily:"'Share Tech Mono',monospace", outline:"none" }}>
              {ASSIGNEE_OPTS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", gap:14, marginBottom:13, flexWrap:"wrap", background:"#000", padding:11, borderRadius:8, border:`1px solid rgba(${scr},0.13)` }}>
            <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:`rgba(${scr},0.67)`, cursor:"pointer" }}>
              <input type="checkbox" checked={newTask.isPrivate} onChange={e=>setNewTask({...newTask,isPrivate:e.target.checked})} style={{ accentColor:sc, width:15, height:15 }}/>
              Private (Only You)
            </label>
            {profile.isLeader && (
              <div style={{ display:"flex", alignItems:"center", gap:12, borderLeft:`1px solid rgba(${scr},0.2)`, paddingLeft:12 }}>
                <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#ff4444", fontWeight:"bold", cursor:"pointer" }}>
                  <input type="checkbox" checked={newTask.deadline} onChange={e=>setNewTask({...newTask,deadline:e.target.checked})} style={{ accentColor:"#ff4444", width:15, height:15 }}/>
                  MARK URGENT
                </label>
                {newTask.deadline && (
                  <input type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask,dueDate:e.target.value})}
                    style={{ background:"#ff444422", border:"1px solid #ff4444", color:"#ff4444", padding:"5px 9px", borderRadius:6, fontFamily:"'Share Tech Mono',monospace" }}/>
                )}
              </div>
            )}
          </div>
          <Btn onClick={handleAdd}>SUBMIT TASK</Btn>
        </div>
      )}

      {activeWks.map(w => renderWeek(w, false))}
      {doneWks.length > 0 && <div style={{ margin:"24px 0", textAlign:"center", fontSize:10, color:`rgba(${scr},0.27)`, letterSpacing:4 }}>--- COMPLETED WEEKS ---</div>}
      {doneWks.map(w => renderWeek(w, true))}
    </div>
  );
}
