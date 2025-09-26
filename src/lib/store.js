import { create } from 'zustand';
export const useEditorStore = create((set) => ({
    capturedFrame: null,
    setCapturedFrame: (dataUrl) => set({ capturedFrame: dataUrl }),
    crop: null,
    setCrop: (r) => set({ crop: r }),
    overlays: [],
    addOverlay: (o) => set((s) => ({ overlays: [...s.overlays, o] })),
    setOverlayOpacity: (id, opacity) => set((s) => ({
        overlays: s.overlays.map((o) => (o.id === id ? { ...o, opacity } : o)),
    })),
    selection: null,
    setSelection: (id) => set({ selection: id }),
}));
