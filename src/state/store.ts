/**
 * Main Store Manager with Duplicate Detection
 *
 * This module provides a centralized store management system that prevents
 * duplicate store instances and doubled listeners by:
 * 1. Exposing window.__SNAP_STORE__ for global access
 * 2. Reusing existing store if already created
 * 3. Logging warnings on duplicate creation attempts
 * 4. Preventing doubled listeners across store instances
 */

import { useCanvasStore, CanvasStore } from "./canvasStore";
import { useEditorStore, EditorStore } from "./editorStore";
import { useModalStore, ModalStore } from "./modalStore";

// Global store interface
interface SnapStore {
  canvas: CanvasStore;
  editor: EditorStore;
  modal: ModalStore;
  isInitialized: boolean;
  createdAt: number;
}

// Extend Window interface for global store
declare global {
  interface Window {
    __SNAP_STORE__?: SnapStore;
  }
}

// Global store instance
let storeInstance: SnapStore | null = null;

/**
 * Creates or retrieves the global store instance
 * Implements duplicate detection and prevention with HMR support
 */
function createStore(): SnapStore {
  // Check if store already exists on window object
  if (typeof window !== "undefined" && window.__SNAP_STORE__) {
    console.warn(
      "🚨 SNAP Store: Attempting to create duplicate store instance. " +
        "Reusing existing store to prevent doubled listeners and memory leaks."
    );
    return window.__SNAP_STORE__;
  }

  // Check if store instance already exists in memory
  if (storeInstance) {
    console.warn(
      "🚨 SNAP Store: Duplicate store creation detected. " +
        "Reusing existing instance to prevent doubled listeners."
    );
    return storeInstance;
  }

  console.log("✅ SNAP Store: Creating new store instance");

  // Create new store instance
  storeInstance = {
    canvas: useCanvasStore.getState(),
    editor: useEditorStore.getState(),
    modal: useModalStore.getState(),
    isInitialized: true,
    createdAt: Date.now(),
  };

  // Expose store on window object for global access
  if (typeof window !== "undefined") {
    window.__SNAP_STORE__ = storeInstance;
  }

  // Handle HMR cleanup
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      console.log("🔄 SNAP Store: HMR detected, preserving store instance");
    });

    import.meta.hot.dispose(() => {
      console.log("🔄 SNAP Store: HMR dispose, cleaning up store");
      // Don't reset the store on HMR dispose to prevent state loss
      // The store will be reused on the next createStore call
    });
  }

  return storeInstance;
}

/**
 * Gets the global store instance
 * Creates it if it doesn't exist
 */
export function getStore(): SnapStore {
  return storeInstance || createStore();
}

/**
 * Checks if a store instance already exists
 */
export function hasStore(): boolean {
  return (
    storeInstance !== null ||
    (typeof window !== "undefined" && !!window.__SNAP_STORE__)
  );
}

/**
 * Gets store statistics for debugging
 */
export function getStoreStats(): {
  exists: boolean;
  isInitialized: boolean;
  createdAt?: number;
  age?: number;
  hasWindowStore: boolean;
} {
  const store =
    storeInstance ||
    (typeof window !== "undefined" ? window.__SNAP_STORE__ : null);

  return {
    exists: !!store,
    isInitialized: store?.isInitialized || false,
    createdAt: store?.createdAt,
    age: store?.createdAt ? Date.now() - store.createdAt : undefined,
    hasWindowStore: typeof window !== "undefined" && !!window.__SNAP_STORE__,
  };
}

/**
 * Resets the store instance (for testing purposes)
 * WARNING: This will destroy all store state
 */
export function resetStore(): void {
  console.warn("🔄 SNAP Store: Resetting store instance");

  storeInstance = null;

  if (typeof window !== "undefined") {
    delete window.__SNAP_STORE__;
  }
}

// Initialize store on module load
const store = createStore();

// Export individual store hooks for component use
export { useCanvasStore, useEditorStore, useModalStore };

// Export store instance for direct access
export { store as default };

// Type exports
export type { CanvasStore, EditorStore, ModalStore, SnapStore };
