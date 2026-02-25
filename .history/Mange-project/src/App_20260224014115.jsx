// src/App.jsx  ─  Team Workspace App  |  English Version
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

// Firebase Setup
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
const EMAIL_DOMAIN = "@ict1222.team";

const TEAM_MEMBERS = ["Group Leader","Member 2","Member 3","Member 4"];
const MEMBER_COLORS = {
  "Group Leader":"#00ff88",
  "Member 2":"#00ccff",
  "Member 3":"#ffaa00",
  "Member 4":"#ff66cc",
};

const INITIAL_TASKS = [
  {id:"t_meeting",week:1,title:"Urgent: Client / Supervisor Meeting",assignee:"All",deadline:true},
  {id:"t1",week:1,title:"Install MySQL Server 8.0+",assignee:"All",deadline:false},
  {id:"t2",week:1,title:"Install MySQL Workbench",assignee:"All",deadline:false},
  {id:"t3",week:1,title:"Install VS Code + Extensions",assignee:"All",deadline:false},
  {id:"t4",week:1,title:"Install Git + GitHub Desktop",assignee:"All",deadline:false},
  {id:"t5",week:1,title:"Create GitHub Repo (Private)",assignee:"Group Leader",deadline:false},
  {id:"t6",week:1,title:"Read UGC Circular No. 12-2024",assignee:"All",deadline:false},
  {id:"t7",week:2,title:"Identify Entities and Attributes",assignee:"All",deadline:false},
  {id:"t8",week:3,title:"Draft ER Diagram",assignee:"Member 2",deadline:false},
  {id:"t9",week:4,title:"Project Customizations & Setup",assignee:"Group Leader",deadline:false},
  {id:"t31",week:7,title:"Submit ER Diagram — Deadline: April 21",assignee:"Group Leader",deadline:true},
  {id:"t38",week:9,title:"Submit Relational Mapping — Deadline: April 28",assignee:"Group Leader",deadline:true},
  {id:"t42",week:10,title:"Submit Final Report + MySQL Script — May 5",assignee:"Group Leader",deadline:true},
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
// EXTERNAL COMPONENTS (Fixes input focus issues)
// ═════════════════════════════════════════════════════════════
const GInput = ({value,onChange,placeholder,type="text",onKeyDown}) => (
  <input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder}
    style={{width:"100%",background:"#0a140a",border:"1px solid #00ff8833",borderRadius:6,padding:"10px 14px",color:"#00ff88",fontSize:13,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}
    onFocus={e=>e.target.style.borderColor="#00ff88"}
    onBlur={e=>e.target.style.borderColor="#00ff8833"} />
);

const Btn = ({onClick,children,style={},variant="primary"}) => {
  const base = variant==="primary"
    ? {background:"#00ff8820",border:"1px solid #00ff88",color:"#00ff88"}
    : {background:"transparent",border:"1px solid #00ff8833",color:"#00ff8866"};
  return (
    <button onClick={onClick} style={{...base,borderRadius:6,padding:"12px 0",width:"100%",fontSize:13,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",...style}}>
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
  const [regEmail,  setRegEmail]  = useState("");
  const [regTgNumber, setRegTgNumber] = useState("");
  const [regRole,   setRegRole]   = useState("Group Leader");
  const [regTeamName, setRegTeamName] = useState("");
  const [regToken,  setRegToken]  = useState("");
  
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

    // Filter by teamId for Tasks
    const unsubTasks = onSnapshot(
      collection(db, TASKS_COL),
      (snap) => {
        const pub = snap.docs
          .map(d => ({ fsId: d.id, ...d.data() }))
          .filter(t => t.teamId === profile.teamId || !t.teamId); 
          
        pub.sort((a, b) => {
          if (a.week !== b.week) return (a.week || 0) - (b.week || 0);
          
          // Pending tasks appear above completed ones
          if (a.done !== b.done) return a.done ? 1 : -1;
          
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA; // Newer tasks higher if same week and status
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

    // GLOBAL CHAT (No teamId filtering)
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

  // ── HELPER FUNCTIONS ──────────────────────────────────────
  const formatDate = (ts) => {
    if (!ts) return "";
    if (ts.toDate) return ts.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return "";
  };

  // ── AUTHENTICATION ────────────────────────────────────────
  async function doRegister() {
    setFormErr(""); setFormLoading(true);
    if (!regUser.trim() || regUser.length < 3) { setFormErr("Username must be 3+ characters"); setFormLoading(false); return; }
    if (!regPass || regPass.length < 4) { setFormErr("Password must be 4+ characters"); setFormLoading(false); return; }
    if (!regEmail.includes("@")) { setFormErr("Enter a valid email"); setFormLoading(false); return; }
    if (!regTgNumber.trim()) { setFormErr("TG Number is required"); setFormLoading(false); return; }
    
    let foundTeamId = null;
    let foundTeamName = null;
    const isLeader = regRole === TEAM_MEMBERS[0];

    try {
      const usersSnap = await getDocs(collection(db, USERS_COL));
      
      // Token check for members
      if (!isLeader) {
        if (!regToken.trim()) { setFormErr("Ask your Group Leader for the Secret Token!"); setFormLoading(false); return; }
        const leaderDoc = usersSnap.docs.find(d => d.data().teamToken === regToken.trim());
        if (!leaderDoc) {
          setFormErr("Invalid Secret Token!"); setFormLoading(false); return;
        }
        foundTeamId = leaderDoc.data().teamId;
        foundTeamName = leaderDoc.data().teamName;
      } else {
        if (!regTeamName.trim()) { setFormErr("Please provide a Team Name"); setFormLoading(false); return; }
        if (!regToken.trim()) { setFormErr("Create a Secret Token for your members"); setFormLoading(false); return; }
      }

      const taken = usersSnap.docs.some(d => d.data().username === regUser.trim());
      if (taken) { setFormErr("Username already taken!"); setFormLoading(false); return; }
      
      const email = regUser.trim().toLowerCase() + EMAIL_DOMAIN;
      const cred  = await createUserWithEmailAndPassword(auth, email, regPass);
      
      const p = { 
        username: regUser.trim(), 
        email: regEmail.trim(),
        tgNumber: regTgNumber.trim(),
        role: regRole, 
        color: MEMBER_COLORS[regRole] || "#00ff88",
        teamId: isLeader ? cred.user.uid : foundTeamId,
        teamName: isLeader ? regTeamName.trim() : foundTeamName
      };

      if (isLeader) {
        p.teamToken = regToken.trim();
      }

      await setDoc(doc(db, USERS_COL, cred.user.uid), p);
      showToast("Registration successful!");
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
    const base = { ...newTask, done: false, note: "", createdBy: profile.username, createdAt: serverTimestamp(), teamId: profile.teamId };
    if (newTask.isPrivate) {
      await addDoc(collection(db, USERS_COL, authUser.uid, "privateTasks"), { ...base });
    } else {
      await addDoc(collection(db, TASKS_COL), { ...base });
    }
    setNewTask({ title:"", week:1, assignee:"All", isPrivate:false, deadline:false });
    setShowAddTask(false);
    showToast("Task added successfully!");
  }

  async function toggleDone(task) {
    const isDone = !task.done;
    const updateData = { done: isDone };
    if (isDone) {
      updateData.completedAt = serverTimestamp();
    } else {
      updateData.completedAt = null;
    }

    if (task.isPrivate) {
      await updateDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId), updateData);
    } else {
      await updateDoc(doc(db, TASKS_COL, task.fsId), updateData);
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
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    if (task.isPrivate) {
      await deleteDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId));
    } else {
      await deleteDoc(doc(db, TASKS_COL, task.fsId));
    }
    showToast("Task deleted.");
  }

  async function seedTasks() {
    setMigrating(true); setMigrateMsg("Adding default tasks to the system...");
    try {
      const batch = writeBatch(db);
      for (const t of INITIAL_TASKS) {
        const ref = doc(collection(db, TASKS_COL));
        batch.set(ref, { ...t, done:false, note:"", createdBy:profile.username, createdAt: serverTimestamp(), teamId: profile.teamId });
      }
      await batch.commit();
      setMigrateMsg(`✓ ${INITIAL_TASKS.length} tasks saved successfully!`);
    } catch(e) { setMigrateMsg("✗ Error: " + e.message); }
    setMigrating(false);
  }

  async function deleteAllTasks() {
    if (!window.confirm("WARNING: This will delete ALL tasks for your team. Are you sure?")) return;
    setMigrating(true); setMigrateMsg("Deleting tasks...");
    try {
      const snap = await getDocs(collection(db, TASKS_COL));
      const batch = writeBatch(db);
      let count = 0;
      snap.docs.forEach(d => {
        if (d.data().teamId === profile.teamId) {
           batch.delete(d.ref);
           count++;
        }
      });
      await batch.commit();
      setMigrateMsg(`✓ ${count} tasks deleted successfully!`);
    } catch(e) { setMigrateMsg("✗ Error: " + e.message); }
    setMigrating(false);
  }

  // ── CHAT LOGIC ────────────────────────────────────────────
  async function sendMsg() {
    if (!chatMsg.trim()) return;
    await addDoc(collection(db, CHAT_COL), {
      user: profile.username, color: profile.color,
      teamName: profile.teamName || "Unknown Team",
      text: chatMsg.trim(),
      time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      ts: serverTimestamp(),
      teamId: profile.teamId
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
    const mMatch = taskFilter === "All" || t.assignee === taskFilter || (taskFilter === "MY_TASKS" && (t.assignee === profile.username || t.assignee === "All" || t.createdBy === profile.username));
    const wMatch = weekFilter === 0 || t.week === weekFilter;
    return mMatch && wMatch;
  });
  const weeks = [...new Set(visibleTasks.map(t => t.week))].sort((a,b)=>a-b);
  const urgentTasks = pubTasks.filter(t => t.deadline && !t.done);

  // ══════════════════════════════════════════════════════════
  // UI COMPONENTS
  // ══════════════════════════════════════════════════════════
  if (!authReady) return (
    <div style={{background:"#060c06",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Share Tech Mono',monospace",color:"#00ff88"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:16, color:"#ffffff"}}>⬡</div>
        <div style={{fontSize:16,letterSpacing:3, color:"#ffffff"}}>{profile?.teamName ? profile.teamName.toUpperCase() : "TEAM WORKSPACE"} LOADING...</div>
        <div style={{fontSize:10,color:"#ffffff66",marginTop:12,letterSpacing:1}}>Developed by HassKariyawasam</div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // LOGIN / REGISTER SCREEN
  // ══════════════════════════════════════════════════════════
  if (screen === "login" || screen === "register") return (
    <div style={{background:"#060c06",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Share Tech Mono',monospace",padding:20}}>
      <div style={{width:"100%",maxWidth:380}}>
        
        {/* TEAM WORKSPACE HEADER & CREDITS */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:60,height:60,border:"2px solid #ffffff",borderRadius:12,marginBottom:12,background:"#0a140a",fontSize:28,color:"#ffffff"}}>⬡</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,color:"#ffffff",letterSpacing:2}}>TEAM WORKSPACE</div>
          <div style={{fontSize:11,color:"#00ff88",marginTop:8,letterSpacing:1}}>Duration: 13 Weeks (91 Days)</div>
          <div style={{fontSize:10,color:"#00ff88",marginTop:6,letterSpacing:1}}>Developed by HassKariyawasam</div>
        </div>

        <div style={{background:"#0a140a",border:"1px solid #00ff8822",borderRadius:12,padding:24}}>
          <div style={{display:"flex",background:"#060c06",borderRadius:8,padding:4,marginBottom:20}}>
            {["login","register"].map(s=>(
              <button key={s} onClick={()=>{setScreen(s);setFormErr("");}} style={{flex:1,padding:"8px 0",background:screen===s?"#00ff8822":"transparent",border:"none",color:screen===s?"#00ff88":"#00ff8544",fontSize:12,letterSpacing:1,borderRadius:6,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                {s==="login"?"[ LOGIN ]":"[ REGISTER ]"}
              </button>
            ))}
          </div>

          {screen === "login" ? (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{fontSize:10,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>USERNAME</div>
                <GInput value={loginUser} onChange={e=>setLoginUser(e.target.value)} placeholder="Enter username..." />
              </div>
              <div>
                <div style={{fontSize:10,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>PASSWORD</div>
                <GInput type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Enter password..." />
              </div>
              {formErr && <div style={{color:"#ff4444",fontSize:12,padding:"8px 12px",background:"#ff000011",border:"1px solid #ff444433",borderRadius:6}}>{formErr}</div>}
              <Btn onClick={doLogin} style={{marginTop:4}}>
                {formLoading?"AUTHENTICATING...":"LOGIN"}
              </Btn>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{fontSize:10,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>NEW USERNAME</div>
                <GInput value={regUser} onChange={e=>setRegUser(e.target.value)} placeholder="Choose username..." />
              </div>
              <div>
                <div style={{fontSize:10,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>PASSWORD</div>
                <GInput type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="Minimum 4 characters..." />
              </div>
              <div>
                <div style={{fontSize:10,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>EMAIL</div>
                <GInput type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="Enter your email..." />
              </div>
              <div>
                <div style={{fontSize:10,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>TG NUMBER</div>
                <GInput value={regTgNumber} onChange={e=>setRegTgNumber(e.target.value)} placeholder="e.g. TG/2026/..." />
              </div>
              <div>
                <div style={{fontSize:10,color:"#00ff8577",marginBottom:6,letterSpacing:2}}>TEAM ROLE</div>
                <select value={regRole} onChange={e=>setRegRole(e.target.value)}
                  style={{width:"100%",background:"#0a140a",border:"1px solid #00ff8833",borderRadius:6,padding:"10px 14px",color:"#00ff88",fontSize:13,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                  {TEAM_MEMBERS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {regRole === "Group Leader" ? (
                <>
                  <div>
                    <div style={{fontSize:10,color:"#ffffff88",marginBottom:6,letterSpacing:2}}>TEAM NAME (FOR YOUR GROUP)</div>
                    <GInput value={regTeamName} onChange={e=>setRegTeamName(e.target.value)} placeholder="Enter team name..." />
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"#ffaa00",marginBottom:6,letterSpacing:2}}>SECRET TOKEN (FOR YOUR MEMBERS)</div>
                    <GInput type="password" value={regToken} onChange={e=>setRegToken(e.target.value)} placeholder="e.g. 1234" />
                  </div>
                </>
              ) : (
                <div>
                  <div style={{fontSize:10,color:"#ffaa00",marginBottom:6,letterSpacing:2}}>ENTER SECRET TOKEN FROM LEADER</div>
                  <GInput type="password" value={regToken} onChange={e=>setRegToken(e.target.value)} placeholder="Secret token..." />
                </div>
              )}

              {formErr && <div style={{color:"#ff4444",fontSize:12,padding:"8px 12px",background:"#ff000011",border:"1px solid #ff444433",borderRadius:6}}>{formErr}</div>}
              <Btn onClick={doRegister} style={{marginTop:4}}>
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
    {id:"chat", label:"GLOBAL CHAT", icon:"◈"},
    {id:"team", label:"TEAM", icon:"◉"},
    {id:"quiz", label:"QUIZ", icon:"◆"},
    {id:"data", label:"DATA", icon:"⬢"},
  ];

  const displayTeamName = profile.teamName || "TEAM WORKSPACE";

  return (
    <div style={{background:"#060c06",minHeight:"100vh",fontFamily:"'Share Tech Mono',monospace",color:"#00ff88",display:"flex",flexDirection:"column"}}>
      
      {/* HEADER WITH DETAILS AND DAYS */}
      <div style={{background:"#0a140a",borderBottom:"1px solid #00ff8822",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,flexShrink:0}}>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,color:"#ffffff",letterSpacing:1}}>{displayTeamName}</div>
          <div style={{fontSize:10,color:"#ffffff66",marginTop:2,letterSpacing:1}}>Developed by HassKariyawasam</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,color:profile.color}}>{profile.username}</div>
            <div style={{fontSize:10,color:"#00ff8544"}}>{pct}% done</div>
          </div>
          <button onClick={doLogout} style={{background:"transparent",border:"1px solid #ff444433",borderRadius:6,color:"#ff4444",fontSize:10,padding:"6px 10px",letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>LOGOUT</button>
        </div>
      </div>

      <div style={{height:3,background:"#0a140a",flexShrink:0}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#00ff88,#00ccff)",transition:"width 0.6s"}} />
      </div>

      <div style={{flex:1,overflow:"auto",paddingBottom:80}}>
        
        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div style={{padding:"16px 14px 0"}}>
            
            {/* COMPACT URGENT DEADLINES */}
            {urgentTasks.length > 0 && (
              <div style={{marginBottom:16, background:"#ff444415", border:"1px solid #ff444455", borderRadius:8, padding:10}}>
                <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:8}}>
                  <span style={{fontSize:14, animation:"pulse 1.5s infinite"}}>⚑</span>
                  <div style={{fontSize:11, color:"#ff4444", fontWeight:"bold", letterSpacing:1}}>URGENT DEADLINES</div>
                </div>
                {urgentTasks.map(t => (
                  <div key={t.fsId||t.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", background:"#0a140a", borderRadius:6, marginBottom:4, border:"1px solid #ff444444"}}>
                    <div style={{fontSize:12, color:"#ffcccc", wordBreak:"break-word"}}>{t.title}</div>
                    <div style={{fontSize:9, padding:"2px 6px", borderRadius:12, background:"#ff444433", color:"#ff4444", whiteSpace:"nowrap", marginLeft:10}}>Week {t.week}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {[{l:"TOTAL",v:pubTasks.length,c:"#00ff88"},{l:"DONE",v:totalDone,c:"#00ccff"},{l:"LEFT",v:pubTasks.length-totalDone,c:"#ffaa00"},{l:"%",v:pct+"%",c:"#ff66cc"}].map(s=>(
                <div key={s.l} style={{flex:"1 1 70px",background:"#0a140a",border:`1px solid ${s.c}22`,borderRadius:8,padding:"8px 12px",minWidth:70}}>
                  <div style={{fontSize:9,color:"#00ff8544",letterSpacing:2,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:18,fontWeight:"bold",color:s.c,fontFamily:"'Orbitron',monospace"}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{marginBottom:16, display:"flex", flexWrap:"wrap", gap: 8, alignItems: "center"}}>
              <div style={{fontSize:10,color:"#00ff8566",letterSpacing:1}}>FILTER:</div>
              <button onClick={()=>setTaskFilter("All")} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${taskFilter==="All"?"#00ff88":"#00ff8822"}`,background:taskFilter==="All"?"#00ff8822":"transparent",color:taskFilter==="All"?"#00ff88":"#00ff8544",fontSize:10,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>ALL TASKS</button>
              
              <button onClick={()=>setTaskFilter("MY_TASKS")} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${taskFilter==="MY_TASKS"?"#00ccff":"#00ccff22"}`,background:taskFilter==="MY_TASKS"?"#00ccff22":"transparent",color:taskFilter==="MY_TASKS"?"#00ccff":"#00ff8544",fontSize:10,fontWeight:"bold",fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>🔥 MY TASKS</button>
            </div>

            <div style={{display:"flex", justifyContent:"center", marginBottom:16}}>
              <button onClick={()=>setShowAddTask(!showAddTask)} style={{padding:"8px 24px", background:"#00ff8811", border:"1px dashed #00ff8833", borderRadius:20, color:"#00ff88", fontSize:11, letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", transition:"all 0.2s"}}>
                {showAddTask?"[ CANCEL ]":"+ ADD NEW TASK"}
              </button>
            </div>

            {showAddTask && (
              <div style={{background:"#0a140a",border:"1px solid #00ff8833",borderRadius:8,padding:14,marginBottom:16}}>
                <div style={{fontSize:9,color:"#00ff8544",letterSpacing:2,marginBottom:8}}>TASK DETAILS</div>
                <input value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} placeholder="Type task description..."
                  style={{width:"100%",background:"#060c06",border:"1px solid #00ff8833",borderRadius:6,padding:"10px",color:"#00ff88",fontSize:13,marginBottom:10,fontFamily:"'Share Tech Mono',monospace",outline:"none"}} />
                <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                  <select value={newTask.week} onChange={e=>setNewTask({...newTask,week:Number(e.target.value)})}
                    style={{flex:1,minWidth:90,background:"#060c06",border:"1px solid #00ff8833",borderRadius:6,padding:"8px",color:"#00ff88",fontSize:12,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                    {Object.keys(WEEK_INFO).map(w=><option key={w} value={w}>Week {w}</option>)}
                  </select>
                  <select value={newTask.assignee} onChange={e=>setNewTask({...newTask,assignee:e.target.value})}
                    style={{flex:1,minWidth:90,background:"#060c06",border:"1px solid #00ff8833",borderRadius:6,padding:"8px",color:"#00ff88",fontSize:12,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                    {["All",...TEAM_MEMBERS].map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                
                <div style={{display:"flex",gap:12,marginBottom:12, flexWrap:"wrap"}}>
                  <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#00ff8577",cursor:"pointer"}}>
                    <input type="checkbox" checked={newTask.isPrivate} onChange={e=>setNewTask({...newTask,isPrivate:e.target.checked})} style={{accentColor:"#00ff88", width:14, height:14}} />
                    Private Task
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#ff4444aa",cursor:"pointer"}}>
                    <input type="checkbox" checked={newTask.deadline} onChange={e=>setNewTask({...newTask,deadline:e.target.checked})} style={{accentColor:"#ff4444", width:14, height:14}} />
                    Urgent/Deadline
                  </label>
                </div>

                <button onClick={addTask} style={{width:"100%",padding:"10px 0",background:"#00ff8822",border:"1px solid #00ff88",borderRadius:6,color:"#00ff88",fontSize:12,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                  SAVE TASK
                </button>
              </div>
            )}

            {weeks.map(week=>{
              const wt=visibleTasks.filter(t=>t.week===week);
              const wd=wt.filter(t=>t.done).length;
              if(!wt.length) return null;
              return (
                <div key={week} style={{marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{fontSize:13,color:"#00ff88",letterSpacing:2,fontFamily:"'Orbitron',monospace",flexShrink:0}}>W{week}</div>
                    <div style={{fontSize:10,color:"#00ff8533"}}>{WEEK_INFO[week]?.dates}</div>
                    <div style={{flex:1,height:1,background:"#00ff8811"}} />
                    <div style={{fontSize:10,color:wd===wt.length?"#00ff88":"#00ff8533"}}>{wd}/{wt.length} Completed</div>
                  </div>
                  {wt.map(task=>{
                    const isUrgent = task.deadline && !task.done;
                    // Check if current user has permission to delete
                    const canDelete = profile.role === "Group Leader" || task.createdBy === profile.username;

                    return (
                    <div key={task.fsId||task.id} style={{
                        background:"#0a140a",
                        border:`1px solid ${isUrgent ? "#ff4444" : task.isPrivate ? "#ffaa0022" : "#00ff8811"}`,
                        boxShadow: isUrgent ? "0 0 10px #ff444422" : "none",
                        borderRadius:8, padding:"12px", marginBottom:6,
                        transition:"all 0.3s"
                      }}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                        <button onClick={()=>toggleDone(task)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${task.done?"#00ff88": isUrgent ? "#ff4444" : "#00ff8833"}`,background:task.done?"#00ff88":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,cursor:"pointer",transition:"all 0.2s"}}>
                          {task.done&&<span style={{color:"#060c06",fontSize:12,fontWeight:"bold",lineHeight:1}}>✓</span>}
                        </button>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                            {isUrgent&&<span style={{color:"#ff4444",fontSize:11,flexShrink:0, animation: "pulse 1.5s infinite"}}>⚑ URGENT</span>}
                            {task.isPrivate&&<span style={{fontSize:9,padding:"2px 6px",background:"#ffaa0022",border:"1px solid #ffaa0033",borderRadius:20,color:"#ffaa00",flexShrink:0}}>PRIVATE</span>}
                            <span style={{fontSize:13,color:task.done?"#00ff8833": isUrgent ? "#ffcccc" : "#aaffcc",textDecoration:task.done?"line-through":"none",wordBreak:"break-word"}}>{task.title}</span>
                          </div>
                          <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
                            <span style={{fontSize:9,padding:"2px 8px",borderRadius:20,background:(MEMBER_COLORS[task.assignee]||"#00ff88")+"22",border:`1px solid ${(MEMBER_COLORS[task.assignee]||"#00ff88")}33`,color:MEMBER_COLORS[task.assignee]||"#00ff88"}}>
                              {task.assignee}
                            </span>
                          </div>
                          
                          <div style={{fontSize:10, color:"#00ff8566", marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center"}}>
                            <span>Added by: <strong style={{color:"#00ff85aa"}}>{task.createdBy}</strong></span>
                            {task.createdAt && <span>• Created: {formatDate(task.createdAt)}</span>}
                            {task.done && task.completedAt && <span style={{color:"#00ccffaa"}}>• Completed: {formatDate(task.completedAt)}</span>}
                          </div>

                          {editNote===(task.fsId||task.id)&&(
                            <div style={{marginTop:8}}>
                              <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={2} placeholder="Add a note..."
                                style={{width:"100%",background:"#060c06",border:"1px solid #00ff88",borderRadius:6,padding:"8px",color:"#00ff88",fontSize:12,resize:"vertical",fontFamily:"'Share Tech Mono',monospace",outline:"none"}} />
                              <div style={{display:"flex",gap:6,marginTop:6}}>
                                <button onClick={()=>saveNote(task)} style={{padding:"6px 12px",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:6,color:"#00ff88",fontSize:10,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>SAVE</button>
                                <button onClick={()=>{setEditNote(null);setNoteText("");}} style={{padding:"6px 12px",background:"transparent",border:"1px solid #00ff8833",borderRadius:6,color:"#00ff8566",fontSize:10,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>CANCEL</button>
                              </div>
                            </div>
                          )}
                          {task.note&&editNote!==(task.fsId||task.id)&&(
                            <div style={{marginTop:6,fontSize:11,color:"#00ccff",background:"#00ccff11",borderLeft:"3px solid #00ccff44",padding:"8px 10px",borderRadius:"0 6px 6px 0", whiteSpace: "pre-wrap"}}>
                              📝 {task.note}
                            </div>
                          )}

                        </div>
                        <div style={{display:"flex",gap:4,flexShrink:0}}>
                          <button onClick={()=>{setEditNote(task.fsId||task.id);setNoteText(task.note||"");}} style={{background:"transparent",border:"none",color:"#00ff8555",fontSize:13,padding:4,cursor:"pointer"}} title="Edit Note">📝</button>
                          {canDelete && (
                            <button onClick={()=>deleteTask(task)} style={{background:"transparent",border:"none",color:"#ff444455",fontSize:13,padding:4,cursor:"pointer"}} title="Delete Task">🗑</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              );
            })}
          </div>
        )}

        {/* CHAT TAB (GLOBAL) */}
        {activeTab === "chat" && (
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
            <div style={{padding: "10px 16px", background: "#0a140a", borderBottom: "1px solid #00ff8822", textAlign: "center"}}>
              <div style={{fontSize: 12, color: "#00ff88", letterSpacing: 2, fontFamily:"'Orbitron',monospace"}}>GLOBAL CHAT & RESOURCES</div>
              <div style={{fontSize: 9, color: "#00ff8588"}}>Chat with all teams & share helpful resources</div>
            </div>
            <div style={{flex:1,overflow:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:10}}>
              {messages.length===0&&<div style={{textAlign:"center",color:"#00ff8522",padding:40,fontSize:12}}>NO MESSAGES YET</div>}
              {messages.map(msg=>{
                const isMe=msg.user===profile.username;
                return (
                  <div key={msg.id} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:8,alignItems:"flex-end"}}>
                    <div style={{width:28,height:28,borderRadius:6,background:(msg.color||"#00ff88")+"22",border:`1px solid ${msg.color||"#00ff88"}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:msg.color||"#00ff88",flexShrink:0}}>
                      {(msg.user||"?")[0].toUpperCase()}
                    </div>
                    <div style={{maxWidth:"75%"}}>
                      {!isMe&&<div style={{fontSize:9,color:msg.color||"#00ff88",marginBottom:4,letterSpacing:1}}>{msg.user} <span style={{color:"#00ff8555"}}>• {msg.teamName}</span></div>}
                      <div style={{background:isMe?"#00ff8820":"#0a140a",border:`1px solid ${isMe?"#00ff8844":"#00ff8811"}`,borderRadius:isMe?"10px 4px 10px 10px":"4px 10px 10px 10px",padding:"8px 12px",fontSize:13,color:isMe?"#00ff88":"#aaffcc",lineHeight:1.5,wordBreak:"break-word"}}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div style={{padding:"10px 14px",background:"#0a140a",borderTop:"1px solid #00ff8811",display:"flex",gap:8}}>
              <input 
                type="text"
                value={chatMsg} 
                onChange={e=>setChatMsg(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){sendMsg();}}}
                placeholder="Share a message or resource link..."
                style={{flex:1,background:"#060c06",border:"1px solid #00ff8833",borderRadius:6,padding:"10px 12px",color:"#00ff88",fontSize:13,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}
              />
              <button onClick={sendMsg} style={{padding:"10px 18px",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:6,color:"#00ff88",fontSize:13,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
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
              return (
                <div key={m} style={{background:"#0a140a",border:`1px solid ${mc}22`,borderRadius:10,padding:14,marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,borderRadius:8,background:mc+"22",border:`2px solid ${mc}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:mc,flexShrink:0}}>
                      {m[0]}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,color:mc,letterSpacing:0.5, marginBottom: 4}}>
                        {m}{m===profile.username&&" (You)"}
                      </div>
                      <div style={{fontSize:10,color:"#00ff8533"}}>{md}/{mt.length} tasks completed</div>
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
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:40,marginBottom:16}}>◆</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,color:"#00ff88",marginBottom:12}}>DBMS QUIZ</div>
                <button onClick={startQuiz} style={{padding:"14px 40px",background:"#00ff8822",border:"1px solid #00ff88",borderRadius:8,color:"#00ff88",fontSize:13,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                  START QUIZ
                </button>
              </div>
            )}
            {quizActive&&!quizDone&&shuffled[quizQ]&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontSize:11,color:"#00ff8555"}}>Question {quizQ+1} of {shuffled.length}</div>
                  <div style={{fontSize:11,color:"#00ccff"}}>Score: {quizScore}</div>
                </div>
                <div style={{background:"#0a140a",border:"1px solid #00ff8833",borderRadius:8,padding:16,marginBottom:14}}>
                  <div style={{fontSize:14,color:"#aaffcc",lineHeight:1.6}}>{shuffled[quizQ].q}</div>
                </div>
                {shuffled[quizQ].opts.map((opt,i)=>{
                  let bg="#0a140a",bc="#00ff8822",c="#00ff8877";
                  if(quizAnswered!==null){
                    if(i===shuffled[quizQ].ans){bg="#00ff8820";bc="#00ff88";c="#00ff88";}
                    else if(i===quizAnswered){bg="#ff000020";bc="#ff4444";c="#ff4444";}
                  }
                  return <button key={i} onClick={()=>answerQuiz(i)} style={{width:"100%",marginBottom:8,padding:"14px",background:bg,border:`1px solid ${bc}`,borderRadius:8,color:c,fontSize:13,textAlign:"left",fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                    {opt}
                  </button>;
                })}
              </div>
            )}
            {quizDone&&(
              <div style={{textAlign:"center",padding:"30px 20px"}}>
                <div style={{fontSize:40,marginBottom:12}}>🏆</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:24,color:"#00ff88",marginBottom:12}}>Score: {quizScore}/{shuffled.length}</div>
                <button onClick={startQuiz} style={{padding:"12px 30px",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:8,color:"#00ff88",fontSize:12,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>RETRY QUIZ</button>
              </div>
            )}
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === "data" && (
          <div style={{padding:16}}>
            <div style={{fontSize:10,color:"#00ff8533",letterSpacing:2,marginBottom:16}}>SYSTEM DATA</div>
            <div style={{background:"#0a140a",border:"1px solid #00ff8833",borderRadius:10,padding:16,marginBottom:16}}>
              <p style={{fontSize:12,color:"#00ff8588",marginBottom:14, lineHeight: 1.5}}>Use these tools to manage default tasks and clear duplicates.</p>
              
              <button onClick={seedTasks} disabled={migrating} style={{width:"100%",padding:"12px 0",background:"#00ff8820",border:"1px solid #00ff88",borderRadius:8,color:"#00ff88",fontSize:13,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:migrating?"not-allowed":"pointer",marginBottom:10}}>
                {migrating?"PROCESSING...":"ADD DEFAULT TASKS"}
              </button>
              
              {/* DELETE ALL BUTTON (Group Leader Only) */}
              {profile.role === "Group Leader" && (
                <button onClick={deleteAllTasks} disabled={migrating} style={{width:"100%",padding:"12px 0",background:"#ff444420",border:"1px solid #ff4444",borderRadius:8,color:"#ff4444",fontSize:13,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:migrating?"not-allowed":"pointer",marginTop:10}}>
                  {migrating?"PROCESSING...":"DELETE ALL TASKS (RESET)"}
                </button>
              )}

              {migrateMsg&&<div style={{marginTop:12,padding:"10px",background:"#00ff8811",border:"1px solid #00ff8844",borderRadius:6,fontSize:12,color:"#00ff88"}}>{migrateMsg}</div>}
            </div>
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a140a",borderTop:"1px solid #00ff8822",display:"flex",zIndex:200}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:"10px 4px",background:activeTab===t.id?"#00ff8815":"transparent",border:"none",borderTop:activeTab===t.id?"2px solid #00ff88":"2px solid transparent",color:activeTab===t.id?"#00ff88":"#00ff8544",fontSize:10,letterSpacing:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
            <span style={{fontSize:18}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {toast&&(
        <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:"#0a140a",border:"1px solid #00ff88",borderRadius:8,padding:"10px 20px",fontSize:13,color:"#00ff88",zIndex:9999,whiteSpace:"nowrap",fontFamily:"'Share Tech Mono',monospace", boxShadow: "0 0 16px #00ff8833"}}>
          {toast}
        </div>
      )}
    </div>
  );
}