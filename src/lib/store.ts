import { create } from 'zustand'
import type { Overlay } from '@/features/overlay/overlayTypes'
import type { Rect } from '@/features/crop/cropMath'

interface EditorState {
  capturedFrame: string | null
  setCapturedFrame: (dataUrl: string) => void

  crop: Rect | null
  setCrop: (r: Rect) => void

  overlays: Overlay[]
  addOverlay: (o: Overlay) => void
  setOverlayOpacity: (id: string, opacity: number) => void

  selection: string | null
  setSelection: (id: string | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  capturedFrame: null,
  setCapturedFrame: (dataUrl) => set({ capturedFrame: dataUrl }),

  crop: null,
  setCrop: (r) => set({ crop: r }),

  overlays: [],
  addOverlay: (o) => set((s) => ({ overlays: [...s.overlays, o] })),
  setOverlayOpacity: (id, opacity) =>
    set((s) => ({
      overlays: s.overlays.map((o) => (o.id === id ? { ...o, opacity } : o)),
    })),

  selection: null,
  setSelection: (id) => set({ selection: id }),
}))
