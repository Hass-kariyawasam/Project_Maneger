// src/App.jsx - Team Workspace | DBMS Practicum 2026 | University of Ruhuna
// Made by Hass Kariyawasam
import { useState, useEffect, useRef } from "react";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, getAuth, GoogleAuthProvider,
  signInWithPopup, updatePassword
} from "firebase/auth";
import {
  collection, doc, setDoc, getDoc, getDocs,
  addDoc, onSnapshot, query, orderBy,
  deleteDoc, updateDoc, serverTimestamp, writeBatch, getFirestore
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDFffM51O204gmg3_q4Ngde01wX0SlkNXo",
  authDomain: "project-manager-29381.firebaseapp.com",
  projectId: "project-manager-29381",
  storageBucket: "project-manager-29381.firebasestorage.app",
  messagingSenderId: "17475331699",
  appId: "1:17475331699:web:c7f8153fd1d94025cb2c06"
};
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ---- CONSTANTS -------------------------------------------------------
const TEAM_MEMBERS  = ["Group Leader", "Member 2", "Member 3", "Member 4"];
const MEMBER_COLORS = { "Group Leader": "#00ff88", "Member 2": "#00ccff", "Member 3": "#ffaa00", "Member 4": "#ff66cc" };
const THEME_COLORS  = ["#00ff88", "#00ccff", "#ff00cc", "#ffaa00", "#ccff00", "#b026ff", "#ff4444"];
const INITIAL_TASKS = [
  { id: "t1", week: 1, title: "Install MySQL Server 8.0+",      assignee: "All",          deadline: false },
  { id: "t2", week: 1, title: "Install MySQL Workbench",        assignee: "All",          deadline: false },
  { id: "t3", week: 1, title: "Install VS Code + Extensions",   assignee: "All",          deadline: false },
  { id: "t4", week: 1, title: "Install Git + GitHub Desktop",   assignee: "All",          deadline: false },
  { id: "t5", week: 1, title: "Create GitHub Repo (Private)",   assignee: "Group Leader", deadline: false },
  { id: "t6", week: 1, title: "Read UGC Circular No. 12-2024",  assignee: "All",          deadline: false },
];
const WEEK_INFO = {
  1:{dates:"Feb 23-Mar 1"},2:{dates:"Mar 2-8"},3:{dates:"Mar 9-15"},4:{dates:"Mar 16-22"},
  5:{dates:"Mar 23-29"},6:{dates:"Mar 30-Apr 5"},7:{dates:"Apr 6-13"},8:{dates:"Apr 14-21"},
  9:{dates:"Apr 22-28"},10:{dates:"Apr 29-May 5"},
};
const TABS = [
  { id: "tasks",    label: "TASKS",     icon: "T" },
  { id: "team",     label: "TEAM",      icon: "P" },
  { id: "data",     label: "RESOURCES", icon: "R" },
  { id: "chat",     label: "CHAT",      icon: "C" },
  { id: "quiz",     label: "QUIZ",      icon: "Q" },
  { id: "settings", label: "SETTINGS",  icon: "S" },
];
const TASKS_COL = "tasks", CHAT_COL = "chat", USERS_COL = "users";
const RESOURCES_COL = "resources", WEEK_STATUS_COL = "week_status", QUIZZES_COL = "quizzes";

// ---- SHARED UI -------------------------------------------------------
const GInput = ({ value, onChange, placeholder, type = "text", onKeyDown, disabled = false }) => (
  <input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown}
    placeholder={placeholder} disabled={disabled} className="g-input"
    style={{
      width: "100%", background: disabled ? "#111" : "#0a0f0a",
      borderRadius: 8, padding: "14px 16px", fontSize: 15,
      fontFamily: "'Share Tech Mono',monospace", outline: "none",
      transition: "all 0.3s", opacity: disabled ? 0.6 : 1,
      color: "#ffffff", caretColor: "var(--sc)",
      border: "1px solid rgba(var(--scr),0.3)",
    }}
  />
);
const Btn = ({ onClick, children, style = {} }) => (
  <button onClick={onClick} className="neon-btn"
    style={{ borderRadius: 8, padding: "14px 0", width: "100%", fontSize: 15,
      fontWeight: "bold", letterSpacing: 2, fontFamily: "'Share Tech Mono',monospace",
      cursor: "pointer", transition: "all 0.3s", ...style }}>
    {children}
  </button>
);

