import { useEffect, useRef, useCallback } from "react";
import { logEvent } from "../lib/logEvent";

interface AutosaveOptions {
  key: string;
  data: any;
  interval?: number; // in milliseconds
  enabled?: boolean;
  onSave?: (data: any) => void;
  onLoad?: (data: any) => any;
}

export function useAutosave({
  key,
  data,
  interval = 2000, // 2 seconds default
  enabled = true,
  onSave,
  onLoad,
}: AutosaveOptions) {
  const lastSavedRef = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Serialize data for comparison
  const serializeData = useCallback((data: any) => {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.warn("Failed to serialize data for autosave:", error);
      return "";
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback(() => {
    if (!enabled) return;

    try {
      const serialized = serializeData(data);

      // Only save if data has changed
      if (serialized !== lastSavedRef.current) {
        const saveData = onSave ? onSave(data) : data;
        localStorage.setItem(key, JSON.stringify(saveData));
        localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
        lastSavedRef.current = serialized;

        logEvent("autosave", { key, dataSize: serialized.length });
      }
    } catch (error) {
      console.warn("Autosave failed:", error);
      logEvent("autosave_error", { key, error: error.message });
    }
  }, [key, data, enabled, onSave, serializeData]);

  // Load data from localStorage
  const loadData = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return onLoad ? onLoad(parsed) : parsed;
      }
    } catch (error) {
      console.warn("Failed to load saved data:", error);
      logEvent("autosave_load_error", { key, error: error.message });
    }
    return null;
  }, [key, onLoad]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);
    lastSavedRef.current = "";
    logEvent("autosave_clear", { key });
  }, [key]);

  // Get last save timestamp
  const getLastSaveTime = useCallback(() => {
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    return timestamp ? new Date(timestamp) : null;
  }, [key]);

  // Set up autosave interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(saveData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, saveData]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (enabled) {
        saveData();
      }
    };
  }, [enabled, saveData]);

  return {
    loadData,
    clearSavedData,
    getLastSaveTime,
    saveData, // Manual save function
  };
}

// Hook for session restoration prompt
export function useSessionRestore(key: string) {
  const getLastSaveTime = useCallback(() => {
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    return timestamp ? new Date(timestamp) : null;
  }, [key]);

  const hasRecentSave = useCallback(() => {
    const lastSave = getLastSaveTime();
    if (!lastSave) return false;

    // Consider "recent" as within the last 24 hours
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastSave > dayAgo;
  }, [getLastSaveTime]);

  return {
    getLastSaveTime,
    hasRecentSave,
  };
}
