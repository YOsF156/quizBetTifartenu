// ============ FX ============ (imperative DOM effects, ported from quiz.html)
// These operate on the #fx layer and the banner DOM, exactly like the original.
import { SCHOOLS } from "./data.js";
import { CONFETTI_SLOW, STAGE_BONUS, STAGE_THRESHOLD } from "./config.js";
import { playFanfare, playApplause, playGrandFanfare } from "./sound.js";

// Full-screen purple celebration when the glass ceiling breaks — flashes purple
// for ~10s with a "שמחת בית השואבה" vibe, then removes itself.
export function purpleCelebration() {
  const fxl = document.getElementById("fx");
  if (!fxl) return;
  document.querySelectorAll(".purple-celebration").forEach((e) => e.remove());
  const ov = document.createElement("div");
  ov.className = "purple-celebration";
  ov.innerHTML =
    '<div class="pc-emojis">🎺🎷🎻🥁🪗🎶</div>' +
    '<div class="pc-title">תקרת הזכוכית נפרצה!</div>' +
    '<div class="pc-sub">שמחת בית השואבה · +' + STAGE_BONUS + " לצבירה!</div>";
  fxl.appendChild(ov);
  setTimeout(() => ov.remove(), 10000);
}

export function cannonConfetti() {
  const fxl = document.getElementById("fx");
  if (!fxl) return;
  const colors = ["#f5d76e", "#d4af37", "#9a7b1f", "#fff6d5", "#e8c252", "#ffffff"];
  const count = CONFETTI_SLOW ? 34 : 46;
  const H = window.innerHeight;
  const W = window.innerWidth;
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = (side === 0 ? 0 : 100) + "%";
      c.style.bottom = "0%";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      // both cannons fire UP and INWARD, almost to the top of the screen, then the
      // pieces drift slowly back down past the bottom edge.
      const dirX = side === 0 ? 1 : -1;
      const peakUp = H * (0.78 + Math.random() * 0.2); // 78–98% of screen height
      const dx = (90 + Math.random() * W * 0.42) * dirX;
      const dur = (CONFETTI_SLOW ? 4.8 : 3.2) + Math.random() * 1.8;
      c.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1, offset: 0 },
          {
            transform: `translate(${dx * 0.55}px,${-peakUp}px) rotate(${Math.random() * 540}deg)`,
            opacity: 1,
            offset: 0.4,
          },
          {
            transform: `translate(${dx}px,${H * 0.12}px) rotate(${Math.random() * 1080}deg)`,
            opacity: 0,
            offset: 1,
          },
        ],
        { duration: dur * 1000, easing: "cubic-bezier(.18,.5,.3,1)" }
      );
      fxl.appendChild(c);
      setTimeout(() => c.remove(), dur * 1000 + 200);
    }
  }
}

// fly a single label across the screen, drifting up and slowly fading out
function flyLabel(text, extra) {
  // prefer the in-stage layer (sits behind the revealed-answer card); fall back to #fx
  const fxl = document.getElementById("flyfx") || document.getElementById("fx");
  if (!fxl) return;
  const el = document.createElement("div");
  el.className = "flyname" + (extra ? " " + extra : "");
  el.textContent = text;
  const fromLeft = Math.random() < 0.5;
  el.style.left = fromLeft ? "-6%" : "auto";
  el.style.right = fromLeft ? "auto" : "-6%";
  fxl.appendChild(el);
  // gentler, slower drift across a shorter path so the names read as a soft backdrop
  const tx = fromLeft ? window.innerWidth * 0.7 : -window.innerWidth * 0.7;
  const ty = -(90 + Math.random() * 160);
  el.animate(
    [
      { transform: "translate(0,0)", opacity: 0 },
      { transform: `translate(${tx * 0.1}px,${ty * 0.4}px)`, opacity: 0.92, offset: 0.16 },
      { transform: `translate(${tx * 0.72}px,${ty * 0.85}px)`, opacity: 0.92, offset: 0.74 },
      { transform: `translate(${tx}px,${ty}px)`, opacity: 0 },
    ],
    { duration: 7000, easing: "cubic-bezier(.33,.7,.4,1)" }
  );
  setTimeout(() => el.remove(), 7100);
}

