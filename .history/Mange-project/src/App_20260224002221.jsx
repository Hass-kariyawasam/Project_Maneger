// src/App.jsx  ─  ICT1222 Team App  |  Firebase Edition
import { useState, useEffect, useRef } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection, doc, setDoc, getDoc, getDocs,
  addDoc, onSnapshot, query, orderBy,
  deleteDoc, updateDoc, serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase.js";

// ─── CONSTANTS ────────────────────────────────────────────────
const TEAM_NAME   = "HassKariyawasamtiks";
const EMAIL_DOMAIN = "@ict1222.team";   // internal fake domain for Firebase Auth

const TEAM_MEMBERS = ["HassKariyawasamtiks","Member2","Member3","Member4"];
const MEMBER_COLORS = {
  "HassKariyawasamtiks":"#00ff88",
  "Member2":"#00ccff",
  "Member3":"#ffaa00",
  "Member4":"#ff66cc",
};

const INITIAL_TASKS = [
  {id:"t1",week:1,title:"Install MySQL Server 8.0+",assignee:"All",deadline:false},
  {id:"t2",week:1,title:"Install MySQL Workbench",assignee:"All",deadline:false},
  {id:"t3",week:1,title:"Install VS Code + Extensions",assignee:"All",deadline:false},
  {id:"t4",week:1,title:"Install Git + GitHub Desktop",assignee:"All",deadline:false},
  {id:"t5",week:1,title:"Create GitHub Repo (Private)",assignee:"HassKariyawasamtiks",deadline:false},
  {id:"t6",week:1,title:"Read UGC Circular No. 12-2024",assignee:"All",deadline:false},
  {id:"t7",week:1,title:"Collect Level 1 Sem 2 Timetable",assignee:"HassKariyawasamtiks",deadline:false},
  {id:"t8",week:1,title:"Finalize Entity List + Attributes",assignee:"All",deadline:false},
  {id:"t9",week:2,title:"Define all Entities + PKs",assignee:"All",deadline:false},
  {id:"t10",week:2,title:"Define Relationships + Cardinality",assignee:"All",deadline:false},
  {id:"t11",week:2,title:"Draw ER Diagram Draft in draw.io",assignee:"HassKariyawasamtiks",deadline:false},
  {id:"t12",week:2,title:"Team Review of ER Diagram",assignee:"All",deadline:false},
  {id:"t13",week:3,title:"Finalize ER Diagram",assignee:"HassKariyawasamtiks",deadline:false},
  {id:"t14",week:3,title:"Start Relational Mapping",assignee:"All",deadline:false},
  {id:"t15",week:3,title:"Define all Foreign Keys",assignee:"All",deadline:false},
  {id:"t16",week:4,title:"Complete Relational Mapping Diagram",assignee:"HassKariyawasamtiks",deadline:false},
  {id:"t17",week:4,title:"Write schema.sql - CREATE TABLE scripts",assignee:"Member3",deadline:false},
  {id:"t18",week:4,title:"Test schema.sql on local MySQL",assignee:"All",deadline:false},
  {id:"t19",week:5,title:"Write users.sql - 5 MySQL user accounts",assignee:"HassKariyawasamtiks",deadline:false},
  {id:"t20",week:5,title:"Write GRANT statements for all roles",assignee:"HassKariyawasamtiks",deadline:false},
  {id:"t21",week:5,title:"Insert 10 proper + 5 repeat students",assignee:"Member2",deadline:false},
  {id:"t22",week:5,title:"Insert 5 lecturers + 5 TOs",assignee:"Member2",deadline:false},
  {id:"t23",week:5,title:"Insert course units from timetable",assignee:"Member3",deadline:false},
  {id:"t24",week:6,title:"Create attendance_session table",assignee:"Member2",deadline:false},
  {id:"t25",week:6,title:"Create student_attendance table",assignee:"Member2",deadline:false},
  {id:"t26",week:6,title:"Insert 15 theory + 15 practical sessions",assignee:"Member2",deadline:false},
  {id:"t27",week:6,title:"Insert attendance data - all 4 scenarios",assignee:"Member2",deadline:false},
  {id:"t28",week:7,title:"Create v_attendance_by_course view",assignee:"Member2",deadline:false},
  {id:"t29",week:7,title:"Create v_final_attendance view",assignee:"Member2",deadline:false},
  {id:"t30",week:7,title:"Create attendance stored procedures",assignee:"Member2",deadline:false},
  {id:"t31",week:7,title:"SUBMIT ER Diagram — April 21",assignee:"HassKariyawasamtiks",deadline:true},
  {id:"t32",week:8,title:"Create marks table (all mark types)",assignee:"Member3",deadline:false},
  {id:"t33",week:8,title:"Insert all marks data",assignee:"Member3",deadline:false},
  {id:"t34",week:8,title:"Implement CA eligibility logic",assignee:"Member3",deadline:false},
  {id:"t35",week:9,title:"Write fn_get_grade() function",assignee:"Member4",deadline:false},
  {id:"t36",week:9,title:"Create v_final_grades view (WH/MC/C-cap)",assignee:"Member4",deadline:false},
  {id:"t37",week:9,title:"Create v_sgpa and v_cgpa views",assignee:"Member4",deadline:false},
  {id:"t38",week:9,title:"SUBMIT Relational Mapping — April 28",assignee:"HassKariyawasamtiks",deadline:true},
  {id:"t39",week:10,title:"Write Final Report - All Sections",assignee:"All",deadline:false},
  {id:"t40",week:10,title:"Clean and comment all SQL scripts",assignee:"All",deadline:false},
  {id:"t41",week:10,title:"Full end-to-end system test",assignee:"All",deadline:false},
  {id:"t42",week:10,title:"SUBMIT Final Report + MySQL Script — May 5",assignee:"HassKariyawasamtiks",deadline:true},
];

const WEEK_INFO = {
  1:{label:"Week 1",dates:"Feb 23–Mar 1"},2:{label:"Week 2",dates:"Mar 2–8"},
  3:{label:"Week 3",dates:"Mar 9–15"},4:{label:"Week 4",dates:"Mar 16–22"},
  5:{label:"Week 5",dates:"Mar 23–29"},6:{label:"Week 6",dates:"Mar 30–Apr 5"},
  7:{label:"Week 7",dates:"Apr 6–13"},8:{label:"Week 8",dates:"Apr 14–21"},
  9:{label:"Week 9",dates:"Apr 22–28"},10:{label:"Week 10",dates:"Apr 29–May 5"},
};

