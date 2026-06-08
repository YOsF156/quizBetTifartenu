SOUND EFFECTS — optional upgrade over the built-in synth
=========================================================

Drop these 5 files into this folder (public/sounds/). As soon as a file is
present it replaces the synthesized cue; if it's missing, the app falls back to
the built-in Web-Audio synth, so sound always works.

Required filenames (mp3):
  correct.mp3   — short "ding"/chime for a correct answer + confetti  (~1s)
  applause.mp3  — crowd cheer for the glass-ceiling break             (~3-4s)
  fanfare.mp3   — grand trumpet fanfare for the glass-ceiling break   (~2-3s)
  tick.mp3      — single soft clock tick (last 5 seconds of timer)    (~0.2s)
  climb.mp3     — ascending whoosh/sparkle while the score climbs     (~1s)

Recommended source (free, no attribution required):
  Pixabay Sound Effects — https://pixabay.com/sound-effects/
  Suggested searches: "correct answer ding", "crowd applause",
  "trumpet fanfare", "clock tick", "whoosh sparkle".
  (Mixkit Free SFX — https://mixkit.co/free-sound-effects/ — also works.)

Keep each file small (mono, ~64-128kbps mp3) so the projector loads them fast.
After adding files, just refresh the display — no code changes needed.
