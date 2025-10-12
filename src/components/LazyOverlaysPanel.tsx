import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the OverlaysPanel component
const OverlaysPanel = React.lazy(() =>
  import("./OverlaysPanel").then((module) => ({
    default: module.OverlaysPanel,
  }))
);

export function LazyOverlaysPanel() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading overlays panel...
          </span>
        </div>
      }
    >
      <OverlaysPanel />
    </Suspense>
  );
}
