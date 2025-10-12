import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the ExportDialog component
const ExportDialog = React.lazy(() =>
  import("./ExportDialog").then((module) => ({ default: module.ExportDialog }))
);

interface LazyExportDialogProps {
  children: React.ReactNode;
  isDragging?: boolean;
}

export function LazyExportDialog({
  children,
  isDragging,
}: LazyExportDialogProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading export dialog...
          </span>
        </div>
      }
    >
      <ExportDialog isDragging={isDragging}>{children}</ExportDialog>
    </Suspense>
  );
}
