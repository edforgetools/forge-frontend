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

/**
 * Hook to get the portal container for dialogs
 * @returns The portal container element
 */
export function usePortalContainer(): HTMLElement {
  return React.useMemo(() => {
    return getPortalRoot() || ensurePortalRoot();
  }, []);
}

/**
 * Hook to access dialog context
 * @returns The dialog context value
 */
export function useDialogContext() {
  return React.useContext(DialogContext);
}
