import { useStore } from "../../store.js";
import { STAGE_NAMES, POINTS } from "../../config.js";
import ScoreNumeric from "./ScoreNumeric.jsx";
import GeneralBonusBar from "./GeneralBonusBar.jsx";

export default function HostS4() {
  const resetAll = useStore((s) => s.resetAll);
  const resetStage = useStore((s) => s.resetStage);

  return (
    <>
      <div className="panel">
        <span className="pill">{STAGE_NAMES[4]}</span>
        <div className="hint" style={{ marginTop: 10 }}>
          שאלת הרב מנחם מקובר שליט"א. חבר השופטים מוסר למנחה את הניקוד לכל משתתף, 0–30. הניקוד הפרטי מצטרף גם לצבירה הכללית.
        </div>
      </div>
      <div className="host-cols">
        <ScoreNumeric stageKey="s4" step={POINTS.s4step} max={POINTS.s4max} />
        <div className="panel">
          <h3>איפוס וניקוד כללי</h3>
          <div className="controls">
            <button className="ghost" onClick={() => resetStage(4)}>
              איפוס שלב ד'
            </button>
            <button className="ghost danger" onClick={resetAll}>
              איפוס כללי
            </button>
          </div>
          <GeneralBonusBar embedded />
        </div>
      </div>
    </>
  );
}
