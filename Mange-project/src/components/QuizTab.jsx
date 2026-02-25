import { GInput, Btn } from "./UI.jsx";

// ─── QUIZ TAB ─────────────────────────────────────────────────
export default function QuizTab({
  sysColor, sysColorRGB, profile,
  dbQuizzes, quizActive, quizQ, quizScore, quizAnswered, quizDone, shuffled,
  showAddQuizSet, setShowAddQuizSet,
  newQuizTitle, setNewQuizTitle,
  quizQuestions, setQuizQuestions,
  formLoading,
  handleQuizQChange, addQuestionToSet, saveQuizSet,
  startQuiz, answerQuiz, setQuizDone,
}) {
  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: sysColor, letterSpacing: 3, fontWeight: "bold" }}>
          QUIZ DATABASE
        </div>
        <button onClick={() => setShowAddQuizSet(!showAddQuizSet)}
          style={{ background: `rgba(${sysColorRGB},0.13)`, border: `1px solid ${sysColor}`, color: sysColor, padding: "8px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "'Share Tech Mono',monospace" }}>
          {showAddQuizSet ? "CANCEL" : "+ CREATE QUIZ SET"}
        </button>
      </div>

      {/* Create quiz set form */}
      {showAddQuizSet && (
        <div style={{ background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.33)`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.67)`, letterSpacing: 2, marginBottom: 12 }}>
            CREATE NEW QUIZ SET
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <GInput value={newQuizTitle} onChange={e => setNewQuizTitle(e.target.value)} placeholder="Quiz Set Title (e.g. Week 1 DBMS)" />

            <div style={{ marginTop: 10 }}>
              {quizQuestions.map((q, index) => (
                <div key={index} style={{ background: "#000", padding: "14px", borderRadius: 8, border: `1px solid rgba(${sysColorRGB},0.2)`, marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: sysColor, marginBottom: 8 }}>Question {index + 1}</div>
                  <GInput value={q.q} onChange={e => handleQuizQChange(index, 'q', e.target.value)} placeholder="Enter question..." />
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <GInput value={q.opt1} onChange={e => handleQuizQChange(index, 'opt1', e.target.value)} placeholder="Option 1" />
                    <GInput value={q.opt2} onChange={e => handleQuizQChange(index, 'opt2', e.target.value)} placeholder="Option 2" />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <GInput value={q.opt3} onChange={e => handleQuizQChange(index, 'opt3', e.target.value)} placeholder="Option 3" />
                    <GInput value={q.opt4} onChange={e => handleQuizQChange(index, 'opt4', e.target.value)} placeholder="Option 4" />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, color: `rgba(${sysColorRGB},0.67)`, marginBottom: 4 }}>CORRECT ANSWER</div>
                    <select value={q.ans} onChange={e => handleQuizQChange(index, 'ans', e.target.value)}
                      className="themed-input"
                      style={{ width: "100%", background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.27)`, borderRadius: 8, padding: "10px", color: "#ffffff", fontFamily: "'Share Tech Mono',monospace", outline: "none" }}>
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={addQuestionToSet}
                style={{ flex: 1, padding: "12px", background: "transparent", border: "1px dashed #00ccff", color: "#00ccff", borderRadius: 8, cursor: "pointer", fontFamily: "'Share Tech Mono',monospace" }}>
                + ADD QUESTION
              </button>
              <Btn onClick={saveQuizSet} style={{ flex: 2 }}>
                {formLoading ? "UPLOADING..." : "SAVE QUIZ SET"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Quiz list */}
      {!quizActive && !quizDone && !showAddQuizSet && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {dbQuizzes.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.2)`, borderRadius: 12 }}>
              <div style={{ fontSize: 14, color: `rgba(${sysColorRGB},0.4)`, marginBottom: 10 }}>No quiz sets yet.</div>
              <Btn onClick={() => startQuiz(null)} style={{ maxWidth: 200 }}>PLAY DEFAULT QUIZ</Btn>
            </div>
          )}
          {dbQuizzes.map(qz => (
            <div key={qz.id} style={{ background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.33)`, borderRadius: 12, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, color: "#fff", fontWeight: "bold" }}>{qz.title}</div>
                <div style={{ fontSize: 11, color: `rgba(${sysColorRGB},0.4)`, marginTop: 4 }}>
                  By {qz.addedBy} • {qz.questions.length} Questions
                </div>
              </div>
              <Btn onClick={() => startQuiz(qz)} style={{ width: "auto", padding: "8px 20px" }}>START</Btn>
            </div>
          ))}
        </div>
      )}

      {/* Quiz running */}
      {quizActive && !quizDone && shuffled[quizQ] && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: `rgba(${sysColorRGB},0.4)`, fontWeight: "bold" }}>
              QUESTION {quizQ + 1} / {shuffled.length}
            </div>
            <div style={{ fontSize: 13, color: "#00ccff", fontWeight: "bold" }}>SCORE: {quizScore}</div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: "#000", borderRadius: 4, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((quizQ + 1) / shuffled.length) * 100}%`, background: `linear-gradient(90deg, ${sysColor}, #00ccff)`, transition: "width 0.3s ease", boxShadow: `0 0 8px ${sysColor}` }} />
          </div>

          <div style={{ background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.33)`, borderRadius: 12, padding: "20px", marginBottom: 20 }}>
            <div style={{ fontSize: 16, color: "#fff", lineHeight: 1.6 }}>{shuffled[quizQ].q}</div>
          </div>

          {shuffled[quizQ].opts.map((opt, i) => {
            let bg = "#0a0f0a", bc = `rgba(${sysColorRGB},0.2)`, c = `rgba(${sysColorRGB},0.67)`;
            if (quizAnswered !== null) {
              if (i === shuffled[quizQ].ans) { bg = `rgba(${sysColorRGB},0.13)`; bc = sysColor; c = sysColor; }
              else if (i === quizAnswered) { bg = "#ff000020"; bc = "#ff4444"; c = "#ff4444"; }
            }
            return (
              <button key={i} onClick={() => answerQuiz(i)}
                style={{ width: "100%", marginBottom: 12, padding: "16px", background: bg, border: `1px solid ${bc}`, borderRadius: 10, color: c, fontSize: 15, textAlign: "left", fontFamily: "'Share Tech Mono',monospace", cursor: "pointer", transition: "all 0.2s" }}>
                [ {i + 1} ] {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Quiz done */}
      {quizDone && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "#0a0f0a", border: `1px solid rgba(${sysColorRGB},0.2)`, borderRadius: 16 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 28, color: sysColor, marginBottom: 16 }}>
            QUIZ COMPLETE
          </div>
          <div style={{ fontSize: 18, color: "#fff", marginBottom: 8 }}>
            Final Score: <span style={{ color: "#00ccff", fontFamily: "'Orbitron',monospace" }}>{quizScore}/{shuffled.length}</span>
          </div>
          <div style={{ fontSize: 13, color: `rgba(${sysColorRGB},0.53)`, marginBottom: 24 }}>
            {Math.round((quizScore / shuffled.length) * 100)}% accuracy
          </div>
          <Btn onClick={() => setQuizDone(false)} style={{ maxWidth: 200 }}>BACK TO QUIZ LIST</Btn>
        </div>
      )}
    </div>
  );
}