// ---- MAIN APP --------------------------------------------------------
export default function App() {
  const [authUser, setAuthUser]   = useState(null);
  const [profile,  setProfile]    = useState(null);
  const [authReady,setAuthReady]  = useState(false);
  const [dbError,  setDbError]    = useState(null);
  const [screen,   setScreen]     = useState("login");
  const [activeTab,setActiveTab]  = useState("tasks");

  // auth form
  const [loginId,    setLoginId]    = useState("");
  const [loginPass,  setLoginPass]  = useState("");
  const [regUser,    setRegUser]    = useState("");
  const [regPass,    setRegPass]    = useState("");
  const [regEmail,   setRegEmail]   = useState("");
  const [regTg,      setRegTg]      = useState("");
  const [regPhone,   setRegPhone]   = useState("");
  const [regRole,    setRegRole]    = useState("Group Leader");
  const [regTeam,    setRegTeam]    = useState("");
  const [regToken,   setRegToken]   = useState("");
  const [regPhoto,   setRegPhoto]   = useState("");
  const [formErr,    setFormErr]    = useState("");
  const [formLoad,   setFormLoad]   = useState(false);

  // profile edit
  const [editData, setEditData] = useState({ phone: "", tgNumber: "", newPassword: "" });

  // data
  const [tasks,       setTasks]       = useState([]);
  const [teamUsers,   setTeamUsers]   = useState([]);
  const [resources,   setResources]   = useState([]);
  const [weekDone,    setWeekDone]    = useState([]);
  const [messages,    setMessages]    = useState([]);
  const [chatMsg,     setChatMsg]     = useState("");
  const chatEndRef = useRef(null);

  // task ui
  const [taskFilter,  setTaskFilter]  = useState("All");
  const [showAdd,     setShowAdd]     = useState(false);
  const [newTask,     setNewTask]     = useState({ title: "", week: 1, assignee: "All", isPrivate: false, deadline: false, dueDate: "" });
  const [editNote,    setEditNote]    = useState(null);
  const [noteText,    setNoteText]    = useState("");

  // resources
  const [resTitle,    setResTitle]    = useState("");
  const [resUrl,      setResUrl]      = useState("");
  const [resNote,     setResNote]     = useState("");
  const [migrating,   setMigrating]   = useState(false);
  const [migrateMsg,  setMigrateMsg]  = useState("");

  // quiz
  const [dbQuizzes,   setDbQuizzes]   = useState([]);
  const [quizActive,  setQuizActive]  = useState(false);
  const [quizQ,       setQuizQ]       = useState(0);
  const [quizScore,   setQuizScore]   = useState(0);
  const [quizAns,     setQuizAns]     = useState(null);
  const [quizDone,    setQuizDone]    = useState(false);
  const [shuffled,    setShuffled]    = useState([]);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [quizTitle,   setQuizTitle]   = useState("");
  const [quizQs,      setQuizQs]      = useState([{ q: "", opt1: "", opt2: "", opt3: "", opt4: "", ans: 0 }]);

  const [toast, setToast] = useState(null);

  // theme
  const sc    = profile?.themeColor || "#00ff88";
  const scr   = (() => { let v = sc.replace("#",""); if(v.length===3)v=v.split("").map(c=>c+c).join(""); return `${parseInt(v.slice(0,2),16)},${parseInt(v.slice(2,4),16)},${parseInt(v.slice(4,6),16)}`; })();

  // ---- AUTH LISTENER -------------------------------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, USERS_COL, user.uid));
          if (snap.exists()) {
            setProfile({ uid: user.uid, ...snap.data() });
            setAuthUser(user); setScreen("app");
          } else {
            setAuthUser(user);
            setRegEmail(user.email || ""); setRegUser(user.displayName || ""); setRegPhoto(user.photoURL || "");
            setScreen("google_onboard");
          }
        } catch { setDbError("Firebase permission denied - check Firestore Rules."); }
      } else { setAuthUser(null); setProfile(null); setScreen("login"); }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // ---- REALTIME LISTENERS --------------------------------------------
  useEffect(() => {
    if (!authUser || !profile) return;
    setDbError(null);
    const err = (e) => { console.error(e); setDbError("Firebase Error: Missing permissions. Update your Firestore Rules."); };

    const u1 = onSnapshot(collection(db, TASKS_COL), snap => {
      const pub = snap.docs.map(d => ({ fsId: d.id, ...d.data() }))
        .filter(t => t.teamId === profile.teamId || !t.teamId)
        .sort((a, b) => (a.week||0)-(b.week||0) || (a.done?1:-1) - (b.done?1:-1) || (b.createdAt?.toMillis()||0)-(a.createdAt?.toMillis()||0));
      setTasks(prev => [...pub, ...prev.filter(t => t.isPrivate)]);
    }, err);
    const u2 = onSnapshot(collection(db, USERS_COL, authUser.uid, "privateTasks"), snap => {
      const priv = snap.docs.map(d => ({ fsId: d.id, ...d.data(), isPrivate: true }));
      setTasks(prev => [...prev.filter(t => !t.isPrivate), ...priv]);
    }, err);
    const u3 = onSnapshot(query(collection(db, CHAT_COL), orderBy("ts")), snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err);
    const u4 = onSnapshot(collection(db, USERS_COL), snap => {
      setTeamUsers(snap.docs.map(d => d.data()).filter(u => u.teamId === profile.teamId));
    }, err);
    const u5 = onSnapshot(collection(db, RESOURCES_COL), snap => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.teamId === profile.teamId));
    }, err);
    const u6 = onSnapshot(collection(db, WEEK_STATUS_COL), snap => {
      setWeekDone(snap.docs.map(d => d.data()).filter(w => w.teamId === profile.teamId && w.done).map(w => w.week));
    }, err);
    const u7 = onSnapshot(collection(db, QUIZZES_COL), snap => {
      setDbQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err);
    return () => [u1,u2,u3,u4,u5,u6,u7].forEach(u => u());
  }, [authUser, profile]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // fallback: scroll the container directly
    const el = document.getElementById("chat-messages");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, activeTab]);
  useEffect(() => { if (activeTab === "settings" && profile) setEditData({ phone: profile.phone||"", tgNumber: profile.tgNumber||"", newPassword: "" }); }, [activeTab]);

  // ---- HELPERS -------------------------------------------------------
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };
  const fmtDate = (ts) => { if (!ts?.toDate) return ""; return ts.toDate().toLocaleString([], { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }); };
  const urgentStatus = (dueDate) => {
    if (!dueDate) return { color: "#ff4444", text: "Urgent", glow: "0 0 15px #ff444466" };
    const d = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
    if (d > 5)  return { color: sc,      text: `${d} days left`,  glow: `0 0 10px rgba(${scr},0.4)` };
    if (d >= 2) return { color: "#ffaa00", text: `${d} days left`,  glow: "0 0 15px #ffaa0066" };
    if (d >= 0) return { color: "#ff4444", text: `${d} days left!`, glow: "0 0 20px #ff444499" };
    return            { color: "#ff0044", text: "OVERDUE!",         glow: "0 0 25px #ff0044aa" };
  };

  // ---- AUTH ----------------------------------------------------------
  async function doGoogleLogin() {
    setFormErr(""); setFormLoad(true);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch(e) { setFormErr("Google login failed: " + e.message); }
    setFormLoad(false);
  }
  async function cancelGoogle() { await signOut(auth); setScreen("login"); }

  async function doRegister(isOnboard = false) {
    setFormErr(""); setFormLoad(true);
    const isLeader = regRole === TEAM_MEMBERS[0];
    if (!regUser.trim() || regUser.length < 3) { setFormErr("Username must be at least 3 characters"); setFormLoad(false); return; }
    if (!isOnboard && regPass.length < 4) { setFormErr("Password must be at least 4 characters"); setFormLoad(false); return; }
    if (!regEmail.includes("@")) { setFormErr("Enter a valid email"); setFormLoad(false); return; }
    if (!regTg.trim()) { setFormErr("Telegram number is required"); setFormLoad(false); return; }
    if (!regPhone.trim()) { setFormErr("Phone number is required"); setFormLoad(false); return; }
    let foundTeamId = null, foundTeamName = null;
    try {
      const snap = await getDocs(collection(db, USERS_COL));
      if (!isLeader) {
        if (!regToken.trim()) { setFormErr("Ask your Group Leader for the secret token!"); setFormLoad(false); return; }
        const ld = snap.docs.find(d => d.data().teamToken === regToken.trim());
        if (!ld) { setFormErr("Invalid secret token!"); setFormLoad(false); return; }
        foundTeamId = ld.data().teamId; foundTeamName = ld.data().teamName;
      } else {
        if (!regTeam.trim()) { setFormErr("Enter your team name"); setFormLoad(false); return; }
        if (!regToken.trim()) { setFormErr("Create a secret token for your members"); setFormLoad(false); return; }
      }
      if (snap.docs.some(d => d.data().username === regUser.trim() && d.id !== authUser?.uid)) { setFormErr("Username already taken!"); setFormLoad(false); return; }
      const uid = isOnboard ? authUser.uid : (await createUserWithEmailAndPassword(auth, regEmail.trim(), regPass)).user.uid;
      const p = { username: regUser.trim(), email: regEmail.trim(), tgNumber: regTg.trim(), phone: regPhone.trim(),
        role: regRole, color: MEMBER_COLORS[regRole] || sc, themeColor: sc,
        teamId: isLeader ? uid : foundTeamId, teamName: isLeader ? regTeam.trim() : foundTeamName, photoURL: regPhoto };
      if (isLeader) p.teamToken = regToken.trim();
      await setDoc(doc(db, USERS_COL, uid), p);
      if (isOnboard) { setProfile({ uid, ...p }); setScreen("app"); }
      showToast("Account created!");
    } catch(e) { setFormErr("Error: " + (e.code === "auth/email-already-in-use" ? "Email already in use." : e.message)); }
    setFormLoad(false);
  }

  async function doLogin() {
    setFormErr(""); setFormLoad(true);
    try {
      let email = loginId.trim();
      if (!email.includes("@")) {
        const snap = await getDocs(collection(db, USERS_COL));
        const found = snap.docs.find(d => d.data().username === email);
        if (found) email = found.data().email;
        else { setFormErr("ACCESS DENIED: Username not found."); setFormLoad(false); return; }
      }
      await signInWithEmailAndPassword(auth, email, loginPass);
    } catch { setFormErr("ACCESS DENIED: Incorrect username or password."); }
    setFormLoad(false);
  }
  async function doLogout() { await signOut(auth); setTasks([]); setMessages([]); setTeamUsers([]); }

  // ---- PROFILE -------------------------------------------------------
  async function saveProfile() {
    setFormLoad(true);
    try {
      const upd = { phone: editData.phone, tgNumber: editData.tgNumber };
      await updateDoc(doc(db, USERS_COL, profile.uid), upd);
      if (editData.newPassword.trim().length >= 4) { await updatePassword(authUser, editData.newPassword.trim()); showToast("Profile & password updated!"); }
      else showToast("Profile updated!");
      setProfile({ ...profile, ...upd });
    } catch(e) { showToast("Error: " + e.message); }
    setFormLoad(false);
  }
  async function updateTheme(c) {
    try { await updateDoc(doc(db, USERS_COL, profile.uid), { themeColor: c }); setProfile({ ...profile, themeColor: c }); showToast("Theme updated!"); }
    catch { showToast("Failed to save theme."); }
  }

  // ---- TASKS ---------------------------------------------------------
  async function addTask() {
    if (!newTask.title.trim()) return;
    const base = { ...newTask, done: false, note: "", createdBy: profile.username, createdAt: serverTimestamp(), teamId: profile.teamId };
    try {
      if (newTask.isPrivate) await addDoc(collection(db, USERS_COL, authUser.uid, "privateTasks"), base);
      else await addDoc(collection(db, TASKS_COL), base);
      setNewTask({ title: "", week: 1, assignee: "All", isPrivate: false, deadline: false, dueDate: "" });
      setShowAdd(false); showToast("Task added!");
    } catch(e) { showToast("Error: " + e.message); }
  }
  async function toggleDone(task) {
    const done = !task.done;
    const upd = { done, completedAt: done ? serverTimestamp() : null };
    try {
      if (task.isPrivate) await updateDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId), upd);
      else await updateDoc(doc(db, TASKS_COL, task.fsId), upd);
    } catch(e) { showToast("Error: " + e.message); }
  }
  async function saveNote(task) {
    try {
      if (task.isPrivate) await updateDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId), { note: noteText });
      else await updateDoc(doc(db, TASKS_COL, task.fsId), { note: noteText });
      setEditNote(null); setNoteText(""); showToast("Note saved!");
    } catch(e) { showToast("Error: " + e.message); }
  }
  async function deleteTask(task) {
    if (!window.confirm("Delete this task?")) return;
    try {
      if (task.isPrivate) await deleteDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId));
      else await deleteDoc(doc(db, TASKS_COL, task.fsId));
      showToast("Task deleted.");
    } catch(e) { showToast("Error: " + e.message); }
  }
  async function toggleWeekDone(week) {
    if (profile.role !== "Group Leader") return;
    const done = weekDone.includes(week);
    const ref = doc(db, WEEK_STATUS_COL, `${profile.teamId}_${week}`);
    try {
      if (done) { await deleteDoc(ref); showToast(`Week ${week} reopened`); }
      else { await setDoc(ref, { done: true, teamId: profile.teamId, week }); showToast(`Week ${week} marked complete!`); }
    } catch(e) { showToast("Error: " + e.message); }
  }

  // ---- RESOURCES -----------------------------------------------------
  async function addResource() {
    if (!resTitle.trim() || !resUrl.trim()) return;
    setFormLoad(true);
    try {
      await addDoc(collection(db, RESOURCES_COL), { title: resTitle, url: resUrl, note: resNote, addedBy: profile.username, teamId: profile.teamId, ts: serverTimestamp() });
      setResTitle(""); setResUrl(""); setResNote(""); showToast("Resource added!");
    } catch(e) { showToast("Error: " + e.message); }
    setFormLoad(false);
  }
  async function deleteResource(id) {
    try { await deleteDoc(doc(db, RESOURCES_COL, id)); showToast("Resource deleted!"); } catch(e) { showToast("Error: " + e.message); }
  }
  async function seedTasks() {
    setMigrating(true); setMigrateMsg("Seeding default tasks...");
    try {
      const batch = writeBatch(db);
      INITIAL_TASKS.forEach(t => batch.set(doc(collection(db, TASKS_COL)), { ...t, done: false, note: "", createdBy: profile.username, createdAt: serverTimestamp(), teamId: profile.teamId }));
      await batch.commit(); setMigrateMsg("Done! " + INITIAL_TASKS.length + " tasks added.");
    } catch(e) { setMigrateMsg("Error: " + e.message); }
    setMigrating(false);
  }
  async function deleteAllTasks() {
    if (!window.confirm("Delete ALL tasks for your team?")) return;
    setMigrating(true); setMigrateMsg("Deleting...");
    try {
      const snap = await getDocs(collection(db, TASKS_COL));
      const batch = writeBatch(db); let n = 0;
      snap.docs.forEach(d => { if (d.data().teamId === profile.teamId) { batch.delete(d.ref); n++; } });
      await batch.commit(); setMigrateMsg("Done! " + n + " tasks deleted.");
    } catch(e) { setMigrateMsg("Error: " + e.message); }
    setMigrating(false);
  }

  // ---- CHAT ----------------------------------------------------------
  async function sendMsg() {
    if (!chatMsg.trim()) return;
    try {
      await addDoc(collection(db, CHAT_COL), { user: profile.username, color: profile.color, photoURL: profile.photoURL||"", teamName: profile.teamName||"Unknown", text: chatMsg.trim(), time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), ts: serverTimestamp(), teamId: profile.teamId });
      setChatMsg("");
    } catch(e) { showToast("Error: " + e.message); }
  }

  // ---- QUIZ ----------------------------------------------------------
  function changeQ(i, f, v) { const a = [...quizQs]; a[i][f] = v; setQuizQs(a); }
  async function saveQuiz() {
    if (!quizTitle.trim()) { showToast("Title is required!"); return; }
    if (!quizQs.every(q => q.q && q.opt1 && q.opt2 && q.opt3 && q.opt4)) { showToast("Fill all fields!"); return; }
    setFormLoad(true);
    try {
      await addDoc(collection(db, QUIZZES_COL), { title: quizTitle, questions: quizQs.map(q => ({ q: q.q, opts: [q.opt1,q.opt2,q.opt3,q.opt4], ans: Number(q.ans) })), addedBy: profile.username, ts: serverTimestamp() });
      setQuizTitle(""); setQuizQs([{ q:"",opt1:"",opt2:"",opt3:"",opt4:"",ans:0 }]); setShowAddQuiz(false); showToast("Quiz saved!");
    } catch(e) { showToast("Error: " + e.message); }
    setFormLoad(false);
  }
  function startQuiz(qz) {
    const arr = qz ? qz.questions : (dbQuizzes[0]?.questions || []);
    if (!arr.length) { showToast("No questions in this set."); return; }
    const q = [...arr].sort(() => Math.random() - 0.5);
    setShuffled(q); setQuizQ(0); setQuizScore(0); setQuizAns(null); setQuizDone(false); setQuizActive(true);
  }
  function answerQuiz(i) {
    if (quizAns !== null) return;
    setQuizAns(i);
    if (i === shuffled[quizQ].ans) setQuizScore(s => s + 1);
    setTimeout(() => { if (quizQ + 1 >= shuffled.length) setQuizDone(true); else { setQuizQ(q => q + 1); setQuizAns(null); } }, 1200);
  }

  // ---- DERIVED -------------------------------------------------------
  const pubTasks    = tasks.filter(t => !t.isPrivate);
  const totalDone   = pubTasks.filter(t => t.done).length;
  const pct         = pubTasks.length ? Math.round(totalDone / pubTasks.length * 100) : 0;
  const urgentTasks = pubTasks.filter(t => t.deadline && !t.done);
  const visible     = tasks.filter(t => {
    if (t.isPrivate && t.createdBy !== profile?.username) return false;
    if (taskFilter === "MY") return t.assignee === profile?.role || t.assignee === profile?.username || t.createdBy === profile?.username;
    return true;
  });
  const allWeeks  = [...new Set(visible.map(t => t.week))].sort((a,b) => a-b);
  const activeWks = allWeeks.filter(w => !weekDone.includes(w));
  const doneWks   = allWeeks.filter(w =>  weekDone.includes(w));
  const userStats = teamUsers.map(u => {
    const ut = pubTasks.filter(t => t.assignee === u.role || t.assignee === "All" || t.assignee === u.username);
    return { ...u, doneCount: ut.filter(t => t.done).length, totalCount: ut.length, points: ut.filter(t => t.done).length * 10 };
  }).sort((a,b) => b.points - a.points);

  // ---- CSS -----------------------------------------------------------
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; background: #030503; }
    .g-input::placeholder { color: rgba(255,255,255,0.3) !important; }
    .g-input:focus { border-color: var(--sc) !important; box-shadow: 0 0 12px rgba(var(--scr),0.3) !important; outline: none; }
    .neon-btn { background: rgba(var(--scr),0.13) !important; border: 1px solid var(--sc) !important; color: var(--sc) !important; box-shadow: 0 0 10px rgba(var(--scr),0.2) !important; }
    .neon-btn:hover { background: rgba(var(--scr),0.25) !important; box-shadow: 0 0 22px var(--sc) !important; }
    select option { background: #0a0f0a; color: #fff; }
    ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #030503; } ::-webkit-scrollbar-thumb { background: rgba(var(--scr),0.3); border-radius: 4px; }
    @keyframes glow-pulse { 0%,100% { text-shadow: 0 0 5px var(--sc); } 50% { text-shadow: 0 0 20px #fff, 0 0 30px var(--sc); } }
    @keyframes glitch1 { 0%,100% { clip-path:inset(0 0 95% 0); transform:translate(-3px) } 50% { clip-path:inset(40% 0 40% 0); transform:translate(3px) } }
    @keyframes glitch2 { 0%,100% { clip-path:inset(80% 0 5% 0); transform:translate(3px) } 50% { clip-path:inset(10% 0 70% 0); transform:translate(-3px) } }
    @keyframes ring-pulse { 0% { transform:scale(1); opacity:.8; } 100% { transform:scale(1.6); opacity:0; } }
    @keyframes bar-scan { 0% { width:0%; } 100% { width:100%; } }
    @keyframes toast-in { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
    @keyframes spin-ring { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
    @keyframes spin-ring2 { 0% { transform:rotate(0deg); } 100% { transform:rotate(-360deg); } }
    @keyframes core-pulse { 0%,100% { box-shadow:0 0 20px #00ff88, inset 0 0 15px #00ff8833; } 50% { box-shadow:0 0 50px #00ff88, 0 0 80px #00ff8844, inset 0 0 25px #00ff8855; } }
    @keyframes scan-line { 0% { top:0%; opacity:0.7; } 100% { top:100%; opacity:0; } }
    @keyframes matrix-fade { 0% { opacity:0; transform:translateY(-10px); } 100% { opacity:1; transform:translateY(0); } }
    @keyframes flicker { 0%,95%,100% { opacity:1; } 96%,99% { opacity:0.4; } }
    .glow-anim { animation: glow-pulse 3s ease-in-out infinite; }
    .glitch { position:relative; }
    .glitch::before { content:attr(data-text); position:absolute; left:0; top:0; color:#ff00cc; animation:glitch1 2s infinite steps(1); }
    .glitch::after  { content:attr(data-text); position:absolute; left:0; top:0; color:#00ccff; animation:glitch2 2s infinite steps(1) reverse; }
    .spin-r  { animation:spin-ring  3s linear infinite; }
    .spin-r2 { animation:spin-ring2 2s linear infinite; }
    .core-p  { animation:core-pulse 2s ease-in-out infinite; }
    .flicker { animation:flicker 4s ease-in-out infinite; }
  `;

  // ---- LOADING SCREEN ------------------------------------------------
  if (!authReady) return (
    <div style={{ background:"#000", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Share Tech Mono',monospace", position:"relative", overflow:"hidden" }}>
      <style>{CSS}</style>
      {/* Grid background */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(0,255,136,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.04) 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }} />
      {/* Scanning line */}
      <div style={{ position:"absolute", left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#00ff88,transparent)", animation:"scan-line 2.5s linear infinite", pointerEvents:"none" }} />
      {/* Content */}
      <div style={{ textAlign:"center", position:"relative", zIndex:10 }}>
        {/* Multi-ring spinner */}
        <div style={{ position:"relative", width:140, height:140, margin:"0 auto 36px" }}>
          {/* Outer ring - spins CW */}
          <div className="spin-r" style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid transparent", borderTop:"2px solid #00ff88", borderRight:"2px solid #00ff8844" }} />
          {/* Mid ring - spins CCW */}
          <div className="spin-r2" style={{ position:"absolute", inset:16, borderRadius:"50%", border:"2px solid transparent", borderTop:"2px solid #00ccff", borderLeft:"2px solid #00ccff44" }} />
          {/* Inner ring - spins CW slower */}
          <div style={{ position:"absolute", inset:32, borderRadius:"50%", border:"1px solid #00ff8833", animation:"spin-ring 5s linear infinite" }} />
          {/* Core */}
          <div className="core-p" style={{ position:"absolute", inset:44, borderRadius:"50%", background:"radial-gradient(circle,#0d2d1a,#030503)", border:"2px solid #00ff88", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"'Orbitron',monospace", fontWeight:900, fontSize:16, color:"#00ff88" }}>TW</span>
          </div>
          {/* Corner dots */}
          {[0,90,180,270].map(deg=>(
            <div key={deg} style={{ position:"absolute", width:6, height:6, borderRadius:"50%", background:"#00ff88", top:"50%", left:"50%", transform:`rotate(${deg}deg) translateX(64px) translateY(-50%)`, boxShadow:"0 0 6px #00ff88", animation:`core-pulse 2s ease-in-out ${deg/360}s infinite` }} />
          ))}
        </div>
        {/* Title with glitch */}
        <div style={{ marginBottom:8 }}>
          <div className="glitch flicker" data-text="TEAM WORKSPACE" style={{ fontSize:28, letterSpacing:8, color:"#fff", fontFamily:"'Orbitron',monospace", fontWeight:900, textShadow:"0 0 20px #00ff8888" }}>TEAM WORKSPACE</div>
        </div>
        <div style={{ fontSize:11, color:"#00ff88", letterSpacing:3, marginBottom:28, animation:"matrix-fade 0.6s ease both" }}>INITIALIZING SYSTEM...</div>
        {/* Progress bar */}
        <div style={{ width:300, height:3, background:"#0a1a0a", borderRadius:4, margin:"0 auto 12px", overflow:"hidden", border:"1px solid #00ff8822" }}>
          <div style={{ height:"100%", background:"linear-gradient(90deg,#00ff88,#00ccff,#00ff88)", backgroundSize:"200% 100%", animation:"bar-scan 1.4s linear infinite", boxShadow:"0 0 10px #00ff88" }} />
        </div>
        {/* Status lines */}
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#00ff8877", letterSpacing:2, lineHeight:2 }}>
          <div style={{ animation:"matrix-fade 0.4s ease 0.1s both" }}>CONNECTING TO FIREBASE...</div>
          <div style={{ animation:"matrix-fade 0.4s ease 0.5s both", color:"#00ccff77" }}>LOADING USER DATA...</div>
          <div style={{ animation:"matrix-fade 0.4s ease 0.9s both" }}>MADE BY HASS KARIYAWASAM</div>
        </div>
        <div style={{ fontSize:9, color:"#00ff8833", marginTop:14, letterSpacing:2 }}>DBMS PRACTICUM 2026 // UNIVERSITY OF RUHUNA</div>
      </div>
    </div>
  );

  // ---- AUTH FORM SHARED STYLES ---------------------------------------
  const authWrap = {
    background:"#030503", minHeight:"100vh", display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center", fontFamily:"'Share Tech Mono',monospace",
    padding:20, "--sc": sc, "--scr": scr,
  };
  const card = { width:"100%", maxWidth:450, background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:16, padding:30, boxShadow:`0 10px 30px rgba(${scr},0.1)` };

  // ---- GOOGLE ONBOARD ------------------------------------------------
  if (screen === "google_onboard") return (
    <div style={authWrap}>
      <style>{CSS}</style>
      <div style={card}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          {regPhoto ? <img src={regPhoto} alt="p" style={{ width:60, height:60, borderRadius:30, border:`2px solid ${sc}`, marginBottom:10 }} /> : <div style={{ fontSize:40, marginBottom:10 }}>?</div>}
          <div style={{ fontSize:18, color:sc, letterSpacing:1 }}>COMPLETE YOUR PROFILE</div>
          <div style={{ fontSize:12, color:`rgba(${scr},0.4)`, marginTop:4 }}>A few more details to set up your workspace.</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:5 }}>USERNAME</div><GInput value={regUser} onChange={e=>setRegUser(e.target.value)} placeholder="Your name..." /></div>
            <div style={{ flex:1 }}><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:5 }}>PHONE *</div><GInput value={regPhone} onChange={e=>setRegPhone(e.target.value)} placeholder="07X..." /></div>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:5 }}>EMAIL</div><GInput type="email" value={regEmail} disabled={true} /></div>
            <div style={{ flex:1 }}><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:5 }}>TELEGRAM *</div><GInput value={regTg} onChange={e=>setRegTg(e.target.value)} placeholder="TG/..." /></div>
          </div>
          <div>
            <div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:6 }}>TEAM ROLE</div>
            <select value={regRole} onChange={e=>setRegRole(e.target.value)} className="g-input" style={{ width:"100%", background:"#0a0f0a", borderRadius:8, padding:"13px 14px", color:"#fff", fontFamily:"'Share Tech Mono',monospace", border:`1px solid rgba(${scr},0.3)` }}>
              {TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          {regRole === "Group Leader" ? (
            <div style={{ background:`rgba(${scr},0.05)`, padding:14, borderRadius:8, border:`1px solid rgba(${scr},0.2)` }}>
              <div style={{ marginBottom:10 }}><div style={{ fontSize:11, color:"#fff", marginBottom:5 }}>TEAM NAME</div><GInput value={regTeam} onChange={e=>setRegTeam(e.target.value)} placeholder="Team name..." /></div>
              <div><div style={{ fontSize:11, color:"#ffaa00", marginBottom:5 }}>CREATE SECRET TOKEN</div><GInput type="password" value={regToken} onChange={e=>setRegToken(e.target.value)} placeholder="e.g. 1234" /></div>
            </div>
          ) : (
            <div style={{ background:"#ffaa0011", padding:14, borderRadius:8, border:"1px solid #ffaa0044" }}>
              <div style={{ fontSize:11, color:"#ffaa00", marginBottom:5 }}>SECRET TOKEN FROM YOUR LEADER</div>
              <GInput type="password" value={regToken} onChange={e=>setRegToken(e.target.value)} placeholder="Secret token..." />
            </div>
          )}
          {formErr && <div style={{ color:"#ff4444", fontSize:13, padding:"10px", background:"#ff000022", border:"1px solid #ff444455", borderRadius:8 }}>{formErr}</div>}
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>doRegister(true)} style={{ flex:2 }}>{formLoad ? "SAVING..." : "COMPLETE SETUP"}</Btn>
            <button onClick={cancelGoogle} style={{ flex:1, background:"transparent", border:"1px solid #ff444444", color:"#ff4444", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- LOGIN / REGISTER ----------------------------------------------
  if (screen === "login" || screen === "register") return (
    <div style={authWrap}>
      <style>{CSS}</style>
      <div style={{ width:"100%", maxWidth:450 }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:70, height:70, border:`3px solid ${sc}`, borderRadius:16, marginBottom:14, background:"#0a0f0a", fontSize:20, color:sc, fontFamily:"'Orbitron',monospace", fontWeight:900, boxShadow:`0 0 20px rgba(${scr},0.4)` }}>TW</div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:24, color:"#fff", letterSpacing:3 }}>TEAM WORKSPACE</div>
          <div className="glow-anim" style={{ fontSize:11, color:sc, marginTop:10, letterSpacing:2 }}>MADE BY HASS KARIYAWASAM</div>
          <div style={{ fontSize:9, color:`rgba(${scr},0.4)`, marginTop:4, letterSpacing:1 }}>DBMS PRACTICUM 2026 // UNIVERSITY OF RUHUNA</div>
        </div>
        <div style={card}>
          {/* Tab */}
          <div style={{ display:"flex", background:"#000", borderRadius:10, padding:5, marginBottom:18, border:`1px solid rgba(${scr},0.13)` }}>
            {["login","register"].map(s=>(
              <button key={s} onClick={()=>{setScreen(s);setFormErr("");}} style={{ flex:1, padding:"11px 0", background:screen===s?`rgba(${scr},0.13)`:"transparent", border:"none", color:screen===s?sc:`rgba(${scr},0.4)`, fontSize:13, fontWeight:"bold", letterSpacing:2, borderRadius:6, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
                {s==="login" ? "[ LOGIN ]" : "[ REGISTER ]"}
              </button>
            ))}
          </div>
          {/* Google */}
          <div style={{ marginBottom:18 }}>
            <button onClick={doGoogleLogin} style={{ width:"100%", padding:13, background:"#fff", color:"#000", border:"none", borderRadius:8, fontSize:14, fontWeight:"bold", display:"flex", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer" }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width:18 }} />
              Continue with Google
            </button>
            <div style={{ textAlign:"center", margin:"14px 0", color:`rgba(${scr},0.33)`, fontSize:11, letterSpacing:1 }}>OR WITH EMAIL</div>
          </div>
          {screen === "login" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:6 }}>USERNAME OR EMAIL</div><GInput value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="Enter username or email..." /></div>
              <div><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:6 }}>PASSWORD</div><GInput type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Enter password..." /></div>
              {formErr && <div style={{ color:"#ff4444", fontSize:13, padding:"9px 13px", background:"#ff000022", border:"1px solid #ff444455", borderRadius:8 }}>{formErr}</div>}
              <Btn onClick={doLogin}>{formLoad ? "CONNECTING..." : "ENTER SYSTEM"}</Btn>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1 }}><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:5 }}>USERNAME</div><GInput value={regUser} onChange={e=>setRegUser(e.target.value)} placeholder="Name..." /></div>
                <div style={{ flex:1 }}><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:5 }}>PASSWORD</div><GInput type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="4+ chars..." /></div>
              </div>
              <div><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:5 }}>PHONE *</div><GInput value={regPhone} onChange={e=>setRegPhone(e.target.value)} placeholder="07X..." /></div>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1 }}><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:5 }}>EMAIL</div><GInput type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="Email..." /></div>
                <div style={{ flex:1 }}><div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:5 }}>TELEGRAM *</div><GInput value={regTg} onChange={e=>setRegTg(e.target.value)} placeholder="TG/..." /></div>
              </div>
              <div>
                <div style={{ fontSize:11, color:`rgba(${scr},0.7)`, marginBottom:6 }}>TEAM ROLE</div>
                <select value={regRole} onChange={e=>setRegRole(e.target.value)} className="g-input" style={{ width:"100%", background:"#0a0f0a", borderRadius:8, padding:"13px 14px", color:"#fff", fontFamily:"'Share Tech Mono',monospace", border:`1px solid rgba(${scr},0.3)` }}>
                  {TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              {regRole === "Group Leader" ? (
                <div style={{ background:`rgba(${scr},0.05)`, padding:14, borderRadius:8, border:`1px solid rgba(${scr},0.2)` }}>
                  <div style={{ marginBottom:10 }}><div style={{ fontSize:11, color:"#fff", marginBottom:5 }}>TEAM NAME</div><GInput value={regTeam} onChange={e=>setRegTeam(e.target.value)} placeholder="Team name..." /></div>
                  <div><div style={{ fontSize:11, color:"#ffaa00", marginBottom:5 }}>CREATE SECRET TOKEN</div><GInput type="password" value={regToken} onChange={e=>setRegToken(e.target.value)} placeholder="e.g. 1234" /></div>
                </div>
              ) : (
                <div style={{ background:"#ffaa0011", padding:14, borderRadius:8, border:"1px solid #ffaa0044" }}>
                  <div style={{ fontSize:11, color:"#ffaa00", marginBottom:5 }}>SECRET TOKEN FROM YOUR LEADER</div>
                  <GInput type="password" value={regToken} onChange={e=>setRegToken(e.target.value)} placeholder="Secret token..." />
                </div>
              )}
              {formErr && <div style={{ color:"#ff4444", fontSize:13, padding:"10px", background:"#ff000022", border:"1px solid #ff444455", borderRadius:8 }}>{formErr}</div>}
              <Btn onClick={()=>doRegister(false)}>{formLoad ? "CREATING..." : "CREATE WORKSPACE"}</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ---- TASK WEEK RENDERER -------------------------------------------
  const renderWeek = (week, isDoneSection) => {
    const wt = visible.filter(t => t.week === week);
    const wd = wt.filter(t => t.done).length;
    if (!wt.length) return null;
    return (
      <div key={week} style={{ marginBottom:22, opacity:isDoneSection?0.6:1, transition:"all 0.3s" }}>
        {/* Week header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10, background:isDoneSection?`rgba(${scr},0.07)`:"transparent", padding:isDoneSection?"10px":"0", borderRadius:8 }}>
          <div style={{ fontSize:15, color:sc, letterSpacing:2, fontFamily:"'Orbitron',monospace", flexShrink:0 }}>WEEK {week}</div>
          <div style={{ fontSize:11, color:`rgba(${scr},0.4)` }}>{WEEK_INFO[week]?.dates}</div>
          <div style={{ flex:1, height:2, background:`rgba(${scr},0.13)` }} />
          <div style={{ fontSize:11, color:wd===wt.length?sc:`rgba(${scr},0.67)`, fontWeight:"bold" }}>{wd}/{wt.length} DONE</div>
          {profile.role === "Group Leader" && (
            <button onClick={()=>toggleWeekDone(week)} style={{ padding:"5px 11px", background:isDoneSection?"#ffaa0022":`rgba(${scr},0.13)`, border:`1px solid ${isDoneSection?"#ffaa00":sc}`, borderRadius:6, color:isDoneSection?"#ffaa00":sc, fontSize:10, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>
              {isDoneSection ? "REOPEN" : "MARK WEEK DONE"}
            </button>
          )}
        </div>
        {/* Task cards */}
        {wt.map(task => {
          const isUrgent = task.deadline && !task.done;
          const canDel = profile.role === "Group Leader" || task.createdBy === profile.username;
          const us = isUrgent ? urgentStatus(task.dueDate) : null;
          return (
            <div key={task.fsId||task.id} style={{ background:"#0a0f0a", border:`1px solid ${isUrgent?us.color:task.isPrivate?"#ffaa0033":`rgba(${scr},0.13)`}`, boxShadow:isUrgent?us.glow:"none", borderRadius:10, padding:16, marginBottom:10, transition:"all 0.3s" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                {/* Checkbox */}
                <button onClick={()=>toggleDone(task)} style={{ width:26, height:26, borderRadius:8, flexShrink:0, marginTop:2, cursor:"pointer", border:`2px solid ${task.done?sc:isUrgent?us.color:`rgba(${scr},0.27)`}`, background:task.done?sc:"#030503", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                  {task.done && <span style={{ color:"#000", fontSize:14, fontWeight:"bold" }}>v</span>}
                </button>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
                    {isUrgent && <span style={{ color:us.color, fontSize:11, fontWeight:"bold", padding:"2px 8px", background:`${us.color}22`, borderRadius:12 }}>! {us.text}</span>}
                    {task.isPrivate && <span style={{ fontSize:10, padding:"2px 8px", background:"#ffaa0022", border:"1px solid #ffaa0044", borderRadius:20, color:"#ffaa00" }}>PRIVATE</span>}
                    <span style={{ fontSize:15, color:task.done?`rgba(${scr},0.27)`:isUrgent?"#fff":sc, textDecoration:task.done?"line-through":"none", wordBreak:"break-word" }}>{task.title}</span>
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, padding:"3px 11px", borderRadius:20, background:(MEMBER_COLORS[task.assignee]||sc)+"22", border:`1px solid ${(MEMBER_COLORS[task.assignee]||sc)}44`, color:MEMBER_COLORS[task.assignee]||sc, fontWeight:"bold" }}>{task.assignee}</span>
                  </div>
                  <div style={{ fontSize:10, color:`rgba(${scr},0.4)`, marginTop:8, display:"flex", gap:12, flexWrap:"wrap" }}>
                    <span>Added by: <strong style={{ color:`rgba(${scr},0.67)` }}>{task.createdBy}</strong></span>
                    {task.createdAt && <span>Time: {fmtDate(task.createdAt)}</span>}
                    {task.done && task.completedAt && <span style={{ color:"#00ccffaa" }}>Completed: {fmtDate(task.completedAt)}</span>}
                  </div>
                  {editNote === (task.fsId||task.id) && (
                    <div style={{ marginTop:12 }}>
                      <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3} placeholder="Write a note..."
                        style={{ width:"100%", background:"#000", border:`1px solid ${sc}`, borderRadius:8, padding:12, color:"#fff", fontSize:13, resize:"vertical", fontFamily:"'Share Tech Mono',monospace", outline:"none" }} />
                      <div style={{ display:"flex", gap:10, marginTop:8 }}>
                        <button onClick={()=>saveNote(task)} style={{ padding:"7px 14px", background:`rgba(${scr},0.13)`, border:`1px solid ${sc}`, borderRadius:6, color:sc, fontSize:12, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>SAVE NOTE</button>
                        <button onClick={()=>{setEditNote(null);setNoteText("");}} style={{ padding:"7px 14px", background:"transparent", border:`1px solid rgba(${scr},0.27)`, borderRadius:6, color:`rgba(${scr},0.53)`, fontSize:12, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>CANCEL</button>
                      </div>
                    </div>
                  )}
                  {task.note && editNote !== (task.fsId||task.id) && (
                    <div style={{ marginTop:10, fontSize:12, color:"#00ccff", background:"#00ccff11", borderLeft:"3px solid #00ccff55", padding:"9px 13px", borderRadius:"0 8px 8px 0", whiteSpace:"pre-wrap" }}>
                      NOTE: {task.note}
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button onClick={()=>{setEditNote(task.fsId||task.id);setNoteText(task.note||"");}} style={{ background:"transparent", border:`1px solid rgba(${scr},0.2)`, borderRadius:6, color:`rgba(${scr},0.67)`, fontSize:11, padding:"7px 10px", cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>NOTE</button>
                  {canDel && <button onClick={()=>deleteTask(task)} style={{ background:"transparent", border:"1px solid #ff444433", borderRadius:6, color:"#ff4444aa", fontSize:11, padding:"7px 10px", cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>DEL</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ---- MAIN APP SHELL -----------------------------------------------
  return (
    <div style={{ background:"#030503", minHeight:"100vh", fontFamily:"'Share Tech Mono',monospace", color:sc, display:"flex", flexDirection:"column", "--sc":sc, "--scr":scr }}>
      <style>{CSS}</style>

      {/* HEADER */}
      <div style={{ background:"#0a0f0a", borderBottom:`1px solid rgba(${scr},0.2)`, padding:"13px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:200, flexShrink:0 }}>
        <div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:17, color:"#fff", letterSpacing:2 }}>{profile.teamName || "TEAM WORKSPACE"}</div>
          <div style={{ fontSize:9, color:`rgba(${scr},0.5)`, marginTop:3, letterSpacing:1 }}>DBMS PRACTICUM 2026 // UNIVERSITY OF RUHUNA</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, color:profile.color, fontWeight:"bold" }}>{profile.username}</div>
            <div style={{ fontSize:9, color:`rgba(${scr},0.4)`, marginTop:2 }}>PROGRESS: {pct}%</div>
          </div>
          <div onClick={()=>setActiveTab("settings")} style={{ cursor:"pointer" }}>
            {profile.photoURL
              ? <img src={profile.photoURL} alt="p" style={{ width:34, height:34, borderRadius:10, border:`2px solid ${sc}` }} />
              : <div style={{ width:34, height:34, borderRadius:10, background:`rgba(${scr},0.2)`, border:`2px solid ${sc}`, display:"flex", alignItems:"center", justifyContent:"center", color:sc, fontSize:16, fontWeight:"bold" }}>{profile.username[0].toUpperCase()}</div>}
          </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{ height:3, background:"#0a0f0a", flexShrink:0 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${sc},#00ccff)`, transition:"width 0.8s ease-out", boxShadow:`0 0 12px ${sc}` }} />
      </div>

      {/* ERROR BANNER */}
      {dbError && <div style={{ background:"#ff444422", borderBottom:"1px solid #ff4444", padding:10, textAlign:"center", color:"#ff4444", fontSize:11, fontWeight:"bold" }}>! {dbError}</div>}

      {/* CONTENT */}
      <div style={{ flex:1, overflow:"auto", paddingBottom:80 }}>

        {/* ---- TASKS ---- */}
        {activeTab === "tasks" && (
          <div style={{ padding:"18px 14px 0" }}>
            {/* Urgent strip */}
            {urgentTasks.length > 0 && (
              <div style={{ marginBottom:14, background:"#ff444411", border:"1px solid #ff444444", borderRadius:8, padding:10 }}>
                <div style={{ fontSize:11, color:"#ff4444", fontWeight:"bold", marginBottom:6 }}>! URGENT DEADLINES</div>
                {urgentTasks.map(t => { const s = urgentStatus(t.dueDate); return (
                  <div key={t.fsId||t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 9px", background:"#000", borderRadius:6, marginBottom:4, border:`1px solid ${s.color}33` }}>
                    <div style={{ fontSize:11, color:"#fff" }}>{t.title}</div>
                    <div style={{ fontSize:9, padding:"2px 8px", borderRadius:10, background:`${s.color}22`, color:s.color, fontWeight:"bold" }}>{s.text}</div>
                  </div>
                );})}
              </div>
            )}
            {/* Stats */}
            <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
              {[{l:"TOTAL TASKS",v:pubTasks.length,c:sc},{l:"COMPLETED",v:totalDone,c:"#00ccff"},{l:"REMAINING",v:pubTasks.length-totalDone,c:"#ffaa00"},{l:"PROGRESS",v:pct+"%",c:"#ff66cc"}].map(s=>(
                <div key={s.l} style={{ flex:"1 1 70px", background:"#0a0f0a", border:`1px solid ${s.c}33`, borderRadius:10, padding:"11px 14px", minWidth:80 }}>
                  <div style={{ fontSize:9, color:"#ffffff66", letterSpacing:2, marginBottom:5 }}>{s.l}</div>
                  <div style={{ fontSize:22, fontWeight:"bold", color:s.c, fontFamily:"'Orbitron',monospace" }}>{s.v}</div>
                </div>
              ))}
            </div>
            {/* Filter */}
            <div style={{ marginBottom:16, display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", background:"#0a0f0a", padding:12, borderRadius:10, border:`1px solid rgba(${scr},0.13)` }}>
              <div style={{ fontSize:11, color:sc, letterSpacing:2, fontWeight:"bold" }}>FILTER:</div>
              <button onClick={()=>setTaskFilter("All")} style={{ padding:"5px 13px", borderRadius:20, border:`1px solid ${taskFilter==="All"?sc:`rgba(${scr},0.2)`}`, background:taskFilter==="All"?`rgba(${scr},0.13)`:"transparent", color:taskFilter==="All"?sc:`rgba(${scr},0.4)`, fontSize:11, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>ALL TASKS</button>
              <button onClick={()=>setTaskFilter("MY")} style={{ padding:"5px 13px", borderRadius:20, border:`1px solid ${taskFilter==="MY"?"#00ccff":"#00ccff33"}`, background:taskFilter==="MY"?"#00ccff22":"transparent", color:taskFilter==="MY"?"#00ccff":`rgba(${scr},0.4)`, fontSize:11, fontWeight:"bold", fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>MY TASKS</button>
            </div>
            {/* Add task */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
              <button className="neon-btn" onClick={()=>setShowAdd(!showAdd)} style={{ padding:"11px 28px", background:`rgba(${scr},0.07)`, border:`1px dashed rgba(${scr},0.33)`, borderRadius:24, color:sc, fontSize:13, fontWeight:"bold", letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
                {showAdd ? "[ CANCEL ]" : "[ + ADD NEW TASK ]"}
              </button>
            </div>
            {showAdd && (
              <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.33)`, borderRadius:12, padding:18, marginBottom:20 }}>
                <div style={{ fontSize:11, color:sc, letterSpacing:3, marginBottom:10, fontWeight:"bold" }}>NEW TASK</div>
                <input value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} placeholder="Describe the task..."
                  style={{ width:"100%", background:"#000", border:`1px solid rgba(${scr},0.27)`, borderRadius:8, padding:13, color:"#fff", fontSize:14, marginBottom:12, fontFamily:"'Share Tech Mono',monospace", outline:"none" }} />
                <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                  <select value={newTask.week} onChange={e=>setNewTask({...newTask,week:Number(e.target.value)})} style={{ flex:1, minWidth:100, background:"#000", border:`1px solid rgba(${scr},0.27)`, borderRadius:8, padding:11, color:"#fff", fontFamily:"'Share Tech Mono',monospace", outline:"none" }}>
                    {Object.keys(WEEK_INFO).map(w=><option key={w} value={w}>Week {w}</option>)}
                  </select>
                  <select value={newTask.assignee} onChange={e=>setNewTask({...newTask,assignee:e.target.value})} style={{ flex:1, minWidth:100, background:"#000", border:`1px solid rgba(${scr},0.27)`, borderRadius:8, padding:11, color:"#fff", fontFamily:"'Share Tech Mono',monospace", outline:"none" }}>
                    {["All",...TEAM_MEMBERS].map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div style={{ display:"flex", gap:14, marginBottom:14, flexWrap:"wrap", background:"#000", padding:12, borderRadius:8, border:`1px solid rgba(${scr},0.13)` }}>
                  <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:`rgba(${scr},0.67)`, cursor:"pointer" }}>
                    <input type="checkbox" checked={newTask.isPrivate} onChange={e=>setNewTask({...newTask,isPrivate:e.target.checked})} style={{ accentColor:sc, width:16, height:16 }} />
                    Private (Only You)
                  </label>
                  {profile.role === "Group Leader" && (
                    <div style={{ display:"flex", alignItems:"center", gap:14, borderLeft:`1px solid rgba(${scr},0.2)`, paddingLeft:14 }}>
                      <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#ff4444", fontWeight:"bold", cursor:"pointer" }}>
                        <input type="checkbox" checked={newTask.deadline} onChange={e=>setNewTask({...newTask,deadline:e.target.checked})} style={{ accentColor:"#ff4444", width:16, height:16 }} />
                        MARK URGENT
                      </label>
                      {newTask.deadline && <input type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask,dueDate:e.target.value})} style={{ background:"#ff444422", border:"1px solid #ff4444", color:"#ff4444", padding:"5px 9px", borderRadius:6, fontFamily:"'Share Tech Mono',monospace" }} />}
                    </div>
                  )}
                </div>
                <Btn onClick={addTask}>SUBMIT TASK</Btn>
              </div>
            )}
            {activeWks.map(w=>renderWeek(w,false))}
            {doneWks.length > 0 && <div style={{ margin:"28px 0", textAlign:"center", fontSize:11, color:`rgba(${scr},0.33)`, letterSpacing:4 }}>--- COMPLETED WEEKS ---</div>}
            {doneWks.map(w=>renderWeek(w,true))}
          </div>
        )}

        {/* ---- TEAM ---- */}
        {activeTab === "team" && (
          <div style={{ padding:"18px 14px" }}>
            <div style={{ fontSize:11, color:sc, letterSpacing:3, marginBottom:14, fontWeight:"bold", borderBottom:`1px solid rgba(${scr},0.2)`, paddingBottom:8 }}>TEAM MEMBERS</div>
            {userStats.map((u,i) => {
              const top = i === 0 && u.points > 0;
              return (
                <div key={u.username} style={{ background:"#0a0f0a", border:`1px solid ${u.color}44`, borderRadius:12, padding:15, marginBottom:13, position:"relative", overflow:"hidden", boxShadow:top?`0 0 15px ${u.color}33`:"none" }}>
                  {top && <div style={{ position:"absolute", top:-8, right:-8, fontSize:44, opacity:0.08 }}>*</div>}
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    {u.photoURL
                      ? <img src={u.photoURL} alt="p" style={{ width:48, height:48, borderRadius:12, border:`2px solid ${u.color}66` }} />
                      : <div style={{ width:48, height:48, borderRadius:12, background:u.color+"22", border:`2px solid ${u.color}66`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:u.color, flexShrink:0 }}>{top?"#":u.username[0].toUpperCase()}</div>}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ fontSize:15, color:u.color, fontWeight:"bold" }}>{u.username}{u.username===profile.username&&" (YOU)"}</div>
                        <div style={{ fontSize:16, color:sc, fontWeight:"bold", fontFamily:"'Orbitron',monospace" }}>{u.points} PTS</div>
                      </div>
                      <div style={{ fontSize:11, color:"#00ff8577", marginTop:3 }}>{u.role}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:9, background:"#000", padding:"7px 11px", borderRadius:8, border:`1px solid rgba(${scr},0.13)` }}>
                        {u.phone && <div style={{ fontSize:10, color:"#fff" }}>PHONE: {u.phone}</div>}
                        <div style={{ fontSize:10, color:"#00ccff" }}>TG: {u.tgNumber}</div>
                        <div style={{ fontSize:10, color:"#ffaa00" }}>~ {u.doneCount}/{u.totalCount} Tasks Done</div>
                      </div>
                      <div style={{ marginTop:9, height:3, background:"#000", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:u.totalCount>0?`${(u.doneCount/u.totalCount)*100}%`:"0%", background:`linear-gradient(90deg,${u.color},${u.color}88)`, borderRadius:4, transition:"width 0.6s" }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ---- RESOURCES ---- */}
        {activeTab === "data" && (
          <div style={{ padding:"18px 14px" }}>
            <div style={{ fontSize:11, color:sc, letterSpacing:3, marginBottom:18, fontWeight:"bold" }}>TEAM RESOURCES</div>
            <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.33)`, borderRadius:12, padding:14, marginBottom:22 }}>
              <div style={{ fontSize:11, color:`rgba(${scr},0.67)`, letterSpacing:2, marginBottom:10 }}>ADD RESOURCE LINK</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <GInput value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="Title (e.g. MySQL Tutorial)" />
                <GInput value={resUrl} onChange={e=>setResUrl(e.target.value)} placeholder="URL (https://...)" type="url" />
                <GInput value={resNote} onChange={e=>setResNote(e.target.value)} placeholder="Short note about this link..." />
                <Btn onClick={addResource}>{formLoad ? "ADDING..." : "ADD TO TEAM"}</Btn>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {resources.length === 0 && <div style={{ textAlign:"center", padding:28, color:`rgba(${scr},0.27)`, fontSize:13 }}>NO RESOURCES YET</div>}
              {resources.map(r=>(
                <div key={r.id} style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:10, padding:14, display:"flex", flexDirection:"column", gap:9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div><div style={{ fontSize:15, color:"#fff", fontWeight:"bold", marginBottom:5 }}>{r.title}</div><div style={{ fontSize:10, color:`rgba(${scr},0.4)` }}>Added by {r.addedBy}</div></div>
                    <div style={{ display:"flex", gap:8 }}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ padding:"7px 14px", background:`rgba(${scr},0.13)`, color:sc, borderRadius:6, textDecoration:"none", fontSize:11, fontWeight:"bold" }}>OPEN LINK</a>
                      {(profile.role==="Group Leader"||r.addedBy===profile.username) && <button onClick={()=>deleteResource(r.id)} style={{ background:"transparent", border:"1px solid #ff444455", color:"#ff4444", borderRadius:6, padding:"7px 11px", cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", fontSize:11 }}>DEL</button>}
                    </div>
                  </div>
                  {r.note && <div style={{ background:"#000", borderLeft:`3px solid ${sc}`, padding:"7px 11px", fontSize:12, color:`rgba(${scr},0.67)`, borderRadius:"0 8px 8px 0" }}>{r.note}</div>}
                </div>
              ))}
            </div>
            {profile.role === "Group Leader" && (
              <div style={{ marginTop:36, borderTop:"1px dashed #ff444455", paddingTop:18 }}>
                <div style={{ fontSize:10, color:"#ff4444", marginBottom:10, letterSpacing:2 }}>LEADER OVERRIDE</div>
                <button onClick={seedTasks} disabled={migrating} style={{ width:"100%", padding:"11px 0", background:`rgba(${scr},0.07)`, border:`1px solid rgba(${scr},0.33)`, borderRadius:8, color:sc, fontSize:11, letterSpacing:1, fontFamily:"'Share Tech Mono',monospace", cursor:migrating?"not-allowed":"pointer", marginBottom:8 }}>SEED DEFAULT TASKS</button>
                <button onClick={deleteAllTasks} disabled={migrating} style={{ width:"100%", padding:"11px 0", background:"#ff444411", border:"1px solid #ff4444", borderRadius:8, color:"#ff4444", fontSize:11, letterSpacing:1, fontFamily:"'Share Tech Mono',monospace", cursor:migrating?"not-allowed":"pointer" }}>DELETE ALL TASKS (RESET)</button>
                {migrateMsg && <div style={{ marginTop:10, padding:10, background:`rgba(${scr},0.07)`, border:`1px solid rgba(${scr},0.27)`, borderRadius:6, fontSize:11, color:sc }}>{migrateMsg}</div>}
              </div>
            )}
          </div>
        )}

        {/* ---- CHAT ---- */}
        {activeTab === "chat" && (
          <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 130px)" }}>
            <div style={{ padding:"11px 14px", background:"#000", borderBottom:`1px solid rgba(${scr},0.2)`, textAlign:"center", flexShrink:0 }}>
              <div style={{ fontSize:13, color:sc, letterSpacing:3, fontFamily:"'Orbitron',monospace", fontWeight:"bold" }}>GLOBAL NETWORK CHAT</div>
              <div style={{ fontSize:9, color:`rgba(${scr},0.53)`, marginTop:3 }}>All teams can see this chat</div>
            </div>
            <div id="chat-messages" style={{ flex:1, overflowY:"scroll", overflowX:"hidden", padding:14, display:"flex", flexDirection:"column", gap:10 }}>
              {messages.length===0 && <div style={{ textAlign:"center", color:`rgba(${scr},0.13)`, padding:36, fontSize:13 }}>NETWORK SILENT</div>}
              {messages.map(msg=>{
                const me = msg.user === profile.username;
                return (
                  <div key={msg.id} style={{ display:"flex", flexDirection:me?"row-reverse":"row", gap:9, alignItems:"flex-end" }}>
                    {msg.photoURL
                      ? <img src={msg.photoURL} alt="p" style={{ width:30, height:30, borderRadius:8, border:`2px solid ${msg.color||sc}55`, flexShrink:0 }} />
                      : <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background:(msg.color||sc)+"22", border:`2px solid ${msg.color||sc}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:msg.color||sc }}>{(msg.user||"?")[0].toUpperCase()}</div>}
                    <div style={{ maxWidth:"75%" }}>
                      {!me && <div style={{ fontSize:9, color:msg.color||sc, marginBottom:3 }}>{msg.user} <span style={{ color:`rgba(${scr},0.33)` }}>* {msg.teamName}</span></div>}
                      <div style={{ background:me?`rgba(${scr},0.13)`:"#0a0f0a", border:`1px solid ${me?`rgba(${scr},0.4)`:`rgba(${scr},0.13)`}`, borderRadius:me?"12px 4px 12px 12px":"4px 12px 12px 12px", padding:"9px 13px", fontSize:13, color:me?sc:"#ccffcc", lineHeight:1.6, wordBreak:"break-word" }}>{msg.text}</div>
                      <div style={{ fontSize:9, color:`rgba(${scr},0.3)`, marginTop:3, textAlign:me?"right":"left" }}>{msg.time}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding:"12px 14px", background:"#0a0f0a", borderTop:`1px solid rgba(${scr},0.2)`, display:"flex", gap:10, flexShrink:0 }}>
              <input type="text" value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} placeholder="Type a message... (Enter to send)"
                style={{ flex:1, background:"#000", border:`1px solid rgba(${scr},0.27)`, borderRadius:8, padding:"13px 15px", color:"#fff", fontSize:13, fontFamily:"'Share Tech Mono',monospace", outline:"none" }} />
              <button className="neon-btn" onClick={sendMsg} style={{ padding:"11px 22px", background:`rgba(${scr},0.13)`, border:`1px solid ${sc}`, borderRadius:8, color:sc, fontSize:13, fontWeight:"bold", fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>SEND</button>
            </div>
          </div>
        )}

        {/* ---- QUIZ ---- */}
        {activeTab === "quiz" && (
          <div style={{ padding:"18px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div style={{ fontSize:11, color:sc, letterSpacing:3, fontWeight:"bold" }}>QUIZ DATABASE</div>
              <button onClick={()=>setShowAddQuiz(!showAddQuiz)} style={{ background:`rgba(${scr},0.13)`, border:`1px solid ${sc}`, color:sc, padding:"7px 13px", borderRadius:6, fontSize:11, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>
                {showAddQuiz ? "CANCEL" : "+ CREATE QUIZ"}
              </button>
            </div>
            {showAddQuiz && (
              <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.33)`, borderRadius:12, padding:14, marginBottom:20 }}>
                <div style={{ fontSize:11, color:`rgba(${scr},0.67)`, letterSpacing:2, marginBottom:10 }}>CREATE NEW QUIZ SET</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <GInput value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} placeholder="Quiz Set Title (e.g. Week 1 DBMS)" />
                  {quizQs.map((q,i)=>(
                    <div key={i} style={{ background:"#000", padding:13, borderRadius:8, border:`1px solid rgba(${scr},0.2)` }}>
                      <div style={{ fontSize:11, color:sc, marginBottom:7 }}>Question {i+1}</div>
                      <GInput value={q.q} onChange={e=>changeQ(i,'q',e.target.value)} placeholder="Enter question..." />
                      <div style={{ display:"flex", gap:9, marginTop:9 }}>
                        <GInput value={q.opt1} onChange={e=>changeQ(i,'opt1',e.target.value)} placeholder="Option 1" />
                        <GInput value={q.opt2} onChange={e=>changeQ(i,'opt2',e.target.value)} placeholder="Option 2" />
                      </div>
                      <div style={{ display:"flex", gap:9, marginTop:9 }}>
                        <GInput value={q.opt3} onChange={e=>changeQ(i,'opt3',e.target.value)} placeholder="Option 3" />
                        <GInput value={q.opt4} onChange={e=>changeQ(i,'opt4',e.target.value)} placeholder="Option 4" />
                      </div>
                      <div style={{ marginTop:9 }}>
                        <div style={{ fontSize:9, color:`rgba(${scr},0.67)`, marginBottom:4 }}>CORRECT ANSWER</div>
                        <select value={q.ans} onChange={e=>changeQ(i,'ans',e.target.value)} style={{ width:"100%", background:"#0a0f0a", border:`1px solid rgba(${scr},0.27)`, borderRadius:8, padding:9, color:"#fff", fontFamily:"'Share Tech Mono',monospace", outline:"none" }}>
                          <option value={0}>Option 1</option><option value={1}>Option 2</option><option value={2}>Option 3</option><option value={3}>Option 4</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <div style={{ display:"flex", gap:9 }}>
                    <button onClick={()=>setQuizQs([...quizQs,{q:"",opt1:"",opt2:"",opt3:"",opt4:"",ans:0}])} style={{ flex:1, padding:11, background:"transparent", border:"1px dashed #00ccff", color:"#00ccff", borderRadius:8, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>+ ADD QUESTION</button>
                    <Btn onClick={saveQuiz} style={{ flex:2 }}>{formLoad?"SAVING...":"SAVE QUIZ SET"}</Btn>
                  </div>
                </div>
              </div>
            )}
            {!quizActive && !quizDone && !showAddQuiz && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {dbQuizzes.length===0 && <div style={{ textAlign:"center", padding:36, background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:12 }}>
                  <div style={{ fontSize:13, color:`rgba(${scr},0.4)`, marginBottom:10 }}>No quiz sets yet.</div>
                  <Btn onClick={()=>startQuiz(null)} style={{ maxWidth:200 }}>PLAY DEFAULT QUIZ</Btn>
                </div>}
                {dbQuizzes.map(qz=>(
                  <div key={qz.id} style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.33)`, borderRadius:12, padding:15, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:15, color:"#fff", fontWeight:"bold" }}>{qz.title}</div>
                      <div style={{ fontSize:10, color:`rgba(${scr},0.4)`, marginTop:3 }}>By {qz.addedBy} - {qz.questions.length} Questions</div>
                    </div>
                    <Btn onClick={()=>startQuiz(qz)} style={{ width:"auto", padding:"7px 18px" }}>START</Btn>
                  </div>
                ))}
              </div>
            )}
            {quizActive && !quizDone && shuffled[quizQ] && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ fontSize:12, color:`rgba(${scr},0.4)`, fontWeight:"bold" }}>QUESTION {quizQ+1} / {shuffled.length}</div>
                  <div style={{ fontSize:12, color:"#00ccff", fontWeight:"bold" }}>SCORE: {quizScore}</div>
                </div>
                <div style={{ height:3, background:"#000", borderRadius:4, marginBottom:18, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${((quizQ+1)/shuffled.length)*100}%`, background:`linear-gradient(90deg,${sc},#00ccff)`, transition:"width 0.3s" }} />
                </div>
                <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.33)`, borderRadius:12, padding:18, marginBottom:18 }}>
                  <div style={{ fontSize:15, color:"#fff", lineHeight:1.6 }}>{shuffled[quizQ].q}</div>
                </div>
                {shuffled[quizQ].opts.map((opt,i)=>{
                  let bg="#0a0f0a",bc=`rgba(${scr},0.2)`,c=`rgba(${scr},0.67)`;
                  if(quizAns!==null){ if(i===shuffled[quizQ].ans){bg=`rgba(${scr},0.13)`;bc=sc;c=sc;} else if(i===quizAns){bg="#ff000020";bc="#ff4444";c="#ff4444";} }
                  return <button key={i} onClick={()=>answerQuiz(i)} style={{ width:"100%", marginBottom:10, padding:15, background:bg, border:`1px solid ${bc}`, borderRadius:10, color:c, fontSize:14, textAlign:"left", fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", transition:"all 0.2s" }}>[ {i+1} ] {opt}</button>;
                })}
              </div>
            )}
            {quizDone && (
              <div style={{ textAlign:"center", padding:"36px 18px", background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:16 }}>
                <div style={{ fontSize:48, marginBottom:14 }}>[DONE]</div>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:26, color:sc, marginBottom:14 }}>QUIZ COMPLETE</div>
                <div style={{ fontSize:17, color:"#fff", marginBottom:8 }}>Final Score: <span style={{ color:"#00ccff", fontFamily:"'Orbitron',monospace" }}>{quizScore}/{shuffled.length}</span></div>
                <div style={{ fontSize:12, color:`rgba(${scr},0.53)`, marginBottom:22 }}>{Math.round((quizScore/shuffled.length)*100)}% accuracy</div>
                <Btn onClick={()=>setQuizDone(false)} style={{ maxWidth:200 }}>BACK TO LIST</Btn>
              </div>
            )}
          </div>
        )}

        {/* ---- SETTINGS ---- */}
        {activeTab === "settings" && (
          <div style={{ padding:"18px 14px" }}>
            <div style={{ fontSize:11, color:sc, letterSpacing:3, marginBottom:18, fontWeight:"bold" }}>SETTINGS</div>
            {/* Theme */}
            <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:12, padding:18, marginBottom:18 }}>
              <div style={{ fontSize:11, color:`rgba(${scr},0.67)`, letterSpacing:2, marginBottom:14 }}>CHOOSE THEME COLOR</div>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                {THEME_COLORS.map(c=>(
                  <div key={c} onClick={()=>updateTheme(c)} style={{ width:38, height:38, borderRadius:19, background:c, cursor:"pointer", border:sc===c?"3px solid #fff":"2px solid transparent", boxShadow:sc===c?`0 0 16px ${c}`:`0 0 5px ${c}44`, transition:"all 0.2s" }} />
                ))}
              </div>
            </div>
            {/* Profile */}
            <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:12, padding:18, marginBottom:18 }}>
              <div style={{ fontSize:11, color:`rgba(${scr},0.67)`, letterSpacing:2, marginBottom:14 }}>PROFILE</div>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
                {profile.photoURL
                  ? <img src={profile.photoURL} alt="p" style={{ width:52, height:52, borderRadius:13, border:`2px solid ${sc}` }} />
                  : <div style={{ width:52, height:52, borderRadius:13, background:`rgba(${scr},0.2)`, border:`2px solid ${sc}`, display:"flex", alignItems:"center", justifyContent:"center", color:sc, fontSize:22, fontWeight:"bold" }}>{profile.username[0].toUpperCase()}</div>}
                <div>
                  <div style={{ fontSize:15, color:profile.color, fontWeight:"bold" }}>{profile.username}</div>
                  <div style={{ fontSize:11, color:`rgba(${scr},0.53)`, marginTop:2 }}>{profile.role} - {profile.teamName}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                <div><div style={{ fontSize:10, color:`rgba(${scr},0.67)`, marginBottom:4 }}>USERNAME (READ ONLY)</div><GInput value={profile.username} disabled={true} /></div>
                <div><div style={{ fontSize:10, color:`rgba(${scr},0.67)`, marginBottom:4 }}>EMAIL (READ ONLY)</div><GInput value={profile.email} disabled={true} /></div>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ flex:1 }}><div style={{ fontSize:10, color:`rgba(${scr},0.67)`, marginBottom:4 }}>PHONE NUMBER</div><GInput value={editData.phone} onChange={e=>setEditData({...editData,phone:e.target.value})} placeholder="07X..." /></div>
                  <div style={{ flex:1 }}><div style={{ fontSize:10, color:`rgba(${scr},0.67)`, marginBottom:4 }}>TELEGRAM</div><GInput value={editData.tgNumber} onChange={e=>setEditData({...editData,tgNumber:e.target.value})} placeholder="TG/..." /></div>
                </div>
                <div><div style={{ fontSize:10, color:"#ffaa00", marginBottom:4 }}>NEW PASSWORD (OPTIONAL)</div><GInput type="password" value={editData.newPassword} onChange={e=>setEditData({...editData,newPassword:e.target.value})} placeholder="Leave blank to keep current" /></div>
                <Btn onClick={saveProfile} style={{ marginTop:8 }}>{formLoad ? "SAVING..." : "SAVE PROFILE"}</Btn>
              </div>
            </div>
            {/* Logout */}
            <div style={{ background:"#ff444411", border:"1px solid #ff444455", borderRadius:12, padding:18 }}>
              <div style={{ fontSize:10, color:"#ff4444", letterSpacing:2, marginBottom:12 }}>DANGER ZONE</div>
              <button onClick={doLogout}
                onMouseOver={e=>{e.currentTarget.style.background="#ff000044";e.currentTarget.style.boxShadow="0 0 18px #ff4444aa";}}
                onMouseOut={e=>{e.currentTarget.style.background="#ff000022";e.currentTarget.style.boxShadow="none";}}
                style={{ width:"100%", background:"#ff000022", border:"2px solid #ff4444", borderRadius:8, color:"#ff4444", fontSize:13, fontWeight:"bold", padding:15, letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", transition:"all 0.2s" }}>
                LOGOUT / EXIT SYSTEM
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#000", borderTop:`1px solid rgba(${scr},0.27)`, display:"flex", zIndex:200, paddingBottom:"env(safe-area-inset-bottom)" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ flex:1, padding:"11px 4px", background:activeTab===t.id?`rgba(${scr},0.07)`:"transparent", border:"none", borderTop:activeTab===t.id?`3px solid ${sc}`:"3px solid transparent", color:activeTab===t.id?sc:`rgba(${scr},0.4)`, fontSize:8, letterSpacing:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", transition:"all 0.2s" }}>
            <span style={{ fontSize:13, fontWeight:900, fontFamily:"'Orbitron',monospace", width:26, height:26, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", background:activeTab===t.id?`rgba(${scr},0.15)`:"transparent", border:`1px solid ${activeTab===t.id?sc:"transparent"}`, color:activeTab===t.id?sc:`rgba(${scr},0.4)`, textShadow:activeTab===t.id?`0 0 8px ${sc}`:"none" }}>{t.icon}</span>
            <span style={{ fontWeight:activeTab===t.id?"bold":"normal" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", background:"#000", border:`1px solid ${sc}`, borderRadius:10, padding:"11px 22px", fontSize:12, fontWeight:"bold", color:sc, zIndex:9999, whiteSpace:"nowrap", fontFamily:"'Share Tech Mono',monospace", boxShadow:`0 0 18px rgba(${scr},0.4)`, animation:"toast-in 0.3s ease" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
