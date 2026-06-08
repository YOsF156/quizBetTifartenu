import { useStore, s1Q } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import { LETTERS, STAGE_NAMES } from "../../config.js";
import GeneralBonusBar from "./GeneralBonusBar.jsx";
import Timer from "../Timer.jsx";

// Stage-1 host board laid out as 4 parallel columns across the width (RTL, so
// right → left): timer · questions · who-answered · reset+general-scoring.
export default function HostS1() {
  const data = useStore((s) => s.data);
  const s1Toggle = useStore((s) => s.s1Toggle);
  const s1Prev = useStore((s) => s.s1Prev);
  const s1Next = useStore((s) => s.s1Next);
  const s1Reveal = useStore((s) => s.s1Reveal);
  const startTimer = useStore((s) => s.startTimer);
  const resetTimer = useStore((s) => s.resetTimer);
  const resetAll = useStore((s) => s.resetAll);
  const resetStage = useStore((s) => s.resetStage);

  const Q = s1Q(data);
  const qi = data.s1_index;
  const q = Q[qi];
  const byQ = data.s1_byQ;

  return (
    <div className="host-4col">
      {/* RIGHT — timer */}
      <div className="panel col-timer">
        <h3>טיימר</h3>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Timer startMs={data.timerStart} size="small" />
          <div className="controls" style={{ justifyContent: "center" }}>
            <button onClick={startTimer} title="הטיימר מתחיל אוטומטית 2 ש' אחרי מעבר לשאלה">
              ▶ הפעל עכשיו
            </button>
            <button onClick={resetTimer} disabled={!data.timerStart}>
              אפס טיימר
            </button>
          </div>
        </div>
      </div>

      {/* questions */}
      <div className="panel col-q">
        <span className="pill">{STAGE_NAMES[1]}</span>
        <div className="q-num" style={{ marginTop: 10 }}>
          שאלה {qi + 1} מתוך {Q.length} · 3 נק' לשאלה
        </div>
        <div className="q-text">{q.text}</div>
        <div className="options">
          {q.options.map((o, i) => {
            const ok = data.s1_revealed && i === q.correct;
            return (
              <div className={"opt" + (ok ? " correct" : "")} key={i}>
                <span className="letter">{LETTERS[i]}</span>
                <span>{o}</span>
              </div>
            );
          })}
        </div>
        <div className="hint">
          נכונה: {LETTERS[q.correct]} — {q.options[q.correct]}
        </div>
        <div className="controls">
          <button onClick={s1Next} disabled={qi >= Q.length - 1}>
            הבאה ▶
          </button>
          <button
            className={data.s1_revealed ? "" : "primary"}
            onClick={s1Reveal}
            title='הניקוד, הקונפטי והעדכון בבאנר קורים רק בלחיצת "חשוף תשובה"'
          >
            {data.s1_revealed ? "הסתר תשובה" : "חשוף תשובה ▶"}
          </button>
          <button onClick={s1Prev} disabled={qi === 0}>
            ◀ הקודמת
          </button>
        </div>
      </div>

      {/* who answered */}
      <div className="panel col-scores">
        <h3>
          מי ענה נכון?{" "}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>(3 נק')</span>
        </h3>
        <div className="score-grid">
          {SCHOOLS.map((s, i) => {
            const on = byQ ? byQ[i][qi] > 0 : false;
            return (
              <div className={"score-card" + (on ? " maxed" : "")} key={i}>
                <span className="nm">
                  {i + 1}. {s.school}
                  {s.player && <small className="player-nm">{s.player}</small>}
                </span>
                <button className={on ? "primary" : ""} onClick={() => s1Toggle(i)}>
                  {on ? "✓ נכון" : "סמן נכון"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* LEFT — reset (top) + general / audience bonus */}
      <div className="panel col-bonus">
        <h3>איפוס וניקוד כללי</h3>
        <div className="controls">
          <button className="ghost" onClick={() => resetStage(1)}>
            איפוס שלב א'
          </button>
          <button className="ghost danger" onClick={resetAll}>
            איפוס כללי
          </button>
        </div>
        <GeneralBonusBar embedded />
      </div>
    </div>
  );
}