const QUIZ_QUESTIONS = [
  {q:"What does DBMS stand for?",opts:["Data Base Management System","Database Management System","Distributed Binary Management System","Data Binary Mapping System"],ans:1},
  {q:"Which MySQL user has ALL privileges WITH GRANT OPTION?",opts:["Dean","Lecturer","Admin","Technical Officer"],ans:2},
  {q:"What is the minimum attendance % for eligibility?",opts:["70%","75%","80%","85%"],ans:2},
  {q:"What grade does a suspended student receive?",opts:["F","WH","MC","E"],ans:1},
  {q:"What is the maximum grade a REPEAT student can receive?",opts:["A","B+","C","D"],ans:2},
  {q:"What does MC mean in results?",opts:["Missing Credit","Medical Certificate","Module Cancelled","Mark Confirmed"],ans:1},
  {q:"What is the SGPA formula?",opts:["Sum(Credits)/Sum(GP)","Sum(Credits×GP)/Sum(Credits)","Sum(GP)/n","Credits×GP"],ans:1},
  {q:"Minimum CGPA for First Class? (UGC Circular 12-2024)",opts:["3.30","3.50","3.70","4.00"],ans:2},
  {q:"What grade point does A+ carry?",opts:["4.5","4.3","4.0","3.7"],ans:2},
  {q:"Minimum marks range for grade A+?",opts:["80% and above","85% and above","90% and above","75% and above"],ans:1},
  {q:"What is a PRIMARY KEY?",opts:["A key that can be NULL","Uniquely identifies each row, cannot be NULL","Any column in a table","Foreign reference to another table"],ans:1},
  {q:"Which SQL command creates a view?",opts:["MAKE VIEW","CREATE VIEW","ADD VIEW","INSERT VIEW"],ans:1},
  {q:"What does GRANT do in MySQL?",opts:["Removes user","Gives permissions to a user","Creates a table","Backs up data"],ans:1},
  {q:"Grade point for D (Conditional Pass)?",opts:["0.0","1.0","1.3","1.7"],ans:2},
  {q:"How many practical sessions per subject in this semester?",opts:["10","12","15","20"],ans:2},
];

// ─── FIRESTORE COLLECTIONS ───────────────────────────────────
const TASKS_COL = "tasks";
const CHAT_COL  = "chat";
const USERS_COL = "users";

