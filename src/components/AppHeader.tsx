import { useEffect, useState } from "react";

export function AppHeader() {
  const [mode, setMode] = useState<"MOCK"|"REAL"|"—">("—");
  const [tip, setTip] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/health");
        const j = await r.json();
        setMode(j.mock ? "MOCK" : "REAL");
        setTip(j.mock ? "Mock mode avoids billing. Set OPENAI_API_KEY and MOCK_OPENAI=0 to switch." :
                        "Real mode uses OpenAI. Billing applies.");
      } catch { setMode("—"); setTip("Health check failed."); }
    })();
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b">
      <h1 className="text-lg font-semibold">Forge</h1>
      <div className="relative group">
        <span className={`px-2 py-1 text-xs rounded border ${mode==="MOCK" ? "bg-yellow-50" : "bg-green-50"}`}>
          {mode}
        </span>
        <div className="absolute right-0 mt-2 w-64 p-2 text-xs border rounded bg-white shadow opacity-0 group-hover:opacity-100 transition">
          {tip}
        </div>
      </div>
    </header>
  );
}
