import { create } from "zustand";
export const useEditorStore = create((set, get) => ({
    capturedFrame: null,
    setCapturedFrame: (dataUrl) => {
        set({ capturedFrame: dataUrl });
        get().pushHistory();
    },
    crop: null,
    setCrop: (r) => {
        set({ crop: r });
        get().pushHistory();
    },
    overlays: [],
    addOverlay: (o) => {
        set((s) => ({ overlays: [...s.overlays, o] }));
        get().pushHistory();
    },
    removeOverlay: (id) => {
        set((s) => ({ overlays: s.overlays.filter((o) => o.id !== id) }));
        get().pushHistory();
    },
    updateOverlay: (id, updates) => {
        set((s) => ({
            overlays: s.overlays.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        }));
        get().pushHistory();
    },
    setOverlayOpacity: (id, opacity) => {
        set((s) => ({
            overlays: s.overlays.map((o) => (o.id === id ? { ...o, opacity } : o)),
        }));
        get().pushHistory();
    },
    moveOverlay: (id, x, y) => {
        set((s) => ({
            overlays: s.overlays.map((o) => (o.id === id ? { ...o, x, y } : o)),
        }));
        get().pushHistory();
    },
    resizeOverlay: (id, w, h) => {
        set((s) => ({
            overlays: s.overlays.map((o) => (o.id === id ? { ...o, w, h } : o)),
        }));
        get().pushHistory();
    },
    selection: null,
    setSelection: (id) => set({ selection: id }),
    // Undo/Redo functionality
    history: [],
    historyIndex: -1,
    canUndo: false,
    canRedo: false,
    pushHistory: () => {
        const state = get();
        const currentState = {
            capturedFrame: state.capturedFrame,
            crop: state.crop,
            overlays: [...state.overlays],
        };
        // Remove any states after current index (when branching from history)
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(currentState);
        // Trim history if it exceeds max size (50)
        if (newHistory.length > 50) {
            newHistory.shift();
        }
        set({
            history: newHistory,
            historyIndex: newHistory.length - 1,
            canUndo: newHistory.length > 1,
            canRedo: false,
        });
    },
    undo: () => {
        const state = get();
        if (!state.canUndo)
            return;
        const newIndex = state.historyIndex - 1;
        const previousState = state.history[newIndex];
        set({
            historyIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: true,
            capturedFrame: previousState.capturedFrame,
            crop: previousState.crop,
            overlays: [...previousState.overlays],
        });
    },
    redo: () => {
        const state = get();
        if (!state.canRedo)
            return;
        const newIndex = state.historyIndex + 1;
        const nextState = state.history[newIndex];
        set({
            historyIndex: newIndex,
            canUndo: true,
            canRedo: newIndex < state.history.length - 1,
            capturedFrame: nextState.capturedFrame,
            crop: nextState.crop,
            overlays: [...nextState.overlays],
        });
    },
    clearHistory: () => {
        set({
            history: [],
            historyIndex: -1,
            canUndo: false,
            canRedo: false,
        });
    },
}));
