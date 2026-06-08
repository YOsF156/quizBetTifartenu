# חידון בית תפארתנו — React

שכתוב של `quiz.html` (Vanilla JS, קובץ יחיד) לאפליקציית **Vite + React** מודולרית, תוך שמירה 1:1 על הפונקציונליות והעיצוב.

## הרצה

```bash
npm install
npm run dev      # http://localhost:5173
```

> חשוב: localStorage ו-BroadcastChannel **לא עובדים** בתצוגת artifacts של Claude.ai. יש להריץ מקומית (Vite) או לפרוס (Netlify).

בנייה לפרודקשן:

```bash
npm run build
npm run preview
```

## שני מסכים, אתר אחד

- `/host` — מסך המנחה (שליטה, ניקוד, ניהול, טאב עריכה).
- `/display` — מסך ההקרנה לקהל/מקרן.

פותחים את שני המסכים כחלונות נפרדים באותו דפדפן. מדף הבית (`/`) יש קישור "מסך הקרנה" שנפתח בלשונית חדשה.

### מנגנון הסנכרון (הלב)
1. **localStorage** (`templeQuizState`) = מקור האמת — נשמר בכל שינוי, עמיד לרענון/קריסה.
2. **BroadcastChannel** (`templeQuiz`) = משדר "תתעדכן" לחלון השני.
3. גיבוי: אירוע `storage` של `window`.

ראה [src/store.js](src/store.js) (persist + actions) ו-[src/useSync.js](src/useSync.js) (קליטת עדכונים).

## מבנה

```
src/
  data.js                  ← SCHOOLS, STAGE1-4 (הועתק מילה במילה מ-quiz.html)
  config.js                ← קבועים, ספי תקרה, שמות שלבים
  store.js                 ← Zustand: state + כל הפעולות + ניקוד/קומבו/תקרת זכוכית
  useSync.js               ← hook סנכרון localStorage + BroadcastChannel
  fx.js                    ← קונפטי, שמות עפים, פופ-אפ בונוס, ריצת מספרים
  styles.css               ← ה-CSS המקורי (design tokens: --gold, --bg ...)
  App.jsx / main.jsx       ← routing (/, /host, /display)
  pages/                   ← Landing, Host, Display
  components/host/         ← HostS1-S4, EditTab, GeneralBonusBar, ScoreNumeric
  components/display/      ← DisplayS1-S4, Banner, FxRunner
public/media/              ← סרטונים (video1..10.mp4) ותמונות שלב ג' (stage3_18..29.png)
```

## מדיה
- **סרטונים לא מצורפים** (כבדים). שבץ אותם ב-`public/media/` בשמות `video1.mp4`…`video10.mp4` (ראה `public/media/README.txt`).
- **תמונות שלב ג'**: `stage3_18.png`…`stage3_29.png` ב-`public/media/`.

## הערות שכתוב (1:1)
הועבר 1:1 מהמקור: כל לוגיקת הניקוד, ההגנות (5 נק'/שאלה בשלב א', מקס' 3 נכונות בשלב ב', clamp 0–50 / 0–60), הקומבו המתגלגל, תקרת הזכוכית, וכל אנימציות ה-FX.

נקודה לשיפור עתידי (כפי שבמקור): מסך ההקרנה בשלב ג' מציג כרגע placeholder ("מנוהל מהבמה"). קבצי התמונות כבר מוכנים ב-`public/media/` ויש helper `STAGE3_IMAGE` ב-`config.js` לחיווט ניווט תמונות כשנרצה.
