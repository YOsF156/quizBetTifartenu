import { useEffect } from "react";
import { useStore, schoolTotal, grandTotal } from "../../store.js";
import { SCHOOLS } from "../../data.js";
import { cannonConfetti } from "../../fx.js";
import { playApplause, playGrandFanfare } from "../../sound.js";

// Build grouped school totals (Orot Rashi merged), highest first.
function topSchools(data) {
  const map = new Map();
  SCHOOLS.forEach((s, i) => {
    const key = s.group || s.school;
    if (!map.has(key)) map.set(key, { name: key, t: 0 });
    map.get(key).t += schoolTotal(data, i);
  });
  return [...map.values()].sort((a, b) => b.t - a.t);
}

export default function Finale() {
  const data = useStore((s) => s.data);
  const grand = grandTotal(data);
  const top3 = topSchools(data).slice(0, 3);

  // celebratory burst on entry, and a gentle repeat
  useEffect(() => {
    cannonConfetti();
    playGrandFanfare();
    playApplause(5);
    const id = setInterval(() => cannonConfetti(), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="finale">
      <div className="menorah">🕎</div>
      <div className="fin-pasuk">אִישׁ אֶת רֵעֵהוּ יַעְזֹרוּ וּלְאָחִיו יֹאמַר חֲזָק</div>
      <div>
        <div className="fin-grand-lbl">הצבירה הכללית של הקופה המשותפת</div>
        <div className="fin-grand">{grand}</div>
      </div>
      {/* three leading schools shown equally — no medals, no ranking between them */}
      <div className="fin-top-title">שלושת בתי הספר שתרמו את מירב הנקודות לקופה הכללית</div>
      <div className="fin-podium">
        {top3.map((p) => (
          <div className="fin-place" key={p.name}>
            <div className="fin-name">{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
