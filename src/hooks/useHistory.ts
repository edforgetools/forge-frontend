import { useState, useCallback, useRef } from "react";

export interface HistoryCommand {
  id: string;
  type: string;
  timestamp: number;
  data: any;
  description: string;
}

export interface HistoryState {
  commands: HistoryCommand[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}

export interface HistoryActions {
  pushCommand: (command: Omit<HistoryCommand, "id" | "timestamp">) => void;
  undo: () => HistoryCommand | null;
  redo: () => HistoryCommand | null;
  clear: () => void;
  getCurrentCommand: () => HistoryCommand | null;
  getPreviousCommand: () => HistoryCommand | null;
  getNextCommand: () => HistoryCommand | null;
}

const MAX_HISTORY_SIZE = 50;

export function useHistory(): [HistoryState, HistoryActions] {
  const [state, setState] = useState<HistoryState>({
    commands: [],
    currentIndex: -1,
    canUndo: false,
    canRedo: false,
  });

  const commandIdCounter = useRef(0);

  const generateCommandId = useCallback(() => {
    return `cmd-${Date.now()}-${++commandIdCounter.current}`;
  }, []);

  const pushCommand = useCallback(
    (command: Omit<HistoryCommand, "id" | "timestamp">) => {
      const newCommand: HistoryCommand = {
        ...command,
        id: generateCommandId(),
        timestamp: Date.now(),
      };

      setState((prev) => {
        // Remove any commands after current index (when branching)
        const newCommands = prev.commands.slice(0, prev.currentIndex + 1);

        // Add new command
        newCommands.push(newCommand);

        // Limit history size
        const limitedCommands = newCommands.slice(-MAX_HISTORY_SIZE);

        const newIndex = limitedCommands.length - 1;

        const newState = {
          commands: limitedCommands,
          currentIndex: newIndex,
          canUndo: newIndex >= 0,
          canRedo: false, // Can't redo after new command
        };
        return newState;
      });
    },
    [generateCommandId]
  );

  const undo = useCallback((): HistoryCommand | null => {
    let result: HistoryCommand | null = null;

    setState((prev) => {
      if (prev.currentIndex > 0) {
        const newIndex = prev.currentIndex - 1;
        result = prev.commands[newIndex];

        return {
          ...prev,
          currentIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: true,
        };
      }
      return prev;
    });

    return result;
  }, []);

  const redo = useCallback((): HistoryCommand | null => {
    let result: HistoryCommand | null = null;

    setState((prev) => {
      if (prev.currentIndex < prev.commands.length - 1) {
        const newIndex = prev.currentIndex + 1;
        result = prev.commands[newIndex];

        return {
          ...prev,
          currentIndex: newIndex,
          canUndo: true,
          canRedo: newIndex < prev.commands.length - 1,
        };
      }
      return prev;
    });

    return result;
  }, []);

  const clear = useCallback(() => {
    setState({
      commands: [],
      currentIndex: -1,
      canUndo: false,
      canRedo: false,
    });
  }, []);

  const getCurrentCommand = useCallback((): HistoryCommand | null => {
    return state.commands[state.currentIndex] || null;
  }, [state.commands, state.currentIndex]);

  const getPreviousCommand = useCallback((): HistoryCommand | null => {
    return state.currentIndex > 0
      ? state.commands[state.currentIndex - 1]
      : null;
  }, [state.commands, state.currentIndex]);

  const getNextCommand = useCallback((): HistoryCommand | null => {
    return state.currentIndex < state.commands.length - 1
      ? state.commands[state.currentIndex + 1]
      : null;
  }, [state.commands, state.currentIndex]);

  const actions: HistoryActions = {
    pushCommand,
    undo,
    redo,
    clear,
    getCurrentCommand,
    getPreviousCommand,
    getNextCommand,
  };

  return [state, actions];
}
