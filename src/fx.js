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
    '<div class="pc-emojis">🎉🕺💃🥳🎺💜</div>' +
    '<div class="pc-title">תקרת הזכוכית נפרצה!</div>' +
    '<div class="pc-sub">שמחת בית השואבה · +' + STAGE_BONUS + " לצבירה!</div>";
  fxl.appendChild(ov);
  setTimeout(() => ov.remove(), 10000);
}

export function cannonConfetti() {
  const fxl = document.getElementById("fx");
  if (!fxl) return;
  const colors = ["#f5d76e", "#d4af37", "#9a7b1f", "#fff6d5", "#e8c252", "#ffffff"];
  const count = CONFETTI_SLOW ? 42 : 55;
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = (side === 0 ? 0 : 100) + "%";
      c.style.bottom = "0%";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      // both cannons fire UP and INWARD: left cannon → up-right, right cannon → up-left
      const dirX = side === 0 ? 1 : -1;
      const angle = 50 + Math.random() * 40; // 50–90° above horizontal
      const rad = (angle * Math.PI) / 180;
      const dist = 320 + Math.random() * 520;
      const dx = Math.cos(rad) * dist * dirX;
      const dy = -Math.sin(rad) * dist; // negative = upward
      const dur = (CONFETTI_SLOW ? 3.0 : 1.8) + Math.random() * 1.6;
      c.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          {
            transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 540}deg)`,
            opacity: 1,
            offset: 0.45,
          },
          {
            transform: `translate(${dx * 1.15}px,${dy + window.innerHeight}px) rotate(${
              Math.random() * 900
            }deg)`,
            opacity: 0,
          },
        ],
        { duration: dur * 1000, easing: "cubic-bezier(.25,.5,.4,1)" }
      );
      fxl.appendChild(c);
      setTimeout(() => c.remove(), dur * 1000 + 200);
    }
  }
}

export function flyName(idx) {
  const fxl = document.getElementById("fx");
  if (!fxl) return;
  const el = document.createElement("div");
  el.className = "flyname";
  const label =
    SCHOOLS[idx].player && SCHOOLS[idx].player !== "—" ? SCHOOLS[idx].player : SCHOOLS[idx].school;
  el.textContent = "✓ " + label;
  const fromLeft = Math.random() < 0.5;
  el.style.left = fromLeft ? "-8%" : "auto";
  el.style.right = fromLeft ? "auto" : "-8%";
  fxl.appendChild(el);
  // slower, drifting across less distance so the name stays readable, then a slow fade-out
  const tx = fromLeft ? window.innerWidth * 0.78 : -window.innerWidth * 0.78;
  const ty = -(110 + Math.random() * 200);
  el.animate(
    [
      { transform: "translate(0,0)", opacity: 0 },
      { transform: `translate(${tx * 0.1}px,${ty * 0.4}px)`, opacity: 1, offset: 0.12 },
      { transform: `translate(${tx * 0.75}px,${ty * 0.85}px)`, opacity: 1, offset: 0.72 },
      { transform: `translate(${tx}px,${ty}px)`, opacity: 0 },
    ],
    { duration: 6000, easing: "cubic-bezier(.25,.6,.4,1)" }
  );
  setTimeout(() => el.remove(), 6100);
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
  cannonConfetti();
  playFanfare(); // trumpets on every confetti

  // flying winner names
  if (fx.type === "reveal1") {
    (fx.winners || []).forEach((w, k) => setTimeout(() => flyName(w), k * 350));
  } else if ((fx.type === "score2" || fx.type === "audience") && fx.schoolIdx != null) {
    flyName(fx.schoolIdx);
  }
  if (fx.schoolIdx != null) bumpRow(fx.schoolIdx);

  // Big popup for EVERY grand-total addition (like the combo popup).
  // The 400 milestone takes priority and shows its own +100 popup.
  if (fx.stageHit) {
    bonusPopup("+" + STAGE_BONUS, "פריצת " + STAGE_THRESHOLD + " — מעבר לסגול! ✨");
    breakMark(STAGE_THRESHOLD);
    purpleCelebration(); // full-screen purple party for ~10s
    playApplause(); // crowd cheering
    playGrandFanfare(); // trumpets
  } else if (fx.type === "combo") {
    bonusPopup("+" + fx.amount, "קומבו! 🔥");
  } else if (fx.type === "audience") {
    bonusPopup("+" + fx.amount, "בונוס קהל! 👏");
  } else if (fx.type === "genbonus") {
    bonusPopup("+" + fx.amount, "בונוס כללי 🌟");
  } else if (fx.amount > 0) {
    // reveal1 / score2 / score — points added to the grand total
    bonusPopup("+" + fx.amount, "נקודות! ✨");
  }
}
