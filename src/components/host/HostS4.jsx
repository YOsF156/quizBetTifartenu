import { STAGE_NAMES, POINTS } from "../../config.js";
import ScoreNumeric from "./ScoreNumeric.jsx";
import GeneralBonusBar from "./GeneralBonusBar.jsx";

export default function HostS4() {
  return (
    <>
      <div className="panel">
        <span className="pill">{STAGE_NAMES[4]}</span>
        <div className="hint" style={{ marginTop: 10 }}>
          שאלת הרב מנחם מקובר שליט"א. חבר השופטים מוסר למנחה את הניקוד לכל משתתף, 0–30. הניקוד הפרטי מצטרף גם לצבירה הכללית.
        </div>
      </div>
      <ScoreNumeric stageKey="s4" step={POINTS.s4step} max={POINTS.s4max} />
      <GeneralBonusBar />
    </>
  );
}
