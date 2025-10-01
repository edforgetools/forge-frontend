import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export function AppHeader() {
  const [mode, setMode] = useState<"MOCK" | "REAL" | "—">("—");
  const [tip, setTip] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/health");
        const j = await r.json();
        setMode(j.mock ? "MOCK" : "REAL");
        setTip(
          j.mock
            ? "Mock mode avoids billing. Set OPENAI_API_KEY and MOCK_OPENAI=0 to switch."
            : "Real mode uses OpenAI. Billing applies."
        );
      } catch {
        setMode("—");
        setTip("Health check failed.");
      }
    })();
  }, []);

  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b border-border bg-card"
      role="banner"
    >
      <h1 className="text-xl font-bold text-foreground">Forge</h1>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={mode === "MOCK" ? "secondary" : "default"}
              className="flex items-center gap-2"
            >
              <Info className="h-3 w-3" />
              {mode}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>
  );
}
