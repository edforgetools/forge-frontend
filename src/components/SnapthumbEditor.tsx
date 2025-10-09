import { useEffect } from "react";
import { AppShell } from "./AppShell";

interface SnapthumbEditorProps {
  onBack: () => void;
}

export function SnapthumbEditor({ onBack }: SnapthumbEditorProps) {
  // Production-only check for duplicate editor roots
  useEffect(() => {
    if ((import.meta as { env?: { PROD?: boolean } }).env?.PROD) {
      const roots = document.querySelectorAll("[data-editor-root]");
      if (roots.length > 1) {
        console.error("Duplicate editor roots:", roots.length);
      }
    }
  }, []);

  return (
    <div data-editor-root>
      <AppShell onBack={onBack} />
    </div>
  );
}
