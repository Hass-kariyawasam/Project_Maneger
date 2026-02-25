// src/App.jsx  ─  Tim Wok-Ples App  |  Hacker Vibe, Theming & Pro Features (Krio Version)
import { useState, useEffect, useRef } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword
} from "firebase/auth";
import {
  collection, doc, setDoc, getDoc, getDocs,
  addDoc, onSnapshot, query, orderBy,
  deleteDoc, updateDoc, serverTimestamp,
  writeBatch,
  getFirestore
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Firebase Sɛtɔp
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

// ─── KƆNSTANT DƐN ────────────────────────────────────────────────
const EMAIL_DOMAIN = "@ict1222.team";

const TEAM_MEMBERS = ["Group Leader","Member 2","Member 3","Member 4"];
const MEMBER_COLORS = {
  "Group Leader":"#00ff88",
  "Member 2":"#00ccff",
  "Member 3":"#ffaa00",
  "Member 4":"#ff66cc",
};

const THEME_COLORS = [
  "#00ff88", // Neon Grin
  "#00ccff", // Neon Blu
  "#ff00cc", // Neon Pink
  "#ffaa00", // Neon Ɔrenj
  "#ccff00", // Neon Yɛlo
  "#b026ff", // Neon Pɔpul
  "#ff4444"  // Neon Rɛd
];

const INITIAL_TASKS = [
  {id:"t1",week:1,title:"Install MySQL Server 8.0+",assignee:"All",deadline:false},
  {id:"t2",week:1,title:"Install MySQL Workbench",assignee:"All",deadline:false},
  {id:"t3",week:1,title:"Install VS Code + Extensions",assignee:"All",deadline:false},
  {id:"t4",week:1,title:"Install Git + GitHub Desktop",assignee:"All",deadline:false},
  {id:"t5",week:1,title:"Create GitHub Repo (Private)",assignee:"Group Leader",deadline:false},
  {id:"t6",week:1,title:"Read UGC Circular No. 12-2024",assignee:"All",deadline:false},
];

const WEEK_INFO = {
  1:{label:"Wik 1",dates:"Feb 23–Mar 1"},2:{label:"Wik 2",dates:"Mar 2–8"},
  3:{label:"Wik 3",dates:"Mar 9–15"},4:{label:"Wik 4",dates:"Mar 16–22"},
  5:{label:"Wik 5",dates:"Mar 23–29"},6:{label:"Wik 6",dates:"Mar 30–Apr 5"},
  7:{label:"Wik 7",dates:"Apr 6–13"},8:{label:"Wik 8",dates:"Apr 14–21"},
  9:{label:"Wik 9",dates:"Apr 22–28"},10:{label:"Wik 10",dates:"Apr 29–May 5"},
};

const TASKS_COL = "tasks";
const CHAT_COL  = "chat";
const USERS_COL = "users";
const RESOURCES_COL = "resources";
const WEEK_STATUS_COL = "week_status";
const QUIZZES_COL = "quizzes";

// ═════════════════════════════════════════════════════════════
// ƐKSTANAL KƆMPONƐNT DƐN
// ═════════════════════════════════════════════════════════════
const GInput = ({value,onChange,placeholder,type="text",onKeyDown, disabled=false}) => (
  <input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} disabled={disabled}
    className="themed-input"
    style={{width:"100%",background: disabled ? "#000" : "#0a0f0a",borderRadius:8,padding:"14px 16px",fontSize:15,fontFamily:"'Share Tech Mono',monospace",outline:"none",transition:"all 0.3s", opacity: disabled ? 0.7 : 1}}
  />
);

