import { STAGE_NAMES, POINTS } from "../../config.js";
import ScoreNumeric from "./ScoreNumeric.jsx";
import GeneralBonusBar from "./GeneralBonusBar.jsx";

export default function HostS3() {
  return (
    <>
      <div className="panel">
        <span className="pill">{STAGE_NAMES[3]}</span>
        <div className="hint" style={{ marginTop: 10 }}>
          שער הניצוץ — מבחן אמריקאי בכתב (20 שאלות). הזן לכל משתתף את הציון הסופי, 0–30 (אפשר להקליד ישירות בשדה, או +/−).
        </div>
      </div>
      <ScoreNumeric stageKey="s3" step={POINTS.s3step} max={POINTS.s3max} />
      <GeneralBonusBar />
    </>
  );
}
