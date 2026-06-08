// ============ SOUND ============
// Synthesized with the Web Audio API (no audio files needed).
//  - playFanfare(): triumphant trumpet arpeggio on every confetti / correct answer
//  - playClimb():   ascending scale while the score climbs
//  - playTick():    clock tick for the last 5 seconds of the timer
// Browsers block audio until a user gesture; call unlockAudio() on first interaction.

let ctx = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function unlockAudio() {
  getCtx();
}

// one oscillator note with a click-free attack/decay envelope
function blip(c, freq, start, dur, type, peak) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(peak, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(start);
  o.stop(start + dur + 0.03);
}

export function playFanfare() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const seq = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  seq.forEach((f, i) => blip(c, f, t + i * 0.1, 0.32, "triangle", 0.16));
  [783.99, 1046.5, 1318.51].forEach((f) => blip(c, f, t + 0.42, 0.55, "triangle", 0.1)); // final chord
}

export function playClimb() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const seq = [392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 783.99];
  seq.forEach((f, i) => blip(c, f, t + i * 0.05, 0.1, "square", 0.06));
}

export function playTick() {
  const c = getCtx();
  if (!c) return;
  blip(c, 1000, c.currentTime, 0.04, "square", 0.13);
}

// Crowd applause — band-passed, amplitude-modulated noise, for the glass ceiling.
export function playApplause(dur = 4) {
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
  g.connect(c.destination);
  src.start(t);
  src.stop(t + dur + 0.05);
}

// A grand multi-trumpet fanfare for the glass-ceiling break (longer than playFanfare).
export function playGrandFanfare() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const seq = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5]; // C E G C G C
  seq.forEach((f, i) => blip(c, f, t + i * 0.13, 0.4, "triangle", 0.16));
  [783.99, 1046.5, 1318.51].forEach((f) => blip(c, f, t + 0.9, 0.9, "triangle", 0.12));
}
