// src/components/TasksTab.jsx - TeamFlow v3 Enhanced
import { useState, useEffect } from "react";
import { ASSIGNEE_OPTS, WEEK_INFO } from "../constants.js";
import { fmtDate, urgentStatus } from "../utils.js";
import { Btn } from "./UI.jsx";
import { db } from "../firebase.js";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// ── Project start date: Feb 23 2026 ───────────────────────────────────────
const PROJECT_START = new Date("2026-02-23T00:00:00");

// Auto-calc week number from a date string
function dateToWeek(dateStr) {
  if (!dateStr) return currentWeekNum();
  const d    = new Date(dateStr + "T00:00:00");
  const diff = (d - PROJECT_START) / 86400000;
  return Math.max(1, Math.ceil((diff + 1) / 7));
}

// Current week number based on today
function currentWeekNum() {
  const diff = (new Date() - PROJECT_START) / 86400000;
  return Math.max(1, Math.ceil((diff + 1) / 7));
}

// Week date range label for any week number (auto-calculated)
function weekLabel(w) {
  const start  = new Date(PROJECT_START.getTime() + (w - 1) * 7 * 86400000);
  const end    = new Date(start.getTime() + 6 * 86400000);
  const fmt    = d => d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
  return `${fmt(start)} - ${fmt(end)}`;
}

// ── Tag colour ─────────────────────────────────────────────────────────────
const TAG_PAL = ["#00ff88","#00ccff","#ff66cc","#ffaa00","#b026ff","#ccff00","#ff4444","#ff8800"];
function tagColor(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) & 0xffff;
  return TAG_PAL[h % TAG_PAL.length];
}

const ROLE_COLORS = { All:"#ffffff", Leader:"#00ff88", Member:"#00ccff" };

// ── Clickable links inside text ────────────────────────────────────────────
function LinkedText({ text, style = {} }) {
  const URL_RE = /(https?:\/\/[^\s]+)/g;
  return (
    <span style={style}>
      {text.split(URL_RE).map((p, i) =>
        URL_RE.test(p)
          ? <a key={i} href={p} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color:"#00ccff", textDecoration:"underline", wordBreak:"break-all" }}>{p}</a>
          : p
      )}
    </span>
  );
}

// ── Meeting countdown ──────────────────────────────────────────────────────
function meetingCountdown(dateStr) {
  if (!dateStr) return null;
  const d = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (d < 0)   return { label:"PAST",     color:"#ffffff33", days: d };
  if (d === 0) return { label:"TODAY",    color:"#ff4444",   days: 0 };
  if (d === 1) return { label:"TOMORROW", color:"#ffaa00",   days: 1 };
  return             { label:`${d} DAYS`, color:"#00ccff",   days: d };
}