// ═════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════
export default function App() {
  // Auth
  const [authUser, setAuthUser] = useState(null);   // Firebase user
  const [profile, setProfile]   = useState(null);   // { username, role, color }
  const [authReady, setAuthReady] = useState(false);

  // Screens: login | register | app
  const [screen, setScreen]   = useState("login");
  const [activeTab, setActiveTab] = useState("tasks");

  // Login / register form
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regUser,   setRegUser]   = useState("");
  const [regPass,   setRegPass]   = useState("");
  const [regRole,   setRegRole]   = useState("HassKariyawasamtiks");
  const [formErr,   setFormErr]   = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Tasks
  const [tasks, setTasks]           = useState([]);
  const [taskFilter, setTaskFilter] = useState("All");
  const [weekFilter, setWeekFilter] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask]   = useState({title:"",week:1,assignee:"All",isPrivate:false});
  const [editNote, setEditNote] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Chat
  const [messages, setMessages] = useState([]);
  const [chatMsg, setChatMsg]   = useState("");
  const chatEndRef = useRef(null);

  // Team
  const [memberView, setMemberView] = useState(null);
  const [allUsers, setAllUsers] = useState({});

  // Quiz
  const [quizActive, setQuizActive]   = useState(false);
  const [quizQ, setQuizQ]             = useState(0);
  const [quizScore, setQuizScore]     = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(null);
  const [quizDone, setQuizDone]       = useState(false);
  const [shuffled, setShuffled]       = useState([]);

  // Migrate
  const [migrating, setMigrating]     = useState(false);
  const [migrateMsg, setMigrateMsg]   = useState("");

  // Toast
  const [toast, setToast] = useState(null);

  // ── FIREBASE AUTH LISTENER ────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Load profile from Firestore
        const snap = await getDoc(doc(db, USERS_COL, user.uid));
        if (snap.exists()) {
          const p = snap.data();
          setProfile(p);
          setAuthUser(user);
          setScreen("app");
        } else {
          await signOut(auth);
          setScreen("login");
        }
      } else {
        setAuthUser(null);
        setProfile(null);
        setScreen("login");
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // ── REALTIME LISTENERS (when logged in) ──────────────────
  useEffect(() => {
    if (!authUser || !profile) return;

    // Public tasks realtime
    const unsubTasks = onSnapshot(
      query(collection(db, TASKS_COL), orderBy("week"), orderBy("createdAt")),
      (snap) => {
        const pub = snap.docs.map(d => ({ fsId: d.id, ...d.data() }));
        setTasks(prev => {
          const priv = prev.filter(t => t.isPrivate);
          return [...pub, ...priv];
        });
      }
    );

    // Private tasks realtime
    const privCol = collection(db, USERS_COL, authUser.uid, "privateTasks");
    const unsubPriv = onSnapshot(privCol, (snap) => {
      const priv = snap.docs.map(d => ({ fsId: d.id, ...d.data(), isPrivate: true }));
      setTasks(prev => {
        const pub = prev.filter(t => !t.isPrivate);
        return [...pub, ...priv];
      });
    });

    // Chat realtime
    const unsubChat = onSnapshot(
      query(collection(db, CHAT_COL), orderBy("ts")),
      (snap) => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMessages(msgs);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    );

    // Load all user profiles (for team view)
    getDocs(collection(db, USERS_COL)).then(snap => {
      const users = {};
      snap.docs.forEach(d => { users[d.data().username] = d.data(); });
      setAllUsers(users);
    });

    return () => { unsubTasks(); unsubPriv(); unsubChat(); };
  }, [authUser, profile]);

  // ── AUTH ────────────────────────────────────────────────
  async function doRegister() {
    setFormErr(""); setFormLoading(true);
    if (!regUser.trim() || regUser.length < 3) { setFormErr("Username must be 3+ chars"); setFormLoading(false); return; }
    if (!regPass || regPass.length < 4) { setFormErr("Password must be 4+ chars"); setFormLoading(false); return; }
    // Check username taken
    const usersSnap = await getDocs(collection(db, USERS_COL));
    const taken = usersSnap.docs.some(d => d.data().username === regUser.trim());
    if (taken) { setFormErr("Username already taken!"); setFormLoading(false); return; }
    try {
      const email = regUser.trim().toLowerCase() + EMAIL_DOMAIN;
      const cred  = await createUserWithEmailAndPassword(auth, email, regPass);
      const p     = { username: regUser.trim(), role: regRole, color: MEMBER_COLORS[regRole] || "#00ff88" };
      await setDoc(doc(db, USERS_COL, cred.user.uid), p);
      showToast("Account created! Welcome.");
    } catch (e) {
      setFormErr("Error: " + (e.code === "auth/email-already-in-use" ? "Username taken." : e.message));
    }
    setFormLoading(false);
  }

  async function doLogin() {
    setFormErr(""); setFormLoading(true);
    try {
      const email = loginUser.trim().toLowerCase() + EMAIL_DOMAIN;
      await signInWithEmailAndPassword(auth, email, loginPass);
    } catch (e) {
      setFormErr("Wrong username or password.");
    }
    setFormLoading(false);
  }

  async function doLogout() {
    await signOut(auth);
    setTasks([]); setMessages([]);
  }

  // ── TASKS ───────────────────────────────────────────────
  async function addTask() {
    if (!newTask.title.trim()) return;
    const base = { ...newTask, done: false, note: "", createdBy: profile.username, createdAt: serverTimestamp() };
    if (newTask.isPrivate) {
      await addDoc(collection(db, USERS_COL, authUser.uid, "privateTasks"), { ...base });
    } else {
      await addDoc(collection(db, TASKS_COL), { ...base });
    }
    setNewTask({ title:"", week:1, assignee:"All", isPrivate:false });
    setShowAddTask(false);
    showToast("Task added!");
  }

  async function toggleDone(task) {
    if (task.isPrivate) {
      await updateDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId), { done: !task.done });
    } else {
      await updateDoc(doc(db, TASKS_COL, task.fsId), { done: !task.done });
    }
  }

  async function saveNote(task) {
    if (task.isPrivate) {
      await updateDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId), { note: noteText });
    } else {
      await updateDoc(doc(db, TASKS_COL, task.fsId), { note: noteText });
    }
    setEditNote(null); setNoteText("");
    showToast("Note saved!");
  }

  async function deleteTask(task) {
    if (!window.confirm("Delete this task?")) return;
    if (task.isPrivate) {
      await deleteDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId));
    } else {
      await deleteDoc(doc(db, TASKS_COL, task.fsId));
    }
    showToast("Task deleted.");
  }

  // ── MIGRATE: window.storage → Firebase ──────────────────
  async function migrateFromStorage() {
    setMigrating(true); setMigrateMsg("Migrating data from local storage...");
    try {
      let count = 0;
      // Try to get old tasks from window.storage
      const oldTasks = await tryGetStorage("ict_tasks_shared");
      if (oldTasks && Array.isArray(oldTasks)) {
        const batch = writeBatch(db);
        for (const t of oldTasks) {
          const ref = doc(collection(db, TASKS_COL));
          batch.set(ref, {
            ...t, createdAt: serverTimestamp(), createdBy: t.createdBy || profile.username,
          });
          count++;
        }
        await batch.commit();
      }
      // Seed default tasks if Firestore is empty
      const existing = await getDocs(collection(db, TASKS_COL));
      if (existing.empty) {
        setMigrateMsg("Seeding default project tasks into Firebase...");
        const batch = writeBatch(db);
        for (const t of INITIAL_TASKS) {
          const ref = doc(collection(db, TASKS_COL));
          batch.set(ref, { ...t, done: false, note: "", createdBy: "system", createdAt: serverTimestamp() });
          count++;
        }
        await batch.commit();
        setMigrateMsg(`✓ ${count} default tasks seeded into Firebase!`);
      } else {
        setMigrateMsg(`✓ Migration complete! ${count} tasks moved. Firebase already has ${existing.size} tasks.`);
      }
    } catch (e) {
      setMigrateMsg("✗ Error: " + e.message);
    }
    setMigrating(false);
  }

  async function tryGetStorage(key) {
    try { const r = await window.storage?.get(key, true); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  }

  // ── SEED TASKS (if Firestore empty) ─────────────────────
  async function seedTasks() {
    setMigrating(true); setMigrateMsg("Seeding default tasks into Firebase...");
    try {
      const batch = writeBatch(db);
      for (const t of INITIAL_TASKS) {
        const ref = doc(collection(db, TASKS_COL));
        batch.set(ref, { ...t, done:false, note:"", createdBy:"system", createdAt: serverTimestamp() });
      }
      await batch.commit();
      setMigrateMsg(`✓ ${INITIAL_TASKS.length} tasks saved to Firebase!`);
    } catch(e) { setMigrateMsg("✗ Error: " + e.message); }
    setMigrating(false);
  }

  // ── CHAT ────────────────────────────────────────────────
  async function sendMsg() {
    if (!chatMsg.trim()) return;
    await addDoc(collection(db, CHAT_COL), {
      user: profile.username, color: profile.color,
      text: chatMsg.trim(),
      time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      ts: serverTimestamp(),
    });
    setChatMsg("");
  }

  // ── QUIZ ────────────────────────────────────────────────
  function startQuiz() {
    const q = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffled(q); setQuizQ(0); setQuizScore(0);
    setQuizAnswered(null); setQuizDone(false); setQuizActive(true);
  }

  function answerQuiz(idx) {
    if (quizAnswered !== null) return;
    setQuizAnswered(idx);
    if (idx === shuffled[quizQ].ans) setQuizScore(s => s + 1);
    setTimeout(() => {
      if (quizQ + 1 >= shuffled.length) { setQuizDone(true); }
      else { setQuizQ(q => q + 1); setQuizAnswered(null); }
    }, 1200);
  }

  // ── HELPERS ─────────────────────────────────────────────
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const pubTasks = tasks.filter(t => !t.isPrivate);
  const totalDone = pubTasks.filter(t => t.done).length;
  const pct = pubTasks.length ? Math.round(totalDone / pubTasks.length * 100) : 0;

  const visibleTasks = tasks.filter(t => {
    if (t.isPrivate && t.createdBy !== profile?.username) return false;
    const mMatch = taskFilter === "All" || t.assignee === taskFilter || t.assignee === "All";
    const wMatch = weekFilter === 0 || t.week === weekFilter;
    return mMatch && wMatch;
  });

  const weeks = [...new Set(visibleTasks.map(t => t.week))].sort((a,b)=>a-b);

  // ══════════════════════════════════════════════════════════
  // LOADING
  // ══════════════════════════════════════════════════════════
  if (!authReady) return (
    <div style={{background:"#060c06",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Share Tech Mono',monospace",color:"#00ff88"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:16}}>⬡</div>
        <div style={{fontSize:13,letterSpacing:3,animation:"pulse 1.5s infinite"}}>CONNECTING TO FIREBASE...</div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // SHARED UI COMPONENTS
  // ══════════════════════════════════════════════════════════
  const GInput = ({value,onChange,placeholder,type="text"}) => (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{width:"100%",background:"#0a140a",border:"1px solid #00ff8833",borderRadius:4,padding:"10px 14px",color:"#00ff88",fontSize:13,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}
      onFocus={e=>e.target.style.borderColor="#00ff88"}
      onBlur={e=>e.target.style.borderColor="#00ff8833"} />
  );

  const Btn = ({onClick,children,style={},variant="primary"}) => {
    const base = variant==="primary"
      ? {background:"#00ff8820",border:"1px solid #00ff88",color:"#00ff88"}
      : {background:"transparent",border:"1px solid #00ff8833",color:"#00ff8866"};
    return (
      <button onClick={onClick} style={{...base,borderRadius:6,padding:"10px 0",width:"100%",fontSize:13,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",...style}}>
        {children}
      </button>
    );
  };

  // ══════════════════════════════════════════════════════════
  // LOGIN / REGISTER SCREEN
  // ══════════════════════════════════════════════════════════
  if (screen === "login" || screen === "register") return (
    <div style={{background:"#060c06",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Share Tech Mono',monospace",padding:20,position:"relative",overflow:"hidden"}}>
      {/* Grid bg */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(#00ff8808 1px,transparent 1px),linear-gradient(90deg,#00ff8808 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}} />
      {/* Scanlines */}
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,136,0.015) 2px,rgba(0,255,136,0.015) 4px)",pointerEvents:"none"}} />

      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:380}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:68,height:68,border:"2px solid #00ff88",borderRadius:14,marginBottom:12,boxShadow:"0 0 24px #00ff8833",background:"#0a140a",fontSize:30}}>⬡</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,color:"#00ff88",letterSpacing:3,textShadow:"0 0 8px #00ff88"}}>{TEAM_NAME}</div>
          <div style={{fontSize:10,color:"#00ff8544",marginTop:4,letterSpacing:2}}>ICT1222 · UNIVERSITY OF RUHUNA · FIREBASE</div>
        </div>

        <div style={{background:"#0a140a",border:"1px solid #00ff8822",borderRadius:10,padding:24,boxShadow:"0 0 40px #00ff8811"}}>
          {/* Tab switch */}
          <div style={{display:"flex",background:"#060c06",borderRadius:6,padding:3,marginBottom:20}}>
            {["login","register"].map(s=>(
              <button key={s} onClick={()=>{setScreen(s);setFormErr("");}} style={{flex:1,padding:"8px 0",background:screen===s?"#00ff8822":"transparent",border:"none",color:screen===s?"#00ff88":"#00ff8544",fontSize:11,letterSpacing:1,borderRadius:4,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                {s==="login"?"[ LOGIN ]":"[ REGISTER ]"}
              </button>
            ))}
          </div>

          {screen === "login" ? (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <div style={{fontSize:9,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>USERNAME</div>
                <GInput value={loginUser} onChange={e=>setLoginUser(e.target.value)} placeholder="your username..." />
              </div>
              <div>
                <div style={{fontSize:9,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>PASSWORD</div>
                <GInput type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="your password..." />
              </div>
              {formErr && <div style={{color:"#ff4444",fontSize:11,padding:"6px 10px",background:"#ff000011",border:"1px solid #ff444433",borderRadius:4}}>{formErr}</div>}
              <Btn onClick={doLogin} style={{marginTop:4}}>
                {formLoading?"AUTHENTICATING...":"ACCESS SYSTEM"}
              </Btn>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <div style={{fontSize:9,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>USERNAME</div>
                <GInput value={regUser} onChange={e=>setRegUser(e.target.value)} placeholder="choose username..." />
              </div>
              <div>
                <div style={{fontSize:9,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>PASSWORD</div>
                <GInput type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="choose password (4+ chars)..." />
              </div>
              <div>
                <div style={{fontSize:9,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>YOUR TEAM ROLE</div>
                <select value={regRole} onChange={e=>setRegRole(e.target.value)}
                  style={{width:"100%",background:"#0a140a",border:"1px solid #00ff8833",borderRadius:4,padding:"10px 14px",color:"#00ff88",fontSize:13,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                  {TEAM_MEMBERS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {formErr && <div style={{color:"#ff4444",fontSize:11,padding:"6px 10px",background:"#ff000011",border:"1px solid #ff444433",borderRadius:4}}>{formErr}</div>}
              <Btn onClick={doRegister} style={{marginTop:4}}>
                {formLoading?"CREATING ACCOUNT...":"CREATE ACCOUNT"}
              </Btn>
            </div>
          )}
        </div>
        <div style={{textAlign:"center",marginTop:12,fontSize:9,color:"#00ff8522",letterSpacing:1}}>POWERED BY FIREBASE · DATA STORED IN FIRESTORE</div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // MAIN APP SCREEN
  // ══════════════════════════════════════════════════════════
  const tabs = [
    {id:"tasks",label:"TASKS",icon:"⬡"},
    {id:"chat", label:"CHAT", icon:"◈"},
    {id:"team", label:"TEAM", icon:"◉"},
    {id:"quiz", label:"QUIZ", icon:"◆"},
    {id:"data", label:"DATA", icon:"⬢"},
  ];

  return (
    <div style={{background:"#060c06",minHeight:"100vh",fontFamily:"'Share Tech Mono',monospace",color:"#00ff88",display:"flex",flexDirection:"column",position:"relative"}}>
      {/* Scanlines */}
      <div style={{position:"fixed",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,136,0.012) 2px,rgba(0,255,136,0.012) 4px)",pointerEvents:"none",zIndex:9999}} />

      {/* HEADER */}
      <div style={{background:"#0a140a",borderBottom:"1px solid #00ff8822",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,border:"1px solid #00ff88",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 0 8px #00ff8833"}}>⬡</div>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#00ff88",letterSpacing:2,textShadow:"0 0 6px #00ff88"}}>{TEAM_NAME}</div>
            <div style={{fontSize:8,color:"#00ff8544",letterSpacing:1}}>ICT1222 · FIREBASE LIVE</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:profile.color}}>{profile.username}</div>
            <div style={{fontSize:9,color:"#00ff8544"}}>{pct}% done · Firebase</div>
          </div>
          <button onClick={doLogout} style={{background:"transparent",border:"1px solid #ff444433",borderRadius:4,color:"#ff4444",fontSize:9,padding:"4px 8px",letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>EXIT</button>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{height:3,background:"#0a140a",flexShrink:0}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#00ff88,#00ccff)",transition:"width 0.6s",boxShadow:"0 0 8px #00ff88"}} />
      </div>

      {/* CONTENT AREA */}
      <div style={{flex:1,overflow:"auto",paddingBottom:64}}>

        {/* ══ TASKS ══════════════════════════════════════ */}
        {activeTab === "tasks" && (
          <div style={{padding:"14px 12px 0"}}>
            {/* Stats */}
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              {[{l:"TOTAL",v:pubTasks.length,c:"#00ff88"},{l:"DONE",v:totalDone,c:"#00ccff"},{l:"LEFT",v:pubTasks.length-totalDone,c:"#ffaa00"},{l:"%",v:pct+"%",c:"#ff66cc"}].map(s=>(
                <div key={s.l} style={{flex:"1 1 70px",background:"#0a140a",border:`1px solid ${s.c}22`,borderRadius:8,padding:"8px 10px",minWidth:70}}>
                  <div style={{fontSize:8,color:"#00ff8544",letterSpacing:2,marginBottom:3}}>{s.l}</div>
                  <div style={{fontSize:18,fontWeight:"bold",color:s.c,fontFamily:"'Orbitron',monospace",textShadow:`0 0 6px ${s.c}`}}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{marginBottom:8}}>
              <div style={{fontSize:8,color:"#00ff8533",letterSpacing:2,marginBottom:5}}>BY MEMBER</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["All",...TEAM_MEMBERS].map(m=>{
                  const c=MEMBER_COLORS[m]||"#00ff88";
                  return <button key={m} onClick={()=>setTaskFilter(m)} style={{padding:"3px 10px",borderRadius:20,border:`1px solid ${taskFilter===m?c:"#00ff8822"}`,background:taskFilter===m?c+"22":"transparent",color:taskFilter===m?c:"#00ff8544",fontSize:9,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>{m}</button>;
                })}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:8,color:"#00ff8533",letterSpacing:2,marginBottom:5}}>BY WEEK</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                <button onClick={()=>setWeekFilter(0)} style={{padding:"3px 8px",borderRadius:20,border:`1px solid ${weekFilter===0?"#00ff88":"#00ff8822"}`,background:weekFilter===0?"#00ff8822":"transparent",color:weekFilter===0?"#00ff88":"#00ff8544",fontSize:9,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>ALL</button>
                {Object.keys(WEEK_INFO).map(w=>(
                  <button key={w} onClick={()=>setWeekFilter(Number(w))} style={{padding:"3px 8px",borderRadius:20,border:`1px solid ${weekFilter===Number(w)?"#00ff88":"#00ff8822"}`,background:weekFilter===Number(w)?"#00ff8822":"transparent",color:weekFilter===Number(w)?"#00ff88":"#00ff8544",fontSize:9,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>W{w}</button>
                ))}
              </div>
            </div>

            {/* Add task btn */}
            <button onClick={()=>setShowAddTask(!showAddTask)} style={{width:"100%",marginBottom:10,padding:"8px 0",background:"#00ff8811",border:"1px dashed #00ff8833",borderRadius:8,color:"#00ff88",fontSize:11,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
              {showAddTask?"[ CANCEL ]":"[ + ADD TASK ]"}
            </button>

            {showAddTask && (
              <div style={{background:"#0a140a",border:"1px solid #00ff8833",borderRadius:8,padding:14,marginBottom:12}}>
                <div style={{fontSize:8,color:"#00ff8544",letterSpacing:2,marginBottom:8}}>NEW TASK</div>
                <input value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} placeholder="Task description..."
                  style={{width:"100%",background:"#060c06",border:"1px solid #00ff8833",borderRadius:4,padding:"8px 10px",color:"#00ff88",fontSize:12,marginBottom:8,fontFamily:"'Share Tech Mono',monospace",outline:"none"}} />
                <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                  <select value={newTask.week} onChange={e=>setNewTask({...newTask,week:Number(e.target.value)})}
                    style={{flex:1,minWidth:90,background:"#060c06",border:"1px solid #00ff8833",borderRadius:4,padding:"6px 8px",color:"#00ff88",fontSize:10,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                    {Object.keys(WEEK_INFO).map(w=><option key={w} value={w}>Week {w}</option>)}
                  </select>
                  <select value={newTask.assignee} onChange={e=>setNewTask({...newTask,assignee:e.target.value})}
                    style={{flex:1,minWidth:90,background:"#060c06",border:"1px solid #00ff8833",borderRadius:4,padding:"6px 8px",color:"#00ff88",fontSize:10,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                    {["All",...TEAM_MEMBERS].map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <label style={{display:"flex",alignItems:"center",gap:8,fontSize:10,color:"#00ff8577",marginBottom:10,cursor:"pointer"}}>
                  <input type="checkbox" checked={newTask.isPrivate} onChange={e=>setNewTask({...newTask,isPrivate:e.target.checked})} style={{accentColor:"#00ff88"}} />
                  PRIVATE (only you can see this)
                </label>
                <button onClick={addTask} style={{width:"100%",padding:"8px 0",background:"#00ff8822",border:"1px solid #00ff88",borderRadius:6,color:"#00ff88",fontSize:11,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                  [ SAVE TO FIREBASE ]
                </button>
              </div>
            )}

            {/* Tasks by week */}
            {weeks.map(week=>{
              const wt=visibleTasks.filter(t=>t.week===week);
              const wd=wt.filter(t=>t.done).length;
              if(!wt.length) return null;
              return (
                <div key={week} style={{marginBottom:18}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{fontSize:11,color:"#00ff88",letterSpacing:2,fontFamily:"'Orbitron',monospace",flexShrink:0}}>W{week}</div>
                    <div style={{fontSize:8,color:"#00ff8533"}}>{WEEK_INFO[week]?.dates}</div>
                    <div style={{flex:1,height:1,background:"#00ff8811"}} />
                    <div style={{fontSize:9,color:wd===wt.length?"#00ff88":"#00ff8533"}}>{wd}/{wt.length}</div>
                  </div>
                  {wt.map(task=>(
                    <div key={task.fsId||task.id} style={{background:"#0a140a",border:`1px solid ${task.deadline?"#ff444433":task.isPrivate?"#ffaa0022":"#00ff8811"}`,borderRadius:8,padding:"10px 12px",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                        {/* Checkbox */}
                        <button onClick={()=>toggleDone(task)} style={{width:18,height:18,borderRadius:4,border:`1px solid ${task.done?"#00ff88":"#00ff8833"}`,background:task.done?"#00ff88":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,cursor:"pointer",transition:"all 0.2s"}}>
                          {task.done&&<span style={{color:"#060c06",fontSize:12,fontWeight:"bold",lineHeight:1}}>✓</span>}
                        </button>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
                            {task.deadline&&<span style={{color:"#ff4444",fontSize:11,flexShrink:0}}>⚑</span>}
                            {task.isPrivate&&<span style={{fontSize:8,padding:"1px 5px",background:"#ffaa0022",border:"1px solid #ffaa0033",borderRadius:20,color:"#ffaa00",flexShrink:0}}>PRIVATE</span>}
                            <span style={{fontSize:12,color:task.done?"#00ff8833":"#aaffcc",textDecoration:task.done?"line-through":"none",wordBreak:"break-word"}}>{task.title}</span>
                          </div>
                          <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap",alignItems:"center"}}>
                            <span style={{fontSize:8,padding:"1px 8px",borderRadius:20,background:(MEMBER_COLORS[task.assignee]||"#00ff88")+"22",border:`1px solid ${(MEMBER_COLORS[task.assignee]||"#00ff88")}33`,color:MEMBER_COLORS[task.assignee]||"#00ff88"}}>
                              {task.assignee}
                            </span>
                          </div>
                          {task.note&&editNote!==(task.fsId||task.id)&&(
                            <div style={{marginTop:6,fontSize:10,color:"#00ccff",background:"#00ccff11",borderLeft:"2px solid #00ccff44",padding:"3px 8px",borderRadius:"0 4px 4px 0"}}>
                              📝 {task.note}
                            </div>
                          )}
                          {editNote===(task.fsId||task.id)&&(
                            <div style={{marginTop:8}}>
                              <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={2} placeholder="Type note..."
                                style={{width:"100%",background:"#060c06",border:"1px solid #00ff88",borderRadius:4,padding:"6px 8px",color:"#00ff88",fontSize:11,resize:"vertical",fontFamily:"'Share Tech Mono',monospace",outline:"none"}} />
                              <div style={{display:"flex",gap:6,marginTop:4}}>
                                <button onClick={()=>saveNote(task)} style={{padding:"4px 12px",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:4,color:"#00ff88",fontSize:9,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>SAVE</button>
                                <button onClick={()=>{setEditNote(null);setNoteText("");}} style={{padding:"4px 12px",background:"transparent",border:"1px solid #00ff8833",borderRadius:4,color:"#00ff8566",fontSize:9,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>CANCEL</button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{display:"flex",gap:3,flexShrink:0}}>
                          <button onClick={()=>{setEditNote(task.fsId||task.id);setNoteText(task.note||"");}} style={{background:"transparent",border:"none",color:"#00ff8555",fontSize:13,padding:2,cursor:"pointer"}} title="Note">📝</button>
                          <button onClick={()=>deleteTask(task)} style={{background:"transparent",border:"none",color:"#ff444455",fontSize:13,padding:2,cursor:"pointer"}} title="Delete">🗑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            {visibleTasks.length===0&&<div style={{textAlign:"center",color:"#00ff8522",padding:40,fontSize:11}}>NO TASKS — USE DATA TAB TO SEED TASKS</div>}
          </div>
        )}

        {/* ══ CHAT ═══════════════════════════════════════ */}
        {activeTab === "chat" && (
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
            <div style={{flex:1,overflow:"auto",padding:"12px 12px",display:"flex",flexDirection:"column",gap:8}}>
              {messages.length===0&&<div style={{textAlign:"center",color:"#00ff8522",padding:40,fontSize:11}}>NO MESSAGES YET<br/><span style={{fontSize:9}}>BE THE FIRST TO MESSAGE!</span></div>}
              {messages.map(msg=>{
                const isMe=msg.user===profile.username;
                return (
                  <div key={msg.id} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:8,alignItems:"flex-end"}}>
                    <div style={{width:26,height:26,borderRadius:6,background:(msg.color||"#00ff88")+"22",border:`1px solid ${msg.color||"#00ff88"}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:msg.color||"#00ff88",flexShrink:0}}>
                      {(msg.user||"?")[0].toUpperCase()}
                    </div>
                    <div style={{maxWidth:"73%"}}>
                      {!isMe&&<div style={{fontSize:8,color:msg.color||"#00ff88",marginBottom:3,letterSpacing:1}}>{msg.user}</div>}
                      <div style={{background:isMe?"#00ff8820":"#0a140a",border:`1px solid ${isMe?"#00ff8844":"#00ff8811"}`,borderRadius:isMe?"8px 2px 8px 8px":"2px 8px 8px 8px",padding:"8px 12px",fontSize:12,color:isMe?"#00ff88":"#aaffcc",lineHeight:1.5,wordBreak:"break-word"}}>
                        {msg.text}
                      </div>
                      <div style={{fontSize:8,color:"#00ff8533",marginTop:2,textAlign:isMe?"right":"left"}}>{msg.time}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div style={{padding:"10px 12px",background:"#0a140a",borderTop:"1px solid #00ff8811",display:"flex",gap:8}}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}
                placeholder="Message... (Enter to send)"
                style={{flex:1,background:"#060c06",border:"1px solid #00ff8833",borderRadius:6,padding:"10px 12px",color:"#00ff88",fontSize:12,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}
                onFocus={e=>e.target.style.borderColor="#00ff88"} onBlur={e=>e.target.style.borderColor="#00ff8833"} />
              <button onClick={sendMsg} style={{padding:"10px 14px",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:6,color:"#00ff88",fontSize:11,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>SEND</button>
            </div>
          </div>
        )}

        {/* ══ TEAM ═══════════════════════════════════════ */}
        {activeTab === "team" && (
          <div style={{padding:12}}>
            <div style={{fontSize:8,color:"#00ff8533",letterSpacing:2,marginBottom:12}}>TEAM OVERVIEW · {TEAM_NAME}</div>
            {TEAM_MEMBERS.map(m=>{
              const mc=MEMBER_COLORS[m]||"#00ff88";
              const mt=pubTasks.filter(t=>t.assignee===m||t.assignee==="All");
              const md=mt.filter(t=>t.done).length;
              const mp=mt.length?Math.round(md/mt.length*100):0;
              const dl=mt.filter(t=>t.deadline&&!t.done);
              return (
                <div key={m} style={{background:"#0a140a",border:`1px solid ${mc}22`,borderRadius:10,padding:14,marginBottom:10,cursor:"pointer"}}
                  onClick={()=>setMemberView(memberView===m?null:m)}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:38,height:38,borderRadius:8,background:mc+"22",border:`2px solid ${mc}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:mc,boxShadow:`0 0 10px ${mc}22`,flexShrink:0}}>
                      {m[0]}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,color:mc,letterSpacing:0.5,textShadow:m===profile.username?`0 0 6px ${mc}`:"none"}}>
                        {m}{m===profile.username&&" ← YOU"}
                      </div>
                      <div style={{fontSize:9,color:"#00ff8533",marginTop:2}}>{md}/{mt.length} tasks · {mp}% done</div>
                      <div style={{marginTop:5,background:"#060c06",borderRadius:2,height:3}}>
                        <div style={{height:"100%",width:`${mp}%`,background:mc,boxShadow:`0 0 4px ${mc}`,transition:"width 0.5s"}} />
                      </div>
                    </div>
                    <div style={{fontSize:12,color:mc+"44"}}>{memberView===m?"▲":"▼"}</div>
                  </div>
                  {dl.length>0&&(
                    <div style={{marginTop:10,padding:"6px 10px",background:"#ff000011",border:"1px solid #ff444422",borderRadius:6}}>
                      <div style={{fontSize:8,color:"#ff4444",letterSpacing:1,marginBottom:3}}>⚑ PENDING DEADLINES</div>
                      {dl.map(d=><div key={d.fsId||d.id} style={{fontSize:10,color:"#ff6666"}}>· {d.title}</div>)}
                    </div>
                  )}
                  {memberView===m&&(
                    <div style={{marginTop:12,borderTop:"1px solid #00ff8811",paddingTop:10}}>
                      <div style={{fontSize:8,color:"#00ff8533",letterSpacing:2,marginBottom:8}}>ALL TASKS</div>
                      {mt.map(t=>(
                        <div key={t.fsId||t.id} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6,padding:"6px 10px",background:"#060c06",borderRadius:6,border:`1px solid ${t.done?"#00ff8822":"#00ff8811"}`}}>
                          <span style={{color:t.done?"#00ff88":"#00ff8533",fontSize:11,flexShrink:0}}>{t.done?"✓":"○"}</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:10,color:t.done?"#00ff8855":"#aaffcc",textDecoration:t.done?"line-through":"none"}}>
                              {t.deadline&&<span style={{color:"#ff4444",marginRight:4}}>⚑</span>}{t.title}
                            </div>
                            {t.note&&<div style={{fontSize:9,color:"#00ccff",marginTop:2,borderLeft:"1px solid #00ccff33",paddingLeft:5}}>📝 {t.note}</div>}
                            <div style={{fontSize:8,color:"#00ff8533",marginTop:2}}>Week {t.week} · {WEEK_INFO[t.week]?.dates}</div>
                          </div>
                        </div>
                      ))}
                      {mt.length===0&&<div style={{fontSize:10,color:"#00ff8522"}}>No tasks assigned</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ QUIZ ═══════════════════════════════════════ */}
        {activeTab === "quiz" && (
          <div style={{padding:14}}>
            <div style={{fontSize:8,color:"#00ff8533",letterSpacing:2,marginBottom:14}}>KNOWLEDGE CHECK · ICT1222 DBMS</div>
            {!quizActive&&!quizDone&&(
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:40,marginBottom:12}}>◆</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,color:"#00ff88",marginBottom:8,textShadow:"0 0 8px #00ff88"}}>DBMS QUIZ</div>
                <div style={{fontSize:10,color:"#00ff8577",marginBottom:24,lineHeight:2}}>
                  MySQL · UGC Circular Grading · SQL Commands<br/>
                  Stored Procedures · Views · User Permissions<br/>
                  <span style={{fontSize:9,color:"#00ff8533"}}>{QUIZ_QUESTIONS.length} questions</span>
                </div>
                <button onClick={startQuiz} style={{padding:"14px 40px",background:"#00ff8822",border:"1px solid #00ff88",borderRadius:8,color:"#00ff88",fontSize:13,letterSpacing:3,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",boxShadow:"0 0 16px #00ff8822"}}>
                  START QUIZ
                </button>
              </div>
            )}
            {quizActive&&!quizDone&&shuffled[quizQ]&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:10,color:"#00ff8555"}}>Q {quizQ+1} / {shuffled.length}</div>
                  <div style={{fontSize:10,color:"#00ccff"}}>SCORE: {quizScore}</div>
                </div>
                <div style={{background:"#0a140a",borderRadius:2,height:3,marginBottom:14}}>
                  <div style={{height:"100%",width:`${(quizQ/shuffled.length)*100}%`,background:"#00ff88",transition:"width 0.4s"}} />
                </div>
                <div style={{background:"#0a140a",border:"1px solid #00ff8833",borderRadius:10,padding:18,marginBottom:14}}>
                  <div style={{fontSize:13,color:"#aaffcc",lineHeight:1.7}}>{shuffled[quizQ].q}</div>
                </div>
                {shuffled[quizQ].opts.map((opt,i)=>{
                  let bg="#0a140a",bc="#00ff8822",c="#00ff8877";
                  if(quizAnswered!==null){
                    if(i===shuffled[quizQ].ans){bg="#00ff8820";bc="#00ff88";c="#00ff88";}
                    else if(i===quizAnswered){bg="#ff000020";bc="#ff4444";c="#ff4444";}
                  }
                  return <button key={i} onClick={()=>answerQuiz(i)} style={{width:"100%",marginBottom:8,padding:"12px 14px",background:bg,border:`1px solid ${bc}`,borderRadius:8,color:c,fontSize:11,textAlign:"left",lineHeight:1.5,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",transition:"all 0.15s"}}>
                    <span style={{color:"#00ff8544",marginRight:8}}>{["A","B","C","D"][i]}.</span>{opt}
                  </button>;
                })}
              </div>
            )}
            {quizDone&&(
              <div style={{textAlign:"center",padding:"30px 20px"}}>
                <div style={{fontSize:40,marginBottom:10}}>{quizScore>=shuffled.length*0.8?"🏆":"📊"}</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:24,color:"#00ff88",marginBottom:6,textShadow:"0 0 10px #00ff88"}}>{quizScore}/{shuffled.length}</div>
                <div style={{fontSize:20,color:quizScore>=shuffled.length*0.8?"#00ff88":quizScore>=shuffled.length*0.6?"#ffaa00":"#ff4444",fontFamily:"'Orbitron',monospace",marginBottom:12}}>{Math.round(quizScore/shuffled.length*100)}%</div>
                <div style={{fontSize:11,color:"#00ff8577",marginBottom:20}}>
                  {quizScore===shuffled.length?"PERFECT SCORE! You're ready! 🎯":quizScore>=shuffled.length*0.8?"EXCELLENT KNOWLEDGE!":quizScore>=shuffled.length*0.6?"GOOD — Review weak areas.":"Keep studying the materials!"}
                </div>
                <button onClick={startQuiz} style={{padding:"12px 32px",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:8,color:"#00ff88",fontSize:12,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>TRY AGAIN</button>
              </div>
            )}
          </div>
        )}

        {/* ══ DATA / FIREBASE TAB ════════════════════════ */}
        {activeTab === "data" && (
          <div style={{padding:14}}>
            <div style={{fontSize:8,color:"#00ff8533",letterSpacing:2,marginBottom:14}}>FIREBASE DATABASE MANAGEMENT</div>

            {/* Status */}
            <div style={{background:"#0a140a",border:"1px solid #00ff8833",borderRadius:10,padding:16,marginBottom:14}}>
              <div style={{fontSize:10,color:"#00ff8577",marginBottom:10,letterSpacing:1}}>⬢ FIREBASE STATUS</div>
              <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 6px #00ff88"}} />
                <span style={{fontSize:11,color:"#aaffcc"}}>Firestore Connected</span>
              </div>
              <div style={{fontSize:10,color:"#00ff8544",marginBottom:4}}>PROJECT: project-manager-29381</div>
              <div style={{fontSize:10,color:"#00ff8544",marginBottom:4}}>PUBLIC TASKS IN DB: {pubTasks.length}</div>
              <div style={{fontSize:10,color:"#00ff8544",marginBottom:4}}>CHAT MESSAGES: {messages.length}</div>
              <div style={{fontSize:10,color:"#00ff8544"}}>LOGGED IN AS: {profile.username} ({profile.role})</div>
            </div>

            {/* MIGRATE / SEED BUTTONS */}
            <div style={{background:"#0a140a",border:"1px solid #ffaa0033",borderRadius:10,padding:16,marginBottom:14}}>
              <div style={{fontSize:10,color:"#ffaa00",marginBottom:12,letterSpacing:1}}>⬢ SEED DEFAULT TASKS TO FIREBASE</div>
              <p style={{fontSize:10,color:"#00ff8566",marginBottom:12,lineHeight:1.6}}>
                ❗ Click this button ONCE to add all {INITIAL_TASKS.length} default project tasks into Firebase Firestore. After seeding, tasks appear on all devices automatically.
              </p>
              <button onClick={seedTasks} disabled={migrating} style={{width:"100%",padding:"12px 0",background:"#ffaa0020",border:"1px solid #ffaa00",borderRadius:8,color:"#ffaa00",fontSize:12,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:migrating?"not-allowed":"pointer",marginBottom:10}}>
                {migrating?"WORKING...":"[ SEED TASKS → FIREBASE ]"}
              </button>

              <div style={{fontSize:10,color:"#00ff8566",marginBottom:12,marginTop:8,lineHeight:1.6}}>
                Already used the app before? Click to migrate old local data to Firebase:
              </div>
              <button onClick={migrateFromStorage} disabled={migrating} style={{width:"100%",padding:"12px 0",background:"#00ccff20",border:"1px solid #00ccff",borderRadius:8,color:"#00ccff",fontSize:12,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:migrating?"not-allowed":"pointer"}}>
                {migrating?"MIGRATING...":"[ MIGRATE LOCAL → FIREBASE ]"}
              </button>

              {migrateMsg&&(
                <div style={{marginTop:12,padding:"8px 12px",background:migrateMsg.startsWith("✓")?"#00ff8811":"#ff000011",border:`1px solid ${migrateMsg.startsWith("✓")?"#00ff8844":"#ff444433"}`,borderRadius:6,fontSize:11,color:migrateMsg.startsWith("✓")?"#00ff88":"#ff4444"}}>
                  {migrateMsg}
                </div>
              )}
            </div>

            {/* CLEAR CHAT */}
            <div style={{background:"#0a140a",border:"1px solid #ff444422",borderRadius:10,padding:16,marginBottom:14}}>
              <div style={{fontSize:10,color:"#ff4444",marginBottom:12,letterSpacing:1}}>⚠ DANGER ZONE</div>
              <p style={{fontSize:10,color:"#00ff8566",marginBottom:12,lineHeight:1.6}}>
                Clear all chat messages from Firebase (cannot be undone).
              </p>
              <button onClick={async()=>{
                if(!window.confirm("Delete ALL chat messages? This cannot be undone.")) return;
                const snap=await getDocs(collection(db,CHAT_COL));
                const batch=writeBatch(db);
                snap.docs.forEach(d=>batch.delete(d.ref));
                await batch.commit();
                showToast("Chat cleared!");
              }} style={{width:"100%",padding:"10px 0",background:"#ff000011",border:"1px solid #ff444433",borderRadius:8,color:"#ff4444",fontSize:11,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                [ CLEAR ALL CHAT ]
              </button>
            </div>

            {/* Firestore rules reminder */}
            <div style={{background:"#0a140a",border:"1px solid #00ccff22",borderRadius:10,padding:16}}>
              <div style={{fontSize:10,color:"#00ccff",marginBottom:10,letterSpacing:1}}>📋 FIRESTORE RULES REMINDER</div>
              <p style={{fontSize:10,color:"#00ff8566",lineHeight:1.8}}>
                Make sure your Firebase Console → Firestore → Rules are set to allow read/write for authenticated users. See the README for exact rules to paste.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a140a",borderTop:"1px solid #00ff8822",display:"flex",zIndex:200}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:"10px 4px",background:activeTab===t.id?"#00ff8815":"transparent",border:"none",borderTop:activeTab===t.id?"2px solid #00ff88":"2px solid transparent",color:activeTab===t.id?"#00ff88":"#00ff8544",fontSize:8,letterSpacing:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",transition:"all 0.15s"}}>
            <span style={{fontSize:15}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:8,padding:"10px 20px",fontSize:11,color:"#00ff88",zIndex:9999,boxShadow:"0 0 20px #00ff8833",whiteSpace:"nowrap",fontFamily:"'Share Tech Mono',monospace"}}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
