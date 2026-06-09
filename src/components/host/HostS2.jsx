import { useStore, s2Q, s2Selected, seatOrderOf } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import { STAGE_NAMES, COMBO_BONUS } from "../../config.js";
import GeneralBonusBar from "./GeneralBonusBar.jsx";
import Timer from "../Timer.jsx";

const S2_MAX = 30; // free score 0–30 per participant

export default function HostS2() {
  const data = useStore((s) => s.data);
  const s2SetPlayer = useStore((s) => s.s2SetPlayer);
  const s2ShowMedia = useStore((s) => s.s2ShowMedia);
  const s2PlayVideo = useStore((s) => s.s2PlayVideo);
  const s2ShowQ = useStore((s) => s.s2ShowQ);
  const addScore = useStore((s) => s.addScore);
  const setScore = useStore((s) => s.setScore);
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
          לחץ על שם בית ספר כדי להציג את הסרטון/השאלות שלו. הזן ניקוד חופשי 0–{S2_MAX} לכל משתתף
          (הקלדה ישירה או +/−). הסדר לפי הישיבה (נערך בטאב עריכה).
        </div>
        <div className="score-grid s2-grid">
          {order.map((i) => {
            const s = SCHOOLS[i];
            const v = data.scores.s2[i];
            const isActive = i === data.s2_player;
            return (
              <div
                className={"score-card" + (v >= S2_MAX ? " maxed" : "") + (isActive ? " active-card" : "")}
                key={i}
              >
                <span
                  className="nm"
                  style={{ cursor: "pointer" }}
                  onClick={() => s2SetPlayer(i)}
                  title="הצג את הסרטון/השאלות של בית ספר זה"
                >
                  {s.school}
                </span>
                <span className="sc">{v}</span>
                <div className="stepper">
                  <button onClick={() => addScore("s2", i, -5, S2_MAX)} disabled={v <= 0}>
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={S2_MAX}
                    step={5}
                    defaultValue={v}
                    key={v}
                    onBlur={(e) => setScore("s2", i, e.target.value, S2_MAX)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.target.blur();
                    }}
                  />
                  <button onClick={() => addScore("s2", i, 5, S2_MAX)} disabled={v >= S2_MAX}>
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel col-bonus">
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
