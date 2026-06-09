// ============ FIREBASE (cloud sync of the edit-mode content) ============
// We sync ONLY the "edit mode" entities (stage-1/2 questions, selected stage-2
// questions, seating order) through a single Firestore document, so the host can
// edit the questions on one device and have them broadcast to every display —
// even on other devices/networks. Scores etc. still sync locally (BroadcastChannel).
//
// The whole content blob is stored as one JSON string field: `s2_selected` is an
// array-of-arrays, which Firestore's native data model forbids, and stringifying
// sidesteps every such limitation.
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { EDIT_PASSWORD } from "./config.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUkT-4y7PCNi8e5VmfJnAWGgjtcG6EqXE",
  authDomain: "bet-tifartenu.firebaseapp.com",
  projectId: "bet-tifartenu",
  storageBucket: "bet-tifartenu.firebasestorage.app",
  messagingSenderId: "1002041012474",
  appId: "1:1002041012474:web:0b48d727461d31773e5943",
  measurementId: "G-MY1G4V8SQ6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// one shared document holds the whole edit-mode content
const CONTENT_DOC = doc(db, "quiz", "content");

// Subscribe to live content changes. `onContent` is called with the parsed
// content object, or null when the document doesn't exist yet. Returns an
// unsubscribe function. Network/permission errors are swallowed (the app keeps
// working off its local defaults).
export function subscribeContent(onContent) {
  try {
    return onSnapshot(
      CONTENT_DOC,
      (snap) => {
        const raw = snap.exists() ? snap.data() : null;
        if (raw && typeof raw.json === "string") {
          try {
            onContent(JSON.parse(raw.json));
            return;
          } catch (e) {
            console.warn("bad cloud content json", e);
          }
        }
        onContent(null);
      },
      (err) => console.warn("firebase subscribe error", err)
    );
  } catch (e) {
    console.warn("firebase subscribe failed", e);
    return () => {};
  }
}

// Persist the edit-mode content to the cloud (broadcasts to every client). The
// `editKey` must match the Firestore rule, so only the password-holder can write.
export function saveContent(content) {
  return setDoc(CONTENT_DOC, {
    json: JSON.stringify(content),
    editKey: EDIT_PASSWORD,
    updatedAt: serverTimestamp(),
  });
}
