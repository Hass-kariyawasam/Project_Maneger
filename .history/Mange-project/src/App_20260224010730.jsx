// src/App.jsx  ─  ICT1222 Team App  |  English Version
import { useState, useEffect, useRef } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";
import {
  collection, doc, setDoc, getDoc, getDocs,
  addDoc, onSnapshot, query, orderBy,
  deleteDoc, updateDoc, serverTimestamp,
  writeBatch,
  getFirestore,
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── CONSTANTS ────────────────────────────────────────────────
const TEAM_NAME   = "HassKariyawasamtiks";
const EMAIL_DOMAIN = "@ict1222.team";

const TEAM_MEMBERS = ["HassKariyawasamtiks","Member2","Member3","Member4"];
const MEMBER_COLORS = {
  "HassKariyawasamtiks":"#00ff88",
  "Member2":"#00ccff",
  "Member3":"#ffaa00",
  "Member4":"#ff66cc",
};

const INITIAL_TASKS = [
  {id:"t_meeting",week:1,title:"Urgent: Client / Supervisor Meeting",assignee:"All",deadline:true},
  {id:"t1",week:1,title:"Install MySQL Server 8.0+",assignee:"All",deadline:false},
  {id:"t2",week:1,title:"Install MySQL Workbench",assignee:"All",deadline:false},
  {id:"t3",week:1,title:"Install VS Code + Extensions",assignee:"All",deadline:false},
  {id:"t4",week:1,title:"Install Git + GitHub Desktop",assignee:"All",deadline:false},
  {id:"t5",week:1,title:"Create GitHub Repo (Private)",assignee:"HassKariyawasamtiks",deadline:false},
  {id:"t6",week:1,title:"Read UGC Circular No. 12-2024",assignee:"All",deadline:false},
  {id:"t7",week:2,title:"Identify Entities and Attributes",assignee:"All",deadline:false},
  {id:"t8",week:3,title:"Draft ER Diagram",assignee:"Member2",deadline:false},
  {id:"t9",week:4,title:"Project Customizations & Setup",assignee:"HassKariyawasamtiks",deadline:false},
  {id:"t31",week:7,title:"Submit ER Diagram — Deadline: April 21",assignee:"HassKariyawasamtiks",deadline:true},
  {id:"t38",week:9,title:"Submit Relational Mapping — Deadline: April 28",assignee:"HassKariyawasamtiks",deadline:true},
  {id:"t42",week:10,title:"Submit Final Report + MySQL Script — May 5",assignee:"HassKariyawasamtiks",deadline:true},
];

const WEEK_INFO = {
  1:{label:"Week 1",dates:"Feb 23–Mar 1"},2:{label:"Week 2",dates:"Mar 2–8"},
  3:{label:"Week 3",dates:"Mar 9–15"},4:{label:"Week 4",dates:"Mar 16–22"},
  5:{label:"Week 5",dates:"Mar 23–29"},6:{label:"Week 6",dates:"Mar 30–Apr 5"},
  7:{label:"Week 7",dates:"Apr 6–13"},8:{label:"Week 8",dates:"Apr 14–21"},
  9:{label:"Week 9",dates:"Apr 22–28"},10:{label:"Week 10",dates:"Apr 29–May 5"},
};

const QUIZ_QUESTIONS = [
  {q:"What is the full form of DBMS?",opts:["Data Base Management System","Database Management System","Distributed Binary Management System","Data Binary Mapping System"],ans:1},
  {q:"Which MySQL user has ALL privileges WITH GRANT OPTION in our project?",opts:["Dean","Lecturer","Admin","Technical Officer"],ans:2},
];

const TASKS_COL = "tasks";
const CHAT_COL  = "chat";
const USERS_COL = "users";

// ═════════════════════════════════════════════════════════════
// OUTSIDE COMPONENTS (Fixes the typing focus issue)
// ═════════════════════════════════════════════════════════════
const GInput = ({value,onChange,placeholder,type="text",onKeyDown}) => (
  <input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder}
    style={{width:"100%",background:"#0a140a",border:"1px solid #00ff8833",borderRadius:6,padding:"12px 14px",color:"#00ff88",fontSize:14,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}
    onFocus={e=>e.target.style.borderColor="#00ff88"}
    onBlur={e=>e.target.style.borderColor="#00ff8833"} />
);

const Btn = ({onClick,children,style={},variant="primary"}) => {
  const base = variant==="primary"
    ? {background:"#00ff8820",border:"1px solid #00ff88",color:"#00ff88"}
    : {background:"transparent",border:"1px solid #00ff8833",color:"#00ff8866"};
  return (
    <button onClick={onClick} style={{...base,borderRadius:6,padding:"12px 0",width:"100%",fontSize:14,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",...style}}>
      {children}
    </button>
  );
};

// ═════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════
export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile]   = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [screen, setScreen]   = useState("login");
  const [activeTab, setActiveTab] = useState("tasks");

  // Auth form
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
  const [newTask, setNewTask]   = useState({title:"",week:1,assignee:"All",isPrivate:false,deadline:false});
  const [editNote, setEditNote] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Chat
  const [messages, setMessages] = useState([]);
  const [chatMsg, setChatMsg]   = useState("");
  const chatEndRef = useRef(null);

  // Quiz
  const [quizActive, setQuizActive]   = useState(false);
  const [quizQ, setQuizQ]             = useState(0);
  const [quizScore, setQuizScore]     = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(null);
  const [quizDone, setQuizDone]       = useState(false);
  const [shuffled, setShuffled]       = useState([]);

  // Data 
  const [migrating, setMigrating]     = useState(false);
  const [migrateMsg, setMigrateMsg]   = useState("");
  const [toast, setToast] = useState(null);

  // ── FIREBASE AUTH LISTENER ────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
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

  // ── REALTIME LISTENERS ────────────────────────────────────
  useEffect(() => {
    if (!authUser || !profile) return;

    const unsubTasks = onSnapshot(
      collection(db, TASKS_COL),
      (snap) => {
        const pub = snap.docs.map(d => ({ fsId: d.id, ...d.data() }));
        pub.sort((a, b) => {
          if (a.week !== b.week) return (a.week || 0) - (b.week || 0);
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeA - timeB;
        });
        
        setTasks(prev => {
          const priv = prev.filter(t => t.isPrivate);
          return [...pub, ...priv];
        });
      },
      (error) => console.error("Snapshot error:", error)
    );

    const privCol = collection(db, USERS_COL, authUser.uid, "privateTasks");
    const unsubPriv = onSnapshot(privCol, (snap) => {
      const priv = snap.docs.map(d => ({ fsId: d.id, ...d.data(), isPrivate: true }));
      setTasks(prev => {
        const pub = prev.filter(t => !t.isPrivate);
        return [...pub, ...priv];
      });
    });

    const unsubChat = onSnapshot(
      query(collection(db, CHAT_COL), orderBy("ts")),
      (snap) => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMessages(msgs);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    );

    return () => { unsubTasks(); unsubPriv(); unsubChat(); };
  }, [authUser, profile]);

  // ── AUTHENTICATION ────────────────────────────────────────
  async function doRegister() {
    setFormErr(""); setFormLoading(true);
    if (!regUser.trim() || regUser.length < 3) { setFormErr("Username must be 3+ characters"); setFormLoading(false); return; }
    if (!regPass || regPass.length < 4) { setFormErr("Password must be 4+ characters"); setFormLoading(false); return; }
    
    try {
      const usersSnap = await getDocs(collection(db, USERS_COL));
      const taken = usersSnap.docs.some(d => d.data().username === regUser.trim());
      if (taken) { setFormErr("Username already taken!"); setFormLoading(false); return; }
      
      const email = regUser.trim().toLowerCase() + EMAIL_DOMAIN;
      const cred  = await createUserWithEmailAndPassword(auth, email, regPass);
      const p     = { username: regUser.trim(), role: regRole, color: MEMBER_COLORS[regRole] || "#00ff88" };
      await setDoc(doc(db, USERS_COL, cred.user.uid), p);
      showToast("Account created successfully!");
    } catch (e) {
      setFormErr("Error: " + (e.code === "auth/email-already-in-use" ? "Name in use." : e.message));
    }
    setFormLoading(false);
  }

  async function doLogin() {
    setFormErr(""); setFormLoading(true);
    try {
      const email = loginUser.trim().toLowerCase() + EMAIL_DOMAIN;
      await signInWithEmailAndPassword(auth, email, loginPass);
    } catch (e) {
      setFormErr("Invalid username or password.");
    }
    setFormLoading(false);
  }

  async function doLogout() {
    await signOut(auth);
    setTasks([]); setMessages([]);
  }

  // ── TASKS LOGIC ───────────────────────────────────────────
  async function addTask() {
    if (!newTask.title.trim()) return;
    const base = { ...newTask, done: false, note: "", createdBy: profile.username, createdAt: serverTimestamp() };
    if (newTask.isPrivate) {
      await addDoc(collection(db, USERS_COL, authUser.uid, "privateTasks"), { ...base });
    } else {
      await addDoc(collection(db, TASKS_COL), { ...base });
    }
    setNewTask({ title:"", week:1, assignee:"All", isPrivate:false, deadline:false });
    setShowAddTask(false);
    showToast("Task Added!");
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
    showToast("Note Saved!");
  }

  async function deleteTask(task) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    if (task.isPrivate) {
      await deleteDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId));
    } else {
      await deleteDoc(doc(db, TASKS_COL, task.fsId));
    }
    showToast("Task Deleted.");
  }

  async function seedTasks() {
    setMigrating(true); setMigrateMsg("Adding default tasks to the system...");
    try {
      const batch = writeBatch(db);
      for (const t of INITIAL_TASKS) {
        const ref = doc(collection(db, TASKS_COL));
        batch.set(ref, { ...t, done:false, note:"", createdBy:"system", createdAt: serverTimestamp() });
      }
      await batch.commit();
      setMigrateMsg(`✓ ${INITIAL_TASKS.length} tasks saved successfully!`);
    } catch(e) { setMigrateMsg("✗ Error: " + e.message); }
    setMigrating(false);
  }

  // ── CHAT LOGIC ────────────────────────────────────────────
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

  // ── QUIZ LOGIC ────────────────────────────────────────────
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

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const pubTasks = tasks.filter(t => !t.isPrivate);
  const totalDone = pubTasks.filter(t => t.done).length;
  const pct = pubTasks.length ? Math.round(totalDone / pubTasks.length * 100) : 0;

  const visibleTasks = tasks.filter(t => {
    if (t.isPrivate && t.createdBy !== profile?.username) return false;
    // Enhanced filtering logic
    const mMatch = taskFilter === "All" || t.assignee === taskFilter || (taskFilter === "MY_TASKS" && (t.assignee === profile.username || t.assignee === "All" || t.createdBy === profile.username));
    const wMatch = weekFilter === 0 || t.week === weekFilter;
    return mMatch && wMatch;
  });
  const weeks = [...new Set(visibleTasks.map(t => t.week))].sort((a,b)=>a-b);

  // ══════════════════════════════════════════════════════════
  // UI COMPONENTS
  // ══════════════════════════════════════════════════════════
  if (!authReady) return (
    <div style={{background:"#060c06",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Share Tech Mono',monospace",color:"#00ff88"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:16}}>⬡</div>
        <div style={{fontSize:16,letterSpacing:3}}>CONNECTING TO SYSTEM...</div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // LOGIN / REGISTER SCREEN
  // ══════════════════════════════════════════════════════════
  if (screen === "login" || screen === "register") return (
    <div style={{background:"#060c06",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Share Tech Mono',monospace",padding:20}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:76,height:76,border:"2px solid #00ff88",borderRadius:16,marginBottom:16,background:"#0a140a",fontSize:36}}>⬡</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,color:"#00ff88",letterSpacing:2}}>ICT1222 PROJECT</div>
          <div style={{fontSize:12,color:"#00ff8588",marginTop:6,letterSpacing:1}}>Duration: 13 Weeks (91 Days)</div>
        </div>

        <div style={{background:"#0a140a",border:"1px solid #00ff8822",borderRadius:12,padding:28}}>
          <div style={{display:"flex",background:"#060c06",borderRadius:8,padding:4,marginBottom:24}}>
            {["login","register"].map(s=>(
              <button key={s} onClick={()=>{setScreen(s);setFormErr("");}} style={{flex:1,padding:"10px 0",background:screen===s?"#00ff8822":"transparent",border:"none",color:screen===s?"#00ff88":"#00ff8544",fontSize:13,letterSpacing:1,borderRadius:6,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                {s==="login"?"[ LOGIN ]":"[ REGISTER ]"}
              </button>
            ))}
          </div>

          {screen === "login" ? (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <div style={{fontSize:11,color:"#00ff8577",marginBottom:8,letterSpacing:2}}>USERNAME</div>
                <GInput value={loginUser} onChange={e=>setLoginUser(e.target.value)} placeholder="Enter username..." />
              </div>
              <div>
                <div style={{fontSize:11,color:"#00ff8577",marginBottom:8,letterSpacing:2}}>PASSWORD</div>
                <GInput type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Enter password..." />
              </div>
              {formErr && <div style={{color:"#ff4444",fontSize:13,padding:"8px 12px",background:"#ff000011",border:"1px solid #ff444433",borderRadius:6}}>{formErr}</div>}
              <Btn onClick={doLogin} style={{marginTop:8}}>
                {formLoading?"AUTHENTICATING...":"LOGIN"}
              </Btn>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <div style={{fontSize:11,color:"#00ff8577",marginBottom:8,letterSpacing:2}}>NEW USERNAME</div>
                <GInput value={regUser} onChange={e=>setRegUser(e.target.value)} placeholder="Choose username..." />
              </div>
              <div>
                <div style={{fontSize:11,color:"#00ff8577",marginBottom:8,letterSpacing:2}}>NEW PASSWORD</div>
                <GInput type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="Choose password (4+ chars)..." />
              </div>
              <div>
                <div style={{fontSize:11,color:"#00ff8577",marginBottom:8,letterSpacing:2}}>TEAM ROLE</div>
                <select value={regRole} onChange={e=>setRegRole(e.target.value)}
                  style={{width:"100%",background:"#0a140a",border:"1px solid #00ff8833",borderRadius:6,padding:"12px 14px",color:"#00ff88",fontSize:14,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                  {TEAM_MEMBERS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {formErr && <div style={{color:"#ff4444",fontSize:13,padding:"8px 12px",background:"#ff000011",border:"1px solid #ff444433",borderRadius:6}}>{formErr}</div>}
              <Btn onClick={doRegister} style={{marginTop:8}}>
                {formLoading?"CREATING...":"CREATE ACCOUNT"}
              </Btn>
            </div>
          )}
        </div>
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
    <div style={{background:"#060c06",minHeight:"100vh",fontFamily:"'Share Tech Mono',monospace",color:"#00ff88",display:"flex",flexDirection:"column"}}>
      
      {/* HEADER WITH DETAILS AND DAYS */}
      <div style={{background:"#0a140a",borderBottom:"1px solid #00ff8822",padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,flexShrink:0}}>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,color:"#00ff88",letterSpacing:1}}>ICT1222 - DBMS Practicum</div>
          <div style={{fontSize:11,color:"#00ff8588",marginTop:4,letterSpacing:1}}>Duration: 13 Weeks (91 Days) | Group: {TEAM_NAME}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,color:profile.color}}>{profile.username}</div>
            <div style={{fontSize:10,color:"#00ff8544"}}>{pct}% done</div>
          </div>
          <button onClick={doLogout} style={{background:"transparent",border:"1px solid #ff444433",borderRadius:6,color:"#ff4444",fontSize:11,padding:"6px 10px",letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>LOGOUT</button>
        </div>
      </div>

      <div style={{height:4,background:"#0a140a",flexShrink:0}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#00ff88,#00ccff)",transition:"width 0.6s"}} />
      </div>

      <div style={{flex:1,overflow:"auto",paddingBottom:80}}>
        
        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div style={{padding:"18px 16px 0"}}>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              {[{l:"TOTAL",v:pubTasks.length,c:"#00ff88"},{l:"DONE",v:totalDone,c:"#00ccff"},{l:"LEFT",v:pubTasks.length-totalDone,c:"#ffaa00"},{l:"%",v:pct+"%",c:"#ff66cc"}].map(s=>(
                <div key={s.l} style={{flex:"1 1 80px",background:"#0a140a",border:`1px solid ${s.c}22`,borderRadius:10,padding:"10px 14px",minWidth:80}}>
                  <div style={{fontSize:10,color:"#00ff8544",letterSpacing:2,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:22,fontWeight:"bold",color:s.c,fontFamily:"'Orbitron',monospace"}}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* ENHANCED TASK FILTERS */}
            <div style={{marginBottom:16, display:"flex", flexWrap:"wrap", gap: 10, alignItems: "center"}}>
              <div style={{fontSize:11,color:"#00ff8566",letterSpacing:1}}>FILTER:</div>
              <button onClick={()=>setTaskFilter("All")} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${taskFilter==="All"?"#00ff88":"#00ff8822"}`,background:taskFilter==="All"?"#00ff8822":"transparent",color:taskFilter==="All"?"#00ff88":"#00ff8544",fontSize:11,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>ALL TASKS</button>
              
              {/* MY TASKS BUTTON */}
              <button onClick={()=>setTaskFilter("MY_TASKS")} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${taskFilter==="MY_TASKS"?"#00ccff":"#00ccff22"}`,background:taskFilter==="MY_TASKS"?"#00ccff22":"transparent",color:taskFilter==="MY_TASKS"?"#00ccff":"#00ff8544",fontSize:11,fontWeight:"bold",fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>🔥 MY TASKS</button>
            </div>

            <button onClick={()=>setShowAddTask(!showAddTask)} style={{width:"100%",marginBottom:16,padding:"10px 0",background:"#00ff8811",border:"1px dashed #00ff8833",borderRadius:8,color:"#00ff88",fontSize:13,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
              {showAddTask?"[ CANCEL ]":"[ + ADD NEW TASK ]"}
            </button>

            {/* TASK INPUT */}
            {showAddTask && (
              <div style={{background:"#0a140a",border:"1px solid #00ff8833",borderRadius:10,padding:16,marginBottom:16}}>
                <div style={{fontSize:10,color:"#00ff8544",letterSpacing:2,marginBottom:10}}>TASK DETAILS</div>
                <input value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} placeholder="Type task description here..."
                  style={{width:"100%",background:"#060c06",border:"1px solid #00ff8833",borderRadius:6,padding:"12px",color:"#00ff88",fontSize:14,marginBottom:10,fontFamily:"'Share Tech Mono',monospace",outline:"none"}} />
                <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                  <select value={newTask.week} onChange={e=>setNewTask({...newTask,week:Number(e.target.value)})}
                    style={{flex:1,minWidth:100,background:"#060c06",border:"1px solid #00ff8833",borderRadius:6,padding:"10px",color:"#00ff88",fontSize:13,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                    {Object.keys(WEEK_INFO).map(w=><option key={w} value={w}>Week {w}</option>)}
                  </select>
                  <select value={newTask.assignee} onChange={e=>setNewTask({...newTask,assignee:e.target.value})}
                    style={{flex:1,minWidth:100,background:"#060c06",border:"1px solid #00ff8833",borderRadius:6,padding:"10px",color:"#00ff88",fontSize:13,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                    {["All",...TEAM_MEMBERS].map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                
                <div style={{display:"flex",gap:16,marginBottom:14, flexWrap:"wrap"}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#00ff8577",cursor:"pointer"}}>
                    <input type="checkbox" checked={newTask.isPrivate} onChange={e=>setNewTask({...newTask,isPrivate:e.target.checked})} style={{accentColor:"#00ff88", width:16, height:16}} />
                    Private Task
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#ff4444aa",cursor:"pointer"}}>
                    <input type="checkbox" checked={newTask.deadline} onChange={e=>setNewTask({...newTask,deadline:e.target.checked})} style={{accentColor:"#ff4444", width:16, height:16}} />
                    Is Urgent/Deadline?
                  </label>
                </div>

                <button onClick={addTask} style={{width:"100%",padding:"12px 0",background:"#00ff8822",border:"1px solid #00ff88",borderRadius:6,color:"#00ff88",fontSize:14,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                  SAVE TASK
                </button>
              </div>
            )}

            {weeks.map(week=>{
              const wt=visibleTasks.filter(t=>t.week===week);
              const wd=wt.filter(t=>t.done).length;
              if(!wt.length) return null;
              return (
                <div key={week} style={{marginBottom:24}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{fontSize:14,color:"#00ff88",letterSpacing:2,fontFamily:"'Orbitron',monospace",flexShrink:0}}>W{week}</div>
                    <div style={{fontSize:11,color:"#00ff8533"}}>{WEEK_INFO[week]?.dates}</div>
                    <div style={{flex:1,height:1,background:"#00ff8811"}} />
                    <div style={{fontSize:11,color:wd===wt.length?"#00ff88":"#00ff8533"}}>{wd}/{wt.length} Completed</div>
                  </div>
                  {wt.map(task=>{
                    // URGENT HIGHLIGHTING LOGIC
                    const isUrgent = task.deadline && !task.done;

                    return (
                    <div key={task.fsId||task.id} style={{
                        background:"#0a140a",
                        border:`1px solid ${isUrgent ? "#ff4444" : task.isPrivate ? "#ffaa0022" : "#00ff8811"}`,
                        boxShadow: isUrgent ? "0 0 12px #ff444433" : "none",
                        borderRadius:8, padding:"14px 14px", marginBottom:8,
                        transition:"all 0.3s"
                      }}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                        <button onClick={()=>toggleDone(task)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${task.done?"#00ff88": isUrgent ? "#ff4444" : "#00ff8833"}`,background:task.done?"#00ff88":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,cursor:"pointer",transition:"all 0.2s"}}>
                          {task.done&&<span style={{color:"#060c06",fontSize:14,fontWeight:"bold",lineHeight:1}}>✓</span>}
                        </button>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                            {isUrgent&&<span style={{color:"#ff4444",fontSize:13,flexShrink:0, animation: "pulse 1.5s infinite"}}>⚑ URGENT</span>}
                            {task.isPrivate&&<span style={{fontSize:10,padding:"2px 6px",background:"#ffaa0022",border:"1px solid #ffaa0033",borderRadius:20,color:"#ffaa00",flexShrink:0}}>PRIVATE</span>}
                            <span style={{fontSize:14,color:task.done?"#00ff8833": isUrgent ? "#ffcccc" : "#aaffcc",textDecoration:task.done?"line-through":"none",wordBreak:"break-word"}}>{task.title}</span>
                          </div>
                          <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
                            <span style={{fontSize:10,padding:"2px 10px",borderRadius:20,background:(MEMBER_COLORS[task.assignee]||"#00ff88")+"22",border:`1px solid ${(MEMBER_COLORS[task.assignee]||"#00ff88")}33`,color:MEMBER_COLORS[task.assignee]||"#00ff88"}}>
                              {task.assignee}
                            </span>
                          </div>
                          
                          {/* NOTE TEXTAREA */}
                          {editNote===(task.fsId||task.id)&&(
                            <div style={{marginTop:10}}>
                              <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={2} placeholder="Type your note here..."
                                style={{width:"100%",background:"#060c06",border:"1px solid #00ff88",borderRadius:6,padding:"10px",color:"#00ff88",fontSize:13,resize:"vertical",fontFamily:"'Share Tech Mono',monospace",outline:"none"}} />
                              <div style={{display:"flex",gap:8,marginTop:6}}>
                                <button onClick={()=>saveNote(task)} style={{padding:"8px 16px",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:6,color:"#00ff88",fontSize:11,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>SAVE</button>
                                <button onClick={()=>{setEditNote(null);setNoteText("");}} style={{padding:"8px 16px",background:"transparent",border:"1px solid #00ff8833",borderRadius:6,color:"#00ff8566",fontSize:11,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>CANCEL</button>
                              </div>
                            </div>
                          )}
                          {task.note&&editNote!==(task.fsId||task.id)&&(
                            <div style={{marginTop:8,fontSize:12,color:"#00ccff",background:"#00ccff11",borderLeft:"3px solid #00ccff44",padding:"6px 10px",borderRadius:"0 6px 6px 0"}}>
                              📝 {task.note}
                            </div>
                          )}

                        </div>
                        <div style={{display:"flex",gap:6,flexShrink:0}}>
                          <button onClick={()=>{setEditNote(task.fsId||task.id);setNoteText(task.note||"");}} style={{background:"transparent",border:"none",color:"#00ff8555",fontSize:15,padding:4,cursor:"pointer"}} title="Edit Note">📝</button>
                          <button onClick={()=>deleteTask(task)} style={{background:"transparent",border:"none",color:"#ff444455",fontSize:15,padding:4,cursor:"pointer"}} title="Delete Task">🗑</button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              );
            })}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)"}}>
            <div style={{flex:1,overflow:"auto",padding:"16px 16px",display:"flex",flexDirection:"column",gap:10}}>
              {messages.length===0&&<div style={{textAlign:"center",color:"#00ff8522",padding:40,fontSize:13}}>NO MESSAGES YET</div>}
              {messages.map(msg=>{
                const isMe=msg.user===profile.username;
                return (
                  <div key={msg.id} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:10,alignItems:"flex-end"}}>
                    <div style={{width:30,height:30,borderRadius:8,background:(msg.color||"#00ff88")+"22",border:`1px solid ${msg.color||"#00ff88"}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:msg.color||"#00ff88",flexShrink:0}}>
                      {(msg.user||"?")[0].toUpperCase()}
                    </div>
                    <div style={{maxWidth:"75%"}}>
                      {!isMe&&<div style={{fontSize:10,color:msg.color||"#00ff88",marginBottom:4,letterSpacing:1}}>{msg.user}</div>}
                      <div style={{background:isMe?"#00ff8820":"#0a140a",border:`1px solid ${isMe?"#00ff8844":"#00ff8811"}`,borderRadius:isMe?"10px 4px 10px 10px":"4px 10px 10px 10px",padding:"10px 14px",fontSize:14,color:isMe?"#00ff88":"#aaffcc",lineHeight:1.5,wordBreak:"break-word"}}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div style={{padding:"12px 16px",background:"#0a140a",borderTop:"1px solid #00ff8811",display:"flex",gap:10}}>
              <input 
                type="text"
                value={chatMsg} 
                onChange={e=>setChatMsg(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){sendMsg();}}}
                placeholder="Type a message..."
                style={{flex:1,background:"#060c06",border:"1px solid #00ff8833",borderRadius:8,padding:"12px 14px",color:"#00ff88",fontSize:14,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}
              />
              <button onClick={sendMsg} style={{padding:"12px 20px",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:8,color:"#00ff88",fontSize:14,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                SEND
              </button>
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === "team" && (
          <div style={{padding:16}}>
            <div style={{fontSize:10,color:"#00ff8533",letterSpacing:2,marginBottom:16}}>TEAM OVERVIEW</div>
            {TEAM_MEMBERS.map(m=>{
              const mc=MEMBER_COLORS[m]||"#00ff88";
              const mt=pubTasks.filter(t=>t.assignee===m||t.assignee==="All");
              const md=mt.filter(t=>t.done).length;
              const mp=mt.length?Math.round(md/mt.length*100):0;
              return (
                <div key={m} style={{background:"#0a140a",border:`1px solid ${mc}22`,borderRadius:12,padding:16,marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:44,height:44,borderRadius:10,background:mc+"22",border:`2px solid ${mc}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:mc,flexShrink:0}}>
                      {m[0]}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,color:mc,letterSpacing:0.5, marginBottom: 4}}>
                        {m}{m===profile.username&&" (You)"}
                      </div>
                      <div style={{fontSize:11,color:"#00ff8533"}}>{md}/{mt.length} tasks completed</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === "quiz" && (
          <div style={{padding:16}}>
            <div style={{fontSize:10,color:"#00ff8533",letterSpacing:2,marginBottom:16}}>KNOWLEDGE CHECK</div>
            {!quizActive&&!quizDone&&(
              <div style={{textAlign:"center",padding:"50px 20px"}}>
                <div style={{fontSize:48,marginBottom:16}}>◆</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,color:"#00ff88",marginBottom:12}}>DBMS QUIZ</div>
                <button onClick={startQuiz} style={{padding:"16px 48px",background:"#00ff8822",border:"1px solid #00ff88",borderRadius:10,color:"#00ff88",fontSize:15,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                  START QUIZ
                </button>
              </div>
            )}
            {quizActive&&!quizDone&&shuffled[quizQ]&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontSize:13,color:"#00ff8555"}}>Question {quizQ+1} of {shuffled.length}</div>
                  <div style={{fontSize:13,color:"#00ccff"}}>Score: {quizScore}</div>
                </div>
                <div style={{background:"#0a140a",border:"1px solid #00ff8833",borderRadius:10,padding:20,marginBottom:16}}>
                  <div style={{fontSize:16,color:"#aaffcc",lineHeight:1.6}}>{shuffled[quizQ].q}</div>
                </div>
                {shuffled[quizQ].opts.map((opt,i)=>{
                  let bg="#0a140a",bc="#00ff8822",c="#00ff8877";
                  if(quizAnswered!==null){
                    if(i===shuffled[quizQ].ans){bg="#00ff8820";bc="#00ff88";c="#00ff88";}
                    else if(i===quizAnswered){bg="#ff000020";bc="#ff4444";c="#ff4444";}
                  }
                  return <button key={i} onClick={()=>answerQuiz(i)} style={{width:"100%",marginBottom:10,padding:"16px",background:bg,border:`1px solid ${bc}`,borderRadius:10,color:c,fontSize:14,textAlign:"left",fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                    {opt}
                  </button>;
                })}
              </div>
            )}
            {quizDone&&(
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:48,marginBottom:12}}>🏆</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:28,color:"#00ff88",marginBottom:12}}>Score: {quizScore}/{shuffled.length}</div>
                <button onClick={startQuiz} style={{padding:"14px 36px",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:10,color:"#00ff88",fontSize:14,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>RETRY QUIZ</button>
              </div>
            )}
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === "data" && (
          <div style={{padding:16}}>
            <div style={{fontSize:10,color:"#00ff8533",letterSpacing:2,marginBottom:16}}>SYSTEM DATA</div>
            <div style={{background:"#0a140a",border:"1px solid #00ff8833",borderRadius:12,padding:20,marginBottom:16}}>
              <p style={{fontSize:13,color:"#00ff8588",marginBottom:16, lineHeight: 1.5}}>Click the button below to add the default project tasks into the database. You only need to do this once.</p>
              <button onClick={seedTasks} disabled={migrating} style={{width:"100%",padding:"14px 0",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:10,color:"#00ff88",fontSize:14,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:migrating?"not-allowed":"pointer",marginBottom:12}}>
                {migrating?"PROCESSING...":"ADD DEFAULT TASKS"}
              </button>
              {migrateMsg&&<div style={{marginTop:16,padding:"12px",background:"#00ff8811",border:"1px solid #00ff8844",borderRadius:8,fontSize:13,color:"#00ff88"}}>{migrateMsg}</div>}
            </div>
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a140a",borderTop:"1px solid #00ff8822",display:"flex",zIndex:200}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:"12px 4px",background:activeTab===t.id?"#00ff8815":"transparent",border:"none",borderTop:activeTab===t.id?"2px solid #00ff88":"2px solid transparent",color:activeTab===t.id?"#00ff88":"#00ff8544",fontSize:11,letterSpacing:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
            <span style={{fontSize:20}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {toast&&(
        <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:"#0a140a",border:"1px solid #00ff88",borderRadius:10,padding:"12px 24px",fontSize:14,color:"#00ff88",zIndex:9999,whiteSpace:"nowrap",fontFamily:"'Share Tech Mono',monospace", boxShadow: "0 0 20px #00ff8833"}}>
          {toast}
        </div>
      )}
    </div>
  );
}