import { useState } from "react";
import ForgePlusDashboard from "../ForgePlusDashboard";
import ThumbTool from "../tools/thumb/ThumbTool";

export default function App() {
  const [tab, setTab] = useState<"captions" | "thumb">("captions");
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <nav className="flex gap-2 mb-4">
        <button className={`btn ${tab==="captions"?"border-white":""}`} onClick={()=>setTab("captions")}>Captions</button>
        <button className={`btn ${tab==="thumb"?"border-white":""}`} onClick={()=>setTab("thumb")}>Thumbnail</button>
      </nav>
      {tab === "captions" ? <ForgePlusDashboard/> : <ThumbTool/>}
    </div>
  );
}
