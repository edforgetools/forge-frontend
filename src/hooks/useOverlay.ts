import { useCallback, useReducer } from "react";
import { sessionDB, SessionData } from "@/lib/db";
import { HistoryCommand } from "./useHistory";

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

export interface OverlayState {
  items: OverlayItem[];
  selectedId: string | null;
  history: OverlayItem[][];
  historyIndex: number;
}

export type OverlayAction =
  | { type: "SET_ITEMS"; payload: { items: OverlayItem[] } }
  | { type: "SET_SELECTED_ID"; payload: { selectedId: string | null } }
  | { type: "ADD_OVERLAY"; payload: { overlay: OverlayItem } }
  | {
      type: "UPDATE_OVERLAY";
      payload: { id: string; updates: Partial<OverlayItem> };
    }
  | { type: "REMOVE_OVERLAY"; payload: { id: string } }
  | { type: "CLEAR_ALL" }
  | {
      type: "RESTORE_STATE";
      payload: { items: OverlayItem[]; selectedId: string | null };
    }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SAVE_TO_HISTORY"; payload: { items: OverlayItem[] } };

function overlayReducer(
  state: OverlayState,
  action: OverlayAction
): OverlayState {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload.items };
    case "SET_SELECTED_ID":
      return { ...state, selectedId: action.payload.selectedId };
    case "ADD_OVERLAY":
      const newItems = [...state.items, action.payload.overlay];
      const addHistory =
        state.historyIndex === -1
          ? []
          : state.history.slice(0, state.historyIndex + 1);
      addHistory.push([...newItems]);
      return {
        ...state,
        items: newItems,
        history: addHistory,
        historyIndex: addHistory.length - 1,
      };
    case "UPDATE_OVERLAY":
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );
      const updateHistory =
        state.historyIndex === -1
          ? []
          : state.history.slice(0, state.historyIndex + 1);
      updateHistory.push([...updatedItems]);
      return {
        ...state,
        items: updatedItems,
        history: updateHistory,
        historyIndex: updateHistory.length - 1,
      };
    case "REMOVE_OVERLAY":
      const filteredItems = state.items.filter(
        (item) => item.id !== action.payload.id
      );
      const removeHistory =
        state.historyIndex === -1
          ? []
          : state.history.slice(0, state.historyIndex + 1);
      removeHistory.push([...filteredItems]);
      return {
        ...state,
        items: filteredItems,
        selectedId:
          state.selectedId === action.payload.id ? null : state.selectedId,
        history: removeHistory,
        historyIndex: removeHistory.length - 1,
      };
    case "CLEAR_ALL":
      const clearHistory =
        state.historyIndex === -1
          ? []
          : state.history.slice(0, state.historyIndex + 1);
      clearHistory.push([]);
      return {
        ...state,
        items: [],
        selectedId: null,
        history: clearHistory,
        historyIndex: clearHistory.length - 1,
      };
    case "RESTORE_STATE":
      // When restoring state, reset history so we start fresh
      return {
        ...state,
        items: action.payload.items,
        selectedId: action.payload.selectedId,
        history: [],
        historyIndex: -1,
      };
    case "SAVE_TO_HISTORY":
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...action.payload.items]);
      return {
        ...state,
        items: action.payload.items,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    case "UNDO":
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          items: [...state.history[newIndex]],
          historyIndex: newIndex,
        };
      }
      return state;
    case "REDO":
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          items: [...state.history[newIndex]],
          historyIndex: newIndex,
        };
      }
      return state;
    default:
      return state;
  }
}

export interface OverlayActions {
  addOverlay: (type: "logo" | "text", initialContent?: string) => string;
  updateOverlay: (id: string, updates: Partial<OverlayItem>) => void;
  removeOverlay: (id: string) => void;
  selectOverlay: (id: string | null) => void;
  moveOverlay: (id: string, x: number, y: number) => void;
  resizeOverlay: (id: string, width: number, height: number) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  saveSession: () => Promise<void>;
  restoreSession: () => Promise<Partial<SessionData> | null>;
  applyHistoryCommand: (command: HistoryCommand) => void;
  createHistoryCommand: (
    type: string,
    data: any,
    description: string
  ) => HistoryCommand;
}

export function useOverlay(): [OverlayState, OverlayActions] {
  const [state, dispatch] = useReducer(overlayReducer, {
    items: [],
    selectedId: null,
    history: [],
    historyIndex: -1,
  });

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

      dispatch({ type: "ADD_OVERLAY", payload: { overlay: newOverlay } });
      return newOverlay.id;
    },
    []
  );

  const updateOverlay = useCallback(
    (id: string, updates: Partial<OverlayItem>) => {
      dispatch({ type: "UPDATE_OVERLAY", payload: { id, updates } });
    },
    []
  );

  const removeOverlay = useCallback((id: string) => {
    dispatch({ type: "REMOVE_OVERLAY", payload: { id } });
  }, []);

  const selectOverlay = useCallback((id: string | null) => {
    dispatch({ type: "SET_SELECTED_ID", payload: { selectedId: id } });
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

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const saveSession = useCallback(async () => {
    if (!sessionDB.isSessionRestoreEnabled()) return;

    const sessionData: Partial<SessionData> = {
      overlays: state.items,
    };

    await sessionDB.saveSession(sessionData);
  }, [state.items]);

  const restoreSession =
    useCallback(async (): Promise<Partial<SessionData> | null> => {
      if (!sessionDB.isSessionRestoreEnabled()) return null;

      const sessionData = await sessionDB.loadSession();
      if (!sessionData || !sessionData.overlays) return null;

      // Restore overlays
      if (Array.isArray(sessionData.overlays)) {
        dispatch({
          type: "RESTORE_STATE",
          payload: {
            items: sessionData.overlays!,
            selectedId: null,
          },
        });
      }

      return sessionData;
    }, []);

  const applyHistoryCommand = useCallback((command: HistoryCommand) => {
    switch (command.type) {
      case "OVERLAY_ADD":
        dispatch({ type: "ADD_OVERLAY", payload: { overlay: command.data } });
        break;
      case "OVERLAY_UPDATE":
        dispatch({ type: "UPDATE_OVERLAY", payload: command.data });
        break;
      case "OVERLAY_REMOVE":
        dispatch({ type: "REMOVE_OVERLAY", payload: command.data });
        break;
      case "OVERLAY_SELECT":
        dispatch({ type: "SET_SELECTED_ID", payload: command.data });
        break;
      case "OVERLAY_CLEAR_ALL":
        dispatch({ type: "CLEAR_ALL" });
        break;
      case "OVERLAY_RESTORE_STATE":
        dispatch({ type: "RESTORE_STATE", payload: command.data });
        break;
    }
  }, []);

  const createHistoryCommand = useCallback(
    (type: string, data: any, description: string): HistoryCommand => {
      return {
        id: `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        timestamp: Date.now(),
        data,
        description,
      };
    },
    []
  );

  const actions: OverlayActions = {
    addOverlay,
    updateOverlay,
    removeOverlay,
    selectOverlay,
    moveOverlay,
    resizeOverlay,
    toggleVisibility,
    toggleLock,
    clearAll,
    undo,
    redo,
    saveSession,
    restoreSession,
    applyHistoryCommand,
    createHistoryCommand,
  };

  return [state, actions];
}
