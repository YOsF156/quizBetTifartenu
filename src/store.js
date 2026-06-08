import { create } from "zustand";
import { SCHOOLS, STAGE1, STAGE2 } from "./data.js";
import {
  S1_PER_Q,
  S2_CORRECT_MAX,
  S2_PER_CORRECT,
  COMBO_BONUS,
  TIMER_ARM_MS,
  STAGE_THRESHOLD,
  STAGE_BONUS,
  AUDIENCE_BONUS,
  STAGE_KEY,
  STORAGE_KEY,
  CHANNEL_NAME,
} from "./config.js";

// ============ STATE ============
// Single shared channel: a BroadcastChannel never delivers a message to the
// instance that posted it, so the posting window won't reload its own state.
export const channel =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;

function freshScores() {
  return SCHOOLS.map(() => 0);
}

const DEFAULT_STATE = {
  stage: 1,
  scores: { s1: freshScores(), s2: freshScores(), s3: freshScores(), s4: freshScores() },
  s1_byQ: null, // [player][question] = 0/5 ; built lazily
  s2_correctCount: freshScores(), // how many correct each player got in stage2

  // ---- per-stage meter bonuses (index 0..3 → stages 1..4) ----
  stageBonus: [0, 0, 0, 0], // +100 once a stage crosses 400
  stageCeilingHit: [false, false, false, false],

  // ---- audience bonus: counts toward the grand total AND toward the current
  // stage's glass-ceiling meter (helps the participants break the ceiling) ----
  audienceBonus: freshScores(), // per-school points won "from the audience"
  stageAudience: [0, 0, 0, 0], // audience points credited to each stage's meter
  comboTotal: 0, // stage-2 combo bonuses
  manualBonus: 0, // manual ±10 to the general total

  ceilingOn: true, // enables the per-stage 200→+50 bonus
  comboOn: false, // off by default — so it isn't left on by accident at the start
  screensaver: false, // host-controlled display screensaver

  s1_index: 0,
  s1_revealed: 0,
  // epoch ms when the 20s countdown begins (set to now+2s on entering a question
  // for the auto-start; null = no timer). Shared by stages 1 & 2.
  timerStart: null,

  s2_player: 0,
  s2_phase: "media",
  s2_playToken: 0, // bumped by the host to trigger playback on the display
  s2_comboReached: 0,
  // which of each media's 3 questions are shown/answerable (default: first 2)
  s2_selected: STAGE2.map(() => [0, 1]),

  // opening slide: when true, the display shows the stage's intro slide and the
  // host advances into the stage with "enterStage"
  intro: true,
  // main welcome slideshow ("ברוכים הבאים…"); shown on top of everything
  welcome: true,
  // closing ceremony slide ("תודה רבה…"); shown on top of everything
  closing: false,

  editS1: null,
  editS2: null,
  // seating order on stage (one row) — list of school indices; drives the stage-2
  // participant list and the combo "consecutive" pairing
  seatOrder: SCHOOLS.map((_, i) => i),
  fx: null,
};

function loadState() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (r) {
      const saved = JSON.parse(r);
      // discard saved state if the participant count changed (avoids index errors)
      if (saved.scores && saved.scores.s1 && saved.scores.s1.length !== SCHOOLS.length) {
        return structuredClone(DEFAULT_STATE);
      }
      return Object.assign(structuredClone(DEFAULT_STATE), saved);
    }
  } catch (e) {
    console.warn(e);
  }
  return structuredClone(DEFAULT_STATE);
}

let applyingRemote = false;
function persist(data) {
  if (applyingRemote) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn(e);
  }
  if (channel) channel.postMessage({ type: "sync" });
}

// ============ question sources (edited overrides original) ============
export function s1Q(data) {
  return data.editS1 || STAGE1;
}
export function s2Q(data) {
  return data.editS2 || STAGE2;
}
// selected question indices for media i (sorted), default first 2
export function s2Selected(data, i) {
  const sel = data.s2_selected && data.s2_selected[i];
  return sel && sel.length ? sel : [0, 1];
}
// how many correct answers participant i can get = number of selected questions
export function s2MaxFor(data, i) {
  return s2Selected(data, i).length;
}
// school indices in seating order (falls back to natural order)
export function seatOrderOf(data) {
  const o = data.seatOrder;
  return o && o.length === SCHOOLS.length ? o : SCHOOLS.map((_, i) => i);
}

