import { useRef } from "react";
import { useStore, s2Q, s2Selected } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import Timer from "../Timer.jsx";

export default function DisplayS2() {
  const data = useStore((s) => s.data);
  const s2ShowQ = useStore((s) => s.s2ShowQ);
  const videoRef = useRef(null);
  const Q = s2Q(data);
  const round = Q[data.s2_player];
  const s = SCHOOLS[data.s2_player];
  const selected = s2Selected(data, data.s2_player);

  const playVideoFs = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
    v.play();
  };

  // when the clip finishes: leave fullscreen and auto-advance to the questions
  const onVideoEnded = () => {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitFullscreenElement && document.webkitExitFullscreen)
      document.webkitExitFullscreen();
    s2ShowQ();
  };

  if (data.s2_phase === "media") {
    return (
      <>
        <div className="d-active-player">{s.school}</div>
        <div className="d-active-sub">{round.media}</div>
        <video
          id="s2video"
          ref={videoRef}
          className="s2-video"
          src={round.video || ""}
          controls
          preload="metadata"
          onClick={playVideoFs}
          onEnded={onVideoEnded}
        ></video>
        <div className="media-cap">{round.media}</div>
        <button className="primary" style={{ marginTop: 18 }} onClick={playVideoFs}>
          ▶ נגן במסך מלא
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
      <div className="d-active-sub">{selected.length} שאלות</div>
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
