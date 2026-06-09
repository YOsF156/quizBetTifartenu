import { useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { useSync } from "./useSync.js";
import { useStore, defaultContent, contentOf } from "./store.js";
import { subscribeContent, saveContent } from "./firebase.js";
import { unlockAudio } from "./sound.js";
import Landing from "./pages/Landing.jsx";
import Host from "./pages/Host.jsx";
import Display from "./pages/Display.jsx";

export default function App() {
  useSync(); // localStorage + BroadcastChannel sync, mounted once

  // Firebase: broadcast the edit-mode content (questions/order) across devices.
  const applyContent = useStore((s) => s.applyContent);
  const setCloudBaseline = useStore((s) => s.setCloudBaseline);
  const seededRef = useRef(false);
  useEffect(() => {
    const unsub = subscribeContent((content) => {
      if (content) {
        applyContent(content);
        return;
      }
      // No cloud document yet: fall back to defaults, and do a ONE-TIME initial
      // seed from the host so the full stage-1/2 questions (and everything in
      // edit mode) are written to Firebase as real entities. After that, the
      // host updates them via the "save & broadcast" button.
      setCloudBaseline(defaultContent());
      const isHost =
        typeof window !== "undefined" && window.location.pathname.startsWith("/host");
      if (isHost && !seededRef.current) {
        seededRef.current = true;
        saveContent(contentOf(useStore.getState().data)).catch((e) =>
          console.warn("initial seed failed (set Firestore rules?)", e)
        );
      }
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
