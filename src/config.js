// ============ CONFIG ============
// Stage 3 & 4 are graded manually, 0–30 per participant (integer steps).
export const POINTS = { s1: 3, s2: 15, s3step: 1, s3max: 30, s4step: 1, s4max: 30 };
export const S1_PER_Q = 3; // stage 1: 3 per question
export const S1_TIMER_SEC = 20; // 20s timer per question (stages 1 & 2)
export const TIMER_ARM_MS = 2000; // auto-start the timer 2s after entering a question
export const S2_CORRECT_MAX = 2; // stage 2: each player gets 2 consecutive questions
export const S2_PER_CORRECT = 15; // 15 per correct
export const COMBO_BONUS = 10;

// ---- Per-stage meter (glass ceiling) ----
// Crossing 200 grants an automatic +50 to the GENERAL total, recolors the bar
// purple, and lets the stage keep climbing up to 350. Marks: 0 / 200 / 350.
export const STAGE_THRESHOLD = 200;
export const STAGE_BONUS = 50;
export const STAGE_METER_MAX = 350;
export const STAGE_METER_MARKS = [0, 200, 350];

// ---- Audience bonus: fixed amount to a chosen school, added to the GENERAL
// total (and the school's private total) but NOT to the current stage meter. ----
export const AUDIENCE_BONUS = 10;

export const CONFETTI_SLOW = true;

export const LETTERS = ["א", "ב", "ג", "ד"];
export const STAGE_NAMES = {
  1: "שלב א׳ — הגבה ימינך!",
  2: "שלב ב׳ — שאלות על סרטונים",
  3: "שלב ג׳ — שער הניצוץ",
  4: 'שלב ד׳ — שאלת הרב מנחם מקובר שליט"א',
  5: "מסך סיום",
};
// stage number → scores key
export const STAGE_KEY = { 1: "s1", 2: "s2", 3: "s3", 4: "s4" };

// Stage 3 images live in media/ as stage3_18.png … stage3_29.png (per STAGE3 order)
export const STAGE3_IMAGE = (i) => `media/stage3_${18 + i}.png`;

// Fixed stage backgrounds (files live in public/media/)
export const STAGE_BG = {
  1: "media/מעמד הקהל.jpeg", // stage 1: the public assembly in the Temple
  3: "media/הלויים משוררים.jpeg", // stage 3: the Levites singing
  4: "media/מקדש.png", // stage 4: the Temple
};
// generic placeholder when a specific media file is missing (Temple from above)
export const PLACEHOLDER_IMG = "media/הר הבית מבט על.jpeg";

// Brand logo, shown on every ceremony/transition slide (top-center).
export const LOGO = "media/logo.png";
// Single fixed backdrop behind the floating photos on the ceremony slides.
export const WELCOME_BG = "media/מקדש.png";
// Images that float into the welcome / closing slides from alternating directions.
export const WELCOME_IMAGES = [
  "media/מעמד הקהל.jpeg",
  "media/מקדש.png",
  "media/הלויים משוררים.jpeg",
  "media/הר הבית מבט על.jpeg",
  "media/כהן גדול.png",
  "media/כהן רגיל.png",
  "media/ארון הברית.png",
  "media/בארון הברית יש ספר תורה.jpg",
  "media/תמונת זמן הצבעה.png",
];

// Opening slide shown on the display before each stage. The host advances from
// the slide into the stage itself. (Adjust the per-stage image freely.)
export const STAGE_INTRO_BG = {
  1: "media/תמונת זמן הצבעה.png", // stage 1 opener — requested
  2: "media/הר הבית מבט על.jpeg", // stage 2 opener
  3: "media/הלויים משוררים.jpeg", // stage 3 opener
  4: "media/מקדש.png", // stage 4 opener
};

export const STORAGE_KEY = "templeQuizState";
export const CHANNEL_NAME = "templeQuiz";
