import { useEffect, useRef } from "react";
import { useStore, schoolTotal, grandTotal, stageMeterValue } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import { STAGE_METER_MAX, STAGE_METER_MARKS, STAGE_THRESHOLD } from "../../config.js";
import { rollNumber } from "../../fx.js";
import { playClimb } from "../../sound.js";

// Build the banner rows: participants sharing a `group` (the two Orot Rashi
// representatives) are merged into ONE row whose score is their combined total.
function buildGroups(data) {
  const map = new Map();
  SCHOOLS.forEach((s, i) => {
    const key = s.group || s.school;
    if (!map.has(key)) map.set(key, { name: key, idxs: [] });
    map.get(key).idxs.push(i);
  });
  return [...map.values()];
}

export default function Banner() {
  const data = useStore((s) => s.data);
  const grandRef = useRef(null);
  const prevGrand = useRef(grandTotal(data));

  const stage = data.stage;
  const stageHit = data.stageCeilingHit[stage - 1];
  // the bar turns purple only once the +50 bonus is actually applied (after the
  // break animation), so the recolor coincides with the second climb
  const broke = data.stageBonus[stage - 1] > 0;
  const meterValue = stageMeterValue(data, stage);
  const fillPct = Math.min(100, (meterValue / STAGE_METER_MAX) * 100);
  const grand = grandTotal(data);

  const active = stage === 2 ? data.s2_player : -1;

  // Always alphabetical (א-ב) — no ranking, no promoting leaders to the top.
  const rows = buildGroups(data)
    .map((g) => ({
      ...g,
      t: g.idxs.reduce((a, i) => a + schoolTotal(data, i), 0),
      active: g.idxs.includes(active),
      members: g.idxs.join(","),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "he"));

  useEffect(() => {
    if (grandRef.current) rollNumber(grandRef.current, grand);
    if (grand > prevGrand.current) playClimb(); // ascending sound as the score climbs
    prevGrand.current = grand;
  }, [grand]);

  return (
    <aside className="banner" id="banner">
      <div className="meter">
        <div
          className={"meter-fill" + (broke ? " purple" : "")}
          style={{ height: `${fillPct}%` }}
        ></div>
        <div className="meter-total">ניקוד השלב</div>
        {STAGE_METER_MARKS.map((mv) => {
          const isBottom = mv === 0;
          const isTop = mv === STAGE_METER_MAX;
          const hit =
            isBottom ? true : mv === STAGE_THRESHOLD ? stageHit : meterValue >= mv;
          const style = isTop
            ? { top: 0 }
            : isBottom
            ? { bottom: 0 }
            : { bottom: `${(mv / STAGE_METER_MAX) * 100}%` };
          return (
            <div
              className={"meter-mark" + (isTop || isBottom ? " edge" : "") + (hit ? " hit" : "")}
              data-step={mv}
              style={style}
              key={mv}
            >
              {mv}
            </div>
          );
        })}
        <div
          className={"meter-flag" + (broke ? " purple" : "")}
          style={{ bottom: `${Math.min(93, Math.max(7, fillPct))}%` }}
        >
          {meterValue}
        </div>
      </div>
      <div className="right-col">
        <div className="total-box">
          <div className="lbl">צבירה כללית</div>
          <div className="val" id="grandVal" ref={grandRef} data-from={grand}>
            {grand}
          </div>
        </div>
        <div className="schools">
          {rows.map((o) => (
            <div
              className={"school-row" + (o.active ? " active" : "")}
              data-members={o.members}
              key={o.name}
            >
              <span className="nm">
                {o.name}
                {o.idxs.length > 1 && <small className="reps">שני נציגים</small>}
              </span>
              <span className="sc">{o.t}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
