import { Btn } from "./UI.jsx";
import { MEMBER_COLORS, WEEK_INFO } from "../constants.js";

// ─── TASKS TAB ────────────────────────────────────────────────
export default function TasksTab({
  sysColor, sysColorRGB, profile,
  pubTasks, totalDone, pct, urgentTasks,
  taskFilter, setTaskFilter,
  showAddTask, setShowAddTask,
  newTask, setNewTask,
  visibleTasks, activeWeeks, completedWeeks, weekStatuses,
  editNote, setEditNote, noteText, setNoteText,
  addTask, toggleDone, saveNote, deleteTask, toggleWeekDone,
  getUrgentStatus, formatDate,
}) {

  const renderWeek = (week, isCompletedSection) => {
    const wt = visibleTasks.filter(t => t.week === week);
    const wd = wt.filter(t => t.done).length;
    if (!wt.length) return null;

    return (
      <div key={week} style={{ marginBottom: 24, opacity: isCompletedSection ? 0.6 : 1, transition: "all 0.3s" }}>
        {/* Week header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 12,
          background: isCompletedSection ? `rgba(${sysColorRGB},0.07)` : "transparent",
          padding: isCompletedSection ? "10px" : "0", borderRadius: 8,
        }}>
          <div style={{ fontSize: 16, color: sysColor, letterSpacing: 2, fontFamily: "'Orbitron',monospace", flexShrink: 0 }}>
            WEEK {week}
          </div>
          <div style={{ fontSize: 12, color: `rgba(${sysColorRGB},0.4)` }}>{WEEK_INFO[week]?.dates}</div>
          <div style={{ flex: 1, height: 2, background: `rgba(${sysColorRGB},0.13)` }} />
          <div style={{ fontSize: 12, color: wd === wt.length ? sysColor : `rgba(${sysColorRGB},0.67)`, fontWeight: "bold" }}>
            {wd}/{wt.length} DONE
          </div>
          {profile.role === "Group Leader" && (
            <button onClick={() => toggleWeekDone(week)}
              style={{
                padding: "6px 12px",
                background: isCompletedSection ? "#ffaa0022" : `rgba(${sysColorRGB},0.13)`,
                border: `1px solid ${isCompletedSection ? "#ffaa00" : sysColor}`,
                borderRadius: 6,
                color: isCompletedSection ? "#ffaa00" : sysColor,
                fontSize: 10, cursor: "pointer", fontFamily: "'Share Tech Mono',monospace",
              }}>
              {isCompletedSection ? "REOPEN" : "MARK WEEK DONE ✓"}
            </button>
          )}
        </div>

        {/* Task cards */}
        {wt.map(task => {
          const isUrgent = task.deadline && !task.done;
          const canDelete = profile.role === "Group Leader" || task.createdBy === profile.username;
          const urgentStatus = isUrgent ? getUrgentStatus(task.dueDate) : null;

          return (
            <div key={task.fsId || task.id} style={{
              background: "#0a0f0a",
              border: `1px solid ${isUrgent ? urgentStatus.color : task.isPrivate ? "#ffaa0033" : `rgba(${sysColorRGB},0.13)`}`,
              boxShadow: isUrgent ? urgentStatus.glow : "none",
              borderRadius: 10, padding: "16px", marginBottom: 10, transition: "all 0.3s",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Checkbox */}
                <button onClick={() => toggleDone(task)} style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0, marginTop: 2, cursor: "pointer",
                  border: `2px solid ${task.done ? sysColor : isUrgent ? urgentStatus.color : `rgba(${sysColorRGB},0.27)`}`,
                  background: task.done ? sysColor : "#030503",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                }}>
                  {task.done && <span style={{ color: "#000", fontSize: 16, fontWeight: "bold", lineHeight: 1 }}>✓</span>}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    {isUrgent && (
                      <span style={{ color: urgentStatus.color, fontSize: 12, fontWeight: "bold", flexShrink: 0, padding: "2px 8px", background: `${urgentStatus.color}22`, borderRadius: 12 }}>
                        ⚑ {urgentStatus.text}
                      </span>
                    )}
                    {task.isPrivate && (
                      <span style={{ fontSize: 10, padding: "2px 8px", background: "#ffaa0022", border: "1px solid #ffaa0044", borderRadius: 20, color: "#ffaa00", flexShrink: 0 }}>
                        PRIVATE
                      </span>
                    )}
                    <span style={{
                      fontSize: 16,
                      color: task.done ? `rgba(${sysColorRGB},0.27)` : isUrgent ? "#ffffff" : sysColor,
                      textDecoration: task.done ? "line-through" : "none",
                      wordBreak: "break-word",
                    }}>
                      {task.title}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{
                      fontSize: 11, padding: "4px 12px", borderRadius: 20, fontWeight: "bold",
                      background: (MEMBER_COLORS[task.assignee] || sysColor) + "22",
                      border: `1px solid ${(MEMBER_COLORS[task.assignee] || sysColor)}44`,
                      color: MEMBER_COLORS[task.assignee] || sysColor,
                    }}>
                      {task.assignee}
                    </span>
                  </div>

                  <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.4)`, marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <span>Added by: <strong style={{ color: `rgba(${sysColorRGB},0.67)` }}>{task.createdBy}</strong></span>
                    {task.createdAt && <span>• {formatDate(task.createdAt)}</span>}
                    {task.done && task.completedAt && <span style={{ color: "#00ccffaa" }}>• Completed: {formatDate(task.completedAt)}</span>}
                  </div>

                  {/* Note editor */}
                  {editNote === (task.fsId || task.id) && (
                    <div style={{ marginTop: 12 }}>
                      <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} placeholder="Write a note..."
                        className="themed-input"
                        style={{ width: "100%", background: "#000", border: `1px solid ${sysColor}`, borderRadius: 8, padding: "12px", color: "#ffffff", fontSize: 14, resize: "vertical", fontFamily: "'Share Tech Mono',monospace", outline: "none" }} />
                      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                        <button onClick={() => saveNote(task)} style={{ padding: "8px 16px", background: `rgba(${sysColorRGB},0.13)`, border: `1px solid ${sysColor}`, borderRadius: 6, color: sysColor, fontSize: 12, fontWeight: "bold", fontFamily: "'Share Tech Mono',monospace", cursor: "pointer" }}>SAVE NOTE</button>
                        <button onClick={() => { setEditNote(null); setNoteText(""); }} style={{ padding: "8px 16px", background: "transparent", border: `1px solid rgba(${sysColorRGB},0.27)`, borderRadius: 6, color: `rgba(${sysColorRGB},0.53)`, fontSize: 12, fontFamily: "'Share Tech Mono',monospace", cursor: "pointer" }}>CANCEL</button>
                      </div>
                    </div>
                  )}

                  {task.note && editNote !== (task.fsId || task.id) && (
                    <div style={{ marginTop: 10, fontSize: 13, color: "#00ccff", background: "#00ccff11", borderLeft: "4px solid #00ccff55", padding: "10px 14px", borderRadius: "0 8px 8px 0", whiteSpace: "pre-wrap" }}>
                      <span style={{ opacity: 0.5 }}>// NOTE: </span><br />{task.note}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { setEditNote(task.fsId || task.id); setNoteText(task.note || ""); }}
                    style={{ background: "transparent", border: `1px solid rgba(${sysColorRGB},0.2)`, borderRadius: 6, color: `rgba(${sysColorRGB},0.67)`, fontSize: 14, padding: "8px", cursor: "pointer" }} title="Edit Note">📝</button>
                  {canDelete && (
                    <button onClick={() => deleteTask(task)}
                      style={{ background: "transparent", border: "1px solid #ff444433", borderRadius: 6, color: "#ff4444aa", fontSize: 14, padding: "8px", cursor: "pointer" }} title="Delete">🗑</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px 16px 0" }}>

      {/* Urgent alert strip */}
      {urgentTasks.length > 0 && (
        <div style={{ marginBottom: 16, background: "#ff444411", border: "1px solid #ff444444", borderRadius: 8, padding: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: "#ff4444" }}>⚑</span>
            <div style={{ fontSize: 11, color: "#ff4444", fontWeight: "bold", letterSpacing: 1 }}>URGENT DEADLINES</div>
          </div>
          {urgentTasks.map(t => {
            const st = getUrgentStatus(t.dueDate);
            return (
              <div key={t.fsId || t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#000", borderRadius: 6, marginBottom: 4, border: `1px solid ${st.color}33` }}>
                <div style={{ fontSize: 12, color: "#fff", wordBreak: "break-word" }}>{t.title}</div>
                <div style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: `${st.color}22`, color: st.color, whiteSpace: "nowrap", fontWeight: "bold", boxShadow: st.glow }}>{st.text}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { l: "TOTAL TASKS",  v: pubTasks.length,             c: sysColor   },
          { l: "COMPLETED",    v: totalDone,                   c: "#00ccff"  },
          { l: "REMAINING",    v: pubTasks.length - totalDone, c: "#ffaa00"  },
          { l: "PROGRESS",     v: pct + "%",                   c: "#ff66cc"  },
        ].map(s => (
          <div key={s.l} style={{ flex: "1 1 70px", background: "#0a0f0a", border: `1px solid ${s.c}33`, borderRadius: 10, padding: "12px 16px", minWidth: 80, boxShadow: `0 4px 10px ${s.c}11` }}>
            <div style={{ fontSize: 10, color: "#ffffff66", letterSpacing: 2, marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontSize: 24, fontWeight: "bold", color: s.c, fontFamily: "'Orbitron',monospace", textShadow: `0 0 10px ${s.c}66` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", background: "#0a0f0a", padding: "12px", borderRadius: 10, border: `1px solid rgba(${sysColorRGB},0.13)` }}>
        <div style={{ fontSize: 12, color: sysColor, letterSpacing: 2, fontWeight: "bold" }}>FILTER:</div>
        {[
          { label: "ALL TASKS",  v: "All",      c: sysColor,  bg: "" },
          { label: "🔥 MY TASKS", v: "MY_TASKS", c: "#00ccff", bg: "#00ccff" },
        ].map(f => (
          <button key={f.v} onClick={() => setTaskFilter(f.v)}
            style={{
              padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: "bold",
              fontFamily: "'Share Tech Mono',monospace", transition: "all 0.2s",
              border: `1px solid ${taskFilter === f.v ? f.c : `rgba(${sysColorRGB},0.2)`}`,
              background: taskFilter === f.v ? `${f.c}22` : "transparent",
              color: taskFilter === f.v ? f.c : `rgba(${sysColorRGB},0.4)`,
              boxShadow: taskFilter === f.v ? `0 0 10px ${f.c}44` : "none",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Add task button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <button className="neon-btn" onClick={() => setShowAddTask(!showAddTask)}
          style={{ padding: "12px 30px", background: `rgba(${sysColorRGB},0.07)`, border: `1px dashed rgba(${sysColorRGB},0.33)`, borderRadius: 24, color: sysColor, fontSize: 14, fontWeight: "bold", letterSpacing: 2, fontFamily: "'Share Tech Mono',monospace", cursor: "pointer", transition: "all 0.3s" }}>
          {showAddTask ? "[ CANCEL ]" : "[ + ADD NEW TASK ]"}
        </button>
      </div>

      {/* Add task form */}
      {showAddTask && (
        <div style={{ background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.33)`, borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: `0 0 20px rgba(${sysColorRGB},0.13)` }}>
          <div style={{ fontSize: 11, color: sysColor, letterSpacing: 3, marginBottom: 12, fontWeight: "bold" }}>NEW TASK</div>
          <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Describe the task..."
            className="themed-input"
            style={{ width: "100%", background: "#000", borderRadius: 8, padding: "14px", color: "#ffffff", fontSize: 15, marginBottom: 14, fontFamily: "'Share Tech Mono',monospace", outline: "none" }} />
          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <select value={newTask.week} onChange={e => setNewTask({ ...newTask, week: Number(e.target.value) })}
              className="themed-input"
              style={{ flex: 1, minWidth: 100, background: "#000", borderRadius: 8, padding: "12px", color: "#ffffff", fontSize: 14, fontFamily: "'Share Tech Mono',monospace", outline: "none" }}>
              {Object.keys(WEEK_INFO).map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
            <select value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
              className="themed-input"
              style={{ flex: 1, minWidth: 100, background: "#000", borderRadius: 8, padding: "12px", color: "#ffffff", fontSize: 14, fontFamily: "'Share Tech Mono',monospace", outline: "none" }}>
              {["All", "Group Leader", "Member 2", "Member 3", "Member 4"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap", background: "#000", padding: "12px", borderRadius: 8, border: `1px solid rgba(${sysColorRGB},0.13)` }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: `rgba(${sysColorRGB},0.67)`, cursor: "pointer" }}>
              <input type="checkbox" checked={newTask.isPrivate} onChange={e => setNewTask({ ...newTask, isPrivate: e.target.checked })} style={{ accentColor: sysColor, width: 18, height: 18 }} />
              Private Task (Only You)
            </label>
            {profile.role === "Group Leader" && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, borderLeft: `1px solid rgba(${sysColorRGB},0.2)`, paddingLeft: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#ff4444", fontWeight: "bold", cursor: "pointer" }}>
                  <input type="checkbox" checked={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.checked })} style={{ accentColor: "#ff4444", width: 18, height: 18 }} />
                  MARK AS URGENT
                </label>
                {newTask.deadline && (
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    style={{ background: "#ff444422", border: "1px solid #ff4444", color: "#ff4444", padding: "6px 10px", borderRadius: 6, fontFamily: "'Share Tech Mono',monospace" }} />
                )}
              </div>
            )}
          </div>
          <Btn onClick={addTask}>SUBMIT TASK</Btn>
        </div>
      )}

      {/* Active weeks */}
      {activeWeeks.map(w => renderWeek(w, false))}

      {/* Completed weeks divider */}
      {completedWeeks.length > 0 && (
        <div style={{ margin: "30px 0", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: `rgba(${sysColorRGB},0.33)`, letterSpacing: 4, marginBottom: 10 }}>
            ─── COMPLETED WEEKS ───
          </div>
        </div>
      )}
      {completedWeeks.map(w => renderWeek(w, true))}
    </div>
  );
}
