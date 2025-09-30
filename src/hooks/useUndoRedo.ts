import { useCallback, useRef, useState, useEffect } from "react";

export interface UndoRedoState<T = any> {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushState: (state: T) => void;
  clear: () => void;
  getCurrentState: () => T | null;
}

export function useUndoRedo<T = any>(
  maxHistory: number = 50
): UndoRedoState<T> {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const historyRef = useRef<T[]>([]);

  const canUndo = currentIndex > 0;
  const canRedo =
    currentIndex >= 0 && currentIndex < historyRef.current.length - 1;

  const pushState = useCallback(
    (state: T) => {
      // Remove any states after current index (when branching from history)
      if (currentIndex >= 0 && currentIndex < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, currentIndex + 1);
      }

      // Add new state
      historyRef.current.push(state);

      // Trim history if it exceeds max size
      if (historyRef.current.length > maxHistory) {
        historyRef.current.shift();
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentIndex, maxHistory]
  );

  const undo = useCallback(() => {
    if (!canUndo) return;
    setCurrentIndex((prev) => prev - 1);
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    setCurrentIndex((prev) => prev + 1);
  }, [canRedo]);

  const clear = useCallback(() => {
    historyRef.current = [];
    setCurrentIndex(-1);
  }, []);

  const getCurrentState = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < historyRef.current.length) {
      return historyRef.current[currentIndex];
    }
    return null;
  }, [currentIndex]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    clear,
    getCurrentState,
  };
}

export function useUndoRedoWithState<T>(
  initialState: T,
  maxHistory: number = 50
): [T, (newState: T) => void, UndoRedoState] {
  const [state, setState] = useState<T>(initialState);
  const undoRedo = useUndoRedo<T>(maxHistory);

  const updateState = useCallback(
    (newState: T) => {
      setState(newState);
      undoRedo.pushState(newState);
    },
    [undoRedo]
  );

  // Apply state from history when undo/redo is called
  useEffect(() => {
    const currentState = undoRedo.getCurrentState();
    if (currentState !== null) {
      setState(currentState);
    }
  }, [undoRedo]);

  return [state, updateState, undoRedo];
}
