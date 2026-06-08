import { useEffect } from "react";
import { useStore, channel } from "./store.js";
import { STORAGE_KEY } from "./config.js";

// Keeps this window's store in sync with the other window via:
//  1. localStorage  = source of truth (written on every action by the store)
//  2. BroadcastChannel("templeQuiz") = "you should refresh" signal
//  3. window 'storage' event = fallback
// Mount once at the app root.
export function useSync() {
  const loadRemote = useStore((s) => s.loadRemote);
  useEffect(() => {
    const onMessage = (e) => {
      if (e.data && e.data.type === "sync") loadRemote();
    };
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) loadRemote();
    };
    if (channel) channel.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    return () => {
      if (channel) channel.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
    };
  }, [loadRemote]);
}
