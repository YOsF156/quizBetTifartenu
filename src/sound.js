// ============ SOUND ============
// Synthesized with the Web Audio API (no audio files needed).
// A small "instrument" with a shared master bus + algorithmic reverb so the cues
// feel warm and spacious rather than bare 8-bit blips.
//  - playFanfare(): warm trumpet/bell arpeggio on every confetti / correct answer
//  - playClimb():   gentle ascending bells while the score climbs
//  - playTick():    soft tick for the last 5 seconds of the timer
//  - playApplause() / playGrandFanfare(): glass-ceiling celebration
// Browsers block audio until a user gesture; call unlockAudio() on first interaction.

let ctx = null;
let master = null; // master gain → lowpass → destination
let reverbSend = null; // send gain → convolver → wet → lowpass

// Generate a short, smooth impulse response for a hall-like reverb tail.
function buildReverb(c) {
  const conv = c.createConvolver();
  const len = Math.floor(c.sampleRate * 1.8);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6); // exponential decay
    }
  }
  conv.buffer = buf;
  return conv;
}

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // master chain: everything → master → gentle lowpass → speakers
    master = ctx.createGain();
    master.gain.value = 0.9;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 8200; // tame the harsh 8-bit top end
    master.connect(lp);
    lp.connect(ctx.destination);
    // parallel reverb branch
    const conv = buildReverb(ctx);
    reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.22;
    const wet = ctx.createGain();
    wet.gain.value = 0.9;
    reverbSend.connect(conv);
    conv.connect(wet);
    wet.connect(lp);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function unlockAudio() {
  getCtx();
}

// ---- recorded SFX layer (optional, upgrades the synth) ----
// Drop royalty-free files into public/sounds/ (see public/sounds/README.txt).
// If a file is present it plays; otherwise we fall back to the synth below, so
// the app always has sound even before the files are added.
const SFX = {
  correct: "sounds/correct.mp3", // ding on a correct answer / confetti
  applause: "sounds/applause.mp3", // crowd cheer (glass ceiling)
  fanfare: "sounds/fanfare.mp3", // grand fanfare (glass ceiling)
  tick: "sounds/tick.mp3", // last-5-seconds clock tick
  climb: "sounds/climb.mp3", // ascending whoosh while score climbs
};
const sfxReady = {};
if (typeof window !== "undefined") {
  for (const [k, src] of Object.entries(SFX)) {
    const a = new Audio(src);
    a.preload = "auto";
    a.addEventListener("canplaythrough", () => (sfxReady[k] = true), { once: true });
    a.addEventListener("error", () => (sfxReady[k] = false), { once: true });
  }
}
function playFile(k, vol) {
  if (!sfxReady[k]) return false;
  try {
    const a = new Audio(SFX[k]);
    a.volume = vol == null ? 0.85 : vol;
    a.play().catch(() => {});
    return true;
  } catch (e) {
    return false;
  }
}

// One warm note: two oscillators slightly detuned (chorus) with a click-free
// attack/decay envelope, routed to the master bus and (optionally) the reverb.
function note(c, freq, start, dur, { type = "triangle", peak = 0.16, detune = 7, send = true } = {}) {
  const o = c.createOscillator();
  const o2 = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o2.type = type;
  o.frequency.setValueAtTime(freq, start);
  o2.frequency.setValueAtTime(freq, start);
  o2.detune.setValueAtTime(detune, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.025);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  o2.connect(g);
  g.connect(master);
  if (send && reverbSend) g.connect(reverbSend);
  o.start(start);
  o2.start(start);
  o.stop(start + dur + 0.05);
  o2.stop(start + dur + 0.05);
}

export function playFanfare() {
  if (playFile("correct", 0.8)) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const seq = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  seq.forEach((f, i) => note(c, f, t + i * 0.1, 0.34, { type: "triangle", peak: 0.16 }));
  // warm sustained major chord underneath the final note
  [523.25, 659.25, 783.99, 1046.5].forEach((f) =>
    note(c, f, t + 0.42, 0.7, { type: "sine", peak: 0.09 })
  );
}

export function playClimb() {
  if (playFile("climb", 0.6)) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const seq = [392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 783.99];
  seq.forEach((f, i) => note(c, f, t + i * 0.06, 0.22, { type: "sine", peak: 0.07 }));
}

export function playTick() {
  if (playFile("tick", 0.5)) return;
  const c = getCtx();
  if (!c) return;
  // soft sine pluck instead of a harsh square click (dry, no reverb wash)
  note(c, 880, c.currentTime, 0.06, { type: "sine", peak: 0.1, detune: 0, send: false });
}

// Crowd applause — band-passed, amplitude-modulated noise, for the glass ceiling.
export function playApplause(dur = 4) {
  if (playFile("applause", 0.7)) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const arr = buffer.getChannelData(0);
  for (let i = 0; i < arr.length; i++) {
    const env = 0.45 + 0.55 * Math.abs(Math.sin(i * 0.0009));
    arr[i] = (Math.random() * 2 - 1) * 0.5 * env;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2400;
  bp.Q.value = 0.5;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.28, t + 0.15);
  g.gain.setValueAtTime(0.28, t + dur - 0.8);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  if (reverbSend) g.connect(reverbSend);
  src.start(t);
  src.stop(t + dur + 0.05);
}

// A grand multi-trumpet fanfare for the glass-ceiling break (longer than playFanfare).
export function playGrandFanfare() {
  if (playFile("fanfare", 0.85)) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const seq = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5]; // C E G C G C
  seq.forEach((f, i) => note(c, f, t + i * 0.13, 0.42, { type: "triangle", peak: 0.16 }));
  // low brass root + bright sustained top chord for grandeur
  note(c, 261.63, t, 1.2, { type: "sawtooth", peak: 0.06 });
  [783.99, 1046.5, 1318.51].forEach((f) =>
    note(c, f, t + 0.9, 1.0, { type: "sine", peak: 0.1 })
  );
}
