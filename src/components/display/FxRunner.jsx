import { useEffect, useRef } from "react";
import { useStore } from "../../store.js";
import { runFx } from "../../fx.js";

// Watches the queued FX descriptor and plays it on the display window only.
// Initializes lastFxId to whatever is already queued at mount, so opening the
// display screen does NOT replay the previous effect (matches quiz.html).
export default function FxRunner() {
  const fx = useStore((s) => s.data.fx);
  const lastFxId = useRef(fx ? fx.id : null);

  useEffect(() => {
    if (fx && fx.id !== lastFxId.current) {
      lastFxId.current = fx.id;
      runFx(fx);
    }
  }, [fx]);

  return null;
}
