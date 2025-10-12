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
};

export type EditorActions = {
  // Mode and view actions
  setMode: (mode: EditorMode) => void;
  setView: (view: EditorView) => void;

  // UI state actions
  setLoading: (loading: boolean) => void;
  setDirty: (dirty: boolean) => void;
  markSaved: () => void;

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
};

export const useEditorStore = create<EditorStore>()(
  devtools(
    (set) => ({
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

      // Reset actions
      resetEditor: () => {
        set({
          ...defaultState,
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

  resetEditor: () => useEditorStore.getState().resetEditor(),
};
