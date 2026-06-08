// Landing page — mirrors #landing from quiz.html.
export default function Landing() {
  return (
    <div id="landing">
      <div className="sub">◆ ◆ ◆</div>
      <h1>חידון בית תפארתנו</h1>
      <div className="sub">חידון הסיום · ידע המקדש</div>
      <p>
        פותחים את תצוגת המנחה במחשב, וגוררים את תצוגת ההקרנה למסך/מקרן השני.
        <br />
        שתי התצוגות מסונכרנות אוטומטית.
      </p>
      <div className="links">
        <a href="/host">
          <strong>מסך מנחה</strong>
          <span>שליטה, ניקוד וניהול</span>
        </a>
        <a href="/display" target="_blank" rel="noreferrer">
          <strong>מסך הקרנה</strong>
          <span>לקהל / מקרן</span>
        </a>
      </div>
    </div>
  );
}
