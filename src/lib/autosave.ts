/**
 * Autosave functionality using localStorage
 * Automatically saves and restores canvas state
 */

import { useCanvasStore, CanvasState } from "@/state/canvasStore";

export interface AutosaveData {
  canvasState: Partial<CanvasState>;
  timestamp: number;
  version: string;
}

export interface AutosaveOptions {
  enabled: boolean;
  interval: number; // milliseconds
  maxHistory: number;
  keyPrefix: string;
}

const DEFAULT_OPTIONS: AutosaveOptions = {
  enabled: true,
  interval: 5000, // 5 seconds
  maxHistory: 10,
  keyPrefix: "snapthumb_autosave",
};

class AutosaveManager {
  private options: AutosaveOptions;
  private intervalId: NodeJS.Timeout | null = null;
  private lastSavedState: string | null = null;

  constructor(options: Partial<AutosaveOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Start autosave
   */
  start() {
    if (!this.options.enabled || this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.saveCurrentState();
    }, this.options.interval);

    // Also save on page unload
    window.addEventListener("beforeunload", this.handleBeforeUnload);

    // Save on visibility change (when user switches tabs)
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  /**
   * Stop autosave
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    window.removeEventListener("beforeunload", this.handleBeforeUnload);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }

  /**
   * Save current canvas state
   */
  saveCurrentState(): boolean {
    try {
      const state = useCanvasStore.getState();

      // Only save if there's actual content
      if (!state.image && !state.videoSrc && state.overlays.length === 0) {
        return false;
      }

      // Create serializable state
      const serializableState: Partial<CanvasState> = {
        aspect: state.aspect,
        crop: state.crop,
        overlays: state.overlays.map((overlay) => {
          if (overlay.type === "logo") {
            return {
              ...overlay,
              src: overlay.src,
            };
          }
          return overlay;
        }),
        prefs: state.prefs,
        zoom: state.zoom,
        showGrid: state.showGrid,
        showSafeZone: state.showSafeZone,
        isPro: state.isPro,
        // Don't save undo/redo stacks as they can be large
        undoStack: [],
        redoStack: [],
      };

      const autosaveData: AutosaveData = {
        canvasState: serializableState,
        timestamp: Date.now(),
        version: "1.0",
      };

      const stateString = JSON.stringify(autosaveData);

      // Only save if state has changed
      if (stateString !== this.lastSavedState) {
        localStorage.setItem(this.options.keyPrefix, stateString);
        this.lastSavedState = stateString;

        // Also save to history
        this.saveToHistory(autosaveData);

        return true;
      }

      return false;
    } catch {
      // Ignore storage errors
      console.error("Failed to save canvas state");
      return false;
    }
  }

  /**
   * Load saved state
   */
  loadSavedState(): boolean {
    try {
      const savedData = localStorage.getItem(this.options.keyPrefix);
      if (!savedData) return false;

      const autosaveData: AutosaveData = JSON.parse(savedData);

      // Validate version compatibility
      if (autosaveData.version !== "1.0") {
        console.warn("Incompatible autosave version, skipping restore");
        return false;
      }

      // Check if data is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - autosaveData.timestamp > maxAge) {
        return false;
      }

      // Restore state
      const state = useCanvasStore.getState();
      const newState = { ...state, ...autosaveData.canvasState };

      // Clear current state first
      useCanvasStore.setState(newState);

      return true;
    } catch {
      // Ignore storage errors
      console.error("Failed to load saved state");
      return false;
    }
  }

  /**
   * Clear saved state
   */
  clearSavedState() {
    localStorage.removeItem(this.options.keyPrefix);
    this.clearHistory();
    this.lastSavedState = null;
  }

  /**
   * Save to history
   */
  private saveToHistory(autosaveData: AutosaveData) {
    try {
      const historyKey = `${this.options.keyPrefix}_history`;
      const existingHistory = localStorage.getItem(historyKey);
      const history: AutosaveData[] = existingHistory
        ? JSON.parse(existingHistory)
        : [];

      // Add new entry
      history.push(autosaveData);

      // Limit history size
      if (history.length > this.options.maxHistory) {
        history.shift(); // Remove oldest
      }

      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch {
      // Ignore storage errors
      console.error("Failed to save to history");
    }
  }

  /**
   * Clear history
   */
  private clearHistory() {
    localStorage.removeItem(`${this.options.keyPrefix}_history`);
  }

  /**
   * Get history
   */
  getHistory(): AutosaveData[] {
    try {
      const historyKey = `${this.options.keyPrefix}_history`;
      const existingHistory = localStorage.getItem(historyKey);
      return existingHistory ? JSON.parse(existingHistory) : [];
    } catch {
      // Ignore storage errors
      console.error("Failed to get history");
      return [];
    }
  }

  /**
   * Restore from history entry
   */
  restoreFromHistory(timestamp: number): boolean {
    try {
      const history = this.getHistory();
      const entry = history.find((h) => h.timestamp === timestamp);

      if (!entry) {
        console.error("History entry not found");
        return false;
      }

      // Restore state
      const state = useCanvasStore.getState();
      const newState = { ...state, ...entry.canvasState };

      useCanvasStore.setState(newState);

      return true;
    } catch {
      // Ignore storage errors
      console.error("Failed to restore from history");
      return false;
    }
  }

  /**
   * Handle before unload
   */
  private handleBeforeUnload = () => {
    this.saveCurrentState();
  };

  /**
   * Handle visibility change
   */
  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.saveCurrentState();
    }
  };

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      // Ignore storage errors
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; available: number; total: number } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          used += localStorage[key].length;
        }
      }

      // Estimate available space (most browsers have ~5-10MB limit)
      const estimatedTotal = 5 * 1024 * 1024; // 5MB
      const available = Math.max(0, estimatedTotal - used);

      return {
        used,
        available,
        total: estimatedTotal,
      };
    } catch {
      // Ignore storage errors
      return { used: 0, available: 0, total: 0 };
    }
  }

  /**
   * Update options
   */
  updateOptions(newOptions: Partial<AutosaveOptions>) {
    const wasRunning = this.intervalId !== null;

    if (wasRunning) {
      this.stop();
    }

    this.options = { ...this.options, ...newOptions };

    if (wasRunning && this.options.enabled) {
      this.start();
    }
  }
}

// Singleton instance
export const autosaveManager = new AutosaveManager();

/**
 * React hook for autosave
 */
export function useAutosave(options: Partial<AutosaveOptions> = {}) {
  const { enabled = true, interval = 5000 } = options;

  React.useEffect(() => {
    if (enabled) {
      autosaveManager.updateOptions({ enabled, interval });
      autosaveManager.start();

      // Try to restore saved state on mount
      autosaveManager.loadSavedState();

      return () => {
        autosaveManager.stop();
      };
    } else {
      autosaveManager.stop();
      return undefined;
    }
  }, [enabled, interval]);

  return {
    save: () => autosaveManager.saveCurrentState(),
    load: () => autosaveManager.loadSavedState(),
    clear: () => autosaveManager.clearSavedState(),
    getHistory: () => autosaveManager.getHistory(),
    restoreFromHistory: (timestamp: number) =>
      autosaveManager.restoreFromHistory(timestamp),
    isAvailable: () => autosaveManager.isAvailable(),
    getStorageInfo: () => autosaveManager.getStorageInfo(),
  };
}

// Import React for the hook
import React from "react";
