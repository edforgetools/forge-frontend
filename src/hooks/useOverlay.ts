import { useState, useCallback } from "react";

export interface OverlayItem {
  id: string;
  type: "logo" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  visible: boolean;
  locked: boolean;
}

interface OverlayState {
  items: OverlayItem[];
  selectedId: string | null;
  history: OverlayItem[][];
  historyIndex: number;
}

interface OverlayActions {
  addOverlay: (type: "logo" | "text", initialContent?: string) => string;
  updateOverlay: (id: string, updates: Partial<OverlayItem>) => void;
  removeOverlay: (id: string) => void;
  selectOverlay: (id: string | null) => void;
  moveOverlay: (id: string, x: number, y: number) => void;
  resizeOverlay: (id: string, width: number, height: number) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
}

export function useOverlay(): [OverlayState, OverlayActions] {
  const [state, setState] = useState<OverlayState>({
    items: [],
    selectedId: null,
    history: [[]],
    historyIndex: 0,
  });

  const saveToHistory = useCallback((newItems: OverlayItem[]) => {
    setState((prev) => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...newItems]);
      return {
        ...prev,
        items: newItems,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const addOverlay = useCallback(
    (type: "logo" | "text", initialContent?: string): string => {
      const newOverlay: OverlayItem = {
        id: `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        x: 50,
        y: 50,
        width: type === "logo" ? 100 : 200,
        height: type === "logo" ? 100 : 40,
        content:
          initialContent || (type === "text" ? "Your Text Here" : "LOGO"),
        visible: true,
        locked: false,
      };

      const newItems = [...state.items, newOverlay];
      saveToHistory(newItems);
      return newOverlay.id;
    },
    [state.items, saveToHistory]
  );

  const updateOverlay = useCallback(
    (id: string, updates: Partial<OverlayItem>) => {
      const newItems = state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      saveToHistory(newItems);
    },
    [state.items, saveToHistory]
  );

  const removeOverlay = useCallback(
    (id: string) => {
      const newItems = state.items.filter((item) => item.id !== id);
      saveToHistory(newItems);

      if (state.selectedId === id) {
        setState((prev) => ({ ...prev, selectedId: null }));
      }
    },
    [state.items, state.selectedId, saveToHistory]
  );

  const selectOverlay = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedId: id }));
  }, []);

  const moveOverlay = useCallback(
    (id: string, x: number, y: number) => {
      updateOverlay(id, { x, y });
    },
    [updateOverlay]
  );

  const resizeOverlay = useCallback(
    (id: string, width: number, height: number) => {
      updateOverlay(id, { width, height });
    },
    [updateOverlay]
  );

  const toggleVisibility = useCallback(
    (id: string) => {
      const overlay = state.items.find((item) => item.id === id);
      if (overlay) {
        updateOverlay(id, { visible: !overlay.visible });
      }
    },
    [state.items, updateOverlay]
  );

  const toggleLock = useCallback(
    (id: string) => {
      const overlay = state.items.find((item) => item.id === id);
      if (overlay) {
        updateOverlay(id, { locked: !overlay.locked });
      }
    },
    [state.items, updateOverlay]
  );

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          items: [...prev.history[newIndex]],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          items: [...prev.history[newIndex]],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const clearAll = useCallback(() => {
    saveToHistory([]);
    setState((prev) => ({ ...prev, selectedId: null }));
  }, [saveToHistory]);

  const actions: OverlayActions = {
    addOverlay,
    updateOverlay,
    removeOverlay,
    selectOverlay,
    moveOverlay,
    resizeOverlay,
    toggleVisibility,
    toggleLock,
    undo,
    redo,
    clearAll,
  };

  return [state, actions];
}
