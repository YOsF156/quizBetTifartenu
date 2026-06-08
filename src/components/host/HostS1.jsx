import { useStore, s1Q } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import { LETTERS, STAGE_NAMES } from "../../config.js";
import GeneralBonusBar from "./GeneralBonusBar.jsx";
import Timer from "../Timer.jsx";

export default function HostS1() {
  const data = useStore((s) => s.data);
  const s1Toggle = useStore((s) => s.s1Toggle);
  const s1Prev = useStore((s) => s.s1Prev);
  const s1Next = useStore((s) => s.s1Next);
  const s1Reveal = useStore((s) => s.s1Reveal);
  const startTimer = useStore((s) => s.startTimer);
  const resetTimer = useStore((s) => s.resetTimer);
  const resetAll = useStore((s) => s.resetAll);

  const Q = s1Q(data);
  const qi = data.s1_index;
  const q = Q[qi];
  // s1_byQ may be null until the store builds it on first stage-1 action
  const byQ = data.s1_byQ;

  return (
    <>
      <div className="panel">
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
          <button onClick={s1Prev} disabled={qi === 0}>
            ◀ הקודמת
          </button>
          <button className={data.s1_revealed ? "" : "primary"} onClick={s1Reveal}>
            {data.s1_revealed ? "הסתר תשובה" : "חשוף תשובה ▶"}
          </button>
          <button onClick={s1Next} disabled={qi >= Q.length - 1}>
            הבאה ▶
          </button>
        </div>
        <div className="controls" style={{ alignItems: "center" }}>
          <span className="hint" style={{ margin: 0 }}>הטיימר מתחיל אוטומטית 2 ש' אחרי מעבר לשאלה ·</span>
          <button onClick={startTimer}>▶ הפעל עכשיו</button>
          <button onClick={resetTimer} disabled={!data.timerStart}>
            אפס טיימר
          </button>
          <Timer startMs={data.timerStart} size="small" />
        </div>
        <div className="hint">
          סמן מי ענה נכון.{" "}
          <b style={{ color: "var(--gold-bright)" }}>
            הניקוד, הקונפטי והעדכון בבאנר קורים רק בלחיצת "חשוף תשובה".
          </b>
        </div>
      </div>

      <div className="panel">
        <h3>
          מי ענה נכון?{" "}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>(3 נק' לשאלה זו)</span>
        </h3>
        <div className="score-grid">
          {SCHOOLS.map((s, i) => {
            const on = byQ ? byQ[i][qi] > 0 : false;
            return (
              <div className={"score-card" + (on ? " maxed" : "")} key={i}>
                <span className="nm">
                  {i + 1}. {s.school}
                </span>
                <button className={on ? "primary" : ""} onClick={() => s1Toggle(i)}>
                  {on ? "✓ נכון" : "סמן נכון"}
                </button>
              </div>
            );
          })}
        </div>
        <div className="controls" style={{ marginTop: 16 }}>
          <button className="ghost" onClick={resetAll}>
            איפוס ניקוד
          </button>
        </div>
      </div>

      <GeneralBonusBar />
    </>
  );
}