// ============ SCORING / TOTALS (operate on a draft `data`) ============
export function playerTotal(data, i) {
  return data.scores.s1[i] + data.scores.s2[i] + data.scores.s3[i] + data.scores.s4[i];
}
// what shows next to a school in the banner (private + audience bonus)
export function schoolTotal(data, i) {
  return playerTotal(data, i) + data.audienceBonus[i];
}
// sum of participants' scores in a stage (1..4) + audience points credited to
// that stage — drives the per-stage meter and the glass-ceiling check
export function stageParticipantTotal(data, stage) {
  const key = STAGE_KEY[stage];
  const sa = (data.stageAudience && data.stageAudience[stage - 1]) || 0;
  return SCHOOLS.reduce((a, _, i) => a + data.scores[key][i], 0) + sa;
}
// meter value for a stage = participants' total + that stage's 400-bonus
export function stageMeterValue(data, stage) {
  return stageParticipantTotal(data, stage) + data.stageBonus[stage - 1];
}
// everything in the grand total except the manual bonus
function grandExcludingManual(data) {
  let t = 0;
  SCHOOLS.forEach((_, i) => (t += schoolTotal(data, i)));
  t += data.stageBonus.reduce((a, b) => a + b, 0);
  t += data.comboTotal;
  return t;
}
export function grandTotal(data) {
  return grandExcludingManual(data) + data.manualBonus;
}

// Detect the per-stage 200 crossing. Marks the ceiling as hit (so it fires once)
// and returns the stage number when NEWLY crossed (for FX). The +50 bonus itself
// is applied later, via applyCeilingBonus, so the meter climbs again only AFTER
// the break animation has played.
function checkStageThreshold(data, stage) {
  if (!data.ceilingOn) return null;
  const idx = stage - 1;
  if (data.stageCeilingHit[idx]) return null;
  if (stageParticipantTotal(data, stage) >= STAGE_THRESHOLD) {
    data.stageCeilingHit[idx] = true;
    return stage;
  }
  return null;
}

function ensureByQ(data) {
  const n = s1Q(data).length;
  if (!data.s1_byQ || data.s1_byQ[0].length !== n) {
    data.s1_byQ = SCHOOLS.map(() => Array(n).fill(0));
  }
}

// ============ FX ============
let fxSeq = 0;
function fireFx(data, p) {
  fxSeq++;
  data.fx = Object.assign({ id: Date.now() + "_" + fxSeq }, p);
}