// ══════════════════════════════════════════════════════════════════════════
export default function TasksTab({
  tasks, teamUsers = [], profile, sc, scr, activeProject,
  addTask, toggleDone, deleteTask, saveNote,
  weekDone, toggleWeekDone,
}) {
  // ── filter state ─────────────────────────────────────────────────────────
  const [mainFilter,  setMainFilter]  = useState("All"); // All | MY | done | left
  const [weekFilter,  setWeekFilter]  = useState(null);  // null = all weeks
  const [expandedId,  setExpandedId]  = useState(null);  // expanded task card
  const [editNote,    setEditNote]    = useState(null);
  const [noteText,    setNoteText]    = useState("");

  // ── add task form ────────────────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({
    title:"", week: currentWeekNum(), assignee:"All",
    isPrivate:false, deadline:false, dueDate:"", taskDate:"", tags:[],
  });
  const [tagInput, setTagInput] = useState("");

  // ── meeting form ─────────────────────────────────────────────────────────
  const [showMtg,  setShowMtg]  = useState(false);
  const [mtgForm,  setMtgForm]  = useState({ title:"", date:"", time:"", type:"online", place:"", link:"", details:"" });
  const [meetings, setMeetings] = useState([]);

  const pid = activeProject?.id;
  const tid = profile?.teamId;
  const CW  = currentWeekNum();

  // ── Firestore meetings listener ──────────────────────────────────────────
  useEffect(() => {
    if (!pid || !tid) return;
    const unsub = onSnapshot(collection(db, "meetings"), snap => {
      setMeetings(
        snap.docs.map(d => ({ id:d.id, ...d.data() }))
          .filter(m => m.projectId === pid && m.teamId === tid)
          .sort((a, b) => (a.date||"").localeCompare(b.date||""))
      );
    });
    return () => unsub();
  }, [pid, tid]);

  const today       = new Date().toISOString().slice(0, 10);
  const nextMeeting = meetings.find(m => (m.date||"") >= today) || meetings[meetings.length - 1];

  // ── Derived counts ───────────────────────────────────────────────────────
  const pubTasks  = tasks.filter(t => !t.isPrivate);
  const doneCnt   = pubTasks.filter(t => t.done).length;
  const leftCnt   = pubTasks.length - doneCnt;
  const pct       = pubTasks.length ? Math.round(doneCnt / pubTasks.length * 100) : 0;
  const urgentTasks = pubTasks.filter(t => t.deadline && !t.done);

  // ── Per-user task count (public tasks only, by createdBy) ─────────────────
  const userTaskCounts = {};
  pubTasks.forEach(t => {
    if (!t.createdBy) return;
    userTaskCounts[t.createdBy] = (userTaskCounts[t.createdBy] || { total:0, done:0 });
    userTaskCounts[t.createdBy].total++;
    if (t.done) userTaskCounts[t.createdBy].done++;
  });

  // ── Visible tasks after filters ───────────────────────────────────────────
  // DAY = tasks in current week + next week (within ~14 days, urgent visible)
  // WEEK = current week only
  const visible = tasks.filter(t => {
    if (t.isPrivate && t.createdBy !== profile?.username) return false;
    // user filter (from workload tap)
    if (mainFilter.startsWith("u:")) {
      const u = mainFilter.slice(2);
      return t.createdBy === u || t.assignee === u;
    }
    // MY filter
    const isMyTask = t.assignee === (profile?.isLeader ? "Leader" : "Member")
        || t.assignee === profile?.username
        || t.createdBy === profile?.username;
    // scope filters
    const inCW   = t.week === CW;
    const inNext = t.week === CW + 1;
    if (mainFilter === "DAY") {
      // show tasks in current week and next week — apply MY if needed
      return (inCW || inNext) && !t.isPrivate;
    }
    if (mainFilter === "WEEK") {
      return inCW && !t.isPrivate;
    }
    if (mainFilter === "MY")  return isMyTask;
    return true; // ALL
  });

  // ── Weeks in visible tasks ────────────────────────────────────────────────
  const allWeeks  = [...new Set(visible.map(t => t.week))].sort((a,b) => a-b);
  const shown     = weekFilter ? visible.filter(t => t.week === weekFilter) : visible;
  const activeWks = (weekFilter ? [weekFilter] : allWeeks).filter(w => !weekDone.includes(w));
  const doneWks   = (weekFilter ? [weekFilter] : allWeeks).filter(w =>  weekDone.includes(w));

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleAdd() {
    if (!newTask.title.trim()) return;
    addTask({ ...newTask });
    setNewTask({ title:"", week:CW, assignee:"All", isPrivate:false, deadline:false, dueDate:"", taskDate:"", tags:[] });
    setTagInput("");
    setShowAdd(false);
  }

  function handleTagKey(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const t = tagInput.trim().replace(/,/g,"");
      if (t && !newTask.tags.includes(t))
        setNewTask(p => ({ ...p, tags:[...p.tags, t] }));
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && newTask.tags.length) {
      setNewTask(p => ({ ...p, tags:p.tags.slice(0,-1) }));
    }
  }

  function handleDateChange(dateStr) {
    setNewTask(p => ({ ...p, taskDate:dateStr, week: dateToWeek(dateStr) }));
  }

  async function saveMeeting() {
    if (!mtgForm.title.trim() || !mtgForm.date) return;
    try {
      await addDoc(collection(db, "meetings"), {
        ...mtgForm, createdBy:profile.username, teamId:tid, projectId:pid,
        createdAt:serverTimestamp(),
      });
      setMtgForm({ title:"", date:"", time:"", type:"online", place:"", link:"", details:"" });
      setShowMtg(false);
    } catch(e) { console.error(e); }
  }

  async function handleDeleteMtg(id) {
    if (!window.confirm("Delete this meeting?")) return;
    try { await deleteDoc(doc(db, "meetings", id)); } catch(e) { console.error(e); }
  }

  // ── NEXT MEETING CARD ─────────────────────────────────────────────────────
  const NextMeetingCard = () => {
    if (!nextMeeting) return null;
    const cd = meetingCountdown(nextMeeting.date);
    if (!cd) return null;
    const isOnline = nextMeeting.type === "online";
    return (
      <div style={{ marginBottom:12, background:"#0a0f0a",
          border:`1px solid ${cd.color}44`, borderRadius:10, padding:"11px 14px",
          position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg,transparent,${cd.color},transparent)` }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:8, color:`rgba(${scr},0.35)`, letterSpacing:3, marginBottom:3 }}>NEXT MEETING</div>
            <div style={{ fontSize:13, fontWeight:"bold", color:"#fff",
                fontFamily:"'Orbitron',monospace", marginBottom:5, wordBreak:"break-word" }}>
              {nextMeeting.title}
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, alignItems:"center" }}>
              <span style={{ fontSize:10, color:`rgba(${scr},0.55)` }}>
                {nextMeeting.date}{nextMeeting.time ? ` · ${nextMeeting.time}` : ""}
              </span>
              <span style={{ fontSize:9, padding:"2px 9px", borderRadius:20,
                  background: isOnline ? "#00ccff18" : "#ffaa0018",
                  border:`1px solid ${isOnline ? "#00ccff44" : "#ffaa0044"}`,
                  color: isOnline ? "#00ccff" : "#ffaa00", fontWeight:"bold", letterSpacing:1 }}>
                {isOnline ? "ONLINE" : "PHYSICAL"}
              </span>
              {nextMeeting.place && (
                <span style={{ fontSize:10, color:`rgba(${scr},0.45)` }}>{nextMeeting.place}</span>
              )}
            </div>
            {isOnline && nextMeeting.link && (
              <a href={nextMeeting.link} target="_blank" rel="noreferrer"
                style={{ fontSize:10, color:"#00ccff", textDecoration:"underline",
                  display:"inline-block", marginTop:5, wordBreak:"break-all" }}>
                Join Link
              </a>
            )}
            {nextMeeting.details && (
              <div style={{ fontSize:10, color:`rgba(${scr},0.5)`, marginTop:5,
                  fontStyle:"italic", whiteSpace:"pre-wrap" }}>
                {nextMeeting.details}
              </div>
            )}
          </div>
          <div style={{ textAlign:"center", flexShrink:0 }}>
            <div style={{ fontSize:28, fontWeight:900, color:cd.color,
                fontFamily:"'Orbitron',monospace", lineHeight:1 }}>
              {cd.days >= 0 ? cd.days : "—"}
            </div>
            <div style={{ fontSize:7, color:cd.color, letterSpacing:2, marginTop:2 }}>{cd.label}</div>
          </div>
        </div>
        {profile.isLeader && (
          <button onClick={() => handleDeleteMtg(nextMeeting.id)}
            style={{ position:"absolute", top:6, right:8, background:"transparent",
              border:"none", color:"#ff444455", fontSize:14, cursor:"pointer", padding:2 }}>x</button>
        )}
      </div>
    );
  };

  // ── WEEK RENDERER ─────────────────────────────────────────────────────────
  const renderWeek = (week, isDone) => {
    const wt = shown.filter(t => t.week === week);
    if (!wt.length) return null;
    const wd  = wt.filter(t => t.done).length;
    const isCW = week === CW;

    return (
      <div key={week} style={{ marginBottom:16, opacity:isDone?0.55:1 }}>
        {/* Week header */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8,
            background:isDone?`rgba(${scr},0.05)`:isCW?`rgba(${scr},0.06)`:"transparent",
            padding:"7px 10px", borderRadius:8,
            border: isCW && !isDone ? `1px solid rgba(${scr},0.25)` : "1px solid transparent" }}>
          <div style={{ fontSize:12, color:isCW&&!isDone?sc:`rgba(${scr},0.6)`,
              letterSpacing:2, fontFamily:"'Orbitron',monospace", flexShrink:0 }}>
            W{week}
          </div>
          {isCW && !isDone && (
            <span style={{ fontSize:8, padding:"1px 6px", borderRadius:10,
                background:`rgba(${scr},0.18)`, border:`1px solid ${sc}44`,
                color:sc, letterSpacing:1 }}>NOW</span>
          )}
          <div style={{ fontSize:9, color:`rgba(${scr},0.35)` }}>{weekLabel(week)}</div>
          <div style={{ flex:1, height:1, background:`rgba(${scr},0.1)` }}/>
          <div style={{ fontSize:10, color:wd===wt.length?sc:`rgba(${scr},0.5)`,
              fontWeight:"bold", fontFamily:"'Orbitron',monospace" }}>{wd}/{wt.length}</div>
          {profile.isLeader && (
            <button onClick={() => toggleWeekDone(week)}
              style={{ padding:"3px 9px", background:"transparent",
                border:`1px solid ${isDone?"#ffaa0055":sc+"44"}`,
                borderRadius:5, color:isDone?"#ffaa00":`rgba(${scr},0.5)`,
                fontSize:9, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>
              {isDone ? "REOPEN" : "DONE"}
            </button>
          )}
        </div>

        {/* Task cards */}
        {wt.map(task => {
          const isUrgent = task.deadline && !task.done;
          const canDel   = profile.isLeader || task.createdBy === profile.username;
          const us       = isUrgent ? urgentStatus(task.dueDate, sc, scr) : null;
          const key      = task.fsId || task.id;
          const expanded = expandedId === key;
          const tags     = task.tags || [];

          return (
            <div key={key}
              onClick={() => setExpandedId(expanded ? null : key)}
              style={{
                background:"#0a0f0a", cursor:"pointer",
                border:`1px solid ${isUrgent ? us.color : task.isPrivate ? "#ffaa0033" : expanded ? `rgba(${scr},0.3)` : `rgba(${scr},0.1)`}`,
                boxShadow: isUrgent ? us.glow : expanded ? `0 0 8px rgba(${scr},0.1)` : "none",
                borderRadius:9, padding:"11px 13px", marginBottom:8, transition:"all 0.2s",
              }}>

              {/* Always-visible row */}
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {/* Checkbox */}
                <button onClick={e => { e.stopPropagation(); toggleDone(task); }}
                  style={{ width:22, height:22, borderRadius:6, flexShrink:0, cursor:"pointer",
                    border:`2px solid ${task.done?sc:isUrgent?us.color:`rgba(${scr},0.25)`}`,
                    background:task.done?sc:"#030503",
                    display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                  {task.done && <span style={{ color:"#000", fontSize:11, fontWeight:"bold", lineHeight:1 }}>v</span>}
                </button>

                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{
                    fontSize:13, wordBreak:"break-word",
                    color:task.done?`rgba(${scr},0.3)`:isUrgent?"#fff":sc,
                    textDecoration:task.done?"line-through":"none",
                  }}>{task.title}</span>

                  {/* Tags row */}
                  {tags.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:5 }}>
                      {tags.map(tag => {
                        const tc = tagColor(tag);
                        return (
                          <span key={tag} style={{ fontSize:8, padding:"1px 7px", borderRadius:20,
                              background:`${tc}18`, border:`1px solid ${tc}44`,
                              color:tc, fontWeight:"bold", letterSpacing:1 }}>
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right: note dot + role badge + urgent badge + chevron */}
                <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                  {/* Note indicator — small dot if note exists */}
                  {task.note && editNote !== key && (
                    <span title="Has note" style={{ width:6, height:6, borderRadius:"50%",
                        background:"#00ccff", boxShadow:"0 0 5px #00ccff88",
                        flexShrink:0, display:"block" }}/>
                  )}
                  {isUrgent && (
                    <span style={{ fontSize:8, padding:"1px 7px", borderRadius:10,
                        background:`${us.color}18`, border:`1px solid ${us.color}44`,
                        color:us.color, fontWeight:"bold" }}>
                      {us.text}
                    </span>
                  )}
                  {task.isPrivate && (
                    <span style={{ fontSize:8, padding:"1px 7px", borderRadius:10,
                        background:"#ffaa0018", border:"1px solid #ffaa0033", color:"#ffaa00" }}>
                      PRIV
                    </span>
                  )}
                  <span style={{ fontSize:9, padding:"2px 8px", borderRadius:20,
                      background:`rgba(${scr},0.1)`, color:ROLE_COLORS[task.assignee]||sc,
                      border:`1px solid rgba(${scr},0.15)` }}>
                    {task.assignee}
                  </span>
                  <span style={{ fontSize:9, color:`rgba(${scr},0.35)`, transition:"transform 0.2s",
                      transform:expanded?"rotate(180deg)":"rotate(0deg)", display:"block" }}>v</span>
                </div>
              </div>

              {/* Expanded content */}
              {expanded && (
                <div style={{ marginTop:11, borderTop:`1px solid rgba(${scr},0.1)`, paddingTop:11 }}
                  onClick={e => e.stopPropagation()}>

                  {/* Meta */}
                  <div style={{ fontSize:9, color:`rgba(${scr},0.38)`, marginBottom:8,
                      display:"flex", gap:10, flexWrap:"wrap" }}>
                    <span>By: <strong style={{ color:`rgba(${scr},0.6)` }}>{task.createdBy}</strong></span>
                    {task.createdAt && <span>{fmtDate(task.createdAt)}</span>}
                    {task.done && task.completedAt && (
                      <span style={{ color:"#00ccff88" }}>Done: {fmtDate(task.completedAt)}</span>
                    )}
                  </div>

                  {/* Note editor */}
                  {editNote === key ? (
                    <div>
                      <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                        rows={3} placeholder="Write a note... (URLs become clickable)"
                        style={{ width:"100%", background:"#000", border:`1px solid ${sc}`,
                          borderRadius:7, padding:10, color:"#fff", fontSize:11,
                          resize:"vertical", fontFamily:"'Share Tech Mono',monospace", outline:"none" }}/>
                      <div style={{ display:"flex", gap:8, marginTop:6 }}>
                        <button onClick={() => { saveNote(task, noteText); setEditNote(null); setNoteText(""); }}
                          style={btnSm(sc, scr)}>SAVE</button>
                        <button onClick={() => { setEditNote(null); setNoteText(""); }}
                          style={btnSm(null, scr)}>CANCEL</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {task.note && (
                        <CollapsibleNote text={task.note}/>
                      )}
                      <div style={{ display:"flex", gap:7, marginTop:8 }}>
                        <button onClick={() => { setEditNote(key); setNoteText(task.note||""); }}
                          style={btnSm(sc, scr)}>{task.note ? "EDIT NOTE" : "ADD NOTE"}</button>
                        {canDel && (
                          <button onClick={() => deleteTask(task)}
                            style={{ ...btnSm(null, scr), borderColor:"#ff444444", color:"#ff4444aa" }}>
                            DELETE
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        .weeks-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media (min-width: 768px) {
          .weeks-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: start; }
        }
        .week-pill::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ padding:"14px 12px 0" }}>

        {/* Next meeting card */}
        <NextMeetingCard/>

        {/* Urgent banner */}
        {urgentTasks.length > 0 && (
          <div style={{ marginBottom:12, background:"#ff444410",
              border:"1px solid #ff444433", borderRadius:8, padding:"9px 12px" }}>
            <div style={{ fontSize:10, color:"#ff4444", fontWeight:"bold", marginBottom:5 }}>
              URGENT DEADLINES
            </div>
            {urgentTasks.map(t => {
              const s = urgentStatus(t.dueDate, sc, scr);
              return (
                <div key={t.fsId||t.id} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", padding:"4px 8px", background:"#000",
                    borderRadius:5, marginBottom:3, border:`1px solid ${s.color}22` }}>
                  <div style={{ fontSize:10, color:"#fff" }}>{t.title}</div>
                  <div style={{ fontSize:8, padding:"1px 7px", borderRadius:10,
                    background:`${s.color}20`, color:s.color, fontWeight:"bold",
                    flexShrink:0, marginLeft:8 }}>{s.text}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── STATS BOXES (clickable filter) ──────────────────────────────── */}
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          {[
            { id:"All",  label:"TOTAL",    val:pubTasks.length,  c:sc        },
            { id:"done", label:"DONE",     val:doneCnt,           c:"#00ccff" },
            { id:"left", label:"LEFT",     val:leftCnt,           c:"#ffaa00" },
            { id:"pct",  label:"PROGRESS", val:pct+"%",           c:"#ff66cc" },
          ].map(s => {
            const active = mainFilter === s.id;
            return (
              <div key={s.id}
                onClick={() => { setMainFilter(active && s.id !== "pct" ? "All" : s.id); setWeekFilter(null); }}
                style={{ flex:"1 1 60px", background:active?`${s.c}18`:"#0a0f0a",
                  border:`1px solid ${active ? s.c : s.c+"28"}`,
                  borderRadius:9, padding:"9px 10px", cursor:s.id!=="pct"?"pointer":"default",
                  transition:"all 0.2s", minWidth:60 }}>
                <div style={{ fontSize:8, color:active?s.c:"#ffffff44", letterSpacing:2, marginBottom:3 }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:"bold", color:active?s.c:s.c+"99",
                  fontFamily:"'Orbitron',monospace" }}>{s.val}</div>
              </div>
            );
          })}
        </div>

        {/* ── TEAM WORKLOAD — built from project members list ──────────────── */}
        {teamUsers.length > 0 && (
          <div style={{ marginBottom:12, background:"#0a0f0a",
              border:`1px solid rgba(${scr},0.12)`, borderRadius:9, padding:"9px 12px" }}>
            <div style={{ fontSize:8, color:`rgba(${scr},0.35)`, letterSpacing:3, marginBottom:8 }}>
              TEAM WORKLOAD
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {teamUsers.filter(u => u.username).map(u => {
                const cnt  = userTaskCounts[u.username] || { total:0, done:0 };
                const wpct = cnt.total ? Math.round(cnt.done / cnt.total * 100) : 0;
                const uc   = u.color || sc;
                const sel  = mainFilter === `u:${u.username}`;
                return (
                  <div key={u.uid || u.username}
                    onClick={() => setMainFilter(sel ? "All" : `u:${u.username}`)}
                    style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer",
                      padding:"4px 10px", borderRadius:20,
                      background: sel ? `${uc}18` : `rgba(${scr},0.06)`,
                      border:`1px solid ${sel ? uc+"66" : `rgba(${scr},0.13)`}`,
                      transition:"all 0.15s" }}>
                    <div style={{ width:18, height:18, borderRadius:5,
                        background:`${uc}28`, border:`1px solid ${uc}44`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:9, color:uc, fontWeight:"bold" }}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize:10, color:sel ? uc : `rgba(${scr},0.7)`,
                        fontWeight:"bold" }}>{u.username}</span>
                    <span style={{ fontSize:8, color:`rgba(${scr},0.4)` }}>
                      {cnt.done}/{cnt.total}
                    </span>
                    <div style={{ width:28, height:3, background:`rgba(${scr},0.12)`, borderRadius:2 }}>
                      <div style={{ width:`${wpct}%`, height:"100%", background:uc,
                          borderRadius:2, transition:"width 0.5s" }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FILTER BAR — single scrollable row ───────────────────────────── */}
        <div className="week-pill" style={{ marginBottom:12, display:"flex", gap:5,
            overflowX:"auto", paddingBottom:2, alignItems:"center",
            background:"#0a0f0a", border:`1px solid rgba(${scr},0.1)`,
            borderRadius:9, padding:"7px 10px" }}>

          {/* Main scope pills: ALL · MY · WEEK · DAY */}
          {[
            ["All",  "ALL"],
            ["MY",   "MINE"],
            ["WEEK", `W${CW}`],
            ["DAY",  "TODAY+"],
          ].map(([id, lbl]) => {
            const sel = mainFilter === id;
            return (
              <button key={id}
                onClick={() => { setMainFilter(id); setWeekFilter(null); }}
                style={{ padding:"4px 11px", borderRadius:20, flexShrink:0, fontSize:10,
                  cursor:"pointer", fontFamily:"'Share Tech Mono',monospace",
                  border:`1px solid ${sel ? sc : `rgba(${scr},0.18)`}`,
                  background: sel ? `rgba(${scr},0.18)` : "transparent",
                  color: sel ? sc : `rgba(${scr},0.38)`,
                  fontWeight: sel ? "bold" : "normal", transition:"all 0.15s" }}>
                {lbl}
              </button>
            );
          })}

          {/* divider */}
          <div style={{ width:1, height:16, background:`rgba(${scr},0.18)`, flexShrink:0, marginLeft:2, marginRight:2 }}/>

          {/* Week pills — only show when ALL or MY selected (week-level sub-filter) */}
          {(mainFilter === "All" || mainFilter === "MY") && (
            <>
              <button onClick={() => setWeekFilter(null)}
                style={{ padding:"4px 10px", borderRadius:20, flexShrink:0, fontSize:10, cursor:"pointer",
                  border:`1px solid ${!weekFilter ? sc : `rgba(${scr},0.13)`}`,
                  background: !weekFilter ? `rgba(${scr},0.15)` : "transparent",
                  color: !weekFilter ? sc : `rgba(${scr},0.28)`,
                  fontFamily:"'Share Tech Mono',monospace" }}>
                ALL
              </button>
              {allWeeks.map(w => {
                const isCW = w === CW;
                const sel  = weekFilter === w;
                return (
                  <button key={w} onClick={() => setWeekFilter(sel ? null : w)}
                    style={{ padding:"4px 10px", borderRadius:20, flexShrink:0, fontSize:10, cursor:"pointer",
                      border:`1px solid ${sel ? sc : isCW ? `rgba(${scr},0.3)` : `rgba(${scr},0.12)`}`,
                      background: sel ? `rgba(${scr},0.15)` : "transparent",
                      color: sel ? sc : isCW ? `rgba(${scr},0.7)` : `rgba(${scr},0.3)`,
                      fontFamily:"'Share Tech Mono',monospace",
                      fontWeight: isCW||sel ? "bold" : "normal" }}>
                    W{w}{isCW ? "*" : ""}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* ── ACTION BUTTONS ───────────────────────────────────────────────── */}
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          <button
            onClick={() => { setShowAdd(!showAdd); if (!showAdd) setShowMtg(false); }}
            style={{ flex:2, padding:"8px 14px", background:`rgba(${scr},0.07)`,
              border:`1px dashed rgba(${scr},0.3)`, borderRadius:20, color:sc,
              fontSize:11, fontWeight:"bold", letterSpacing:1,
              fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
            {showAdd ? "CANCEL" : "+ ADD TASK"}
          </button>
          {profile.isLeader && (
            <button onClick={() => { setShowMtg(!showMtg); if (!showMtg) setShowAdd(false); }}
              style={{ flex:1, padding:"8px 12px",
                background:showMtg?"#00ccff18":"transparent",
                border:`1px dashed ${showMtg?"#00ccff":"#00ccff33"}`,
                borderRadius:20, color:"#00ccff", fontSize:11, fontWeight:"bold",
                fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
              {showMtg ? "CANCEL" : "MEETING"}
            </button>
          )}
        </div>

        {/* ── ADD TASK FORM ────────────────────────────────────────────────── */}
        {showAdd && (
          <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.3)`,
              borderRadius:10, padding:14, marginBottom:16 }}>
            <div style={{ fontSize:10, color:sc, letterSpacing:3, marginBottom:10 }}>NEW TASK</div>

            <input value={newTask.title}
              onChange={e => setNewTask({...newTask, title:e.target.value})}
              placeholder="Task description..."
              style={inputStyle}/>

            {/* Date → auto week */}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:9, color:`rgba(${scr},0.4)`, letterSpacing:2, marginBottom:5 }}>
                DATE — AUTO ASSIGNS WEEK
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <input type="date" value={newTask.taskDate}
                  onChange={e => handleDateChange(e.target.value)}
                  style={{ ...inputStyle, flex:"1 1 130px", marginBottom:0, padding:"8px 10px" }}/>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:9,
                    color:`rgba(${scr},0.4)` }}>
                  or:
                  <select value={newTask.week}
                    onChange={e => setNewTask({...newTask, week:Number(e.target.value), taskDate:""})}
                    style={{ background:"#000", border:`1px solid rgba(${scr},0.25)`,
                      borderRadius:7, padding:"7px 9px", color:"#fff",
                      fontFamily:"'Share Tech Mono',monospace", outline:"none", fontSize:11 }}>
                    {[...Array(Math.max(10, CW+3))].map((_,i) => {
                      const w = i+1;
                      return <option key={w} value={w}>W{w} — {weekLabel(w)}</option>;
                    })}
                  </select>
                </div>
              </div>
              {newTask.taskDate && (
                <div style={{ fontSize:9, color:sc, marginTop:4 }}>
                  Auto-assigned: Week {newTask.week} ({weekLabel(newTask.week)})
                </div>
              )}
            </div>

            {/* Assignee */}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:9, color:`rgba(${scr},0.4)`, letterSpacing:2, marginBottom:5 }}>
                ASSIGN TO
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {profile.isLeader ? (
                  <>
                    {/* Role options */}
                    {ASSIGNEE_OPTS.map(opt => {
                      const sel = newTask.assignee === opt;
                      const c   = opt==="All" ? sc : opt==="Leader" ? "#00ff88" : "#00ccff";
                      return (
                        <button key={opt}
                          onClick={() => setNewTask({...newTask, assignee:opt})}
                          style={{ padding:"5px 11px", borderRadius:20, fontSize:10, cursor:"pointer",
                            border:`1px solid ${sel ? c : c+"33"}`,
                            background: sel ? c+"22" : "transparent",
                            color: sel ? c : c+"55",
                            fontFamily:"'Share Tech Mono',monospace", fontWeight:sel?"bold":"normal" }}>
                          {opt}
                        </button>
                      );
                    })}
                    {/* divider */}
                    {teamUsers.filter(u => u.username).length > 0 && (
                      <div style={{ width:1, height:24, background:`rgba(${scr},0.18)`,
                          alignSelf:"center", flexShrink:0 }}/>
                    )}
                    {/* Individual project member names */}
                    {teamUsers.filter(u => u.username).map(u => {
                      const sel = newTask.assignee === u.username;
                      const c   = u.color || sc;
                      return (
                        <button key={u.uid || u.username}
                          onClick={() => setNewTask({...newTask, assignee:u.username})}
                          style={{ padding:"5px 11px", borderRadius:20, fontSize:10, cursor:"pointer",
                            border:`1px solid ${sel ? c : c+"33"}`,
                            background: sel ? c+"22" : "transparent",
                            color: sel ? c : c+"55",
                            fontFamily:"'Share Tech Mono',monospace", fontWeight:sel?"bold":"normal",
                            display:"flex", alignItems:"center", gap:5 }}>
                          <span style={{ width:14, height:14, borderRadius:4,
                              background:c+"28", border:`1px solid ${c}44`,
                              display:"inline-flex", alignItems:"center", justifyContent:"center",
                              fontSize:8, fontWeight:"bold", color:c, flexShrink:0 }}>
                            {u.username[0].toUpperCase()}
                          </span>
                          {u.username}
                        </button>
                      );
                    })}
                  </>
                ) : (
                  /* Member: role options only */
                  ASSIGNEE_OPTS.map(opt => {
                    const sel = newTask.assignee === opt;
                    const c   = opt==="All" ? sc : opt==="Leader" ? "#00ff88" : "#00ccff";
                    return (
                      <button key={opt}
                        onClick={() => setNewTask({...newTask, assignee:opt})}
                        style={{ padding:"5px 11px", borderRadius:20, fontSize:10, cursor:"pointer",
                          border:`1px solid ${sel ? c : c+"33"}`,
                          background: sel ? c+"22" : "transparent",
                          color: sel ? c : c+"55",
                          fontFamily:"'Share Tech Mono',monospace", fontWeight:sel?"bold":"normal" }}>
                        {opt}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:9, color:`rgba(${scr},0.4)`, letterSpacing:2, marginBottom:5 }}>
                TAGS — Enter or comma to add
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5, alignItems:"center",
                  background:"#000", border:`1px solid rgba(${scr},0.25)`,
                  borderRadius:7, padding:"7px 9px", minHeight:38 }}>
                {newTask.tags.map(tag => {
                  const tc = tagColor(tag);
                  return (
                    <span key={tag} style={{ fontSize:9, padding:"2px 9px", borderRadius:20,
                        background:`${tc}18`, border:`1px solid ${tc}44`, color:tc,
                        display:"flex", alignItems:"center", gap:5 }}>
                      {tag}
                      <button onClick={() => setNewTask(p => ({ ...p, tags:p.tags.filter(t=>t!==tag) }))}
                        style={{ background:"transparent", border:"none", color:tc,
                          cursor:"pointer", fontSize:13, padding:0, lineHeight:1 }}>x</button>
                    </span>
                  );
                })}
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  placeholder={newTask.tags.length===0 ? "design, bug, urgent…" : ""}
                  style={{ flex:1, minWidth:80, background:"transparent", border:"none",
                    color:"#fff", fontSize:11, outline:"none",
                    fontFamily:"'Share Tech Mono',monospace" }}/>
              </div>
            </div>

            {/* Options */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:12,
                background:"#000", padding:10, borderRadius:7,
                border:`1px solid rgba(${scr},0.1)` }}>
              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11,
                  color:`rgba(${scr},0.6)`, cursor:"pointer" }}>
                <input type="checkbox" checked={newTask.isPrivate}
                  onChange={e => setNewTask({...newTask, isPrivate:e.target.checked})}
                  style={{ accentColor:sc, width:13, height:13 }}/>
                Private
              </label>
              {profile.isLeader && (
                <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11,
                    color:"#ff4444", fontWeight:"bold", cursor:"pointer" }}>
                  <input type="checkbox" checked={newTask.deadline}
                    onChange={e => setNewTask({...newTask, deadline:e.target.checked})}
                    style={{ accentColor:"#ff4444", width:13, height:13 }}/>
                  URGENT
                  {newTask.deadline && (
                    <input type="date" value={newTask.dueDate}
                      onChange={e => setNewTask({...newTask, dueDate:e.target.value})}
                      style={{ background:"#ff444415", border:"1px solid #ff444455", color:"#ff4444",
                        padding:"3px 7px", borderRadius:5,
                        fontFamily:"'Share Tech Mono',monospace", fontSize:10 }}/>
                  )}
                </label>
              )}
            </div>

            <Btn onClick={handleAdd}>SUBMIT TASK</Btn>
          </div>
        )}

        {/* ── ADD MEETING FORM ─────────────────────────────────────────────── */}
        {showMtg && (
          <div style={{ background:"#0a0f0a", border:"1px solid #00ccff28",
              borderRadius:10, padding:14, marginBottom:16 }}>
            <div style={{ fontSize:10, color:"#00ccff", letterSpacing:3, marginBottom:10 }}>
              SCHEDULE MEETING
            </div>

            {/* Title */}
            <input value={mtgForm.title}
              onChange={e => setMtgForm({...mtgForm, title:e.target.value})}
              placeholder="Meeting title..."
              style={{ ...inputStyle, borderColor:"#00ccff28" }}/>

            {/* Date + Time row */}
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <div style={{ flex:2 }}>
                <div style={{ fontSize:9, color:"#00ccff55", letterSpacing:2, marginBottom:4 }}>DATE</div>
                <input type="date" value={mtgForm.date}
                  onChange={e => setMtgForm({...mtgForm, date:e.target.value})}
                  style={{ ...inputStyle, borderColor:"#00ccff28", padding:"8px 10px", marginBottom:0 }}/>
                {mtgForm.date && (() => {
                  const cd = meetingCountdown(mtgForm.date);
                  return cd ? (
                    <div style={{ fontSize:9, color:cd.color, marginTop:3 }}>{cd.label} from today</div>
                  ) : null;
                })()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:9, color:"#00ccff55", letterSpacing:2, marginBottom:4 }}>TIME</div>
                <input type="time" value={mtgForm.time}
                  onChange={e => setMtgForm({...mtgForm, time:e.target.value})}
                  style={{ ...inputStyle, borderColor:"#00ccff28", padding:"8px 10px", marginBottom:0 }}/>
              </div>
            </div>

            {/* Type */}
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              {[["online","ONLINE"],["physical","PHYSICAL"]].map(([val,lbl]) => (
                <button key={val} onClick={() => setMtgForm({...mtgForm, type:val})}
                  style={{ flex:1, padding:9, borderRadius:7,
                    background:mtgForm.type===val?"#00ccff18":"transparent",
                    border:`1px solid ${mtgForm.type===val?"#00ccff":"#00ccff28"}`,
                    color:mtgForm.type===val?"#00ccff":"#00ccff44",
                    fontSize:11, fontWeight:"bold", cursor:"pointer",
                    fontFamily:"'Share Tech Mono',monospace" }}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* Place / Link */}
            {mtgForm.type === "physical" && (
              <input value={mtgForm.place}
                onChange={e => setMtgForm({...mtgForm, place:e.target.value})}
                placeholder="Location / venue..."
                style={{ ...inputStyle, borderColor:"#ffaa0028" }}/>
            )}
            {mtgForm.type === "online" && (
              <input value={mtgForm.link}
                onChange={e => setMtgForm({...mtgForm, link:e.target.value})}
                placeholder="https://meet.google.com/... or Zoom link"
                style={{ ...inputStyle, borderColor:"#00ccff28" }}/>
            )}

            {/* Details / Agenda */}
            <div style={{ fontSize:9, color:"#00ccff55", letterSpacing:2, marginBottom:4, marginTop:2 }}>
              DETAILS / AGENDA (optional)
            </div>
            <textarea value={mtgForm.details}
              onChange={e => setMtgForm({...mtgForm, details:e.target.value})}
              rows={2} placeholder="What will be discussed..."
              style={{ ...inputStyle, borderColor:"#00ccff28", resize:"vertical",
                fontFamily:"'Share Tech Mono',monospace", verticalAlign:"top" }}/>

            <button onClick={saveMeeting}
              style={{ width:"100%", padding:10, background:"#00ccff18",
                border:"1px solid #00ccff", borderRadius:7, color:"#00ccff",
                fontSize:12, fontWeight:"bold", letterSpacing:2, cursor:"pointer",
                fontFamily:"'Share Tech Mono',monospace" }}>
              SAVE MEETING
            </button>
          </div>
        )}

        {/* ── WEEKS GRID ───────────────────────────────────────────────────── */}
        <div className="weeks-grid">
          {activeWks.map(w => renderWeek(w, false))}
        </div>

        {doneWks.length > 0 && (
          <>
            <div style={{ margin:"16px 0 10px", textAlign:"center", fontSize:9,
                color:`rgba(${scr},0.22)`, letterSpacing:4 }}>
              COMPLETED WEEKS
            </div>
            <div className="weeks-grid">
              {doneWks.map(w => renderWeek(w, true))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── shared inline styles ────────────────────────────────────────────────────
const inputStyle = {
  width:"100%", background:"#000",
  border:"1px solid rgba(var(--scr),0.22)", borderRadius:7,
  padding:"10px 11px", color:"#fff", fontSize:12, marginBottom:10,
  fontFamily:"'Share Tech Mono',monospace", outline:"none",
};

function btnSm(activeColor, scr) {
  return {
    padding:"5px 12px", borderRadius:6, fontSize:10, cursor:"pointer",
    background:"transparent",
    border: activeColor ? `1px solid ${activeColor}` : `1px solid rgba(${scr},0.2)`,
    color:  activeColor ? activeColor : `rgba(${scr},0.5)`,
    fontFamily:"'Share Tech Mono',monospace",
  };
}

// ── Collapsible note with link support ─────────────────────────────────────
const NOTE_LIMIT = 2; // lines before collapse
function CollapsibleNote({ text }) {
  const [open, setOpen] = useState(false);
  const lines  = text.split("\n");
  const long   = lines.length > NOTE_LIMIT || text.length > 100;
  const shown  = open ? text : lines.slice(0, NOTE_LIMIT).join("\n").slice(0, 100) + (long ? "…" : "");
  const URL_RE = /(https?:\/\/[^\s]+)/g;

  return (
    <div style={{ background:"#00ccff0d", borderLeft:"2px solid #00ccff44",
        borderRadius:"0 7px 7px 0", padding:"7px 10px", fontSize:11 }}>
      <div style={{ fontSize:8, color:"#00ccff66", letterSpacing:2, marginBottom:3 }}>NOTE</div>
      <span style={{ color:"#00ccff", whiteSpace:"pre-wrap", lineHeight:1.55, wordBreak:"break-word" }}>
        {shown.split(URL_RE).map((p, i) =>
          URL_RE.test(p)
            ? <a key={i} href={p} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ color:"#00ccff", textDecoration:"underline" }}>{p}</a>
            : p
        )}
      </span>
      {long && (
        <button onClick={e => { e.stopPropagation(); setOpen(!open); }}
          style={{ display:"block", marginTop:4, background:"transparent", border:"none",
            color:"#00ccff66", fontSize:9, cursor:"pointer",
            fontFamily:"'Share Tech Mono',monospace", padding:0, textDecoration:"underline" }}>
          {open ? "show less" : "show more"}
        </button>
      )}
    </div>
  );
}
