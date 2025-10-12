import React, { Suspense } from "react";

const UpgradeModal = React.lazy(() =>
  import("./UpgradeModal").then((module) => ({
    default: module.UpgradeModal,
  }))
);

interface LazyUpgradeModalProps {
  children: React.ReactNode;
}

export function LazyUpgradeModal({ children }: LazyUpgradeModalProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      }
    >
      <UpgradeModal>{children}</UpgradeModal>
    </Suspense>
  );
}
