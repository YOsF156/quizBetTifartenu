import { useState } from "react";
import { useStore } from "../store.js";
import HostS1 from "../components/host/HostS1.jsx";
import HostS2 from "../components/host/HostS2.jsx";
import HostS3 from "../components/host/HostS3.jsx";
import HostS4 from "../components/host/HostS4.jsx";
import EditTab from "../components/host/EditTab.jsx";

const TAB_LABELS = ["", "א", "ב", "ג", "ד"];

export default function Host() {
  const [hostTab, setHostTab] = useState("play"); // play | edit
  const stage = useStore((s) => s.data.stage);
  const ceilingOn = useStore((s) => s.data.ceilingOn);
  const comboOn = useStore((s) => s.data.comboOn);
  const screensaver = useStore((s) => s.data.screensaver);
  const setStage = useStore((s) => s.setStage);
  const toggleSwitch = useStore((s) => s.toggleSwitch);

  return (
    <div id="host" className="view active">
      <div className="host-bar">
        <div className="stage-tabs" id="stageTabs">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={hostTab === "play" && stage === n ? "on" : ""}
              onClick={() => {
                setHostTab("play");
                setStage(n);
              }}
            >
              {TAB_LABELS[n]}
            </button>
          ))}
          <button
            className={hostTab === "play" && stage === 5 ? "on" : ""}
            onClick={() => {
              setHostTab("play");
              setStage(5);
            }}
            style={{ marginRight: 8 }}
          >
            🏁 סיום
          </button>
          <button
            className={hostTab === "edit" ? "on" : ""}
            onClick={() => setHostTab("edit")}
            style={{ marginRight: 8 }}
          >
            ✎ עריכה
          </button>
        </div>
        <div className="toggles">
          <div
            className={"toggle" + (ceilingOn ? " on" : "")}
            onClick={() => toggleSwitch("ceilingOn")}
          >
            <span className="switch"></span> תקרת זכוכית (200→+50)
          </div>
          <div
            className={"toggle" + (comboOn ? " on" : "")}
            onClick={() => toggleSwitch("comboOn")}
          >
            <span className="switch"></span> קומבו
          </div>
          <div
            className={"toggle" + (screensaver ? " on" : "")}
            onClick={() => toggleSwitch("screensaver")}
          >
            <span className="switch"></span> שומר מסך
          </div>
        </div>
        <div className="title">בית תפארתנו</div>
      </div>

      <div id="hostStage">
        {hostTab === "edit" ? (
          <EditTab />
        ) : stage === 1 ? (
          <HostS1 />
        ) : stage === 2 ? (
          <HostS2 />
        ) : stage === 3 ? (
          <HostS3 />
        ) : stage === 4 ? (
          <HostS4 />
        ) : (
          <div className="panel">
            <span className="pill">מסך סיום</span>
            <div className="hint" style={{ marginTop: 10 }}>
              מסך הסיום החגיגי מוצג כעת על ההקרנה — הצבירה הכללית, שלושת בתי הספר שהכי קידמו את הקופה,
              והפסוק "איש את רעהו יעזורו". חזרה לשלב כלשהו תסגור אותו.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
