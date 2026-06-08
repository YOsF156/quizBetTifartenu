import { useStore, s1Q } from "../../store.js";
import { LETTERS } from "../../config.js";
import Timer from "../Timer.jsx";

// Stage 1 uses one fixed background for every question (מעמד הקהל) — set on the
// stage-area in Display.jsx. No per-question illustration anymore.
export default function DisplayS1() {
  const data = useStore((s) => s.data);
  const Q = s1Q(data);
  const qi = data.s1_index;
  const q = Q[qi];

  const accent = qi % 2 === 0 ? "gold" : "coral"; // alternating title color

  return (
    <>
      {!data.s1_revealed && (
        <div className="s1-timer-slot">
          <Timer startMs={data.timerStart} size="big" sound />
        </div>
      )}

      <div className="d-num">
        שאלה {qi + 1} / {Q.length}
      </div>
      <div className={"d-text " + accent}>{q.text}</div>

      {!data.s1_revealed ? (
        <div className="options">
          {q.options.map((o, i) => (
            <div className="opt" key={i}>
              <span className="letter">{LETTERS[i]}</span>
              <span className="opt-text">{o}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="hero">
          <span className="letter">{LETTERS[q.correct]}</span>
          <span className="hero-text">{q.options[q.correct]}</span>
        </div>
      )}
    </>
  );
}
