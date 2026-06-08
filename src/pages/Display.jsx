import { useStore } from "../store.js";
import { STAGE_NAMES, STAGE_BG } from "../config.js";
import DisplayS1 from "../components/display/DisplayS1.jsx";
import DisplayS2 from "../components/display/DisplayS2.jsx";
import DisplayS3 from "../components/display/DisplayS3.jsx";
import DisplayS4 from "../components/display/DisplayS4.jsx";
import Finale from "../components/display/Finale.jsx";
import Banner from "../components/display/Banner.jsx";
import FxRunner from "../components/display/FxRunner.jsx";

export default function Display() {
  const stage = useStore((s) => s.data.stage);
  const screensaver = useStore((s) => s.data.screensaver);

  // Screensaver overlay — controlled from the host board. Sits above everything.
  const ssOverlay = screensaver && (
    <div
      className="screensaver"
      style={{ backgroundImage: `url("${STAGE_BG[4]}")` }}
    >
      <div className="ss-title">בית תפארתנו</div>
      <div className="ss-sub">חידון המקדש — המופע מתחיל בקרוב…</div>
    </div>
  );

  // Finale (stage 5) — full-screen celebration, no banner.
  if (stage === 5) {
    return (
      <div id="display" className="view active" style={{ display: "block" }}>
        <FxRunner />
        <Finale />
        {ssOverlay}
      </div>
    );
  }

  const bg = STAGE_BG[stage];
  // Bake the light scrim into the background image so the photo reads but the
  // dark question text stays legible — no extra overlay element needed.
  const bgStyle = bg
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(255,253,248,.80), rgba(251,243,231,.86)), url("${bg}")`,
      }
    : undefined;

  return (
    <div id="display" className="view active">
      <FxRunner />
      <div
        className={"stage-area" + (bg ? " has-bg" : "")}
        id="d-stage"
        style={bgStyle}
      >
        <div className="stage-badge">
          <span className="pill" id="d-badge">
            {STAGE_NAMES[stage]}
          </span>
        </div>
        <div id="d-content">
          {stage === 1 ? (
            <DisplayS1 />
          ) : stage === 2 ? (
            <DisplayS2 />
          ) : stage === 3 ? (
            <DisplayS3 />
          ) : (
            <DisplayS4 />
          )}
        </div>
      </div>
      <Banner />
      {ssOverlay}
    </div>
  );
}