export function flyName(idx) {
  // only the school name flies (student names removed everywhere)
  flyLabel("✓ " + SCHOOLS[idx].school);
}

export function bumpRow(idx) {
  // rows are grouped: data-members is a comma-list of participant indices
  const rows = document.querySelectorAll(".school-row[data-members]");
  let r = null;
  rows.forEach((el) => {
    const members = (el.getAttribute("data-members") || "").split(",");
    if (members.includes(String(idx))) r = el;
  });
  if (r) {
    r.classList.remove("bump");
    void r.offsetWidth;
    r.classList.add("bump");
  }
}

export function bonusPopup(big, cap) {
  const fxl = document.getElementById("fx");
  if (!fxl) return;
  const p = document.createElement("div");
  p.className = "bonus-pop show";
  p.innerHTML = `<div class="big">${big}</div><div class="cap">${cap}</div>`;
  fxl.appendChild(p);
  setTimeout(() => p.remove(), 2600);
}

export function breakMark(step) {
  const m = document.querySelector(`.meter-mark[data-step="${step}"]`);
  if (m) {
    m.classList.add("breaking");
    setTimeout(() => m.classList.remove("breaking"), 1000);
  }
}

export function rollNumber(el, to) {
  const from = parseInt(el.dataset.from || "0", 10);
  if (from === to) {
    el.textContent = to;
    return;
  }
  const dur = 800;
  const t0 = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(tick);
    else el.dataset.from = to;
  }
  el.dataset.from = to;
  requestAnimationFrame(tick);
}

// runs the queued FX descriptor (only on the display window)
export function runFx(fx) {
  const fxTypes = ["reveal1", "score2", "combo", "score", "genbonus", "audience"];
  if (!fx || !fxTypes.includes(fx.type)) return;
  const tb = document.querySelector(".total-box");
  if (tb) {
    tb.classList.remove("flash");
    void tb.offsetWidth;
    tb.classList.add("flash");
  }
  // Keep the cannons firing while the winner names are still drifting up the
  // screen (reveal1 can have several names, each staggered ~350ms then a 6s flight).
  const bursts =
    fx.type === "reveal1" ? Math.min(6, Math.max(3, (fx.winners || []).length + 2)) : 2;
  for (let k = 0; k < bursts; k++) setTimeout(cannonConfetti, k * 1100);
  playFanfare(); // trumpets on every confetti

  // flying winner names
  if (fx.type === "reveal1") {
    (fx.winners || []).forEach((w, k) => setTimeout(() => flyName(w), k * 350));
  } else if ((fx.type === "score2" || fx.type === "audience") && fx.schoolIdx != null) {
    flyName(fx.schoolIdx);
  }
  if (fx.schoolIdx != null) bumpRow(fx.schoolIdx);

  // FIRST beat — the answer's own points popup (immediately, with the confetti).
  if (fx.type === "combo") {
    bonusPopup("+" + fx.amount, "קומבו! 🔥");
  } else if (fx.type === "audience") {
    bonusPopup("+" + fx.amount, "בונוס קהל! 👏");
  } else if (fx.type === "genbonus") {
    bonusPopup("+" + fx.amount, "בונוס כללי 🌟");
  } else if (fx.amount > 0) {
    // reveal1 / score2 / score — points added to the grand total
    bonusPopup("+" + fx.amount, "נקודות! ✨");
  }

  // Glass-ceiling break — fire it immediately so the exciting moment isn't missed:
  // purple screen, fanfare, and the meter pulses/flashes as it tops out.
  if (fx.stageHit) {
    breakMark(STAGE_THRESHOLD);
    purpleCelebration(); // full-screen purple party for ~10s
    playApplause(); // crowd cheering
    playGrandFanfare(); // trumpets
    bonusPopup("+" + STAGE_BONUS, "פריצת " + STAGE_THRESHOLD + " — מעבר לסגול! ✨");
    const mf = document.querySelector(".meter-fill");
    if (mf) {
      mf.classList.remove("celebrate");
      void mf.offsetWidth;
      mf.classList.add("celebrate");
      setTimeout(() => mf.classList.remove("celebrate"), 2800);
    }
  }
}
