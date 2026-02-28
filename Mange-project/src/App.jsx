// src/App.jsx - TeamFlow v3
// Made by HassKariyawasam | All rights reserved TeamFlow
import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, updatePassword,
} from "firebase/auth";
import {
  collection, doc, setDoc, getDoc, getDocs, addDoc,
  onSnapshot, query, orderBy, deleteDoc, updateDoc,
  serverTimestamp, writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase.js";
import {
  INITIAL_TASKS, THEME_COLORS, TABS,
  TASKS_COL, CHAT_COL, USERS_COL, RESOURCES_COL,
  WEEK_STATUS_COL, QUIZZES_COL, PROJECTS_COL,
  ADMIN_USER, ADMIN_PASS, ADMIN_EMAIL,
} from "./constants.js";
import { hex2rgb, genCode, makeCSS } from "./utils.js";

import LoadingScreen  from "./components/LoadingScreen.jsx";
import { AuthScreen, GoogleOnboardScreen } from "./components/AuthScreens.jsx";
import AdminPanel     from "./components/AdminPanel.jsx";
import TFLogo         from "./components/Logo.jsx";
import TasksTab       from "./components/TasksTab.jsx";
import TeamTab        from "./components/TeamTab.jsx";
import ChatTab        from "./components/ChatTab.jsx";
import ResourcesTab   from "./components/ResourcesTab.jsx";
import QuizTab        from "./components/QuizTab.jsx";
import SettingsTab    from "./components/SettingsTab.jsx";

export default function App() {
  // core
  const [authUser,  setAuthUser]  = useState(null);
  const [profile,   setProfile]   = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [screen,    setScreen]    = useState("loading");
  // screens: loading | login | google_onboard | app | admin
  const [activeTab, setActiveTab] = useState("tasks");
  const [dbError,   setDbError]   = useState(null);
  const [formLoad,  setFormLoad]  = useState(false);
  const [toast,     setToast]     = useState(null);

  // auth form
  const [authTab,        setAuthTab]        = useState("login");
  const [loginId,        setLoginId]        = useState("");
  const [loginPass,      setLoginPass]      = useState("");
  const [regUser,        setRegUser]        = useState("");
  const [regPass,        setRegPass]        = useState("");
  const [regEmail,       setRegEmail]       = useState("");
  const [regTg,          setRegTg]          = useState("");
  const [regPhone,       setRegPhone]       = useState("");
  const [regTeam,        setRegTeam]        = useState("");
  const [regPhoto,       setRegPhoto]       = useState("");
  const [joinCode,       setJoinCode]       = useState("");
  const [selectedProjId, setSelectedProjId] = useState("");
  const [formErr,        setFormErr]        = useState("");

  // projects + active
  const [projects,      setProjects]      = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  // app data
  const [tasks,     setTasks]     = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [weekDone,  setWeekDone]  = useState([]);
  const [messages,  setMessages]  = useState([]);
  const [dbQuizzes, setDbQuizzes] = useState([]);

  // invite
  const [inviteCopied, setInviteCopied] = useState(false);

  // admin
  const [allUsers,  setAllUsers]  = useState([]);
  const [allTeams,  setAllTeams]  = useState([]);

  // theme
  const sc  = profile?.themeColor || "#00ff88";
  const scr = hex2rgb(sc);

  // -- URL join code ------------------------------------------------
  useEffect(()=>{
    const p = new URLSearchParams(window.location.search);
    const c = p.get("join");
    if (c){ setJoinCode(c.toUpperCase()); setAuthTab("register"); }
  },[]);

  // -- Global projects listener (always on) -------------------------
  useEffect(()=>{
    const unsub = onSnapshot(collection(db, PROJECTS_COL), snap=>{
      setProjects(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return ()=>unsub();
  },[]);

  // -- Auth state ---------------------------------------------------
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async user=>{
      if (user){
        if (user.email === ADMIN_EMAIL){
          setAuthUser(user); setScreen("admin"); setAuthReady(true);
          loadAdminData(); return;
        }
        try {
          const snap = await getDoc(doc(db, USERS_COL, user.uid));
          if (snap.exists()){
            const p = { uid:user.uid, ...snap.data() };
            setProfile(p); setAuthUser(user);
            // restore active project if saved
            if (p.projectId){
              const psnap = await getDoc(doc(db, PROJECTS_COL, p.projectId));
              if (psnap.exists()) setActiveProject({ id:psnap.id, ...psnap.data() });
            }
            setScreen("app");
          } else {
            // Google new user - onboard
            setAuthUser(user);
            setRegEmail(user.email||"");
            setRegUser(user.displayName||"");
            setRegPhoto(user.photoURL||"");
            setScreen("google_onboard");
          }
        } catch(e){ setDbError("Firebase: "+e.message); setScreen("login"); }
      } else {
        setAuthUser(null); setProfile(null); setScreen("login");
        setActiveProject(null);
        setTasks([]); setMessages([]); setTeamUsers([]);
      }
      setAuthReady(true);
    });
    return ()=>unsub();
  },[]);

  // -- Data listeners (when profile + project ready) -----------------
  useEffect(()=>{
    if (!authUser||!profile||!activeProject) return;
    setDbError(null);
    const pid = activeProject.id;
    const tid = profile.teamId;
    const err = e=>setDbError("DB: "+e.message);

    // public tasks
    const u1 = onSnapshot(collection(db, TASKS_COL), snap=>{
      const pub = snap.docs
        .map(d=>({fsId:d.id,...d.data()}))
        .filter(t=>t.projectId===pid&&t.teamId===tid)
        .sort((a,b)=>(a.week||0)-(b.week||0)||(a.done?1:-1)-(b.done?1:-1));
      setTasks(prev=>[...pub,...prev.filter(t=>t.isPrivate)]);
    },err);

    // private tasks
    const u2 = onSnapshot(collection(db,USERS_COL,authUser.uid,"privateTasks"), snap=>{
      const priv = snap.docs.map(d=>({fsId:d.id,...d.data(),isPrivate:true}));
      setTasks(prev=>[...prev.filter(t=>!t.isPrivate),...priv]);
    },err);

    // chat
    const u3 = onSnapshot(query(collection(db,CHAT_COL),orderBy("ts")), snap=>{
      setMessages(snap.docs.map(d=>({id:d.id,...d.data()})).filter(m=>m.projectId===pid&&m.teamId===tid));
    },err);

    // team members in this project+team
    const u4 = onSnapshot(collection(db,USERS_COL), snap=>{
      setTeamUsers(
        snap.docs.map(d=>({uid:d.id,...d.data()}))
          .filter(u=>u.teamId===tid&&u.projectId===pid)
      );
    },err);

    // resources
    const u5 = onSnapshot(collection(db,RESOURCES_COL), snap=>{
      setResources(snap.docs.map(d=>({id:d.id,...d.data()})).filter(r=>r.projectId===pid&&r.teamId===tid));
    },err);

    // week status
    const u6 = onSnapshot(collection(db,WEEK_STATUS_COL), snap=>{
      setWeekDone(
        snap.docs.map(d=>d.data())
          .filter(w=>w.projectId===pid&&w.teamId===tid&&w.done)
          .map(w=>w.week)
      );
    },err);

    // quizzes (global)
    const u7 = onSnapshot(collection(db,QUIZZES_COL), snap=>{
      setDbQuizzes(snap.docs.map(d=>({id:d.id,...d.data()})));
    },err);

    return ()=>[u1,u2,u3,u4,u5,u6,u7].forEach(u=>u());
  },[authUser,profile,activeProject]);

  // -- helpers ------------------------------------------------------
  const showToast = msg=>{ setToast(msg); setTimeout(()=>setToast(null),3500); };

  // -- AUTH ---------------------------------------------------------
  async function doGoogleLogin(){
    setFormErr(""); setFormLoad(true);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch(e){ setFormErr("Google failed: "+e.message); }
    setFormLoad(false);
  }

  async function doLogin(){
    setFormErr(""); setFormLoad(true);
    // admin check
    if (loginId.trim()===ADMIN_USER && loginPass===ADMIN_PASS){
      try {
        try { await signInWithEmailAndPassword(auth,ADMIN_EMAIL,ADMIN_PASS); }
        catch { await createUserWithEmailAndPassword(auth,ADMIN_EMAIL,ADMIN_PASS); }
      } catch(e){ setFormErr("Admin error: "+e.message); }
      setFormLoad(false); return;
    }
    try {
      let em = loginId.trim();
      if (!em.includes("@")){
        const s = await getDocs(collection(db,USERS_COL));
        const f = s.docs.find(d=>d.data().username===em);
        if (f) em=f.data().email;
        else { setFormErr("Username not found."); setFormLoad(false); return; }
      }
      await signInWithEmailAndPassword(auth,em,loginPass);
    } catch { setFormErr("Wrong credentials."); }
    setFormLoad(false);
  }

  // Registration: everyone is a "Member" joining a project+team via code
  async function doRegister(isOnboard=false){
    setFormErr(""); setFormLoad(true);
    if (!regUser.trim()||regUser.length<3){ setFormErr("Username min 3 chars"); setFormLoad(false); return; }
    if (!isOnboard&&regPass.length<4)    { setFormErr("Password min 4 chars"); setFormLoad(false); return; }
    if (!regEmail.includes("@"))         { setFormErr("Valid email required");  setFormLoad(false); return; }
    if (!regTg.trim())                   { setFormErr("Telegram required");     setFormLoad(false); return; }
    if (!regPhone.trim())                { setFormErr("Phone required");        setFormLoad(false); return; }
    if (!selectedProjId)                 { setFormErr("Select a project");      setFormLoad(false); return; }
    if (!regTeam.trim())                 { setFormErr("Team name required");    setFormLoad(false); return; }
    const code = joinCode.trim();
    if (!code)                           { setFormErr("Join code required");    setFormLoad(false); return; }

    try {
      const uSnap = await getDocs(collection(db,USERS_COL));

      // username unique check
      if (uSnap.docs.some(d=>d.data().username===regUser.trim()&&d.id!==(authUser?.uid))){
        setFormErr("Username already taken!"); setFormLoad(false); return;
      }

      const uid = isOnboard
        ? authUser.uid
        : (await createUserWithEmailAndPassword(auth,regEmail.trim(),regPass)).user.uid;

      const palette = ["#00ccff","#ffaa00","#ff66cc","#ccff00","#b026ff","#ff8800","#00ffcc"];
      let prof;

      if (code.toUpperCase() === "NEWLEADER") {
        // -- LEADER registration path ------------------------------
        // Creates a brand new team for this project
        const newJoinCode = genCode();
        const color = "#00ff88"; // leader always green
        prof = {
          username:  regUser.trim(),
          email:     regEmail.trim(),
          tgNumber:  regTg.trim(),
          phone:     regPhone.trim(),
          isLeader:  true,
          joinCode:  newJoinCode,
          color,
          themeColor:"#00ff88",
          photoURL:  regPhoto,
          teamId:    uid,            // leader's uid = their team's id
          teamName:  regTeam.trim(),
          projectId: selectedProjId,
        };
        await setDoc(doc(db,USERS_COL,uid), prof);
        // add team to project
        const pSnap = await getDoc(doc(db,PROJECTS_COL,selectedProjId));
        if (pSnap.exists()){
          const tids = pSnap.data().teamIds||[];
          if (!tids.includes(uid)){
            await updateDoc(doc(db,PROJECTS_COL,selectedProjId),{ teamIds:[...tids,uid] });
          }
        }
      } else {
        // -- MEMBER registration path ------------------------------
        // validate join code & find leader's teamId
        const ldrDoc = uSnap.docs.find(d=>d.data().joinCode===code.toUpperCase()&&d.data().projectId===selectedProjId);
        if (!ldrDoc){ setFormErr("Invalid join code for this project!"); setFormLoad(false); return; }
        const ldrData = ldrDoc.data();

        const teamCount = uSnap.docs.filter(d=>d.data().teamId===ldrData.teamId).length;
        const color     = palette[teamCount % palette.length];

        prof = {
          username:  regUser.trim(),
          email:     regEmail.trim(),
          tgNumber:  regTg.trim(),
          phone:     regPhone.trim(),
          isLeader:  false,
          color,
          themeColor:"#00ff88",
          photoURL:  regPhoto,
          teamId:    ldrData.teamId,
          teamName:  regTeam.trim(),
          projectId: selectedProjId,
        };
        await setDoc(doc(db,USERS_COL,uid), prof);

        // add teamId to project's teamIds if not present
        const projSnap = await getDoc(doc(db,PROJECTS_COL,selectedProjId));
        if (projSnap.exists()){
          const tids = projSnap.data().teamIds||[];
          if (!tids.includes(ldrData.teamId)){
            await updateDoc(doc(db,PROJECTS_COL,selectedProjId),{ teamIds:[...tids,ldrData.teamId] });
          }
        }
      }

      if (isOnboard){ setProfile({uid,...prof}); setScreen("app"); }
      showToast("Welcome, "+regUser+"!");
    } catch(e){
      setFormErr("Error: "+(e.code==="auth/email-already-in-use"?"Email in use.":e.message));
    }
    setFormLoad(false);
  }

  // Leader registers separately: no join code needed, creates their own team+project linkage
  // (Leaders are created by admin or via a special flow - for now leaders register same way
  //  but admin can upgrade them. Leaders have isLeader=true + joinCode.)
  // Actually: if join code points to a leader record, the code is valid.
  // Leaders themselves register by using the admin-provided project and setting their OWN join code.
  // Solution: if registering user enters ANY project and enters "LEADER" as code, they become leader.
  // Better: Admin creates leader accounts from admin panel. For now leaders self-register with code "NEWLEADER"
  // which creates a leader account. Admin can also set isLeader manually.

  async function doLogout(){ await signOut(auth); }

  // -- PROJECT SWITCH -----------------------------------------------
  async function switchProject(proj){
    try {
      // update user's projectId + teamId
      await updateDoc(doc(db,USERS_COL,profile.uid),{ projectId:proj.id });
      // add team to project if not there
      const tids = proj.teamIds||[];
      if (!tids.includes(profile.teamId)){
        await updateDoc(doc(db,PROJECTS_COL,proj.id),{ teamIds:[...tids,profile.teamId] });
      }
      setProfile({...profile,projectId:proj.id});
      setActiveProject(proj);
      showToast("Switched to: "+proj.shortName);
      setActiveTab("tasks");
    } catch(e){ showToast("Error: "+e.message); }
  }

  // -- INVITE -------------------------------------------------------
  function copyInvite(msg){
    navigator.clipboard.writeText(msg).then(()=>{
      setInviteCopied(true); showToast("Invite copied!");
      setTimeout(()=>setInviteCopied(false),3000);
    });
  }

  // -- TASKS --------------------------------------------------------
  async function addTask(t){
    const base = {
      ...t, done:false, note:"",
      createdBy: profile.username,
      createdAt: serverTimestamp(),
      teamId:    profile.teamId,
      projectId: activeProject?.id,
    };
    try {
      if (t.isPrivate) await addDoc(collection(db,USERS_COL,authUser.uid,"privateTasks"),base);
      else             await addDoc(collection(db,TASKS_COL),base);
      showToast("Task added!");
    } catch(e){ showToast("Error: "+e.message); }
  }

  async function toggleDone(task){
    const done=!task.done;
    const u={done,completedAt:done?serverTimestamp():null};
    try {
      if (task.isPrivate) await updateDoc(doc(db,USERS_COL,authUser.uid,"privateTasks",task.fsId),u);
      else                await updateDoc(doc(db,TASKS_COL,task.fsId),u);
    } catch(e){ showToast("Error: "+e.message); }
  }

  async function saveNote(task,note){
    try {
      if (task.isPrivate) await updateDoc(doc(db,USERS_COL,authUser.uid,"privateTasks",task.fsId),{note});
      else                await updateDoc(doc(db,TASKS_COL,task.fsId),{note});
      showToast("Note saved!");
    } catch(e){ showToast("Error: "+e.message); }
  }

  async function deleteTask(task){
    if (!window.confirm("Delete?")) return;
    try {
      if (task.isPrivate) await deleteDoc(doc(db,USERS_COL,authUser.uid,"privateTasks",task.fsId));
      else                await deleteDoc(doc(db,TASKS_COL,task.fsId));
    } catch(e){ showToast("Error: "+e.message); }
  }

  async function toggleWeekDone(week){
    if (!profile.isLeader) return;
    const done=weekDone.includes(week);
    const ref=doc(db,WEEK_STATUS_COL,`${profile.teamId}_${week}_${activeProject?.id}`);
    try {
      if (done){ await deleteDoc(ref); showToast("Week "+week+" reopened"); }
      else     { await setDoc(ref,{done:true,teamId:profile.teamId,week,projectId:activeProject?.id}); showToast("Week "+week+" done!"); }
    } catch(e){ showToast("Error: "+e.message); }
  }

  // -- RESOURCES ----------------------------------------------------
  async function addResource(data){
    try {
      await addDoc(collection(db,RESOURCES_COL),{
        ...data, addedBy:profile.username,
        teamId:profile.teamId, projectId:activeProject?.id,
        ts:serverTimestamp(),
      });
      showToast("Added!");
    } catch(e){ showToast("Error: "+e.message); }
  }

  async function deleteResource(id){
    try { await deleteDoc(doc(db,RESOURCES_COL,id)); showToast("Deleted!"); }
    catch(e){ showToast("Error: "+e.message); }
  }

  async function seedTasks(){
    try {
      const batch=writeBatch(db);
      INITIAL_TASKS.forEach(t=>batch.set(doc(collection(db,TASKS_COL)),{
        ...t, done:false, note:"",
        createdBy:profile.username, createdAt:serverTimestamp(),
        teamId:profile.teamId, projectId:activeProject?.id,
      }));
      await batch.commit();
      return "Done! "+INITIAL_TASKS.length+" tasks seeded.";
    } catch(e){ return "Error: "+e.message; }
  }

  async function deleteAllTasks(){
    try {
      const snap=await getDocs(collection(db,TASKS_COL));
      const batch=writeBatch(db); let n=0;
      snap.docs.forEach(d=>{ if(d.data().projectId===activeProject?.id&&d.data().teamId===profile.teamId){ batch.delete(d.ref); n++; } });
      await batch.commit();
      return "Done! "+n+" tasks removed.";
    } catch(e){ return "Error: "+e.message; }
  }

  // -- CHAT ---------------------------------------------------------
  async function sendMsg(text){
    try {
      await addDoc(collection(db,CHAT_COL),{
        user:      profile.username,
        color:     profile.color,
        photoURL:  profile.photoURL||"",
        teamName:  profile.teamName||"",
        text,
        time:      new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
        ts:        serverTimestamp(),
        teamId:    profile.teamId,
        projectId: activeProject?.id,
      });
    } catch(e){ showToast("Error: "+e.message); }
  }

  async function deleteMsg(id){
    if (!profile.isLeader && messages.find(m=>m.id===id)?.user!==profile.username) return;
    try { await deleteDoc(doc(db,CHAT_COL,id)); }
    catch(e){ showToast("Error: "+e.message); }
  }

  // -- QUIZ ---------------------------------------------------------
  async function saveQuiz(title,questions){
    try {
      await addDoc(collection(db,QUIZZES_COL),{
        title, questions, addedBy:profile.username,
        ts:serverTimestamp(), projectId:activeProject?.id,
      });
      showToast("Quiz saved!");
    } catch(e){ showToast("Error: "+e.message); }
  }

  async function deleteQuiz(id){
    if (!window.confirm("Delete quiz?")) return;
    try { await deleteDoc(doc(db,QUIZZES_COL,id)); showToast("Quiz deleted!"); }
    catch(e){ showToast("Error: "+e.message); }
  }

  // -- SETTINGS -----------------------------------------------------
  async function updateProfile(data){
    setFormLoad(true);
    try {
      const u={phone:data.phone,tgNumber:data.tgNumber};
      await updateDoc(doc(db,USERS_COL,profile.uid),u);
      if (data.newPassword?.trim().length>=4) await updatePassword(authUser,data.newPassword.trim());
      setProfile({...profile,...u});
      showToast("Saved!");
    } catch(e){ showToast("Error: "+e.message); }
    setFormLoad(false);
  }

  async function updateTheme(color){
    try {
      await updateDoc(doc(db,USERS_COL,profile.uid),{themeColor:color});
      setProfile({...profile,themeColor:color});
      showToast("Theme updated!");
    } catch(e){ showToast("Error: "+e.message); }
  }

  // -- ADMIN --------------------------------------------------------
  async function loadAdminData(){
    try {
      const uSnap = await getDocs(collection(db,USERS_COL));
      const users = uSnap.docs.map(d=>({uid:d.id,...d.data()}));
      setAllUsers(users);
      const pSnap = await getDocs(collection(db,PROJECTS_COL));
      setProjects(pSnap.docs.map(d=>({id:d.id,...d.data()})));
      const qSnap = await getDocs(collection(db,QUIZZES_COL));
      setDbQuizzes(qSnap.docs.map(d=>({id:d.id,...d.data()})));
      // group by teamId
      const teams={};
      users.forEach(u=>{ if(!u.teamId)return; if(!teams[u.teamId])teams[u.teamId]={teamId:u.teamId,teamName:u.teamName,members:[]}; teams[u.teamId].members.push(u); });
      setAllTeams(Object.values(teams));
    } catch(e){ setDbError("Admin load: "+e.message); }
  }

  // -- derived ------------------------------------------------------
  const pubTasks = tasks.filter(t=>!t.isPrivate);
  const pct      = pubTasks.length ? Math.round(pubTasks.filter(t=>t.done).length/pubTasks.length*100) : 0;

  // User's accessible projects (same teamId OR any project with their teamId in teamIds)
  const myProjects = projects.filter(p => p.teamIds?.includes(profile?.teamId)||p.ownerId==="admin");

  // ================================================================
  // RENDER
  // ================================================================

  if (!authReady) return <><style>{makeCSS()}</style><LoadingScreen/></>;

  if (screen==="google_onboard") return (
    <>
      <style>{makeCSS()}</style>
      <GoogleOnboardScreen
        regUser={regUser} setRegUser={setRegUser}
        regPhone={regPhone} setRegPhone={setRegPhone}
        regEmail={regEmail} regTg={regTg} setRegTg={setRegTg}
        regPhoto={regPhoto}
        joinCode={joinCode} setJoinCode={setJoinCode}
        regTeam={regTeam} setRegTeam={setRegTeam}
        projects={projects} selectedProjId={selectedProjId} setSelectedProjId={setSelectedProjId}
        formErr={formErr} formLoad={formLoad}
        doRegister={doRegister} doCancel={()=>signOut(auth)}
      />
    </>
  );

  if (screen==="login"||!authUser) return (
    <>
      <style>{makeCSS()}</style>
      <AuthScreen
        authTab={authTab} setAuthTab={setAuthTab}
        loginId={loginId} setLoginId={setLoginId}
        loginPass={loginPass} setLoginPass={setLoginPass}
        regUser={regUser} setRegUser={setRegUser}
        regPass={regPass} setRegPass={setRegPass}
        regEmail={regEmail} setRegEmail={setRegEmail}
        regTg={regTg} setRegTg={setRegTg}
        regPhone={regPhone} setRegPhone={setRegPhone}
        regTeam={regTeam} setRegTeam={setRegTeam}
        joinCode={joinCode} setJoinCode={setJoinCode}
        projects={projects} selectedProjId={selectedProjId} setSelectedProjId={setSelectedProjId}
        formErr={formErr} formLoad={formLoad}
        doLogin={doLogin} doRegister={doRegister} doGoogleLogin={doGoogleLogin}
      />
    </>
  );

  if (screen==="admin") return (
    <>
      <style>{makeCSS()}</style>
      <AdminPanel
        db={db} allUsers={allUsers} allTeams={allTeams}
        projects={projects} dbQuizzes={dbQuizzes}
        toast={toast} showToast={showToast}
        doLogout={doLogout} loadAdminData={loadAdminData}
      />
    </>
  );

  // -- MAIN APP -------------------------------------------------------
  return (
    <div style={{ background:"#030503", minHeight:"100vh", fontFamily:"'Share Tech Mono',monospace", display:"flex", flexDirection:"column", "--sc":sc, "--scr":scr }}>
      <style>{makeCSS()}</style>

      {/* HEADER */}
      <div style={{ background:"#0a0f0a", borderBottom:`1px solid rgba(${scr},0.2)`, padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:200, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
          <TFLogo size="sm" color={sc} showSub={false}/>
          {activeProject && (
            <>
              <div style={{ width:1, height:26, background:`rgba(${scr},0.2)`, flexShrink:0 }}/>
              <div style={{ minWidth:0, maxWidth:140 }}>
                <div style={{ fontSize:11, fontFamily:"'Orbitron',monospace", fontWeight:"bold", color:sc, letterSpacing:2, wordBreak:"break-word", lineHeight:1.3 }}>{activeProject.shortName}</div>
                <div style={{ fontSize:8, color:`rgba(${scr},0.38)`, marginTop:2, wordBreak:"break-word", lineHeight:1.4 }}>{profile.teamName}</div>
              </div>
            </>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:9, flexShrink:0 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:profile.color||sc, fontWeight:"bold", maxWidth:90, wordBreak:"break-word", lineHeight:1.3 }}>{profile.username}</div>
            <div style={{ fontSize:8, color:`rgba(${scr},0.35)`, marginTop:1 }}>{pct}%</div>
          </div>
          <div onClick={()=>setActiveTab("settings")} style={{ cursor:"pointer", flexShrink:0 }}>
            {profile.photoURL
              ? <img src={profile.photoURL} alt="p" style={{ width:32, height:32, borderRadius:9, border:`2px solid ${sc}` }}/>
              : <div style={{ width:32, height:32, borderRadius:9, background:`rgba(${scr},0.2)`, border:`2px solid ${sc}`, display:"flex", alignItems:"center", justifyContent:"center", color:sc, fontSize:14, fontWeight:"bold" }}>{profile.username[0].toUpperCase()}</div>}
          </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{ height:2, background:"#000", flexShrink:0 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${sc},#00ccff)`, transition:"width 0.8s", boxShadow:`0 0 8px ${sc}` }}/>
      </div>

      {dbError && <div style={{ background:"#ff444418", borderBottom:"1px solid #ff4444", padding:8, textAlign:"center", color:"#ff4444", fontSize:11 }}>! {dbError}</div>}

      {!activeProject && screen==="app" && (
        <div style={{ padding:20, textAlign:"center" }}>
          <div style={{ fontSize:13, color:`rgba(${scr},0.5)`, marginBottom:12 }}>No project selected. Go to TEAM tab to select a project.</div>
          <button onClick={()=>setActiveTab("team")} style={{ padding:"10px 24px", background:`rgba(${scr},0.1)`, border:`1px solid rgba(${scr},0.3)`, borderRadius:8, color:sc, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", fontSize:12 }}>GO TO TEAM</button>
        </div>
      )}

      {/* TAB CONTENT */}
      <div style={{ flex:1, overflow:"auto", paddingBottom:72 }}>
        {activeTab==="tasks"    && activeProject && <TasksTab     tasks={tasks} profile={profile} sc={sc} scr={scr} activeProject={activeProject} addTask={addTask} toggleDone={toggleDone} deleteTask={deleteTask} saveNote={saveNote} weekDone={weekDone} toggleWeekDone={toggleWeekDone}/>}
        {activeTab==="team"     && <TeamTab      profile={profile} activeProject={activeProject} teamUsers={teamUsers} tasks={tasks} sc={sc} scr={scr} copyInvite={copyInvite} inviteCopied={inviteCopied} projects={myProjects} onSwitchProject={switchProject}/>}
        {activeTab==="data"     && activeProject && <ResourcesTab resources={resources} profile={profile} sc={sc} scr={scr} addResource={addResource} deleteResource={deleteResource} seedTasks={seedTasks} deleteAllTasks={deleteAllTasks}/>}
        {activeTab==="chat"     && activeProject && <ChatTab      messages={messages} profile={profile} sc={sc} scr={scr} activeProject={activeProject} sendMsg={sendMsg} deleteMsg={deleteMsg}/>}
        {activeTab==="quiz"     && <QuizTab      dbQuizzes={dbQuizzes} profile={profile} sc={sc} scr={scr} saveQuiz={saveQuiz} deleteQuiz={deleteQuiz}/>}
        {activeTab==="settings" && <SettingsTab  profile={profile} sc={sc} scr={scr} doLogout={doLogout} updateProfile={updateProfile} updateTheme={updateTheme} formLoad={formLoad}/>}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#000", borderTop:`1px solid rgba(${scr},0.22)`, display:"flex", zIndex:200 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            style={{ flex:1, padding:"9px 2px 10px", background:activeTab===t.id?`rgba(${scr},0.07)`:"transparent", border:"none", borderTop:activeTab===t.id?`2px solid ${sc}`:"2px solid transparent", color:activeTab===t.id?sc:`rgba(${scr},0.38)`, fontSize:8, letterSpacing:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", transition:"all 0.18s" }}>
            <span style={{ fontSize:12, fontWeight:900, fontFamily:"'Orbitron',monospace", width:24, height:24, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", background:activeTab===t.id?`rgba(${scr},0.15)`:"transparent", border:`1px solid ${activeTab===t.id?sc:"transparent"}` }}>
              {t.icon}
            </span>
            <span style={{ fontWeight:activeTab===t.id?"bold":"normal" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TOAST */}
      {toast && <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", background:"#000", border:`1px solid ${sc}`, borderRadius:10, padding:"10px 20px", fontSize:12, fontWeight:"bold", color:sc, zIndex:9999, whiteSpace:"nowrap", fontFamily:"'Share Tech Mono',monospace", boxShadow:`0 0 16px rgba(${scr},0.35)`, animation:"toast-in 0.3s ease" }}>{toast}</div>}
    </div>
  );
}
