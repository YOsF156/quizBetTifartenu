import { useEffect, useState } from "react";
import { WELCOME_IMAGES, WELCOME_BG, LOGO } from "../../config.js";
import { unlockAudio } from "../../sound.js";

// Shared ceremony slide (opening "ברוכים הבאים" + closing "תודה רבה"). One fixed
// backdrop stays behind, while the rest of our images float into the screen one
// at a time from alternating directions, under a sweeping spotlight + the logo.
// Clicking it counts as a user gesture (unlocks audio for the stage-2 videos).
const DIRS = ["left", "right", "top", "bottom"];

export default function CeremonySlide({ kicker, title, hint }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => i + 1), 2800);
    return () => clearInterval(id);
  }, []);

  const img = WELCOME_IMAGES[idx % WELCOME_IMAGES.length];
  const dir = DIRS[idx % DIRS.length];

  return (
    <div className="intro-slide intro-welcome" onClick={unlockAudio}>
      <div className="welcome-bg" style={{ backgroundImage: `url("${WELCOME_BG}")` }} />
      <div className="intro-spotlight" />
      <div className="intro-scrim" />
      <img className="slide-logo" src={LOGO} alt="לוגו" />
      <div className="welcome-float-wrap">
        <img key={idx} className={"welcome-float fly-" + dir} src={img} alt="" />
      </div>
      <div className="intro-inner">
        <div className="intro-kicker">{kicker}</div>
        <h1 className="intro-title">{title}</h1>
        {hint && <div className="intro-hint">{hint}</div>}
      </div>
    </div>
  );
}
