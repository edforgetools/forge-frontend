import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the SnapthumbCanvas components
const SnapthumbCanvas = React.lazy(() =>
  import("./SnapthumbCanvas/SnapthumbCanvas").then((module) => ({
    default: module.SnapthumbCanvas,
  }))
);
const Controls = React.lazy(() =>
  import("./SnapthumbCanvas/Controls").then((module) => ({
    default: module.Controls,
  }))
);

interface LazySnapthumbCanvasProps {
  backgroundImage?: string;
  overlayImage?: string;
  className?: string;
  onPositionChange?: (position: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

interface LazyControlsProps {
  className?: string;
}

export function LazySnapthumbCanvas(props: LazySnapthumbCanvasProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8 border border-neutral-200 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading canvas...
          </span>
        </div>
      }
    >
      <SnapthumbCanvas {...props} />
    </Suspense>
  );
}

export function LazyControls(props: LazyControlsProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      }
    >
      <Controls {...props} />
    </Suspense>
  );
}
