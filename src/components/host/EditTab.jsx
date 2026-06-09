import { useState } from "react";
import { useStore, s1Q, s2Q, s2Selected, seatOrderOf, contentOf, contentDirty } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import { LETTERS } from "../../config.js";
import { saveContent } from "../../firebase.js";

// Edit stage-1 and stage-2 questions. Inputs are uncontrolled (commit on blur),
// matching the original "onchange" behavior so typing isn't interrupted by re-renders.
export default function EditTab() {
  const data = useStore((s) => s.data);
  const editS1 = useStore((s) => s.editS1);
  const editS2 = useStore((s) => s.editS2);
  const s2ToggleQuestion = useStore((s) => s.s2ToggleQuestion);
  const seatMove = useStore((s) => s.seatMove);
  const resetEdits = useStore((s) => s.resetEdits);

  // Save button: enabled only while the live edits differ from the cloud-saved
  // copy; typing back to the saved text flips `dirty` off and disables it again.
  const dirty = useStore(contentDirty);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0); // bump to flash the "saved" badge
  const [error, setError] = useState("");

  const onSave = async () => {
    setSaving(true);
    setError("");
    try {
      await saveContent(contentOf(useStore.getState().data));
      setSavedAt(Date.now());
    } catch (e) {
      console.warn(e);
      setError("השמירה נכשלה — בדוק חיבור לאינטרנט והרשאות");
    } finally {
      setSaving(false);
    }
  };

  const Q1 = s1Q(data);
  const Q2 = s2Q(data);
  const order = seatOrderOf(data);

  return (
    <div className="panel">
      <div className="edit-savebar">
        <h3 style={{ margin: 0 }}>✎ עריכת שאלות וסדר ישיבה</h3>
        <div className="edit-save-actions">
          {error && <span className="save-msg err">{error}</span>}
          {!dirty && savedAt > 0 && !saving && (
            <span className="save-msg ok">✓ הנתונים נשמרו בהצלחה</span>
          )}
          {dirty && !saving && <span className="save-msg pending">● יש שינויים שלא נשמרו</span>}
          <button className="primary" onClick={onSave} disabled={!dirty || saving}>
            {saving ? "שומר…" : "💾 שמור ושדר לכל המסכים"}
          </button>
        </div>
      </div>
      <div className="hint" style={{ marginBottom: 14 }}>
        השינויים מוצגים מיד במסך ההקרנה המקומי. לחיצה על "שמור ושדר" משדרת את השאלות לכל המכשירים דרך הענן (Firebase).
        שלבים ג'/ד' מנוהלים ידנית מהבמה ואינם נערכים כאן.
      </div>

      <details open>
        <summary>סדר ישיבה על הבמה (שורה אחת)</summary>
        <div className="hint" style={{ margin: "8px 0" }}>
          הסדר קובע את סדר המשתתפים בשלב ב' ואת זוגות הקומבו הרצופים. החץ ► מזיז ימינה (תחילת השורה), ◄ שמאלה.
        </div>
        <div className="seat-row">
          {order.map((i, pos) => (
            <div className="seat-chip" key={i}>
              <button
                onClick={() => seatMove(pos, -1)}
                disabled={pos === 0}
                title="הזז לתחילת השורה"
              >
                ►
              </button>
              <span className="seat-nm">
                {pos + 1}. {SCHOOLS[i].school}
              </span>
              <button
                onClick={() => seatMove(pos, 1)}
                disabled={pos === order.length - 1}
                title="הזז לסוף השורה"
              >
                ◄
              </button>
            </div>
          ))}
        </div>
      </details>

      <details open>
        <summary>שלב א' — אמריקאיות ({Q1.length} שאלות)</summary>
        <div style={{ marginTop: 10 }}>
          {Q1.map((q, i) => (
            <div className="edit-row" key={i + (data.editS1 ? "e" : "o")}>
              <label>שאלה {i + 1} (שלב א')</label>
              <textarea
                rows={2}
                defaultValue={q.text}
                onBlur={(e) => editS1(i, "text", e.target.value)}
              />
              {q.options.map((o, j) => (
                <div key={j}>
                  <label>
                    אפשרות {LETTERS[j]} {j === q.correct ? "✓ הנכונה" : ""}
                  </label>
                  <input defaultValue={o} onBlur={(e) => editS1(i, "opt", e.target.value, j)} />
                </div>
              ))}
              <label>אינדקס תשובה נכונה (0=א, 1=ב, 2=ג, 3=ד)</label>
              <input
                type="number"
                min={0}
                max={3}
                defaultValue={q.correct}
                onBlur={(e) => editS1(i, "correct", e.target.value)}
              />
            </div>
          ))}
        </div>
      </details>

      <details>
        <summary>שלב ב' — סרטונים ({Q2.length} מדיות)</summary>
        <div style={{ marginTop: 10 }}>
          {Q2.map((r, i) => {
            const sel = s2Selected(data, i);
            return (
              <div className="edit-row" key={i + (data.editS2 ? "e" : "o")}>
                <label>מדיה {i + 1} — כותרת</label>
                <input defaultValue={r.media} onBlur={(e) => editS2(i, "media", e.target.value)} />
                <label>קובץ וידאו (נתיב יחסי)</label>
                <input
                  defaultValue={r.video || ""}
                  onBlur={(e) => editS2(i, "video", e.target.value)}
                />
                <label style={{ marginTop: 10, color: "var(--gold)" }}>
                  שאלות — סמן אילו יוצגו ({sel.length} נבחרו)
                </label>
                {r.questions.map((q, j) => {
                  const on = sel.includes(j);
                  return (
                    <div
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        marginTop: 6,
                        opacity: on ? 1 : 0.5,
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 8,
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                          color: on ? "var(--ok)" : "var(--muted)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => s2ToggleQuestion(i, j)}
                          style={{ width: "auto", margin: 0 }}
                        />
                        {on ? "✓ מוצגת" : "מוסתרת"}
                      </label>
                      <textarea
                        rows={2}
                        defaultValue={q}
                        onBlur={(e) => editS2(i, "q", e.target.value, j)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </details>

      <div className="controls" style={{ marginTop: 16 }}>
        <button className="ghost" onClick={resetEdits}>
          שחזר טקסט מקורי
        </button>
      </div>
    </div>
  );
}
