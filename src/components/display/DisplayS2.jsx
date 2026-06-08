import { useEffect, useRef, useState } from "react";
import { useStore, s2Q, s2Selected } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import Timer from "../Timer.jsx";

export default function DisplayS2() {
  const data = useStore((s) => s.data);
  const s2ShowQ = useStore((s) => s.s2ShowQ);
  const videoRef = useRef(null);
  const [fading, setFading] = useState(false);
  // ignore whatever token is already set when the display opens (don't replay)
  const lastPlayToken = useRef(data.s2_playToken);
  const Q = s2Q(data);
  const round = Q[data.s2_player];
  const s = SCHOOLS[data.s2_player];
  const selected = s2Selected(data, data.s2_player);

  // The host presses "▶ הפעל סרטון"; that bumps s2_playToken, which we watch here
  // and start the clip large on the projector. Playback-with-sound is allowed once
  // the display window has had any click (e.g. the opening slide, which calls
  // unlockAudio); if the browser still blocks it we fall back to muted playback.
  useEffect(() => {
    if (data.s2_playToken === lastPlayToken.current) return;
    lastPlayToken.current = data.s2_playToken;
    if (data.s2_phase !== "media" || data.intro) return;
    const v = videoRef.current;
    if (!v) return;
    setFading(false);
    try {
      v.currentTime = 0;
    } catch (e) {
      /* metadata not ready yet — fine */
    }
    const p = v.play();
    if (p && p.catch) {
      p.catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    }
  }, [data.s2_playToken, data.s2_phase, data.intro]);

  const playVideoFs = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
    v.play();
  };

  // when the clip finishes: leave fullscreen, softly fade the video out and hold a
  // beat so participants can digest the clip, then reveal the questions.
  const onVideoEnded = () => {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitFullscreenElement && document.webkitExitFullscreen)
      document.webkitExitFullscreen();
    setFading(true);
    setTimeout(() => {
      setFading(false);
      s2ShowQ();
    }, 4900); // ~1.4s fade + ~3.5s hold so participants digest before the questions
  };

  if (data.s2_phase === "media") {
    return (
      <>
        <div className="d-active-player">{s.school}</div>
        {s.player && <div className="d-active-name">{s.player}</div>}
        <div className="d-active-sub">{round.media}</div>
        <video
          id="s2video"
          ref={videoRef}
          className={"s2-video" + (fading ? " fading" : "")}
          src={round.video || ""}
          controls
          preload="auto"
          onClick={playVideoFs}
          onEnded={onVideoEnded}
        ></video>
        <button className="primary" style={{ marginTop: 16 }} onClick={playVideoFs}>
          ⛶ מסך מלא
        </button>
      </>
    );
  }

  return (
    <>
      <div className="s1-timer-slot">
        <Timer startMs={data.timerStart} size="big" sound />
      </div>
      <div className="d-active-player">{s.school}</div>
      {s.player && <div className="d-active-name">{s.player}</div>}
      <div className="q-list">
        {selected.map((qIdx, n) => (
          <div className="q-item q-slow" key={qIdx}>
            <span className="num">{n + 1}</span>
            <span>{round.questions[qIdx]}</span>
          </div>
        ))}
      </div>
    </>
  );
}
