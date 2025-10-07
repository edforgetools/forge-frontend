import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type OverlayBase = {
  id: string;
  type: "logo" | "text";
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  z: number;
  locked: boolean;
  hidden: boolean;
  opacity: number;
};

export type LogoOverlay = OverlayBase & {
  type: "logo";
  src: string;
  blend?: GlobalCompositeOperation;
};

export type TextOverlay = OverlayBase & {
  type: "text";
  text: string;
  font: string;
  size: number;
  weight: number;
  letter: number;
  shadow: boolean;
  align: "left" | "center" | "right";
  color: string;
};

export type Crop = {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
};

export type ExportPrefs = {
  format: "jpeg" | "png" | "webp";
  quality: number;
  width: number;
  height: number;
  keepUnderMB: number;
};

export type CanvasPatch = {
  type: "overlay" | "crop" | "image";
  data: any;
  timestamp: number;
};

export type CanvasState = {
  image?: HTMLImageElement | ImageBitmap;
  videoSrc?: string;
  aspect: "16:9";
  crop: Crop;
  overlays: (LogoOverlay | TextOverlay)[];
  selectedId?: string;
  undoStack: any[];
  redoStack: any[];
  prefs: ExportPrefs;
  projectId: string;
};

const defaultCrop: Crop = {
  x: 0,
  y: 0,
  w: 1280,
  h: 720,
  active: false,
};

const defaultPrefs: ExportPrefs = {
  format: "jpeg",
  quality: 0.8,
  width: 1280,
  height: 720,
  keepUnderMB: 2,
};

const defaultState: CanvasState = {
  aspect: "16:9",
  crop: defaultCrop,
  overlays: [],
  undoStack: [],
  redoStack: [],
  prefs: defaultPrefs,
  projectId: `project_${Date.now()}`,
};