const Btn = ({onClick,children,style={},variant="primary"}) => {
  return (
    <button className={variant === "primary" ? "neon-btn" : "neon-btn-outline"} onClick={onClick} style={{borderRadius:8,padding:"14px 0",width:"100%",fontSize:16,fontWeight:"bold",letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",transition:"all 0.3s",...style}}>
      {children}
    </button>
  );
};

// ═════════════════════════════════════════════════════════════
// MEN APP
// ═════════════════════════════════════════════════════════════
export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile]   = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [dbError, setDbError]   = useState(null);

  // Skrin dɛn: login | register | google_onboard | app
  const [screen, setScreen]   = useState("login");
  const [activeTab, setActiveTab] = useState("tasks");

  // Ɔtɛntikeshɔn fɔm
  const [loginIdentifier, setLoginIdentifier] = useState(""); 
  const [loginPass, setLoginPass] = useState("");
  
  const [regUser,   setRegUser]   = useState("");
  const [regPass,   setRegPass]   = useState("");
  const [regEmail,  setRegEmail]  = useState("");
  const [regTgNumber, setRegTgNumber] = useState("");
  const [regPhone,  setRegPhone]  = useState("");
  const [regRole,   setRegRole]   = useState("Group Leader");
  const [regTeamName, setRegTeamName] = useState("");
  const [regToken,  setRegToken]  = useState("");
  const [regPhoto,  setRegPhoto]  = useState("");
  
  const [formErr,   setFormErr]   = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Profayl Ɛdit
  const [editData, setEditData] = useState({ phone: "", tgNumber: "", newPassword: "" });

  // Men Data
  const [tasks, setTasks]           = useState([]);
  const [teamUsers, setTeamUsers]   = useState([]);
  const [resources, setResources]   = useState([]);
  const [weekStatuses, setWeekStatuses] = useState([]); 

  // Wok Filta ɛn Fɔm
  const [taskFilter, setTaskFilter] = useState("All");
  const [weekFilter, setWeekFilter] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask]   = useState({title:"",week:1,assignee:"All",isPrivate:false,deadline:false,dueDate:""});
  const [editNote, setEditNote] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Risɔs Fɔm
  const [newResTitle, setNewResTitle] = useState("");
  const [newResUrl, setNewResUrl] = useState("");
  const [newResNote, setNewResNote] = useState("");

  // Chat
  const [messages, setMessages] = useState([]);
  const [chatMsg, setChatMsg]   = useState("");
  const chatEndRef = useRef(null);

  // Kuiz
  const [dbQuizzes, setDbQuizzes]     = useState([]);
  const [quizActive, setQuizActive]   = useState(false);
  const [quizQ, setQuizQ]             = useState(0);
  const [quizScore, setQuizScore]     = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(null);
  const [quizDone, setQuizDone]       = useState(false);
  const [shuffled, setShuffled]       = useState([]);
  
  // Kuiz Set Fɔm
  const [showAddQuizSet, setShowAddQuizSet] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([{q:"", opt1:"", opt2:"", opt3:"", opt4:"", ans:0}]);

  // Sistɛm
  const [migrating, setMigrating]     = useState(false);
  const [migrateMsg, setMigrateMsg]   = useState("");
  const [toast, setToast] = useState(null);

  // Tim Kɔlɔ (Theme Variables)
  const sysColor = profile?.themeColor || "#00ff88";
  const hex2rgb = (hex) => {
      let v = hex.replace('#', '');
      if (v.length === 3) v = v.split('').map(c => c+c).join('');
      return `${parseInt(v.slice(0,2),16)}, ${parseInt(v.slice(2,4),16)}, ${parseInt(v.slice(4,6),16)}`;
  };
  const sysColorRGB = hex2rgb(sysColor);

  // ── FIREBASE AUTH LISTENER ────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, USERS_COL, user.uid));
          if (snap.exists()) {
            setProfile({uid: user.uid, ...snap.data()});
            setAuthUser(user);
            setScreen("app");
          } else {
            setAuthUser(user);
            setRegEmail(user.email || "");
            setRegUser(user.displayName || "");
            setRegPhoto(user.photoURL || "");
            setScreen("google_onboard");
          }
        } catch (err) {
          setDbError("Firebase Pɔmishɔn Dɛnay: Duya chɛk yu Firestore Rules fɔ mek shɔ se rid/rayt alaw.");
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
    setDbError(null);

    const handleFbErr = (err) => {
      console.error(err);
      setDbError("Firebase Ɛrɔ: Missing or insufficient permissions. Duya ɔpdet yu Firebase Console Rules.");
    };

    const unsubTasks = onSnapshot(collection(db, TASKS_COL), (snap) => {
        const pub = snap.docs
          .map(d => ({ fsId: d.id, ...d.data() }))
          .filter(t => t.teamId === profile.teamId || !t.teamId); 
          
        pub.sort((a, b) => {
          if (a.week !== b.week) return (a.week || 0) - (b.week || 0);
          if (a.done !== b.done) return a.done ? 1 : -1;
          return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0); 
        });
        
        setTasks(prev => {
          const priv = prev.filter(t => t.isPrivate);
          return [...pub, ...priv];
        });
    }, handleFbErr);

    const privCol = collection(db, USERS_COL, authUser.uid, "privateTasks");
    const unsubPriv = onSnapshot(privCol, (snap) => {
      const priv = snap.docs.map(d => ({ fsId: d.id, ...d.data(), isPrivate: true }));
      setTasks(prev => {
        const pub = prev.filter(t => !t.isPrivate);
        return [...pub, ...priv];
      });
    }, handleFbErr);

    const unsubChat = onSnapshot(query(collection(db, CHAT_COL), orderBy("ts")), (snap) => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMessages(msgs);
    }, handleFbErr);

    const unsubUsers = onSnapshot(collection(db, USERS_COL), (snap) => {
        const users = snap.docs.map(d => d.data()).filter(u => u.teamId === profile.teamId);
        setTeamUsers(users);
    }, handleFbErr);

    const unsubRes = onSnapshot(collection(db, RESOURCES_COL), (snap) => {
        const res = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.teamId === profile.teamId);
        setResources(res);
    }, handleFbErr);

    const unsubWeeks = onSnapshot(collection(db, WEEK_STATUS_COL), (snap) => {
        const doneWeeks = snap.docs.map(d => d.data()).filter(w => w.teamId === profile.teamId && w.done).map(w => w.week);
        setWeekStatuses(doneWeeks);
    }, handleFbErr);

    const unsubQuiz = onSnapshot(collection(db, QUIZZES_COL), (snap) => {
        setDbQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, handleFbErr);

    return () => { unsubTasks(); unsubPriv(); unsubChat(); unsubUsers(); unsubRes(); unsubWeeks(); unsubQuiz(); };
  }, [authUser, profile]);

  // ── HELPER FUNCTIONS ──────────────────────────────────────
  const formatDate = (ts) => {
    if (!ts) return "";
    if (ts.toDate) return ts.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return "";
  };

  const getUrgentStatus = (dueDate) => {
    if (!dueDate) return { color: "#ff4444", text: "Urgent", glow: "0 0 15px #ff444466" };
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days > 5) return { color: sysColor, text: `${days} dez lɛf`, glow: `0 0 10px rgba(${sysColorRGB},0.4)` };
    if (days >= 2) return { color: "#ffaa00", text: `${days} dez lɛf`, glow: "0 0 15px #ffaa0066" };
    if (days >= 0) return { color: "#ff4444", text: `${days} dez lɛf!`, glow: "0 0 20px #ff444499" };
    return { color: "#ff0044", text: `LƐT DƆN PAS!`, glow: "0 0 25px #ff0044aa" };
  };

  // ── AUTHENTICATION ────────────────────────────────────────
  async function doGoogleLogin() {
    setFormErr(""); setFormLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch(e) {
      setFormErr("Gugul Lɔgin Fɛl: " + e.message);
    }
    setFormLoading(false);
  }

  async function cancelGoogleOnboard() {
    await signOut(auth);
    setScreen("login");
  }

  async function doRegister(isOnboarding = false) {
    setFormErr(""); setFormLoading(true);
    if (!regUser.trim() || regUser.length < 3) { setFormErr("Yuzanem fɔ pas 3 lɛta dɛn"); setFormLoading(false); return; }
    if (!isOnboarding && (!regPass || regPass.length < 4)) { setFormErr("Paswɔd fɔ pas 4 lɛta dɛn"); setFormLoading(false); return; }
    if (!regEmail.includes("@")) { setFormErr("Put kɔrɛkt imel"); setFormLoading(false); return; }
    if (!regTgNumber.trim()) { setFormErr("TG Nɔmba na mɔs"); setFormLoading(false); return; }
    if (!regPhone.trim()) { setFormErr("Fon Nɔmba na mɔs"); setFormLoading(false); return; }
    
    let foundTeamId = null;
    let foundTeamName = null;
    const isLeader = regRole === TEAM_MEMBERS[0];

    try {
      const usersSnap = await getDocs(collection(db, USERS_COL));
      if (!isLeader) {
        if (!regToken.trim()) { setFormErr("Aks yu Tim Lida fɔ di Sikrit Tokɛn!"); setFormLoading(false); return; }
        const leaderDoc = usersSnap.docs.find(d => d.data().teamToken === regToken.trim());
        if (!leaderDoc) { setFormErr("Sikrit Tokɛn nɔ kɔrɛkt!"); setFormLoading(false); return; }
        foundTeamId = leaderDoc.data().teamId;
        foundTeamName = leaderDoc.data().teamName;
      } else {
        if (!regTeamName.trim()) { setFormErr("Duya put Tim Nem"); setFormLoading(false); return; }
        if (!regToken.trim()) { setFormErr("Mek Sikrit Tokɛn fɔ yu mɛmba dɛn"); setFormLoading(false); return; }
      }

      const taken = usersSnap.docs.some(d => d.data().username === regUser.trim() && d.id !== authUser?.uid);
      if (taken) { setFormErr("Dis Yuzanem dɔn tek dɔn!"); setFormLoading(false); return; }
      
      let uidToSave = null;
      
      if (!isOnboarding) {
        const cred  = await createUserWithEmailAndPassword(auth, regEmail.trim(), regPass);
        uidToSave = cred.user.uid;
      } else {
        uidToSave = authUser.uid;
      }
      
      const p = { 
        username: regUser.trim(), 
        email: regEmail.trim(),
        tgNumber: regTgNumber.trim(),
        phone: regPhone.trim(),
        role: regRole, 
        color: MEMBER_COLORS[regRole] || sysColor,
        themeColor: sysColor, 
        teamId: isLeader ? uidToSave : foundTeamId,
        teamName: isLeader ? regTeamName.trim() : foundTeamName,
        photoURL: regPhoto
      };

      if (isLeader) { p.teamToken = regToken.trim(); }
      await setDoc(doc(db, USERS_COL, uidToSave), p);
      
      if (isOnboarding) {
         setProfile({uid: uidToSave, ...p});
         setScreen("app");
      }
      
      showToast("SISTƐM PAS GIVƐN");
    } catch (e) {
      setFormErr("Ɛrɔ: " + (e.code === "auth/email-already-in-use" ? "Dis imel dɔn tek dɔn." : e.message));
    }
    setFormLoading(false);
  }

  async function doLogin() {
    setFormErr(""); setFormLoading(true);
    try {
      let loginEmail = loginIdentifier.trim();
      
      if (!loginEmail.includes("@")) {
          const usersSnap = await getDocs(collection(db, USERS_COL));
          const userDoc = usersSnap.docs.find(d => d.data().username === loginEmail);
          if (userDoc) {
             loginEmail = userDoc.data().email;
          } else {
             setFormErr("AKSƐS DƐNAY: Yuzanem nɔ de.");
             setFormLoading(false); return;
          }
      }

      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
    } catch (e) {
      setFormErr("AKSƐS DƐNAY: Yuzanem ɔ Paswɔd nɔ kɔrɛkt.");
    }
    setFormLoading(false);
  }

  async function doLogout() {
    await signOut(auth);
    setTasks([]); setMessages([]); setTeamUsers([]);
  }

  // ── SETTINGS / PROFILE EDIT LOGIC ──────────────────────────────────
  async function updateProfileData() {
    setFormLoading(true);
    try {
      const updateData = { phone: editData.phone, tgNumber: editData.tgNumber };
      await updateDoc(doc(db, USERS_COL, profile.uid), updateData);
      
      if (editData.newPassword.trim().length >= 4) {
         await updatePassword(authUser, editData.newPassword.trim());
         showToast("Profayl & Paswɔd Dɔn Ɔpdet!");
      } else {
         showToast("Profayl Dɔn Ɔpdet!");
      }
      
      setProfile({...profile, ...updateData});
    } catch(e) {
      showToast("Ɛrɔ we de ɔpdet profayl: " + e.message);
    }
    setFormLoading(false);
  }

  function loadEditProfile() {
      setEditData({ phone: profile.phone || "", tgNumber: profile.tgNumber || "", newPassword: "" });
  }

  useEffect(() => {
     if (activeTab === "settings" && profile) {
         loadEditProfile();
     }
  }, [activeTab]);

  async function updateTheme(colorHex) {
     try {
       await updateDoc(doc(db, USERS_COL, profile.uid), { themeColor: colorHex });
       setProfile({...profile, themeColor: colorHex});
       showToast("Kɔlɔ Dɔn Ɔpdet!");
     } catch (e) {
       showToast("E fɛl fɔ sev kɔlɔ.");
     }
  }

  // ── TASKS & WEEK LOGIC ───────────────────────────────────────────
  async function addTask() {
    if (!newTask.title.trim()) return;
    const base = { ...newTask, done: false, note: "", createdBy: profile.username, createdAt: serverTimestamp(), teamId: profile.teamId };
    try {
      if (newTask.isPrivate) {
        await addDoc(collection(db, USERS_COL, authUser.uid, "privateTasks"), { ...base });
      } else {
        await addDoc(collection(db, TASKS_COL), { ...base });
      }
      setNewTask({ title:"", week:1, assignee:"All", isPrivate:false, deadline:false, dueDate:"" });
      setShowAddTask(false);
      showToast("Wok Dɔn Sɛn Na Sistɛm");
    } catch (e) {
      showToast("Ɛrɔ fɔ add wok: " + e.message);
    }
  }

  async function toggleDone(task) {
    const isDone = !task.done;
    const updateData = { done: isDone };
    if (isDone) updateData.completedAt = serverTimestamp();
    else updateData.completedAt = null;

    try {
      if (task.isPrivate) await updateDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId), updateData);
      else await updateDoc(doc(db, TASKS_COL, task.fsId), updateData);
    } catch (e) { showToast("Ɛrɔ: " + e.message); }
  }

  async function saveNote(task) {
    try {
      if (task.isPrivate) await updateDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId), { note: noteText });
      else await updateDoc(doc(db, TASKS_COL, task.fsId), { note: noteText });
      setEditNote(null); setNoteText("");
      showToast("Not Sev Dɔn");
    } catch (e) { showToast("Ɛrɔ: " + e.message); }
  }

  async function deleteTask(task) {
    if (!window.confirm("WƆNIN: Yu rili want fɔ mɔs dis wok?")) return;
    try {
      if (task.isPrivate) await deleteDoc(doc(db, USERS_COL, authUser.uid, "privateTasks", task.fsId));
      else await deleteDoc(doc(db, TASKS_COL, task.fsId));
      showToast("Wok Dɔn Mɔs.");
    } catch (e) { showToast("Ɛrɔ: " + e.message); }
  }

  async function toggleWeekDone(weekNum) {
    if (profile.role !== "Group Leader") return;
    const isDone = weekStatuses.includes(weekNum);
    const docRef = doc(db, WEEK_STATUS_COL, `${profile.teamId}_${weekNum}`);
    try {
      if (isDone) {
        await deleteDoc(docRef);
        showToast(`Wik ${weekNum} Dɔn Opin Bɔk`);
      } else {
        await setDoc(docRef, { done: true, teamId: profile.teamId, week: weekNum });
        showToast(`Wik ${weekNum} Dɔn Mak As Kɔmplit!`);
      }
    } catch (e) { showToast("Ɛrɔ: " + e.message); }
  }

  // ── DATA TAB (RESOURCES) ──────────────────────────────────
  async function addResource() {
    if (!newResTitle.trim() || !newResUrl.trim()) return;
    setFormLoading(true);
    try {
      await addDoc(collection(db, RESOURCES_COL), {
        title: newResTitle, url: newResUrl, note: newResNote,
        addedBy: profile.username, teamId: profile.teamId, ts: serverTimestamp()
      });
      setNewResTitle(""); setNewResUrl(""); setNewResNote("");
      showToast("Risɔs Dɔn Sɛn Na Tim!");
    } catch(e) {
      showToast("Aksɛs Dɛnay: " + e.message);
    }
    setFormLoading(false);
  }

  async function deleteResource(id) {
    try{
        if (profile.role !== "Group Leader") return;
        await deleteDoc(doc(db, RESOURCES_COL, id));
        showToast("Link Dɔn Mɔs!");
    } catch(e){
        showToast("Aksɛs Dɛnay: " + e.message);
    }
  }

  async function seedTasks() {
    setMigrating(true); setMigrateMsg("De put difɔlt data...");
    try {
      const batch = writeBatch(db);
      for (const t of INITIAL_TASKS) {
        const ref = doc(collection(db, TASKS_COL));
        batch.set(ref, { ...t, done:false, note:"", createdBy:profile.username, createdAt: serverTimestamp(), teamId: profile.teamId });
      }
      await batch.commit();
      setMigrateMsg(`✓ ${INITIAL_TASKS.length} difɔlt wok dɛn dɔn add!`);
    } catch(e) { setMigrateMsg("✗ Ɛrɔ: " + e.message); }
    setMigrating(false);
  }

  async function deleteAllTasks() {
    if (!window.confirm("WƆNIN: Dis go mɔs ƆL wok fɔ yu tim. Yu rili want du am?")) return;
    setMigrating(true); setMigrateMsg("De mɔs wok dɛn...");
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
      setMigrateMsg(`✓ ${count} wok dɛn dɔn mɔs fayn!`);
    } catch(e) { setMigrateMsg("✗ Ɛrɔ: " + e.message); }
    setMigrating(false);
  }

  // ── CHAT LOGIC ────────────────────────────────────────────
  async function sendMsg() {
    if (!chatMsg.trim()) return;
    try {
      await addDoc(collection(db, CHAT_COL), {
        user: profile.username, color: profile.color, photoURL: profile.photoURL || "",
        teamName: profile.teamName || "Unknown Team",
        text: chatMsg.trim(),
        time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
        ts: serverTimestamp(),
        teamId: profile.teamId
      });
      setChatMsg("");
    } catch (e) { showToast("Ɛrɔ: " + e.message); }
  }

  // ── QUIZ LOGIC (SETS) ────────────────────────────────────────────
  function handleQuizQChange(index, field, value) {
     const newQ = [...quizQuestions];
     newQ[index][field] = value;
     setQuizQuestions(newQ);
  }

  function addQuestionToSet() {
     setQuizQuestions([...quizQuestions, {q:"", opt1:"", opt2:"", opt3:"", opt4:"", ans:0}]);
  }

  async function saveQuizSet() {
    if (!newQuizTitle.trim()) { showToast("Taytul na mɔs!"); return; }
    
    const isValid = quizQuestions.every(q => q.q.trim() && q.opt1.trim() && q.opt2.trim() && q.opt3.trim() && q.opt4.trim());
    if (!isValid) { showToast("Fil ɔl bɔks fɔ ɔl kwɛstyɔn dɛn!"); return; }

    setFormLoading(true);
    try {
        const formattedQs = quizQuestions.map(q => ({
            q: q.q,
            opts: [q.opt1, q.opt2, q.opt3, q.opt4],
            ans: Number(q.ans)
        }));

        await addDoc(collection(db, QUIZZES_COL), {
            title: newQuizTitle,
            questions: formattedQs,
            addedBy: profile.username,
            ts: serverTimestamp()
        });

        setNewQuizTitle("");
        setQuizQuestions([{q:"", opt1:"", opt2:"", opt3:"", opt4:"", ans:0}]);
        setShowAddQuizSet(false);
        showToast("Kuiz Set Dɔn Sɛn!");
    } catch(e) {
        showToast("Aksɛs Dɛnay: " + e.message);
    }
    setFormLoading(false);
  }

  function startQuiz(quizSet) {
    let qArray = [];
    if (quizSet) {
        qArray = quizSet.questions;
    } else {
        qArray = dbQuizzes.length > 0 && dbQuizzes[0].questions ? dbQuizzes[0].questions : [];
    }
    
    if (qArray.length === 0) {
        showToast("Nɔ kwɛstyɔn de insay dis set."); return;
    }

    const q = [...qArray].sort(() => Math.random() - 0.5);
    setShuffled(q); setQuizQ(0); setQuizScore(0);
    setQuizAnswered(null); setQuizDone(false); setQuizActive(true);
  }

  function answerQuiz(idx) {
    if (quizAnswered !== null) return;
    setQuizAnswered(idx);
    if (idx === shuffled[quizQ].ans) setQuizScore(s => s + 1);
    setTimeout(() => {
      if (quizQ + 1 >= shuffled.length) setQuizDone(true);
      else { setQuizQ(q => q + 1); setQuizAnswered(null); }
    }, 1200);
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 4000); }

  // ── CALCULATIONS & FILTERS ────────────────────────────────
  const pubTasks = tasks.filter(t => !t.isPrivate);
  const totalDone = pubTasks.filter(t => t.done).length;
  const pct = pubTasks.length ? Math.round(totalDone / pubTasks.length * 100) : 0;

  const visibleTasks = tasks.filter(t => {
    if (t.isPrivate && t.createdBy !== profile?.username) return false;
    let mMatch = true;
    if (taskFilter === "MY_TASKS") {
      // Filta fɔ mi wok (My Tasks fix)
      mMatch = (t.assignee === profile?.role || t.assignee === profile?.username || t.assignee === "All" || t.createdBy === profile?.username);
    }
    const wMatch = weekFilter === 0 || t.week === weekFilter;
    return mMatch && wMatch;
  });

  const allWeeks = [...new Set(visibleTasks.map(t => t.week))].sort((a,b)=>a-b);
  const activeWeeks = allWeeks.filter(w => !weekStatuses.includes(w));
  const completedWeeks = allWeeks.filter(w => weekStatuses.includes(w));
  const urgentTasks = pubTasks.filter(t => t.deadline && !t.done);

  // Gamification (Pɔynt dɛn)
  const userStats = teamUsers.map(u => {
    const userTasks = pubTasks.filter(t => t.assignee === u.role || t.assignee === "All" || t.assignee === u.username);
    const done = userTasks.filter(t => t.done).length;
    return { ...u, doneCount: done, totalCount: userTasks.length, points: done * 10 };
  }).sort((a,b) => b.points - a.points);

  // ══════════════════════════════════════════════════════════
  // UI COMPONENTS (HACKER VIBE)
  // ══════════════════════════════════════════════════════════
  if (!authReady) return (
    <div style={{background:"#030503",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Share Tech Mono',monospace",color:sysColor}}>
      <style>{`
        @keyframes text-glow-sweep { 0% { text-shadow: 0 0 5px var(--sys-color), 0 0 10px var(--sys-color); } 50% { text-shadow: 0 0 15px #ffffff, 0 0 30px #ffffff, 0 0 40px var(--sys-color); } 100% { text-shadow: 0 0 5px var(--sys-color), 0 0 10px var(--sys-color); } }
        .glow-text-smooth { animation: text-glow-sweep 3s ease-in-out infinite; }
        @keyframes pulse-glow { 0% { text-shadow: 0 0 10px var(--sys-color); transform: scale(1); } 50% { text-shadow: 0 0 30px var(--sys-color), 0 0 40px #ffffff; transform: scale(1.1); } 100% { text-shadow: 0 0 10px var(--sys-color); transform: scale(1); } }
        .glow-logo { animation: pulse-glow 1s infinite alternate; font-size: 80px; margin-bottom: 20px; display: inline-block; }
      `}</style>
      <div style={{textAlign:"center", '--sys-color': sysColor}}>
        <div className="glow-logo">⬡</div>
        <div className="glow-text-smooth" style={{fontSize:24,letterSpacing:4, color:"#ffffff", fontWeight:"bold"}}>DI SISTƐM DE LOD...</div>
        <div style={{fontSize:16, color:sysColor, marginTop:24, letterSpacing:2, fontWeight:"bold"}} className="glow-text-smooth">
          NA HASSKARIYAWASAM MEK AM
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // ONBOARDING SCREEN (Fɔ Gugul Yuzer dɛn)
  // ══════════════════════════════════════════════════════════
  if (screen === "google_onboard") return (
    <div style={{background:"#030503",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Share Tech Mono',monospace",padding:20, '--sys-color': sysColor, '--sys-color-rgb': sysColorRGB}}>
       <style>{`
        .themed-input:focus { border-color: var(--sys-color) !important; box-shadow: 0 0 12px rgba(var(--sys-color-rgb), 0.27) !important; }
        .neon-btn { background: rgba(var(--sys-color-rgb), 0.13) !important; border: 1px solid var(--sys-color) !important; color: var(--sys-color) !important; box-shadow: 0 0 10px rgba(var(--sys-color-rgb), 0.2) !important; }
        .neon-btn:hover { background: rgba(var(--sys-color-rgb), 0.2) !important; box-shadow: 0 0 20px var(--sys-color) !important; }
      `}</style>
       <div style={{width:"100%",maxWidth:450, background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.2)`,borderRadius:16,padding:30,boxShadow:`0 10px 30px rgba(${sysColorRGB},0.1)`}}>
          <div style={{textAlign:"center", marginBottom: 20}}>
            {regPhoto ? <img src={regPhoto} alt="profile" style={{width:60,height:60,borderRadius:30, border:`2px solid ${sysColor}`, marginBottom:10}}/> : <div style={{fontSize:40}}>👤</div>}
            <div style={{fontSize:18, color:sysColor, letterSpacing:1}}>MƐK YU PROFAYL KƆMPLIT</div>
            <div style={{fontSize:12, color:`rgba(${sysColorRGB},0.4)`, marginTop:4}}>Wi nid smɔl infɔmeshɔn mɔ fɔ sɛtɔp yu wok-ples.</div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{display:"flex",gap:16}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,marginBottom:6,letterSpacing:1}}>YUZANEM</div>
                  <GInput value={regUser} onChange={e=>setRegUser(e.target.value)} placeholder="Nem..." />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,marginBottom:6,letterSpacing:1}}>FON NƆMBA *</div>
                  <GInput value={regPhone} onChange={e=>setRegPhone(e.target.value)} placeholder="07X..." />
                </div>
              </div>
              <div style={{display:"flex",gap:16}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,marginBottom:6,letterSpacing:1}}>IMEL</div>
                  <GInput type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="Imel..." disabled={true}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,marginBottom:6,letterSpacing:1}}>TG NƆMBA *</div>
                  <GInput value={regTgNumber} onChange={e=>setRegTgNumber(e.target.value)} placeholder="TG/..." />
                </div>
              </div>
              <div>
                <div style={{fontSize:12,color:`rgba(${sysColorRGB},0.67)`,marginBottom:8,letterSpacing:2}}>TIM WOK</div>
                <select value={regRole} onChange={e=>setRegRole(e.target.value)}
                  className="themed-input"
                  style={{width:"100%",background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.27)`,borderRadius:8,padding:"14px 16px",color:sysColor,fontSize:15,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                  {TEAM_MEMBERS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {regRole === "Group Leader" ? (
                <div style={{background:`rgba(${sysColorRGB},0.05)`,padding:16,borderRadius:8,border:`1px solid rgba(${sysColorRGB},0.2)`}}>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:11,color:"#ffffff",marginBottom:6,letterSpacing:1}}>TIM NEM (FƆ YU GRUP)</div>
                    <GInput value={regTeamName} onChange={e=>setRegTeamName(e.target.value)} placeholder="Tim nem..." />
                  </div>
                  <div>
                    <div style={{fontSize:11,color:"#ffaa00",marginBottom:6,letterSpacing:1}}>MƐK SIKRIT TOKƐN</div>
                    <GInput type="password" value={regToken} onChange={e=>setRegToken(e.target.value)} placeholder="ɛg. 1234" />
                  </div>
                </div>
              ) : (
                <div style={{background:"#ffaa0011",padding:16,borderRadius:8,border:"1px solid #ffaa0044"}}>
                  <div style={{fontSize:11,color:"#ffaa00",marginBottom:6,letterSpacing:1}}>PUT SIKRIT TOKƐN FRƆM YU LIDA</div>
                  <GInput type="password" value={regToken} onChange={e=>setRegToken(e.target.value)} placeholder="Sikrit tokɛn..." />
                </div>
              )}

              {formErr && <div style={{color:"#ff4444",fontSize:14,padding:"10px",background:"#ff000022",border:"1px solid #ff444455",borderRadius:8}}>{formErr}</div>}
              
              <div style={{display:"flex", gap:10, marginTop:10}}>
                <Btn onClick={() => doRegister(true)} style={{flex:2}}>
                  {formLoading?"DE SEV...":"DƆN DI SƐTƆP"}
                </Btn>
                <button onClick={cancelGoogleOnboard} style={{flex:1, background:"transparent", border:"1px solid #ff444444", color:"#ff4444", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer"}}>KANSUL</button>
              </div>
          </div>
       </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // LƆGIN / RƐJISTA SKRIN
  // ══════════════════════════════════════════════════════════
  if (screen === "login" || screen === "register") return (
    <div style={{background:"#030503",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Share Tech Mono',monospace",padding:20, '--sys-color': sysColor, '--sys-color-rgb': sysColorRGB}}>
      <style>{`
        @keyframes text-glow-sweep { 0% { text-shadow: 0 0 5px var(--sys-color), 0 0 10px var(--sys-color); } 50% { text-shadow: 0 0 15px #ffffff, 0 0 30px #ffffff, 0 0 40px var(--sys-color); } 100% { text-shadow: 0 0 5px var(--sys-color), 0 0 10px var(--sys-color); } }
        .glow-text-smooth { animation: text-glow-sweep 3s ease-in-out infinite; }
        .themed-input:focus { border-color: var(--sys-color) !important; box-shadow: 0 0 12px rgba(var(--sys-color-rgb), 0.27) !important; }
        .neon-btn { background: rgba(var(--sys-color-rgb), 0.13) !important; border: 1px solid var(--sys-color) !important; color: var(--sys-color) !important; box-shadow: 0 0 10px rgba(var(--sys-color-rgb), 0.2) !important; }
        .neon-btn:hover { background: rgba(var(--sys-color-rgb), 0.2) !important; box-shadow: 0 0 20px var(--sys-color) !important; }
      `}</style>
      <div style={{width:"100%",maxWidth:450}}>
        
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:70,height:70,border:`3px solid ${sysColor}`,borderRadius:16,marginBottom:16,background:"#0a0f0a",fontSize:35,color:sysColor,boxShadow:`0 0 20px rgba(${sysColorRGB},0.4)`}}>⬡</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:26,color:"#ffffff",letterSpacing:3,textShadow:"0 0 10px #ffffff66"}}>TIM WOK-PLES</div>
          <div style={{fontSize:12,color:sysColor,marginTop:12,letterSpacing:2}} className="glow-text-smooth">
            NA HASSKARIYAWASAM MEK AM
          </div>
        </div>

        <div style={{background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.2)`,borderRadius:16,padding:30,boxShadow:`0 10px 30px rgba(${sysColorRGB},0.1)`}}>
          <div style={{display:"flex",background:"#000000",borderRadius:10,padding:6,marginBottom:20,border:`1px solid rgba(${sysColorRGB},0.13)`}}>
            {["login","register"].map(s=>(
              <button key={s} onClick={()=>{setScreen(s);setFormErr("");}} style={{flex:1,padding:"12px 0",background:screen===s?`rgba(${sysColorRGB},0.13)`:"transparent",border:"none",color:screen===s?sysColor:`rgba(${sysColorRGB},0.4)`,fontSize:14,fontWeight:"bold",letterSpacing:2,borderRadius:6,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",transition:"all 0.3s"}}>
                {s==="login"?"[ LƆGIN ]":"[ RƐJISTA ]"}
              </button>
            ))}
          </div>

          <div style={{marginBottom: 20}}>
             <button onClick={doGoogleLogin} style={{width:"100%", padding:"14px", background:"#ffffff", color:"#000", border:"none", borderRadius:8, fontSize:15, fontWeight:"bold", fontFamily:"sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer"}}>
               <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{width:18}}/>
               Kɔntinyu wit Gugul
             </button>
             <div style={{textAlign:"center", margin:"16px 0", color:`rgba(${sysColorRGB},0.33)`, fontSize:12, letterSpacing:1}}>Ɔ WIT IMEL</div>
          </div>

          {screen === "login" ? (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <div style={{fontSize:12,color:`rgba(${sysColorRGB},0.67)`,marginBottom:8,letterSpacing:2}}>YUZANEM Ɔ IMEL</div>
                <GInput value={loginIdentifier} onChange={e=>setLoginIdentifier(e.target.value)} placeholder="Put yuzanem ɔ imel..." />
              </div>
              <div>
                <div style={{fontSize:12,color:`rgba(${sysColorRGB},0.67)`,marginBottom:8,letterSpacing:2}}>PASWƆD</div>
                <GInput type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Put paswɔd..." />
              </div>
              {formErr && <div style={{color:"#ff4444",fontSize:14,padding:"10px 14px",background:"#ff000022",border:"1px solid #ff444455",borderRadius:8}}>{formErr}</div>}
              <Btn onClick={doLogin} style={{marginTop:6}}>
                {formLoading?"DE ƐNTA...":"ƐNTA DI SISTƐM"}
              </Btn>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{display:"flex",gap:16}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,marginBottom:6,letterSpacing:1}}>YUZANEM</div>
                  <GInput value={regUser} onChange={e=>setRegUser(e.target.value)} placeholder="Nem..." />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,marginBottom:6,letterSpacing:1}}>PASWƆD</div>
                  <GInput type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="4+ lɛta dɛn..." />
                </div>
              </div>
              <div>
                 <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,marginBottom:6,letterSpacing:1}}>FON NƆMBA *</div>
                 <GInput value={regPhone} onChange={e=>setRegPhone(e.target.value)} placeholder="07X..." />
              </div>
              <div style={{display:"flex",gap:16}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,marginBottom:6,letterSpacing:1}}>IMEL</div>
                  <GInput type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="Imel..." />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,marginBottom:6,letterSpacing:1}}>TG NƆMBA *</div>
                  <GInput value={regTgNumber} onChange={e=>setRegTgNumber(e.target.value)} placeholder="TG/..." />
                </div>
              </div>
              <div>
                <div style={{fontSize:12,color:`rgba(${sysColorRGB},0.67)`,marginBottom:8,letterSpacing:2}}>TIM WOK</div>
                <select value={regRole} onChange={e=>setRegRole(e.target.value)}
                  className="themed-input"
                  style={{width:"100%",background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.27)`,borderRadius:8,padding:"14px 16px",color:sysColor,fontSize:15,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                  {TEAM_MEMBERS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {regRole === "Group Leader" ? (
                <div style={{background:`rgba(${sysColorRGB},0.05)`,padding:16,borderRadius:8,border:`1px solid rgba(${sysColorRGB},0.2)`}}>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:11,color:"#ffffff",marginBottom:6,letterSpacing:1}}>TIM NEM (FƆ YU GRUP)</div>
                    <GInput value={regTeamName} onChange={e=>setRegTeamName(e.target.value)} placeholder="Tim nem..." />
                  </div>
                  <div>
                    <div style={{fontSize:11,color:"#ffaa00",marginBottom:6,letterSpacing:1}}>MƐK SIKRIT TOKƐN</div>
                    <GInput type="password" value={regToken} onChange={e=>setRegToken(e.target.value)} placeholder="ɛg. 1234" />
                  </div>
                </div>
              ) : (
                <div style={{background:"#ffaa0011",padding:16,borderRadius:8,border:"1px solid #ffaa0044"}}>
                  <div style={{fontSize:11,color:"#ffaa00",marginBottom:6,letterSpacing:1}}>PUT SIKRIT TOKƐN FRƆM YU LIDA</div>
                  <GInput type="password" value={regToken} onChange={e=>setRegToken(e.target.value)} placeholder="Sikrit tokɛn..." />
                </div>
              )}

              {formErr && <div style={{color:"#ff4444",fontSize:14,padding:"10px",background:"#ff000022",border:"1px solid #ff444455",borderRadius:8}}>{formErr}</div>}
              <Btn onClick={() => doRegister(false)} style={{marginTop:6}}>
                {formLoading?"DE LOD...":"MƐK WOK-PLES"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const tabs = [
    {id:"tasks",label:"WOK DƐN",icon:"⬡"},
    {id:"team", label:"TIM", icon:"◉"},
    {id:"data", label:"DATA LINK DƐN", icon:"⬢"},
    {id:"chat", label:"GLOBA CHAT", icon:"◈"},
    {id:"quiz", label:"KUIZ", icon:"◆"},
    {id:"settings", label:"SƐTIN DƐN", icon:"⚙"},
  ];

  const displayTeamName = profile.teamName || "TIM WOK-PLES";

  const renderWeek = (week, isCompletedSection) => {
    const wt=visibleTasks.filter(t=>t.week===week);
    const wd=wt.filter(t=>t.done).length;
    if(!wt.length) return null;
    
    return (
      <div key={week} style={{marginBottom:24, opacity: isCompletedSection ? 0.6 : 1, transition:"all 0.3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12, background: isCompletedSection ? `rgba(${sysColorRGB},0.07)` : "transparent", padding: isCompletedSection ? "10px" : "0", borderRadius:8}}>
          <div style={{fontSize:16,color:sysColor,letterSpacing:2,fontFamily:"'Orbitron',monospace",flexShrink:0}}>WIK {week}</div>
          <div style={{fontSize:12,color:`rgba(${sysColorRGB},0.4)`}}>{WEEK_INFO[week]?.dates}</div>
          <div style={{flex:1,height:2,background:`rgba(${sysColorRGB},0.13)`}} />
          <div style={{fontSize:12,color:wd===wt.length?sysColor:`rgba(${sysColorRGB},0.67)`,fontWeight:"bold"}}>{wd}/{wt.length} DƆN DU</div>
          
          {profile.role === "Group Leader" && (
            <button onClick={()=>toggleWeekDone(week)} style={{padding:"6px 12px", background:isCompletedSection?"#ffaa0022":`rgba(${sysColorRGB},0.13)`, border:`1px solid ${isCompletedSection?"#ffaa00":sysColor}`, borderRadius:6, color:isCompletedSection?"#ffaa00":sysColor, fontSize:10, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace"}}>
              {isCompletedSection ? "UNDO" : "MAK WIK DƆN ✓"}
            </button>
          )}
        </div>
        
        {wt.map(task=>{
          const isUrgent = task.deadline && !task.done;
          const canDelete = profile.role === "Group Leader" || task.createdBy === profile.username;
          const urgentStatus = isUrgent ? getUrgentStatus(task.dueDate) : null;

          return (
          <div key={task.fsId||task.id} style={{
              background:"#0a0f0a",
              border:`1px solid ${isUrgent ? urgentStatus.color : task.isPrivate ? "#ffaa0033" : `rgba(${sysColorRGB},0.13)`}`,
              boxShadow: isUrgent ? urgentStatus.glow : "none",
              borderRadius:10, padding:"16px", marginBottom:10,
              transition:"all 0.3s"
            }}>
            <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
              <button onClick={()=>toggleDone(task)} style={{width:26,height:26,borderRadius:8,border:`2px solid ${task.done?sysColor: isUrgent ? urgentStatus.color : `rgba(${sysColorRGB},0.27)`}`,background:task.done?sysColor:"#030503",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,cursor:"pointer",transition:"all 0.2s"}}>
                {task.done&&<span style={{color:"#000",fontSize:16,fontWeight:"bold",lineHeight:1}}>✓</span>}
              </button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
                  {isUrgent&&<span style={{color:urgentStatus.color,fontSize:12,fontWeight:"bold",flexShrink:0, padding:"2px 8px", background:`${urgentStatus.color}22`, borderRadius:12}}>⚑ {urgentStatus.text}</span>}
                  {task.isPrivate&&<span style={{fontSize:10,padding:"2px 8px",background:"#ffaa0022",border:"1px solid #ffaa0044",borderRadius:20,color:"#ffaa00",flexShrink:0}}>SIKRIT</span>}
                  <span style={{fontSize:16,color:task.done?`rgba(${sysColorRGB},0.27)`: isUrgent ? "#ffffff" : sysColor,textDecoration:task.done?"line-through":"none",wordBreak:"break-word", filter:task.done?"brightness(0.8)":"none"}}>{task.title}</span>
                </div>
                <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:11,padding:"4px 12px",borderRadius:20,background:(MEMBER_COLORS[task.assignee]||sysColor)+"22",border:`1px solid ${(MEMBER_COLORS[task.assignee]||sysColor)}44`,color:MEMBER_COLORS[task.assignee]||sysColor, fontWeight:"bold"}}>
                    {task.assignee}
                  </span>
                </div>
                
                <div style={{fontSize:11, color:`rgba(${sysColorRGB},0.4)`, marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center"}}>
                  <span>Na im put am: <strong style={{color:`rgba(${sysColorRGB},0.67)`}}>{task.createdBy}</strong></span>
                  {task.createdAt && <span>• Tɛm: {formatDate(task.createdAt)}</span>}
                  {task.done && task.completedAt && <span style={{color:"#00ccffaa"}}>• Dɔn: {formatDate(task.completedAt)}</span>}
                </div>

                {editNote===(task.fsId||task.id)&&(
                  <div style={{marginTop:12}}>
                    <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3} placeholder="Put yu not..."
                      className="themed-input"
                      style={{width:"100%",background:"#000",border:`1px solid ${sysColor}`,borderRadius:8,padding:"12px",color:sysColor,fontSize:14,resize:"vertical",fontFamily:"'Share Tech Mono',monospace",outline:"none"}} />
                    <div style={{display:"flex",gap:10,marginTop:8}}>
                      <button onClick={()=>saveNote(task)} style={{padding:"8px 16px",background:`rgba(${sysColorRGB},0.13)`,border:`1px solid ${sysColor}`,borderRadius:6,color:sysColor,fontSize:12,fontWeight:"bold",fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>SEV NOT</button>
                      <button onClick={()=>{setEditNote(null);setNoteText("");}} style={{padding:"8px 16px",background:"transparent",border:`1px solid rgba(${sysColorRGB},0.27)`,borderRadius:6,color:`rgba(${sysColorRGB},0.53)`,fontSize:12,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>KANSUL</button>
                    </div>
                  </div>
                )}
                {task.note&&editNote!==(task.fsId||task.id)&&(
                  <div style={{marginTop:10,fontSize:13,color:"#00ccff",background:"#00ccff11",borderLeft:"4px solid #00ccff55",padding:"10px 14px",borderRadius:"0 8px 8px 0", whiteSpace: "pre-wrap"}}>
                    <span style={{opacity:0.5}}>// NOT: </span><br/>{task.note}
                  </div>
                )}

              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                <button onClick={()=>{setEditNote(task.fsId||task.id);setNoteText(task.note||"");}} style={{background:"transparent",border:`1px solid rgba(${sysColorRGB},0.2)`,borderRadius:6,color:`rgba(${sysColorRGB},0.67)`,fontSize:14,padding:"8px",cursor:"pointer"}} title="Edit Note">📝</button>
                {canDelete && (
                  <button onClick={()=>deleteTask(task)} style={{background:"transparent",border:"1px solid #ff444433",borderRadius:6,color:"#ff4444aa",fontSize:14,padding:"8px",cursor:"pointer"}} title="Delete Task">🗑</button>
                )}
              </div>
            </div>
          </div>
        )})}
      </div>
    );
  };

  return (
    <div style={{background:"#030503",minHeight:"100vh",fontFamily:"'Share Tech Mono',monospace",color:sysColor,display:"flex",flexDirection:"column", '--sys-color': sysColor, '--sys-color-rgb': sysColorRGB}}>
      <style>{`
        .themed-input:focus { border-color: var(--sys-color) !important; box-shadow: 0 0 12px rgba(var(--sys-color-rgb), 0.27) !important; }
        .neon-btn { background: rgba(var(--sys-color-rgb), 0.13) !important; border: 1px solid var(--sys-color) !important; color: var(--sys-color) !important; box-shadow: 0 0 10px rgba(var(--sys-color-rgb), 0.2) !important; }
        .neon-btn:hover { background: rgba(var(--sys-color-rgb), 0.2) !important; box-shadow: 0 0 20px var(--sys-color) !important; }
        
        @keyframes text-glow-sweep { 0% { text-shadow: 0 0 5px var(--sys-color), 0 0 10px var(--sys-color); } 50% { text-shadow: 0 0 15px #ffffff, 0 0 30px #ffffff, 0 0 40px var(--sys-color); } 100% { text-shadow: 0 0 5px var(--sys-color), 0 0 10px var(--sys-color); } }
        .glow-text-smooth { animation: text-glow-sweep 3s ease-in-out infinite; }
      `}</style>
      
      {/* HEADER */}
      <div style={{background:"#0a0f0a",borderBottom:`1px solid rgba(${sysColorRGB},0.2)`,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,flexShrink:0,boxShadow:`0 4px 20px rgba(${sysColorRGB},0.05)`}}>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,color:"#ffffff",letterSpacing:2,textShadow:"0 0 10px #ffffff66"}}>{displayTeamName}</div>
          <div style={{fontSize:9,color:`rgba(${sysColorRGB},0.53)`,marginTop:4,letterSpacing:1}}>DBMS PRACTICUM 2026 // UNIVERSITY OF RUHUNA</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:14,color:profile.color,fontWeight:"bold"}}>{profile.username}</div>
            <div style={{fontSize:10,color:`rgba(${sysColorRGB},0.4)`,marginTop:2}}>LODIN: {pct}%</div>
          </div>
          
          <div onClick={() => setActiveTab("settings")} style={{cursor: "pointer"}}>
            {profile.photoURL ? (
               <img src={profile.photoURL} alt="profile" style={{width: 36, height: 36, borderRadius: 10, border: `2px solid ${sysColor}`}} />
            ) : (
               <div style={{width: 36, height: 36, borderRadius: 10, background: `rgba(${sysColorRGB},0.2)`, border: `2px solid ${sysColor}`, display:"flex", alignItems:"center", justifyContent:"center", color:sysColor, fontSize:18, fontWeight:"bold"}}>
                  {profile.username[0].toUpperCase()}
               </div>
            )}
          </div>
        </div>
      </div>

      <div style={{height:4,background:"#0a0f0a",flexShrink:0}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg, ${sysColor}, #00ccff)`,transition:"width 0.8s ease-out",boxShadow:`0 0 15px ${sysColor}`}} />
      </div>

      {dbError && (
        <div style={{background:"#ff444422", borderBottom:"1px solid #ff4444", padding:"10px", textAlign:"center", color:"#ff4444", fontSize:12, fontWeight:"bold", fontFamily:"'Share Tech Mono',monospace"}}>
           ⚠ {dbError}
        </div>
      )}

      <div style={{flex:1,overflow:"auto",paddingBottom:90}}>
        
        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div style={{padding:"20px 16px 0"}}>
            
            {/* URGENT ALERTS */}
            {urgentTasks.length > 0 && (
              <div style={{marginBottom:16, background:"#ff444411", border:"1px solid #ff444444", borderRadius:8, padding:10}}>
                <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                  <span style={{fontSize:14, color:"#ff4444"}}>⚑</span>
                  <div style={{fontSize:11, color:"#ff4444", fontWeight:"bold", letterSpacing:1}}>IMPƆTANT MƐSEJ DƐN</div>
                </div>
                {urgentTasks.map(t => {
                  const st = getUrgentStatus(t.dueDate);
                  return (
                  <div key={t.fsId||t.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", background:"#000", borderRadius:6, marginBottom:4, border:`1px solid ${st.color}33`}}>
                    <div style={{fontSize:12, color:"#fff", wordBreak:"break-word"}}>{t.title}</div>
                    <div style={{display:"flex", alignItems:"center", gap:10}}>
                      <div style={{fontSize:9, padding:"2px 8px", borderRadius:10, background:`${st.color}22`, color:st.color, whiteSpace:"nowrap", fontWeight:"bold", boxShadow: st.glow}}>{st.text}</div>
                    </div>
                  </div>
                )})}
              </div>
            )}

            <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
              {[{l:"SISTƐM WOK DƐN",v:pubTasks.length,c:sysColor},{l:"DƆN DU",v:totalDone,c:"#00ccff"},{l:"WETIN LƐF",v:pubTasks.length-totalDone,c:"#ffaa00"},{l:"PRƆGRƐS",v:pct+"%",c:"#ff66cc"}].map(s=>(
                <div key={s.l} style={{flex:"1 1 70px",background:"#0a0f0a",border:`1px solid ${s.c}33`,borderRadius:10,padding:"12px 16px",minWidth:80,boxShadow:`0 4px 10px ${s.c}11`}}>
                  <div style={{fontSize:10,color:"#ffffff66",letterSpacing:2,marginBottom:6}}>{s.l}</div>
                  <div style={{fontSize:24,fontWeight:"bold",color:s.c,fontFamily:"'Orbitron',monospace",textShadow:`0 0 10px ${s.c}66`}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{marginBottom:20, display:"flex", flexWrap:"wrap", gap: 10, alignItems: "center", background:"#0a0f0a", padding:"12px", borderRadius:10, border:`1px solid rgba(${sysColorRGB},0.13)`}}>
              <div style={{fontSize:12,color:sysColor,letterSpacing:2,fontWeight:"bold"}}>FILTA DƐN:</div>
              <button onClick={()=>setTaskFilter("All")} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${taskFilter==="All"?sysColor:`rgba(${sysColorRGB},0.2)`}`,background:taskFilter==="All"?`rgba(${sysColorRGB},0.13)`:"transparent",color:taskFilter==="All"?sysColor:`rgba(${sysColorRGB},0.4)`,fontSize:12,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",transition:"all 0.2s"}}>ƆL WOK DƐN</button>
              
              <button onClick={()=>setTaskFilter("MY_TASKS")} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${taskFilter==="MY_TASKS"?"#00ccff":"#00ccff33"}`,background:taskFilter==="MY_TASKS"?"#00ccff22":"transparent",color:taskFilter==="MY_TASKS"?"#00ccff":`rgba(${sysColorRGB},0.4)`,fontSize:12,fontWeight:"bold",fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",transition:"all 0.2s",boxShadow:taskFilter==="MY_TASKS"?"0 0 10px #00ccff44":"none"}}>🔥 MI WOK DƐN</button>
            </div>

            <div style={{display:"flex", justifyContent:"center", marginBottom:20}}>
              <button className="neon-btn" onClick={()=>setShowAddTask(!showAddTask)} style={{padding:"12px 30px", background:`rgba(${sysColorRGB},0.07)`, border:`1px dashed rgba(${sysColorRGB},0.33)`, borderRadius:24, color:sysColor, fontSize:14, fontWeight:"bold", letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", transition:"all 0.3s"}}>
                {showAddTask?"[ KANSUL OVERRIDE ]":"[ + PUT NYU WOK ]"}
              </button>
            </div>

            {showAddTask && (
              <div style={{background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.33)`,borderRadius:12,padding:20,marginBottom:24,boxShadow:`0 0 20px rgba(${sysColorRGB},0.13)`}}>
                <div style={{fontSize:11,color:sysColor,letterSpacing:3,marginBottom:12,fontWeight:"bold"}}>NYU WOK PROTOKOL</div>
                <input value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} placeholder="Rayt di wok ya..."
                  className="themed-input"
                  style={{width:"100%",background:"#000",border:`1px solid rgba(${sysColorRGB},0.27)`,borderRadius:8,padding:"14px",color:sysColor,fontSize:15,marginBottom:14,fontFamily:"'Share Tech Mono',monospace",outline:"none"}} />
                <div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap"}}>
                  <select value={newTask.week} onChange={e=>setNewTask({...newTask,week:Number(e.target.value)})}
                    className="themed-input"
                    style={{flex:1,minWidth:100,background:"#000",border:`1px solid rgba(${sysColorRGB},0.27)`,borderRadius:8,padding:"12px",color:sysColor,fontSize:14,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                    {Object.keys(WEEK_INFO).map(w=><option key={w} value={w}>Wik {w}</option>)}
                  </select>
                  <select value={newTask.assignee} onChange={e=>setNewTask({...newTask,assignee:e.target.value})}
                    className="themed-input"
                    style={{flex:1,minWidth:100,background:"#000",border:`1px solid rgba(${sysColorRGB},0.27)`,borderRadius:8,padding:"12px",color:sysColor,fontSize:14,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                    {["All",...TEAM_MEMBERS].map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                
                <div style={{display:"flex",gap:16,marginBottom:16, flexWrap:"wrap", background:"#000", padding:"12px", borderRadius:8, border:`1px solid rgba(${sysColorRGB},0.13)`}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:`rgba(${sysColorRGB},0.67)`,cursor:"pointer"}}>
                    <input type="checkbox" checked={newTask.isPrivate} onChange={e=>setNewTask({...newTask,isPrivate:e.target.checked})} style={{accentColor:sysColor, width:18, height:18}} />
                    Sikrit Wok (Onli Yu)
                  </label>
                  
                  {profile.role === "Group Leader" && (
                    <div style={{display:"flex",alignItems:"center",gap:16, borderLeft:`1px solid rgba(${sysColorRGB},0.2)`, paddingLeft:16}}>
                      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#ff4444",fontWeight:"bold",cursor:"pointer"}}>
                        <input type="checkbox" checked={newTask.deadline} onChange={e=>setNewTask({...newTask,deadline:e.target.checked})} style={{accentColor:"#ff4444", width:18, height:18}} />
                        MAK AM IMPƆTANT
                      </label>
                      {newTask.deadline && (
                        <input type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask,dueDate:e.target.value})}
                          style={{background:"#ff444422", border:"1px solid #ff4444", color:"#ff4444", padding:"6px 10px", borderRadius:6, fontFamily:"'Share Tech Mono',monospace"}} />
                      )}
                    </div>
                  )}
                </div>

                <Btn onClick={addTask}>SƐN DI WOK</Btn>
              </div>
            )}

            {/* ACTIVE WEEKS */}
            {activeWeeks.map(w => renderWeek(w, false))}

            {/* COMPLETED WEEKS DIVIDER */}
            {completedWeeks.length > 0 && (
              <div style={{margin:"30px 0", textAlign:"center"}}>
                <div style={{fontSize:12, color:`rgba(${sysColorRGB},0.33)`, letterSpacing:4, marginBottom:10}}>--- DƆN DU WOK DƐN ---</div>
              </div>
            )}

            {/* COMPLETED WEEKS */}
            {completedWeeks.map(w => renderWeek(w, true))}
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === "team" && (
          <div style={{padding:"20px 16px"}}>
            <div style={{fontSize:12,color:sysColor,letterSpacing:3,marginBottom:16, fontWeight:"bold", borderBottom: `1px solid rgba(${sysColorRGB},0.2)`, paddingBottom: 8}}>TIM WƆKA DƐN</div>
            
            {userStats.map((u, index) => {
              const isTop = index === 0 && u.points > 0;
              return (
                <div key={u.username} style={{background:"#0a0f0a",border:`1px solid ${u.color}44`,borderRadius:12,padding:"16px",marginBottom:14, position:"relative", overflow:"hidden", boxShadow: isTop ? `0 0 15px ${u.color}33` : "none"}}>
                  {isTop && <div style={{position:"absolute", top:-10, right:-10, fontSize:50, opacity:0.1}}>👑</div>}
                  
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    {u.photoURL ? (
                      <img src={u.photoURL} alt="p" style={{width:50, height:50, borderRadius:12, border:`2px solid ${u.color}66`, boxShadow: isTop ? `0 0 15px ${u.color}` : "none"}} />
                    ) : (
                      <div style={{width:50,height:50,borderRadius:12,background:u.color+"22",border:`2px solid ${u.color}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:u.color,flexShrink:0, boxShadow: isTop ? `0 0 15px ${u.color}` : "none"}}>
                        {isTop ? "👑" : u.username[0].toUpperCase()}
                      </div>
                    )}

                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <div style={{fontSize:16,color:u.color,letterSpacing:1, fontWeight:"bold"}}>
                          {u.username}{u.username===profile.username&&" (YU)"}
                        </div>
                        <div style={{fontSize:18, color:sysColor, fontWeight:"bold", fontFamily:"'Orbitron',monospace"}}>{u.points} PTS</div>
                      </div>
                      <div style={{fontSize:12,color:"#00ff8588", marginTop:4}}>{u.role}</div>
                      
                      <div style={{display:"flex", flexWrap:"wrap", gap:12, marginTop:10, background:"#000", padding:"8px 12px", borderRadius:8, border:`1px solid rgba(${sysColorRGB},0.13)`}}>
                        {u.phone && <div style={{fontSize:11, color:"#fff"}}>FON: {u.phone}</div>}
                        <div style={{fontSize:11, color:"#00ccff"}}>TG: {u.tgNumber}</div>
                        <div style={{fontSize:11, color:"#ffaa00"}}>⚡ {u.doneCount}/{u.totalCount} Wok Dɔn Du</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div style={{padding:"20px 16px"}}>
            <div style={{fontSize:12,color:sysColor,letterSpacing:3,marginBottom:20, fontWeight:"bold"}}>SISTƐM SƐTIN DƐN</div>
            
            {/* THEME SELECTOR */}
            <div style={{background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.2)`,borderRadius:12,padding:"20px", marginBottom:24}}>
               <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,letterSpacing:2,marginBottom:16}}>CHUZ YU KƆLƆ</div>
               <div style={{display:"flex", gap:16, flexWrap:"wrap"}}>
                 {THEME_COLORS.map(c => (
                   <div key={c} onClick={() => updateTheme(c)} style={{width:40, height:40, borderRadius:20, background:c, cursor:"pointer", border: sysColor === c ? "3px solid #fff" : "none", boxShadow: sysColor === c ? `0 0 15px ${c}` : "none", transition:"all 0.2s"}} />
                 ))}
               </div>
            </div>

            {/* PROFILE CONFIG */}
            <div style={{background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.2)`,borderRadius:12,padding:"20px", position:"relative"}}>
                <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,letterSpacing:2,marginBottom:16}}>PROFAYL KƆNFIG</div>
                <div style={{display:"flex", flexDirection:"column", gap: 12}}>
                    <div>
                      <div style={{fontSize:10, color:`rgba(${sysColorRGB},0.67)`, marginBottom:4}}>YUZANEM (NƆ DE CHENJ)</div>
                      <GInput value={profile.username} disabled={true} />
                    </div>
                    <div>
                      <div style={{fontSize:10, color:`rgba(${sysColorRGB},0.67)`, marginBottom:4}}>IMEL ADRƐS</div>
                      <GInput value={profile.email} disabled={true} />
                    </div>
                    <div style={{display:"flex", gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10, color:`rgba(${sysColorRGB},0.67)`, marginBottom:4}}>FON NƆMBA</div>
                        <GInput value={editData.phone} onChange={e=>setEditData({...editData, phone: e.target.value})} />
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10, color:`rgba(${sysColorRGB},0.67)`, marginBottom:4}}>TG NƆMBA</div>
                        <GInput value={editData.tgNumber} onChange={e=>setEditData({...editData, tgNumber: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:10, color:"#ffaa00", marginBottom:4}}>NYU PASWƆD (ƆPSHƆNAL)</div>
                      <GInput type="password" value={editData.newPassword} onChange={e=>setEditData({...editData, newPassword: e.target.value})} placeholder="Lef am blank if yu nɔ want chenj" />
                    </div>
                    <Btn onClick={updateProfileData} style={{marginTop:10}}>{formLoading ? "DE ƆPDET..." : "ƆPDET PROFAYL"}</Btn>
                </div>
            </div>

            <div style={{marginTop: 40}}>
              <button onClick={doLogout} style={{width:"100%",background:"#ff444411",border:"1px solid #ff444455",borderRadius:8,color:"#ff4444",fontSize:13,fontWeight:"bold",padding:"14px",letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",transition:"all 0.2s"}}>KƆMƆT NA DI SISTƐM (LOGOUT)</button>
            </div>
          </div>
        )}

        {/* DATA LINKS TAB */}
        {activeTab === "data" && (
          <div style={{padding:"20px 16px"}}>
            <div style={{fontSize:12,color:sysColor,letterSpacing:3,marginBottom:20, fontWeight:"bold"}}>TIM DATA LINK DƐN</div>
            
            <div style={{background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.33)`,borderRadius:12,padding:16,marginBottom:24, boxShadow:`0 0 15px rgba(${sysColorRGB},0.07)`}}>
              <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,letterSpacing:2,marginBottom:12}}>PUT NYU RISƆS LINK</div>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                <GInput value={newResTitle} onChange={e=>setNewResTitle(e.target.value)} placeholder="Taytul (ɛg. MySQL Tutorial)" />
                <GInput value={newResUrl} onChange={e=>setNewResUrl(e.target.value)} placeholder="URL (https://...)" type="url" />
                <GInput value={newResNote} onChange={e=>setNewResNote(e.target.value)} placeholder="Put smɔl not bɔt dis link..." />
                <Btn onClick={addResource}>{formLoading?"DE SƐN...":"SƐN TO DATABANK"}</Btn>
              </div>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:12}}>
              {resources.length === 0 && <div style={{textAlign:"center", padding:30, color:`rgba(${sysColorRGB},0.27)`, fontSize:14}}>DATABANK ƐMPTI</div>}
              {resources.map(r => (
                <div key={r.id} style={{background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.2)`,borderRadius:10,padding:"16px", display:"flex", flexDirection:"column", gap:10}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:16, color:"#fff", fontWeight:"bold", marginBottom:6}}>{r.title}</div>
                      <div style={{fontSize:11, color:`rgba(${sysColorRGB},0.4)`}}>Na {r.addedBy} put am</div>
                    </div>
                    <div style={{display:"flex", gap:10}}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={{padding:"8px 16px", background:`rgba(${sysColorRGB},0.13)`, color:sysColor, borderRadius:6, textDecoration:"none", fontSize:12, fontWeight:"bold"}}>OPIN LINK</a>
                      {(profile.role === "Group Leader" || r.addedBy === profile.username) && (
                        <button onClick={()=>deleteResource(r.id)} style={{background:"transparent", border:"1px solid #ff444455", color:"#ff4444", borderRadius:6, padding:"8px 12px", cursor:"pointer"}}>MƆS</button>
                      )}
                    </div>
                  </div>
                  {r.note && (
                    <div style={{background:"#000", borderLeft:`3px solid ${sysColor}`, padding:"8px 12px", fontSize:13, color:`rgba(${sysColorRGB},0.67)`, borderRadius:"0 8px 8px 0"}}>
                      {r.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {profile.role === "Group Leader" && (
              <div style={{marginTop:40, borderTop:"1px dashed #ff444455", paddingTop:20}}>
                <div style={{fontSize:10, color:"#ff4444", marginBottom:10}}>SISTƐM OVERRIDE (FƆ LIDA ONLI)</div>
                <button onClick={seedTasks} disabled={migrating} style={{width:"100%",padding:"12px 0",background:`rgba(${sysColorRGB},0.07)`,border:`1px solid rgba(${sysColorRGB},0.33)`,borderRadius:8,color:sysColor,fontSize:12,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:migrating?"not-allowed":"pointer",marginBottom:10}}>
                  PUT DIFƆLT WOK DƐN
                </button>
                <button onClick={deleteAllTasks} disabled={migrating} style={{width:"100%",padding:"12px 0",background:"#ff444411",border:"1px solid #ff4444",borderRadius:8,color:"#ff4444",fontSize:12,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace",cursor:migrating?"not-allowed":"pointer"}}>
                  MƆS ƆL WOK DƐN (RISET)
                </button>
                {migrateMsg&&<div style={{marginTop:12,padding:"10px",background:`rgba(${sysColorRGB},0.07)`,border:`1px solid rgba(${sysColorRGB},0.27)`,borderRadius:6,fontSize:12,color:sysColor}}>{migrateMsg}</div>}
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB (GLOBAL) */}
        {activeTab === "chat" && (
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)"}}>
            <div style={{padding: "12px 16px", background: "#000", borderBottom: `1px solid rgba(${sysColorRGB},0.2)`, textAlign: "center"}}>
              <div style={{fontSize: 14, color: sysColor, letterSpacing: 3, fontFamily:"'Orbitron',monospace", fontWeight:"bold"}}>GLOBA NƐTWƆK CHAT</div>
              <div style={{fontSize: 10, color: `rgba(${sysColorRGB},0.53)`, marginTop:4}}>TƆK WIT ƆL TIM DƐN</div>
            </div>
            <div style={{flex:1,overflow:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
              {messages.length===0&&<div style={{textAlign:"center",color:`rgba(${sysColorRGB},0.13)`,padding:40,fontSize:14}}>NƐTWƆK SAYLƐNT</div>}
              {messages.map(msg=>{
                const isMe=msg.user===profile.username;
                return (
                  <div key={msg.id} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:10,alignItems:"flex-end"}}>
                    
                    {msg.photoURL ? (
                      <img src={msg.photoURL} alt="p" style={{width:32, height:32, borderRadius:8, border:`2px solid ${msg.color||sysColor}55`, flexShrink:0}} />
                    ) : (
                      <div style={{width:32,height:32,borderRadius:8,background:(msg.color||sysColor)+"22",border:`2px solid ${msg.color||sysColor}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:msg.color||sysColor,flexShrink:0}}>
                        {(msg.user||"?")[0].toUpperCase()}
                      </div>
                    )}
                    
                    <div style={{maxWidth:"75%"}}>
                      {!isMe&&<div style={{fontSize:10,color:msg.color||sysColor,marginBottom:4,letterSpacing:1}}>{msg.user} <span style={{color:`rgba(${sysColorRGB},0.33)`}}>• {msg.teamName}</span></div>}
                      <div style={{background:isMe?`rgba(${sysColorRGB},0.13)`:"#0a0f0a",border:`1px solid ${isMe?`rgba(${sysColorRGB},0.4)`:`rgba(${sysColorRGB},0.13)`}`,borderRadius:isMe?"12px 4px 12px 12px":"4px 12px 12px 12px",padding:"10px 14px",fontSize:14,color:isMe?sysColor:"#aaffcc",lineHeight:1.6,wordBreak:"break-word", boxShadow:isMe?`0 0 10px rgba(${sysColorRGB},0.13)`:"none"}}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div style={{padding:"14px 16px",background:"#0a0f0a",borderTop:`1px solid rgba(${sysColorRGB},0.2)`,display:"flex",gap:10}}>
              <input 
                type="text"
                value={chatMsg} 
                onChange={e=>setChatMsg(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){sendMsg();}}}
                placeholder="Rayt mɛsej..."
                className="themed-input"
                style={{flex:1,background:"#000",border:`1px solid rgba(${sysColorRGB},0.27)`,borderRadius:8,padding:"14px 16px",color:sysColor,fontSize:14,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}
              />
              <button className="neon-btn" onClick={sendMsg} style={{padding:"12px 24px",background:`rgba(${sysColorRGB},0.13)`,border:`1px solid ${sysColor}`,borderRadius:8,color:sysColor,fontSize:14,fontWeight:"bold",fontFamily:"'Share Tech Mono',monospace",cursor:"pointer"}}>
                SƐN
              </button>
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === "quiz" && (
          <div style={{padding:"20px 16px"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
              <div style={{fontSize:12,color:sysColor,letterSpacing:3, fontWeight:"bold"}}>GLOBA KUIZ DATABES</div>
              <button onClick={()=>setShowAddQuizSet(!showAddQuizSet)} style={{background:`rgba(${sysColorRGB},0.13)`, border:`1px solid ${sysColor}`, color:sysColor, padding:"8px 14px", borderRadius:6, fontSize:12, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace"}}>
                {showAddQuizSet ? "KANSUL" : "+ MEK KUIZ SET"}
              </button>
            </div>

            {/* CREATE NEW QUIZ SET */}
            {showAddQuizSet && (
              <div style={{background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.33)`,borderRadius:12,padding:16,marginBottom:24, boxShadow:`0 0 15px rgba(${sysColorRGB},0.07)`}}>
                <div style={{fontSize:11,color:`rgba(${sysColorRGB},0.67)`,letterSpacing:2,marginBottom:12}}>MEK NYU KUIZ BƆNDUL</div>
                <div style={{display:"flex", flexDirection:"column", gap:10}}>
                  <GInput value={newQuizTitle} onChange={e=>setNewQuizTitle(e.target.value)} placeholder="Kuiz Set Taytul (ɛg. Week 1 DBMS)" />
                  
                  <div style={{marginTop:10}}>
                     {quizQuestions.map((q, index) => (
                        <div key={index} style={{background:"#000", padding:"14px", borderRadius:8, border:`1px solid rgba(${sysColorRGB},0.2)`, marginBottom:10}}>
                           <div style={{fontSize:12, color:sysColor, marginBottom:8}}>Kwɛstyɔn {index + 1}</div>
                           <GInput value={q.q} onChange={e=>handleQuizQChange(index, 'q', e.target.value)} placeholder="Put Kwɛstyɔn..." />
                           <div style={{display:"flex", gap:10, marginTop:10}}>
                             <GInput value={q.opt1} onChange={e=>handleQuizQChange(index, 'opt1', e.target.value)} placeholder="Ɔpshɔn 1" />
                             <GInput value={q.opt2} onChange={e=>handleQuizQChange(index, 'opt2', e.target.value)} placeholder="Ɔpshɔn 2" />
                           </div>
                           <div style={{display:"flex", gap:10, marginTop:10}}>
                             <GInput value={q.opt3} onChange={e=>handleQuizQChange(index, 'opt3', e.target.value)} placeholder="Ɔpshɔn 3" />
                             <GInput value={q.opt4} onChange={e=>handleQuizQChange(index, 'opt4', e.target.value)} placeholder="Ɔpshɔn 4" />
                           </div>
                           <div style={{marginTop:10}}>
                             <div style={{fontSize:10, color:`rgba(${sysColorRGB},0.67)`, marginBottom:4}}>KƆRƐKT ANSA</div>
                             <select value={q.ans} onChange={e=>handleQuizQChange(index, 'ans', e.target.value)} className="themed-input" style={{width:"100%",background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.27)`,borderRadius:8,padding:"10px",color:sysColor,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
                               <option value={0}>Ɔpshɔn 1</option>
                               <option value={1}>Ɔpshɔn 2</option>
                               <option value={2}>Ɔpshɔn 3</option>
                               <option value={3}>Ɔpshɔn 4</option>
                             </select>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div style={{display:"flex", gap:10, marginTop:10}}>
                     <button onClick={addQuestionToSet} style={{flex:1, padding:"12px", background:"transparent", border:"1px dashed #00ccff", color:"#00ccff", borderRadius:8, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace"}}>+ ADD ƆDA KWƐSTYƆN</button>
                     <Btn onClick={saveQuizSet} style={{flex:2}}>{formLoading ? "DE UPLOD..." : "SƐN KUIZ SET"}</Btn>
                  </div>
                </div>
              </div>
            )}

            {/* QUIZ LIST UI */}
            {!quizActive && !quizDone && !showAddQuizSet && (
               <div style={{display:"flex", flexDirection:"column", gap:12}}>
                  {dbQuizzes.length === 0 && (
                     <div style={{textAlign:"center", padding:40, background:"#0a0f0a", border:`1px solid rgba(${sysColorRGB},0.2)`, borderRadius:12}}>
                        <div style={{fontSize:14, color:`rgba(${sysColorRGB},0.4)`, marginBottom:10}}>Nɔ kuiz nɔ de yet.</div>
                        <Btn onClick={() => startQuiz(null)} style={{maxWidth:200}}>PLE DIFƆLT KUIZ</Btn>
                     </div>
                  )}
                  {dbQuizzes.map(qz => (
                     <div key={qz.id} style={{background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.33)`,borderRadius:12,padding:"16px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <div>
                           <div style={{fontSize:16, color:"#fff", fontWeight:"bold"}}>{qz.title}</div>
                           <div style={{fontSize:11, color:`rgba(${sysColorRGB},0.4)`, marginTop:4}}>Na {qz.addedBy} put am • {qz.questions.length} Kwɛstyɔn dɛn</div>
                        </div>
                        <Btn onClick={() => startQuiz(qz)} style={{width:"auto", padding:"8px 20px"}}>STAT</Btn>
                     </div>
                  ))}
               </div>
            )}

            {/* QUIZ RUNNING UI */}
            {quizActive&&!quizDone&&shuffled[quizQ]&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                  <div style={{fontSize:13,color:`rgba(${sysColorRGB},0.4)`, fontWeight:"bold"}}>KWƐSTYƆN {quizQ+1} // {shuffled.length}</div>
                  <div style={{fontSize:13,color:"#00ccff", fontWeight:"bold"}}>SKƆ: {quizScore}</div>
                </div>
                <div style={{background:"#0a0f0a",border:`1px solid rgba(${sysColorRGB},0.33)`,borderRadius:12,padding:"20px",marginBottom:20, boxShadow:`0 0 20px rgba(${sysColorRGB},0.07)`}}>
                  <div style={{fontSize:16,color:"#fff",lineHeight:1.6}}>{shuffled[quizQ].q}</div>
                </div>
                {shuffled[quizQ].opts.map((opt,i)=>{
                  let bg="#0a0f0a",bc=`rgba(${sysColorRGB},0.2)`,c=`rgba(${sysColorRGB},0.67)`;
                  if(quizAnswered!==null){
                    if(i===shuffled[quizQ].ans){bg=`rgba(${sysColorRGB},0.13)`;bc=sysColor;c=sysColor;}
                    else if(i===quizAnswered){bg="#ff000020";bc="#ff4444";c="#ff4444";}
                  }
                  return <button key={i} onClick={()=>answerQuiz(i)} style={{width:"100%",marginBottom:12,padding:"16px",background:bg,border:`1px solid ${bc}`,borderRadius:10,color:c,fontSize:15,textAlign:"left",fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",transition:"all 0.2s"}}>
                    [ {i+1} ] {opt}
                  </button>;
                })}
              </div>
            )}
            {quizDone&&(
              <div style={{textAlign:"center",padding:"40px 20px", background:"#0a0f0a", border:`1px solid rgba(${sysColorRGB},0.2)`, borderRadius:16}}>
                <div style={{fontSize:50,marginBottom:16}}>🏆</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:28,color:sysColor,marginBottom:16, textShadow:`0 0 10px rgba(${sysColorRGB},0.4)`}}>TƐST DƆN</div>
                <div style={{fontSize:18, color:"#fff", marginBottom:24}}>Faynal Skɔ: <span style={{color:"#00ccff"}}>{quizScore}/{shuffled.length}</span></div>
                <Btn onClick={()=>setQuizDone(false)} style={{maxWidth:200}}>KƆMƆT NA TƐST</Btn>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#000",borderTop:`1px solid rgba(${sysColorRGB},0.27)`,display:"flex",zIndex:200, paddingBottom:"env(safe-area-inset-bottom)"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:"14px 4px",background:activeTab===t.id?`rgba(${sysColorRGB},0.07)`:"transparent",border:"none",borderTop:activeTab===t.id?`3px solid ${sysColor}`:"3px solid transparent",color:activeTab===t.id?sysColor:`rgba(${sysColorRGB},0.4)`,fontSize:10,letterSpacing:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",transition:"all 0.2s"}}>
            <span style={{fontSize:22, color:activeTab===t.id?sysColor:`rgba(${sysColorRGB},0.4)`, textShadow:activeTab===t.id?`0 0 10px ${sysColor}`:"none"}}>{t.icon}</span>
            <span style={{fontWeight:activeTab===t.id?"bold":"normal"}}>{t.label}</span>
          </button>
        ))}
      </div>

      {toast&&(
        <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:"#000",border:`1px solid ${sysColor}`,borderRadius:10,padding:"12px 24px",fontSize:14,fontWeight:"bold",color:sysColor,zIndex:9999,whiteSpace:"nowrap",fontFamily:"'Share Tech Mono',monospace", boxShadow: `0 0 20px rgba(${sysColorRGB},0.33)`, animation:"pulse-glow 1s infinite"}}>
          {toast}
        </div>
      )}
    </div>
  );
}