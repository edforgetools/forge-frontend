import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the CropPanel component
const CropPanel = React.lazy(() =>
  import("./CropPanel").then((module) => ({ default: module.CropPanel }))
);

export function LazyCropPanel() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading crop panel...
          </span>
        </div>
      }
    >
      <CropPanel />
    </Suspense>
  );
}
