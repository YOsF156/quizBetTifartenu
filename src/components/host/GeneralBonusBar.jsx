import { useState } from "react";
import { useStore } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import { AUDIENCE_BONUS } from "../../config.js";

// Manual general-bonus controls (±10) + audience bonus (fixed points to a chosen
// school). Both add to the GRAND total only; audience bonus is excluded from the
// current stage meter. Shown under every stage.
// `embedded` renders compact rows without an outer panel, so it can sit at the
// bottom of another panel (e.g. inside "מי ענה נכון").
export default function GeneralBonusBar({ embedded = false }) {
  const manualBonus = useStore((s) => s.data.manualBonus);
  const manualBonusAdd = useStore((s) => s.manualBonusAdd);
  const audienceBonus = useStore((s) => s.data.audienceBonus);
  const audienceAdd = useStore((s) => s.audienceAdd);
  const [pick, setPick] = useState(0);

  const audienceTotal = audienceBonus.reduce((a, b) => a + b, 0);

  const inner = (
    <div className={"bonus-bar" + (embedded ? " embedded" : "")}>
      <div className="bonus-row">
        <b style={{ color: "var(--gold)" }}>ניקוד כללי ידני:</b>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          {manualBonus >= 0 ? "+" : ""}
          {manualBonus}
        </span>
        <button onClick={() => manualBonusAdd(10)}>+10 לכללי</button>
        <button onClick={() => manualBonusAdd(-10)}>−10 לכללי</button>
      </div>
      <div className="bonus-row">
        <b style={{ color: "var(--gold)" }}>בונוס קהל:</b>
        <select value={pick} onChange={(e) => setPick(+e.target.value)}>
          {SCHOOLS.map((s, i) => (
            <option value={i} key={i}>
              {i + 1}. {s.school}
            </option>
          ))}
        </select>
        <button
          className="primary"
          onClick={() => audienceAdd(pick)}
          title={`+${AUDIENCE_BONUS} לצבירה הכללית ולמחוון תקרת הזכוכית של השלב`}
        >
          + בונוס קהל (+{AUDIENCE_BONUS})
        </button>
        {audienceTotal > 0 && (
          <span style={{ color: "var(--muted)", fontSize: 13 }}>סה״כ: +{audienceTotal}</span>
        )}
      </div>
    </div>
  );

  if (embedded) return inner;
  return <div className="panel">{inner}</div>;
}
