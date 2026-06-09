import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useSync } from "./useSync.js";
import { useStore, defaultContent } from "./store.js";
import { subscribeContent } from "./firebase.js";
import { unlockAudio } from "./sound.js";
import Landing from "./pages/Landing.jsx";
import Host from "./pages/Host.jsx";
import Display from "./pages/Display.jsx";

export default function App() {
  useSync(); // localStorage + BroadcastChannel sync, mounted once

  // Firebase: broadcast the edit-mode content (questions/order) across devices.
  const applyContent = useStore((s) => s.applyContent);
  const setCloudBaseline = useStore((s) => s.setCloudBaseline);
  useEffect(() => {
    const unsub = subscribeContent((content) => {
      if (content) applyContent(content);
      else setCloudBaseline(defaultContent()); // no cloud doc yet → defaults
    });
    return unsub;
  }, [applyContent, setCloudBaseline]);

  // browsers block audio until a user gesture — resume on the first interaction
  useEffect(() => {
    const go = () => unlockAudio();
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, []);

  return (
    <>
      {/* FX layer — shared overlay, used by the display window */}
      <div className="fx-layer" id="fx"></div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/host" element={<Host />} />
        <Route path="/display" element={<Display />} />
      </Routes>
    </>
  );
}
