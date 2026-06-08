import { STAGE_NAMES, STAGE_INTRO_BG, LOGO } from "../../config.js";
import { unlockAudio } from "../../sound.js";

// Per-stage opening slide shown on the display before each stage. The photo fills
// the screen; it stays mounted and cross-fades out (via `leaving`) when the host
// enters the stage. Clicking it counts as a user gesture (unlocks audio).
export default function IntroSlide({ stage, leaving }) {
  const bg = STAGE_INTRO_BG[stage];
  return (
    <div className={"intro-slide" + (leaving ? " leaving" : "")} onClick={unlockAudio}>
      {bg && (
        <>
          <div className="intro-bg" style={{ backgroundImage: `url("${bg}")` }} />
          <img className="intro-photo" src={bg} alt="" />
        </>
      )}
      <div className="intro-scrim" />
      <img className="slide-logo" src={LOGO} alt="לוגו" />
      <div className="intro-inner">
        <div className="intro-kicker">בית תפארתנו · חידון המקדש</div>
        <h1 className="intro-title">{STAGE_NAMES[stage]}</h1>
      </div>
    </div>
  );
}
