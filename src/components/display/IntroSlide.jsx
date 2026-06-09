import { STAGE_NAMES, STAGE_INTRO_BG, LOGO } from "../../config.js";
import { unlockAudio } from "../../sound.js";

// Stage-1 photo framing, picked from the live switcher: "מלא חלקית" — the image
// is shown in full (contain) anchored to the top and scaled up a touch so the
// priest + ballot/goats fill the frame.
const STAGE1_PHOTO_STYLE = {
  objectFit: "contain",
  objectPosition: "center top",
  transform: "scale(1.2)",
};

// Per-stage opening slide shown on the display before each stage. The photo fills
// the screen; it stays mounted and cross-fades out (via `leaving`) when the host
// enters the stage. Clicking it counts as a user gesture (unlocks audio).
export default function IntroSlide({ stage, leaving }) {
  const bg = STAGE_INTRO_BG[stage];
  const photoStyle =
    stage === 1 ? STAGE1_PHOTO_STYLE : { objectFit: "cover", objectPosition: "center" };

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
    </div>
  );
}
