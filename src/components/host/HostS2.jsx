import { useStore, s2Q, s2Selected, s2MaxFor, seatOrderOf } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import { STAGE_NAMES, S2_PER_CORRECT, COMBO_BONUS } from "../../config.js";
import GeneralBonusBar from "./GeneralBonusBar.jsx";
import Timer from "../Timer.jsx";

export default function HostS2() {
  const data = useStore((s) => s.data);
  const s2SetPlayer = useStore((s) => s.s2SetPlayer);
  const s2ShowMedia = useStore((s) => s.s2ShowMedia);
  const s2PlayVideo = useStore((s) => s.s2PlayVideo);
  const s2ShowQ = useStore((s) => s.s2ShowQ);
  const s2Correct = useStore((s) => s.s2Correct);
  const s2Undo = useStore((s) => s.s2Undo);
  const startTimer = useStore((s) => s.startTimer);
  const resetTimer = useStore((s) => s.resetTimer);
  const resetAll = useStore((s) => s.resetAll);
  const resetStage = useStore((s) => s.resetStage);

  const Q = s2Q(data);
  const round = Q[data.s2_player];
  const selected = s2Selected(data, data.s2_player); // question indices for active media
  const order = seatOrderOf(data); // seating order on stage

  return (
    <div className="s2-host">
      <div className="host-cols">
      <div className="panel">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="pill">{STAGE_NAMES[2]}</span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{round.media}</span>
          <div className="controls" style={{ margin: 0, marginRight: "auto", alignItems: "center" }}>
            <button className={data.s2_phase === "media" ? "primary" : ""} onClick={s2ShowMedia}>
              ▶ מדיה
            </button>
            <button
              className="primary"
              onClick={s2PlayVideo}
              title="מפעיל את הסרטון בגדול על מסך ההקרנה (דרוש קליק אחד על ההקרנה בתחילת המופע כדי לאפשר שמע)"
            >
              ▶ הפעל סרטון
            </button>
            <button className={data.s2_phase === "questions" ? "primary" : ""} onClick={s2ShowQ}>
              שאלות ▶
            </button>
            <button onClick={startTimer}>▶ טיימר</button>
            <button onClick={resetTimer} disabled={!data.timerStart}>
              אפס
            </button>
            <Timer startMs={data.timerStart} size="small" />
          </div>
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {selected.map((qIdx, n) => (
            <div className="opt" key={qIdx} style={{ flex: "1 1 280px" }}>
              <span className="letter">{n + 1}</span>
              <span>{round.questions[qIdx]}</span>
            </div>
          ))}
        </div>
        <div className="combo-status" style={{ marginTop: 8 }}>
          {data.comboOn
            ? `קומבו: ${data.s2_comboReached} זוגות רצופים השלימו · בונוס ${
                data.s2_comboReached * COMBO_BONUS
              } נק' · הטיימר אוטומטי 2ש' אחרי "שאלות"`
            : "קומבו כבוי"}
        </div>
      </div>

      <div className="panel">
        <div className="hint" style={{ marginBottom: 10 }}>
          לחץ על בית ספר כדי להגדירו <b style={{ color: "var(--gold-bright)" }}>כעונה</b>. רק העונה
          מקבל נקודות · "✓" = +{S2_PER_CORRECT} (עד מספר השאלות שנבחרו). הסדר לפי הישיבה (נערך בטאב עריכה).
        </div>
        <div className="score-grid s2-grid">
          {order.map((i) => {
            const s = SCHOOLS[i];
            const cc = data.s2_correctCount[i];
            const max = s2MaxFor(data, i);
            const maxed = cc >= max;
            const isActive = i === data.s2_player;
            return (
              <div
                className={"score-card" + (maxed ? " maxed" : "") + (isActive ? " active-card" : "")}
                key={i}
              >
                <span
                  className="nm"
                  style={{ cursor: "pointer" }}
                  onClick={() => s2SetPlayer(i)}
                  title="הגדר כעונה"
                >
                  {s.school}
                  {s.player && <small className="player-nm">{s.player}</small>}
                  <small>{cc}/{max} תשובות</small>
                </span>
                <span className="sc">{data.scores.s2[i]}</span>
                <div className="btns">
                  <button onClick={() => s2Undo(i)} disabled={cc <= 0}>
                    ↶
                  </button>
                  <button
                    className="primary"
                    onClick={() => s2Correct(i)}
                    disabled={maxed || !isActive}
                    title={!isActive ? "רק העונה יכול לקבל נקודות" : ""}
                  >
                    ✓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <h3>איפוס וניקוד כללי</h3>
        <div className="controls">
          <button className="ghost" onClick={() => resetStage(2)}>
            איפוס שלב ב'
          </button>
          <button className="ghost danger" onClick={resetAll}>
            איפוס כללי
          </button>
        </div>
        <GeneralBonusBar embedded />
      </div>
      </div>
    </div>
  );
}
