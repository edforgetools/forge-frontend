import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type EditorMode = "edit" | "preview" | "export";

export type EditorView = "desktop" | "mobile" | "tablet";

export type EditorState = {
  // Editor mode and view
  mode: EditorMode;
  view: EditorView;

  // UI state
  isLoading: boolean;
  isDirty: boolean;
  lastSaved?: number;

  // Editor-specific settings
  showRulers: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
  gridSize: number;

  // Performance settings
  enableAnimations: boolean;
  enableTransitions: boolean;

  // Editor history
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
};

export type EditorActions = {
  // Mode and view actions
  setMode: (mode: EditorMode) => void;
  setView: (view: EditorView) => void;

  // UI state actions
  setLoading: (loading: boolean) => void;
  setDirty: (dirty: boolean) => void;
  markSaved: () => void;

  // Editor settings actions
  setShowRulers: (show: boolean) => void;
  setShowGuides: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;

  // Performance actions
  setEnableAnimations: (enable: boolean) => void;
  setEnableTransitions: (enable: boolean) => void;

  // History actions
  setHistoryIndex: (index: number) => void;
  setCanUndo: (canUndo: boolean) => void;
  setCanRedo: (canRedo: boolean) => void;

  // Reset actions
  resetEditor: () => void;
};

export type EditorStore = EditorState & EditorActions;

const defaultState: EditorState = {
  mode: "edit",
  view: "desktop",
  isLoading: false,
  isDirty: false,
  lastSaved: undefined,
  showRulers: false,
  showGuides: false,
  snapToGrid: false,
  gridSize: 20,
  enableAnimations: true,
  enableTransitions: true,
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
};

export const useEditorStore = create<EditorStore>()(
  devtools(
    (set, get) => ({
      ...defaultState,

      // Mode and view actions
      setMode: (mode) => {
        set({ mode });
      },

      setView: (view) => {
        set({ view });
      },

      // UI state actions
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setDirty: (dirty) => {
        set({ isDirty: dirty });
      },

      markSaved: () => {
        set({
          isDirty: false,
          lastSaved: Date.now(),
        });
      },

      // Editor settings actions
      setShowRulers: (show) => {
        set({ showRulers: show });
      },

      setShowGuides: (show) => {
        set({ showGuides: show });
      },

      setSnapToGrid: (snap) => {
        set({ snapToGrid: snap });
      },

      setGridSize: (size) => {
        set({ gridSize: Math.max(5, Math.min(100, size)) });
      },

      // Performance actions
      setEnableAnimations: (enable) => {
        set({ enableAnimations: enable });
      },

      setEnableTransitions: (enable) => {
        set({ enableTransitions: enable });
      },

      // History actions
      setHistoryIndex: (index) => {
        set({ historyIndex: index });
      },

      setCanUndo: (canUndo) => {
        set({ canUndo });
      },

      setCanRedo: (canRedo) => {
        set({ canRedo });
      },

      // Reset actions
      resetEditor: () => {
        set({
          ...defaultState,
          // Preserve some settings that shouldn't reset
          enableAnimations: get().enableAnimations,
          enableTransitions: get().enableTransitions,
        });
      },
    }),
    { name: "editor-store" }
  )
);

// Convenience exports for easy access
export const editorActions = {
  setMode: (mode: EditorMode) => useEditorStore.getState().setMode(mode),
  setView: (view: EditorView) => useEditorStore.getState().setView(view),

  setLoading: (loading: boolean) =>
    useEditorStore.getState().setLoading(loading),
  setDirty: (dirty: boolean) => useEditorStore.getState().setDirty(dirty),
  markSaved: () => useEditorStore.getState().markSaved(),

  setShowRulers: (show: boolean) =>
    useEditorStore.getState().setShowRulers(show),
  setShowGuides: (show: boolean) =>
    useEditorStore.getState().setShowGuides(show),
  setSnapToGrid: (snap: boolean) =>
    useEditorStore.getState().setSnapToGrid(snap),
  setGridSize: (size: number) => useEditorStore.getState().setGridSize(size),

  setEnableAnimations: (enable: boolean) =>
    useEditorStore.getState().setEnableAnimations(enable),
  setEnableTransitions: (enable: boolean) =>
    useEditorStore.getState().setEnableTransitions(enable),

  setHistoryIndex: (index: number) =>
    useEditorStore.getState().setHistoryIndex(index),
  setCanUndo: (canUndo: boolean) =>
    useEditorStore.getState().setCanUndo(canUndo),
  setCanRedo: (canRedo: boolean) =>
    useEditorStore.getState().setCanRedo(canRedo),

  resetEditor: () => useEditorStore.getState().resetEditor(),
};
