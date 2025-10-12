import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the Settings component
const Settings = React.lazy(() =>
  import("./Settings").then((module) => ({ default: module.Settings }))
);

interface LazySettingsProps {
  onClearSession?: () => void;
}

export function LazySettings(props: LazySettingsProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading settings...
          </span>
        </div>
      }
    >
      <Settings {...props} />
    </Suspense>
  );
}