export type CanvasActions = {
  setImage: (img?: HTMLImageElement | ImageBitmap) => void;
  setVideo: (src?: string) => void;
  setCrop: (patch: Partial<Crop>) => void;
  setOverlays: (arr: (LogoOverlay | TextOverlay)[]) => void;
  addOverlay: (o: LogoOverlay | TextOverlay) => void;
  updateOverlay: (id: string, patch: Partial<LogoOverlay | TextOverlay>) => void;
  remove: (id: string) => void;
  select: (id?: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  lock: (id: string, v?: boolean) => void;
  hide: (id: string, v?: boolean) => void;
  pushUndo: (p: any) => void;
  undo: () => void;
  redo: () => void;
  setPrefs: (p: Partial<ExportPrefs>) => void;
  resetDefaults: () => void;
  clearProject: () => void;
  duplicateProject: () => void;
};

export type CanvasStore = CanvasState & CanvasActions;

export const useCanvasStore = create<CanvasStore>()(
  devtools(
    (set, get) => ({
      ...defaultState,
      setImage: (img) => {
        if (!img) {
          set({ image: undefined });
          return;
        }
        const newCrop = calculateAutoCrop(img);
        set({
          image: img,
          crop: { ...newCrop, active: true },
          videoSrc: undefined,
        });
      },

      setVideo: (src) => {
        if (!src) {
          set({ videoSrc: undefined });
          return;
        }
        set({
          videoSrc: src,
          image: undefined,
          crop: { ...defaultCrop, active: true },
        });
      },

      setCrop: (patch) => {
        set((state) => ({
          crop: { ...state.crop, ...patch },
        }));
      },

      setOverlays: (arr) => set({ overlays: arr }),

      addOverlay: (o) => {
        const state = get();
        set({
          overlays: [...state.overlays, o],
          selectedId: o.id,
        });
      },

      updateOverlay: (id, patch) => {
        set((state) => ({
          overlays: state.overlays.map((overlay) =>
            overlay.id === id
              ? ({ ...overlay, ...patch } as LogoOverlay | TextOverlay)
              : overlay
          ),
        }));
      },

      select: (id?: string) => {
        set({ selectedId: id });
      },

      bringToFront: (id) => {
        const state = get();
        const maxZ = Math.max(0, ...state.overlays.map(o => o.z ?? 0));
        set({ overlays: state.overlays.map(o => o.id === id ? { ...o, z: maxZ + 1 } : o) });
      },

      sendToBack: (id) => {
        const state = get();
        const minZ = Math.min(0, ...state.overlays.map(o => o.z ?? 0));
        set({ overlays: state.overlays.map(o => o.id === id ? { ...o, z: minZ - 1 } : o) });
      },

      lock: (id, v = true) => {
        set({ overlays: get().overlays.map(o => o.id === id ? { ...o, locked: v } : o) });
      },

      hide: (id, v = true) => {
        set({ overlays: get().overlays.map(o => o.id === id ? { ...o, hidden: v } : o) });
      },

      remove: (id) => {
        const state = get();
        set({
          overlays: state.overlays.filter((o) => o.id !== id),
          selectedId: state.selectedId === id ? undefined : state.selectedId,
        });
      },

      pushUndo: (p) => {
        set((state) => ({
          undoStack: [...state.undoStack, p],
          redoStack: [],
        }));
      },

      undo: () => {
        // Implementation would restore state from patch
        // This is a simplified version
      },

      redo: () => {
        // Implementation would restore state from patch
        // This is a simplified version
      },

      setPrefs: (p) => {
        set((state) => ({
          prefs: { ...state.prefs, ...p },
        }));
      },

      resetDefaults: () => {
        set({
          ...defaultState,
          projectId: get().projectId,
        });
      },

      clearProject: () => {
        set({
          ...defaultState,
          projectId: crypto?.randomUUID?.() ?? 'project',
        });
      },

      duplicateProject: () => {
        set({
          projectId: crypto?.randomUUID?.() ?? 'project',
        });
      },
    }),
    { name: "canvas-store" }
  )
);

// Convenience export used by components: { canvasActions }.
export const canvasActions: CanvasActions = {
  setImage: (v) => useCanvasStore.getState().setImage(v),
  setVideo: (v) => useCanvasStore.getState().setVideo(v),
  setCrop: (v) => useCanvasStore.getState().setCrop(v),
  setOverlays: (v) => useCanvasStore.getState().setOverlays(v),
  addOverlay: (v) => useCanvasStore.getState().addOverlay(v),
  updateOverlay: (id, patch) => useCanvasStore.getState().updateOverlay(id, patch),
  remove: (id) => useCanvasStore.getState().remove(id),
  select: (id) => useCanvasStore.getState().select(id),
  bringToFront: (id) => useCanvasStore.getState().bringToFront(id),
  sendToBack: (id) => useCanvasStore.getState().sendToBack(id),
  lock: (id, v) => useCanvasStore.getState().lock(id, v),
  hide: (id, v) => useCanvasStore.getState().hide(id, v),
  pushUndo: (p) => useCanvasStore.getState().pushUndo(p),
  undo: () => useCanvasStore.getState().undo(),
  redo: () => useCanvasStore.getState().redo(),
  setPrefs: (p) => useCanvasStore.getState().setPrefs(p),
  resetDefaults: () => useCanvasStore.getState().resetDefaults(),
  clearProject: () => useCanvasStore.getState().clearProject(),
  duplicateProject: () => useCanvasStore.getState().duplicateProject(),
};

function calculateAutoCrop(image: HTMLImageElement | ImageBitmap): Crop {
  const imgWidth = image.width;
  const imgHeight = image.height;
  const targetRatio = 16 / 9;

  let cropWidth = imgWidth;
  let cropHeight = imgHeight;
  let cropX = 0;
  let cropY = 0;

  const currentRatio = imgWidth / imgHeight;

  if (currentRatio > targetRatio) {
    // Image is wider than 16:9, crop width
    cropWidth = imgHeight * targetRatio;
    cropX = (imgWidth - cropWidth) / 2;
  } else if (currentRatio < targetRatio) {
    // Image is taller than 16:9, crop height
    cropHeight = imgWidth / targetRatio;
    cropY = (imgHeight - cropHeight) / 2;
  }

  return {
    x: cropX,
    y: cropY,
    w: cropWidth,
    h: cropHeight,
    active: true,
  };
}
