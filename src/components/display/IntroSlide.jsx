import { useState } from "react";
import { STAGE_NAMES, STAGE_INTRO_BG, LOGO } from "../../config.js";
import { unlockAudio } from "../../sound.js";

// DEV-only: four ways to present the stage-1 photo, switchable from the display
// so we can pick the framing that best shows the priest + ballot/goats.
const PHOTO_MODES = [
  { label: "1 · מלא / עליון", style: { objectFit: "cover", objectPosition: "center top" } },
  { label: "2 · מלא / מרכז", style: { objectFit: "cover", objectPosition: "center" } },
  { label: "3 · תמונה מלאה", style: { objectFit: "contain", objectPosition: "center" } },
  { label: "4 · מלא / גבוה", style: { objectFit: "cover", objectPosition: "center 22%" } },
  { label: "5 · מלא חלקית", style: { objectFit: "contain", objectPosition: "center top", transform: "scale(1.2)" } },
];

// Per-stage opening slide shown on the display before each stage. The photo fills
// the screen; it stays mounted and cross-fades out (via `leaving`) when the host
// enters the stage. Clicking it counts as a user gesture (unlocks audio).
export default function IntroSlide({ stage, leaving }) {
  const bg = STAGE_INTRO_BG[stage];
  const [mode, setMode] = useState(0);
  const photoStyle =
    stage === 1 ? PHOTO_MODES[mode].style : { objectFit: "cover", objectPosition: "center" };
  // show the framing switcher in dev, or live via ?dev (so the partner can decide)
  const showFraming =
    import.meta.env.DEV ||
    (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("dev"));

  return (
    <div className={"intro-slide" + (leaving ? " leaving" : "")} onClick={unlockAudio}>
      {bg && (
        <>
          <div className="intro-bg" style={{ backgroundImage: `url("${bg}")` }} />
          <img className="intro-photo" src={bg} alt="" style={photoStyle} />
        </>
      )}
      <div className="intro-scrim" />
      <img className="slide-logo" src={LOGO} alt="לוגו" />
      <div className="intro-inner">
        <div className="intro-kicker">בית תפארתנו · חידון המקדש</div>
        <h1 className="intro-title">{STAGE_NAMES[stage]}</h1>
      </div>

      {stage === 1 && showFraming && (
        <div className="dev-photo-bar" onClick={(e) => e.stopPropagation()}>
          <span className="dev-tag">DEV · פריסת תמונה</span>
          {PHOTO_MODES.map((m, i) => (
            <button key={i} className={i === mode ? "on" : ""} onClick={() => setMode(i)}>
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
