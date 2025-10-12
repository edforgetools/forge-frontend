import * as React from "react";
import { getPortalRoot, ensurePortalRoot } from "@/lib/dom";

/**
 * DialogProvider context for managing dialog state and portal container
 * This component ensures the portal root exists and provides context for dialogs
 */
export const DialogContext = React.createContext<{
  portalContainer: HTMLElement;
}>({
  portalContainer: document.body,
});

export function DialogProvider({ children }: { children: React.ReactNode }) {
  // Ensure portal root exists and get reference
  const portalContainer = React.useMemo(() => {
    return getPortalRoot() || ensurePortalRoot();
  }, []);

  const contextValue = React.useMemo(
    () => ({ portalContainer }),
    [portalContainer]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

// Unused hooks removed - no imports found in codebase
