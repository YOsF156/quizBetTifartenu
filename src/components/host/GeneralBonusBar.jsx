import { useState } from "react";
import { useStore } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import { AUDIENCE_BONUS } from "../../config.js";

// Manual general-bonus controls (±10) + audience bonus (fixed points to a chosen
// school). Both add to the GRAND total only; audience bonus is excluded from the
// current stage meter. Shown under every stage.
export default function GeneralBonusBar() {
  const manualBonus = useStore((s) => s.data.manualBonus);
  const manualBonusAdd = useStore((s) => s.manualBonusAdd);
  const audienceBonus = useStore((s) => s.data.audienceBonus);
  const audienceAdd = useStore((s) => s.audienceAdd);
  const [pick, setPick] = useState(0);

  const audienceTotal = audienceBonus.reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="panel" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <b style={{ color: "var(--gold)" }}>ניקוד כללי ידני:</b>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          בונוס נוכחי: {manualBonus >= 0 ? "+" : ""}
          {manualBonus}
        </span>
        <div className="controls" style={{ margin: 0 }}>
          <button onClick={() => manualBonusAdd(10)}>+10 לכללי</button>
          <button onClick={() => manualBonusAdd(-10)}>−10 לכללי</button>
        </div>
      </div>

      <div className="panel" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <b style={{ color: "var(--gold)" }}>בונוס קהל:</b>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          +{AUDIENCE_BONUS} לבי״ס שענה נכון מהקהל · נכנס לצבירה הכללית <b>וגם</b> מקדם את מחוון תקרת הזכוכית של השלב הנוכחי
        </span>
        <select value={pick} onChange={(e) => setPick(+e.target.value)}>
          {SCHOOLS.map((s, i) => (
            <option value={i} key={i}>
              {i + 1}. {s.school}
            </option>
          ))}
        </select>
        <button className="primary" onClick={() => audienceAdd(pick)}>
          + בונוס קהל (+{AUDIENCE_BONUS})
        </button>
        {audienceTotal > 0 && (
          <span style={{ color: "var(--muted)", fontSize: 13 }}>סה״כ בונוס קהל: +{audienceTotal}</span>
        )}
      </div>
    </>
  );
}