// ============ STORE ============
export const useStore = create((set, get) => {
  const apply = (mutator) => {
    const data = structuredClone(get().data);
    mutator(data);
    set({ data });
    persist(data);
  };

  // After a stage crosses 200, the break animation plays first; ~5s later we add
  // the +50 so the meter climbs again (Banner plays the climb sound on the rise).
  const CEILING_BONUS_DELAY = 5000;
  const scheduleCeiling = (stage) => {
    setTimeout(() => get().applyCeilingBonus(stage), CEILING_BONUS_DELAY);
  };

  return {
    data: loadState(),

    loadRemote: () => {
      applyingRemote = true;
      set({ data: loadState() });
      applyingRemote = false;
    },

    // ---- general ----
    setStage: (n) =>
      apply((d) => {
        d.stage = n;
        // show the opening slide for stages 1–4; the host then enters the stage.
        d.intro = n >= 1 && n <= 4;
        d.welcome = false;
        d.closing = false;
        // timer is armed when the host actually enters the stage, not on the slide
        d.timerStart = null;
      }),
    // advance from the opening slide into the stage itself
    enterStage: () =>
      apply((d) => {
        d.intro = false;
        d.welcome = false;
        d.closing = false;
        // entering stage 1 enters a question → auto-arm the countdown
        if (d.stage === 1) d.timerStart = Date.now() + TIMER_ARM_MS;
      }),
    // re-show the opening slide for the current stage
    showIntro: () =>
      apply((d) => {
        d.intro = true;
        d.welcome = false;
        d.closing = false;
        d.timerStart = null;
      }),
    // ceremony overlays (mutually exclusive), shown over everything
    toggleWelcome: () => apply((d) => { d.welcome = !d.welcome; d.closing = false; }),
    toggleClosing: () => apply((d) => { d.closing = !d.closing; d.welcome = false; }),
    toggleSwitch: (k) =>
      apply((d) => {
        d[k] = !d[k];
        if (k === "ceilingOn" && d.ceilingOn) {
          // retroactive: apply any crossed bonuses immediately (no animation on a toggle)
          [1, 2, 3, 4].forEach((st) => {
            if (checkStageThreshold(d, st)) d.stageBonus[st - 1] = STAGE_BONUS;
          });
        }
      }),
    // apply the deferred +50 ceiling bonus (called ~5s after the break animation)
    applyCeilingBonus: (stage) =>
      apply((d) => {
        const idx = stage - 1;
        if (!d.stageCeilingHit[idx] || d.stageBonus[idx] >= STAGE_BONUS) return;
        d.stageBonus[idx] = STAGE_BONUS; // meter climbs again + climb sound
      }),

    // ---- STAGE 1: mark correct per-question; meter updates ONLY on reveal ----
    s1Toggle: (i) =>
      apply((d) => {
        ensureByQ(d);
        const q = d.s1_index;
        d.s1_byQ[i][q] = d.s1_byQ[i][q] ? 0 : S1_PER_Q;
      }),
    s1Next: () =>
      apply((d) => {
        if (d.s1_index < s1Q(d).length - 1) {
          d.s1_index++;
          d.s1_revealed = 0;
          d.timerStart = Date.now() + TIMER_ARM_MS; // auto-arm on new question
        }
      }),
    s1Prev: () =>
      apply((d) => {
        if (d.s1_index > 0) {
          d.s1_index--;
          d.s1_revealed = 0;
          d.timerStart = Date.now() + TIMER_ARM_MS; // auto-arm on new question
        }
      }),
    s1Reveal: () =>
      apply((d) => {
        ensureByQ(d);
        d.s1_revealed = d.s1_revealed ? 0 : 1;
        if (d.s1_revealed) {
          d.timerStart = null; // revealing the answer ends the question → stop the timer
          const q = d.s1_index;
          const winners = [];
          d.scores.s1 = SCHOOLS.map((_, i) => d.s1_byQ[i].reduce((a, b) => a + b, 0));
          SCHOOLS.forEach((_, i) => {
            if (d.s1_byQ[i][q] > 0) winners.push(i);
          });
          const hit = checkStageThreshold(d, 1);
          fireFx(d, {
            type: "reveal1",
            winners,
            stageHit: hit,
            amount: winners.length * S1_PER_Q,
          });
          if (hit) scheduleCeiling(1);
        }
      }),
    // manual timer controls (start = immediate, reset = clear)
    startTimer: () => apply((d) => { d.timerStart = Date.now(); }),
    resetTimer: () => apply((d) => { d.timerStart = null; }),

    // ---- STAGE 2 ----
    s2SetPlayer: (i) =>
      apply((d) => {
        d.s2_player = i;
        d.s2_phase = "media";
        d.timerStart = null; // media phase has no timer
      }),
    s2ShowMedia: () =>
      apply((d) => {
        d.s2_phase = "media";
        d.timerStart = null;
      }),
    // host presses "play video" → bump a token the display watches to start the clip
    s2PlayVideo: () =>
      apply((d) => {
        d.s2_phase = "media";
        d.s2_playToken = (d.s2_playToken || 0) + 1;
      }),
    s2ShowQ: () =>
      apply((d) => {
        d.s2_phase = "questions";
        d.timerStart = Date.now() + TIMER_ARM_MS; // auto-arm 2s after showing questions
      }),
    s2Correct: (i) =>
      apply((d) => {
        if (i !== d.s2_player) return; // only the active player can earn points
        if (d.s2_correctCount[i] >= s2MaxFor(d, i)) return; // guard: max = #selected questions
        d.s2_correctCount[i]++;
        d.scores.s2[i] = d.s2_correctCount[i] * S2_PER_CORRECT;
        const hit = checkStageThreshold(d, 2);
        fireFx(d, { type: "score2", schoolIdx: i, stageHit: hit, amount: S2_PER_CORRECT });
        if (hit) scheduleCeiling(2);
        evaluateCombo(d);
      }),
    s2Undo: (i) =>
      apply((d) => {
        if (d.s2_correctCount[i] <= 0) return;
        d.s2_correctCount[i]--;
        d.scores.s2[i] = d.s2_correctCount[i] * S2_PER_CORRECT;
        evaluateCombo(d); // no confetti on undo
      }),

    // ---- STAGE 3/4 manual numeric ----
    // stepper +/− adjusts the score WITHOUT confetti on every point (only the
    // ceiling break still celebrates); the points confetti fires once on commit.
    addScore: (stageKey, i, delta, max) =>
      apply((d) => {
        const arr = d.scores[stageKey];
        const old = arr[i];
        const nv = clampNum(old + delta, max);
        if (nv === old) return;
        arr[i] = nv;
        const stage = stageOfKey(stageKey);
        const hit = checkStageThreshold(d, stage);
        if (hit) {
          fireFx(d, { type: "score", schoolIdx: i, stageHit: hit, amount: 0 });
          scheduleCeiling(stage);
        }
      }),
    // commit (typed value on blur/Enter) = end of entry → celebrate once
    setScore: (stageKey, i, val, max) =>
      apply((d) => {
        const arr = d.scores[stageKey];
        const old = arr[i];
        const nv = clampNum(parseFloat(val) || 0, max);
        arr[i] = nv;
        const stage = stageOfKey(stageKey);
        const hit = checkStageThreshold(d, stage);
        if (nv > old || hit) {
          fireFx(d, { type: "score", schoolIdx: i, stageHit: hit, amount: Math.max(0, nv - old) });
        }
        if (hit) scheduleCeiling(stage);
      }),

    // ---- manual GENERAL bonus ±10 (big animation on add) ----
    manualBonusAdd: (delta) =>
      apply((d) => {
        const floor = -grandExcludingManual(d);
        d.manualBonus = Math.max(floor, d.manualBonus + delta);
        if (delta > 0) fireFx(d, { type: "genbonus", amount: delta });
      }),

    // ---- audience bonus: fixed points to a school. Counts toward the grand
    // total AND helps the CURRENT stage break its glass ceiling. ----
    audienceAdd: (i) =>
      apply((d) => {
        d.audienceBonus[i] += AUDIENCE_BONUS;
        const stage = d.stage;
        let hit = null;
        if (stage >= 1 && stage <= 4) {
          d.stageAudience[stage - 1] += AUDIENCE_BONUS;
          hit = checkStageThreshold(d, stage);
        }
        fireFx(d, { type: "audience", schoolIdx: i, stageHit: hit, amount: AUDIENCE_BONUS });
        if (hit) scheduleCeiling(stage);
      }),

    resetAll: () => {
      if (!confirm("לאפס את כל החידון? (כולל ניקוד ובונוסים בכל השלבים)")) return;
      apply((d) => {
        const e1 = d.editS1;
        const e2 = d.editS2;
        const fresh = structuredClone(DEFAULT_STATE);
        Object.assign(d, fresh);
        d.editS1 = e1;
        d.editS2 = e2;
      });
    },

    // reset only the current stage's scores + that stage's meter/ceiling/audience
    resetStage: (stage) => {
      const names = { 1: "א'", 2: "ב'", 3: "ג'", 4: "ד'" };
      if (!confirm(`לאפס את הניקוד של שלב ${names[stage] || stage} בלבד?`)) return;
      apply((d) => {
        const key = STAGE_KEY[stage];
        if (key) d.scores[key] = freshScores();
        d.stageBonus[stage - 1] = 0;
        d.stageCeilingHit[stage - 1] = false;
        d.stageAudience[stage - 1] = 0;
        if (stage === 1) {
          d.s1_byQ = null;
          d.s1_revealed = 0;
        }
        if (stage === 2) {
          d.s2_correctCount = freshScores();
          d.s2_comboReached = 0;
          d.comboTotal = 0;
        }
      });
    },

    // ---- editing ----
    editS1: (i, field, val, optIdx) =>
      apply((d) => {
        if (!d.editS1) d.editS1 = structuredClone(STAGE1);
        if (field === "text") d.editS1[i].text = val;
        else if (field === "opt") d.editS1[i].options[optIdx] = val;
        else if (field === "correct") d.editS1[i].correct = parseInt(val, 10);
      }),
    editS2: (i, field, val, qIdx) =>
      apply((d) => {
        if (!d.editS2) d.editS2 = structuredClone(STAGE2);
        if (field === "media") d.editS2[i].media = val;
        else if (field === "video") d.editS2[i].video = val;
        else if (field === "q") d.editS2[i].questions[qIdx] = val;
      }),
    // toggle whether question qIdx of media i is shown/answerable (keep ≥1, sorted)
    s2ToggleQuestion: (i, qIdx) =>
      apply((d) => {
        const cur = (d.s2_selected[i] || []).slice();
        const at = cur.indexOf(qIdx);
        if (at >= 0) {
          if (cur.length <= 1) return; // never drop below 1 question
          cur.splice(at, 1);
        } else {
          cur.push(qIdx);
        }
        cur.sort((a, b) => a - b);
        d.s2_selected[i] = cur;
        // don't let a participant keep more correct answers than selected questions
        if (d.s2_correctCount[i] > cur.length) {
          d.s2_correctCount[i] = cur.length;
          d.scores.s2[i] = d.s2_correctCount[i] * S2_PER_CORRECT;
        }
      }),
    resetEdits: () => {
      if (!confirm("לשחזר את כל השאלות לטקסט המקורי?")) return;
      apply((d) => {
        d.editS1 = null;
        d.editS2 = null;
        d.s2_selected = STAGE2.map(() => [0, 1]);
      });
    },

    // move a participant left/right in the seating row (dir -1 / +1)
    seatMove: (pos, dir) =>
      apply((d) => {
        const o = (d.seatOrder && d.seatOrder.length === SCHOOLS.length
          ? d.seatOrder
          : SCHOOLS.map((_, i) => i)
        ).slice();
        const np = pos + dir;
        if (np < 0 || np >= o.length) return;
        [o[pos], o[np]] = [o[np], o[pos]];
        d.seatOrder = o;
      }),
  };
});

// round to a whole number and clamp to [0, max]. (Stages 3 & 4 are entered as
// integers 0–30; the old 2.5-rounding is what mangled manually-typed scores.)
function clampNum(v, max) {
  let nv = Math.round(v);
  return Math.max(0, Math.min(max, nv));
}
function stageOfKey(key) {
  return { s1: 1, s2: 2, s3: 3, s4: 4 }[key];
}

// combo: a player is "full" when they answered all their selected questions;
// +10 per consecutive full pair (consecutive = adjacent in the seating order)
function evaluateCombo(d) {
  const full = (i) => d.s2_correctCount[i] >= s2MaxFor(d, i);
  const order = seatOrderOf(d);
  let pairs = 0;
  for (let k = 0; k < order.length - 1; k++) {
    if (full(order[k]) && full(order[k + 1])) pairs++;
  }
  if (d.comboOn && pairs > d.s2_comboReached) {
    const g = pairs - d.s2_comboReached;
    d.comboTotal += g * COMBO_BONUS;
    fireFx(d, { type: "combo", amount: g * COMBO_BONUS });
  }
  d.s2_comboReached = pairs;
}
