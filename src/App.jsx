import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useSync } from "./useSync.js";
import { unlockAudio } from "./sound.js";
import Landing from "./pages/Landing.jsx";
import Host from "./pages/Host.jsx";
import Display from "./pages/Display.jsx";

export default function App() {
  useSync(); // localStorage + BroadcastChannel sync, mounted once

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
