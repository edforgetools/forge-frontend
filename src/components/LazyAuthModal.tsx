import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the AuthModal component
const AuthModal = React.lazy(() =>
  import("./AuthModal").then((module) => ({ default: module.AuthModal }))
);

interface LazyAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "signin" | "signup";
}

export function LazyAuthModal({
  open,
  onOpenChange,
  defaultMode,
}: LazyAuthModalProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading auth modal...
          </span>
        </div>
      }
    >
      <AuthModal
        open={open}
        onOpenChange={onOpenChange}
        defaultMode={defaultMode}
      />
    </Suspense>
  );
}
