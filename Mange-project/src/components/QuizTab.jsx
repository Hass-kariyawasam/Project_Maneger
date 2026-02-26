// src/components/QuizTab.jsx
import { useState } from "react";
import { GInput, Btn } from "./UI.jsx";

export default function QuizTab({ dbQuizzes, profile, sc, scr, saveQuiz, deleteQuiz }) {
  const [showAdd,    setShowAdd]    = useState(false);
  const [quizTitle,  setQuizTitle]  = useState("");
  const [quizQs,     setQuizQs]     = useState([{ q:"", opt1:"", opt2:"", opt3:"", opt4:"", ans:0 }]);
  const [loading,    setLoading]    = useState(false);
  // Active quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [shuffled,   setShuffled]   = useState([]);
  const [quizQ,      setQuizQ]      = useState(0);
  const [quizScore,  setQuizScore]  = useState(0);
  const [quizAns,    setQuizAns]    = useState(null);
  const [quizDone,   setQuizDone]   = useState(false);

  function changeQ(i, f, v) { const a=[...quizQs]; a[i][f]=v; setQuizQs(a); }

  async function handleSave() {
    if (!quizTitle.trim()) return;
    if (!quizQs.every(q => q.q && q.opt1 && q.opt2 && q.opt3 && q.opt4)) return;
    setLoading(true);
    await saveQuiz(quizTitle, quizQs.map(q=>({ q:q.q, opts:[q.opt1,q.opt2,q.opt3,q.opt4], ans:Number(q.ans) })));
    setQuizTitle(""); setQuizQs([{ q:"",opt1:"",opt2:"",opt3:"",opt4:"",ans:0 }]);
    setShowAdd(false); setLoading(false);
  }

  function startQuiz(qz) {
    const arr = qz ? qz.questions : (dbQuizzes[0]?.questions || []);
    if (!arr.length) return;
    const q = [...arr].sort(() => Math.random() - 0.5);
    setShuffled(q); setQuizQ(0); setQuizScore(0); setQuizAns(null); setQuizDone(false); setQuizActive(true);
  }

  function answerQuiz(i) {
    if (quizAns !== null) return;
    setQuizAns(i);
    if (i === shuffled[quizQ].ans) setQuizScore(s => s+1);
    setTimeout(() => {
      if (quizQ + 1 >= shuffled.length) setQuizDone(true);
      else { setQuizQ(q => q+1); setQuizAns(null); }
    }, 1200);
  }

  return (
    <div style={{ padding:"16px 14px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:11, color:sc, letterSpacing:3, fontWeight:"bold" }}>QUIZ DATABASE</div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background:`rgba(${scr},0.13)`, border:`1px solid ${sc}`, color:sc, padding:"7px 12px", borderRadius:6, fontSize:11, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>
          {showAdd ? "CANCEL" : "+ CREATE QUIZ"}
        </button>
      </div>

      {/* Create form */}
      {showAdd && (
        <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.33)`, borderRadius:12, padding:13, marginBottom:18 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            <GInput value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} placeholder="Quiz Set Title"/>
            {quizQs.map((q,i) => (
              <div key={i} style={{ background:"#000", padding:12, borderRadius:8, border:`1px solid rgba(${scr},0.2)` }}>
                <div style={{ fontSize:10, color:sc, marginBottom:6 }}>Question {i+1}</div>
                <GInput value={q.q}    onChange={e=>changeQ(i,"q",e.target.value)}    placeholder="Question..."/>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <GInput value={q.opt1} onChange={e=>changeQ(i,"opt1",e.target.value)} placeholder="Option 1"/>
                  <GInput value={q.opt2} onChange={e=>changeQ(i,"opt2",e.target.value)} placeholder="Option 2"/>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <GInput value={q.opt3} onChange={e=>changeQ(i,"opt3",e.target.value)} placeholder="Option 3"/>
                  <GInput value={q.opt4} onChange={e=>changeQ(i,"opt4",e.target.value)} placeholder="Option 4"/>
                </div>
                <div style={{ marginTop:8 }}>
                  <select value={q.ans} onChange={e=>changeQ(i,"ans",e.target.value)} style={{ width:"100%", background:"#0a0f0a", border:`1px solid rgba(${scr},0.27)`, borderRadius:8, padding:9, color:"#fff", fontFamily:"'Share Tech Mono',monospace", outline:"none" }}>
                    {[0,1,2,3].map(n=><option key={n} value={n}>Correct: Option {n+1}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={() => setQuizQs([...quizQs,{q:"",opt1:"",opt2:"",opt3:"",opt4:"",ans:0}])} style={{ flex:1, padding:10, background:"transparent", border:"1px dashed #00ccff", color:"#00ccff", borderRadius:8, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>+ ADD Q</button>
              <Btn onClick={handleSave} style={{ flex:2 }}>{loading ? "SAVING..." : "SAVE QUIZ"}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Quiz list */}
      {!quizActive && !quizDone && (
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {dbQuizzes.length === 0 && (
            <div style={{ textAlign:"center", padding:32, background:"#0a0f0a", border:`1px solid rgba(${scr},0.15)`, borderRadius:12, color:`rgba(${scr},0.3)`, fontSize:12 }}>No quizzes yet.</div>
          )}
          {dbQuizzes.map(qz => (
            <div key={qz.id} style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.25)`, borderRadius:12, padding:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:14, color:"#fff", fontWeight:"bold" }}>{qz.title}</div>
                <div style={{ fontSize:10, color:`rgba(${scr},0.4)`, marginTop:3 }}>By {qz.addedBy} - {qz.questions?.length||0} Questions</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={() => startQuiz(qz)} style={{ width:"auto", padding:"7px 18px" }}>START</Btn>
                {(profile.isLeader || qz.addedBy === profile.username) && (
                  <button onClick={() => deleteQuiz(qz.id)} style={{ padding:"7px 12px", background:"#ff000022", border:"1px solid #ff444444", color:"#ff4444", borderRadius:6, fontSize:11, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace" }}>DEL</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active quiz */}
      {quizActive && !quizDone && shuffled[quizQ] && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:11, color:`rgba(${scr},0.4)`, fontWeight:"bold" }}>Q {quizQ+1}/{shuffled.length}</div>
            <div style={{ fontSize:11, color:"#00ccff", fontWeight:"bold" }}>SCORE: {quizScore}</div>
          </div>
          <div style={{ height:3, background:"#000", borderRadius:4, marginBottom:16, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${((quizQ+1)/shuffled.length)*100}%`, background:`linear-gradient(90deg,${sc},#00ccff)`, transition:"width 0.3s" }}/>
          </div>
          <div style={{ background:"#0a0f0a", border:`1px solid rgba(${scr},0.33)`, borderRadius:12, padding:16, marginBottom:16 }}>
            <div style={{ fontSize:14, color:"#fff", lineHeight:1.6 }}>{shuffled[quizQ].q}</div>
          </div>
          {shuffled[quizQ].opts.map((opt, i) => {
            let bg="#0a0f0a", bc=`rgba(${scr},0.2)`, c=`rgba(${scr},0.67)`;
            if (quizAns !== null) {
              if (i === shuffled[quizQ].ans) { bg=`rgba(${scr},0.13)`; bc=sc; c=sc; }
              else if (i === quizAns)        { bg="#ff000020"; bc="#ff4444"; c="#ff4444"; }
            }
            return (
              <button key={i} onClick={() => answerQuiz(i)} style={{ width:"100%", marginBottom:9, padding:14, background:bg, border:`1px solid ${bc}`, borderRadius:10, color:c, fontSize:13, textAlign:"left", fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", transition:"all 0.2s" }}>
                [{i+1}] {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Quiz done */}
      {quizDone && (
        <div style={{ textAlign:"center", padding:"32px 16px", background:"#0a0f0a", border:`1px solid rgba(${scr},0.2)`, borderRadius:16 }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:24, color:sc, marginBottom:12 }}>QUIZ COMPLETE</div>
          <div style={{ fontSize:16, color:"#fff", marginBottom:7 }}>Score: <span style={{ color:"#00ccff", fontFamily:"'Orbitron',monospace" }}>{quizScore}/{shuffled.length}</span></div>
          <div style={{ fontSize:12, color:`rgba(${scr},0.5)`, marginBottom:20 }}>{Math.round((quizScore/shuffled.length)*100)}%</div>
          <Btn onClick={() => { setQuizDone(false); setQuizActive(false); }} style={{ maxWidth:200 }}>BACK</Btn>
        </div>
      )}
    </div>
  );
}
