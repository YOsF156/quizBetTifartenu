import { useStore } from "../../store.js";
import { STAGE_NAMES, POINTS } from "../../config.js";
import ScoreNumeric from "./ScoreNumeric.jsx";
import GeneralBonusBar from "./GeneralBonusBar.jsx";

export default function HostS3() {
  const resetAll = useStore((s) => s.resetAll);
  const resetStage = useStore((s) => s.resetStage);

  return (
    <>
      <div className="panel">
        <span className="pill">{STAGE_NAMES[3]}</span>
        <div className="hint" style={{ marginTop: 10 }}>
          שער הניצוץ — מבחן אמריקאי בכתב (20 שאלות). הזן לכל משתתף את הציון הסופי, 0–30 (אפשר להקליד ישירות בשדה, או +/−).
        </div>
      </div>
      <div className="host-cols">
        <ScoreNumeric stageKey="s3" step={POINTS.s3step} max={POINTS.s3max} />
        <div className="panel">
          <h3>איפוס וניקוד כללי</h3>
          <div className="controls">
            <button className="ghost" onClick={() => resetStage(3)}>
              איפוס שלב ג'
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
