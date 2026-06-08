import { useState } from "react";
import { useStore } from "../../store.js";
import { SCHOOLS } from "../../data.js";

// One scoring row. The number field keeps a LOCAL draft while focused so typing
// isn't fought by re-clamping on every keystroke (the old bug that turned any
// typed digit into "5"); it commits (clamped) on blur / Enter.
function ScoreRow({ stageKey, school, i, v, step, max, addScore, setScore }) {
  const [draft, setDraft] = useState(null); // null = not editing → show store value
  const shown = draft !== null ? draft : v;
  const maxed = v >= max;

  const commit = () => {
    if (draft !== null) setScore(stageKey, i, draft, max);
    setDraft(null);
  };

  return (
    <div className={"score-card" + (maxed ? " maxed" : "")}>
      <span className="nm">
        {i + 1}. {school.school}
      </span>
      <span className="sc">{v}</span>
      <div className="stepper">
        <button onClick={() => addScore(stageKey, i, -step, max)} disabled={v <= 0}>
          −
        </button>
        <input
          type="number"
          value={shown}
          step={step}
          min={0}
          max={max}
          onFocus={() => setDraft(String(v))}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.target.blur();
          }}
        />
        <button onClick={() => addScore(stageKey, i, step, max)} disabled={maxed}>
          +
        </button>
      </div>
    </div>
  );
}

// Manual numeric scoring grid for stages 3 & 4.
export default function ScoreNumeric({ stageKey, step, max }) {
  const scores = useStore((s) => s.data.scores[stageKey]);
  const addScore = useStore((s) => s.addScore);
  const setScore = useStore((s) => s.setScore);

  return (
    <div className="panel">
      <h3>
        ניקוד <span style={{ color: "var(--muted)", fontWeight: 400 }}>(מקס' {max} למשתתף)</span>
      </h3>
      <div className="score-grid">
        {SCHOOLS.map((s, i) => (
          <ScoreRow
            key={i}
            stageKey={stageKey}
            school={s}
            i={i}
            v={scores[i]}
            step={step}
            max={max}
            addScore={addScore}
            setScore={setScore}
          />
        ))}
      </div>
    </div>
  );
}
