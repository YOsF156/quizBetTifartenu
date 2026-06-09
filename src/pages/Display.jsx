import { useStore, s1Q } from "../store.js";
import { STAGE_NAMES, STAGE_BG } from "../config.js";
import DisplayS1 from "../components/display/DisplayS1.jsx";
import DisplayS2 from "../components/display/DisplayS2.jsx";
import DisplayS3 from "../components/display/DisplayS3.jsx";
import DisplayS4 from "../components/display/DisplayS4.jsx";
import Finale from "../components/display/Finale.jsx";
import Banner from "../components/display/Banner.jsx";
import FxRunner from "../components/display/FxRunner.jsx";
import IntroSlide from "../components/display/IntroSlide.jsx";
import CeremonySlide from "../components/display/CeremonySlide.jsx";

export default function Display() {
  const stage = useStore((s) => s.data.stage);
  const intro = useStore((s) => s.data.intro);
  const welcome = useStore((s) => s.data.welcome);
  const closing = useStore((s) => s.data.closing);
  const screensaver = useStore((s) => s.data.screensaver);
  const s1Index = useStore((s) => s.data.s1_index);
  const s1Len = useStore((s) => s1Q(s.data).length);

  const ceremony = welcome ? (
    <CeremonySlide kicker="בית תפארתנו" title="ברוכים הבאים לחידון בית תפארתנו" hint="החידון מתחיל…" />
  ) : closing ? (
    <CeremonySlide kicker="בית תפארתנו · חידון המקדש" title="תודה רבה ובהצלחה!" hint="עד לפעם הבאה" />
  ) : null;

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
        {ceremony}
        {ssOverlay}
      </div>
    );
  }

  const bg = STAGE_BG[stage];
  // Bake the light scrim into the background image so the photo reads but the
  // dark question text stays legible — no extra overlay element needed.
  const bgStyle = bg
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(255,253,248,.55), rgba(251,243,231,.63)), url("${bg}")`,
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
        <div className="flyname-layer" id="flyfx" />
        <div className="stage-badge">
          <span className="pill" id="d-badge">
            {stage === 1 ? `${STAGE_NAMES[1]} · ${s1Index + 1}/${s1Len}` : STAGE_NAMES[stage]}
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
      {stage >= 1 && stage <= 4 && <IntroSlide stage={stage} leaving={!intro} />}
      {ceremony}
      {ssOverlay}
    </div>
  );
}
