import { useEffect, useRef, useState } from "react";
import { S1_TIMER_SEC } from "../config.js";
import { playTick } from "../sound.js";

// Counts down S1_TIMER_SEC from `startMs`. Ticks locally so both windows stay in
// sync (they share the same start timestamp via the store). `startMs` may be in
// the future (2s auto-arm pre-roll) — clamped so it reads a steady 20 first.
// Pass sound={true} on the display instance to play the last-5-seconds ticks.
export default function Timer({ startMs, size = "big", sound = false }) {
  const [now, setNow] = useState(() => Date.now());
  const lastTick = useRef(0);

  useEffect(() => {
    if (!startMs) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [startMs]);

  const remaining = startMs
    ? Math.max(0, Math.min(S1_TIMER_SEC, S1_TIMER_SEC - (now - startMs) / 1000))
    : S1_TIMER_SEC;
  const secs = Math.ceil(remaining);
  const done = startMs && remaining <= 0;
  const urgent = startMs && remaining <= 5 && !done;

  useEffect(() => {
    if (!sound || !startMs) return;
    if (secs <= 5 && secs >= 1 && secs !== lastTick.current) {
      lastTick.current = secs;
      playTick();
    } else if (secs > 5) {
      lastTick.current = secs;
    }
  }, [secs, sound, startMs]);

  if (!startMs) {
    return <div className={"timer " + size + " idle"}>⏱ {S1_TIMER_SEC}</div>;
  }

  return (
    <div className={"timer " + size + (done ? " done" : "") + (urgent ? " urgent" : "")}>
      {done ? "⏱ הזמן נגמר" : "⏱ " + secs}
    </div>
  );
}
