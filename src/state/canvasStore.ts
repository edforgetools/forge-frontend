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
  undo: CanvasPatch[];
  redo: CanvasPatch[];
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
  undo: [],
  redo: [],
  prefs: defaultPrefs,
  projectId: `project_${Date.now()}`,
};

export type CanvasActions = {
  setImage: (image: HTMLImageElement | ImageBitmap) => void;
  setVideo: (videoSrc: string) => void;
  setCrop: (crop: Partial<Crop>) => void;
  addOverlay: (overlay: Omit<LogoOverlay | TextOverlay, "id" | "z">) => void;
  updateOverlay: (
    id: string,
    updates: Partial<LogoOverlay | TextOverlay>
  ) => void;
  select: (id?: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  lock: (id: string) => void;
  hide: (id: string) => void;
  remove: (id: string) => void;
  pushUndo: (patch: CanvasPatch) => void;
  undoAction: () => void;
  redoAction: () => void;
  setPrefs: (prefs: Partial<ExportPrefs>) => void;
  resetDefaults: () => void;
  clearProject: () => void;
  duplicateProject: () => void;
};

export type CanvasStore = CanvasState & CanvasActions;

export const useCanvasStore = create<CanvasStore>()(
  devtools(
    (set, get) => ({
      ...defaultState,
      setImage: (image: HTMLImageElement | ImageBitmap) => {
        const newCrop = calculateAutoCrop(image);

        set({
          image,
          crop: { ...newCrop, active: true },
          videoSrc: undefined,
        });
      },

      setVideo: (videoSrc: string) => {
        set({
          videoSrc,
          image: undefined,
          crop: { ...defaultCrop, active: true },
        });
      },

      setCrop: (crop: Partial<Crop>) => {
        set((state) => ({
          crop: { ...state.crop, ...crop },
        }));
      },

      addOverlay: (overlay: Omit<LogoOverlay | TextOverlay, "id" | "z">) => {
        const state = get();
        const maxZ = state.overlays.reduce((max, o) => Math.max(max, o.z), 0);

        const newOverlay = {
          ...overlay,
          id: `overlay_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          z: maxZ + 1,
        } as LogoOverlay | TextOverlay;

        set({
          overlays: [...state.overlays, newOverlay],
          selectedId: newOverlay.id,
        });
      },

      updateOverlay: (
        id: string,
        updates: Partial<LogoOverlay | TextOverlay>
      ) => {
        set((state) => ({
          overlays: state.overlays.map((overlay) =>
            overlay.id === id
              ? ({ ...overlay, ...updates } as LogoOverlay | TextOverlay)
              : overlay
          ),
        }));
      },

      select: (id?: string) => {
        set({ selectedId: id });
      },

      bringToFront: (id: string) => {
        const state = get();
        const overlay = state.overlays.find((o) => o.id === id);
        if (!overlay) return;

        const maxZ = state.overlays.reduce((max, o) => Math.max(max, o.z), 0);
        get().updateOverlay(id, { z: maxZ + 1 });
      },

      sendToBack: (id: string) => {
        const state = get();
        const overlay = state.overlays.find((o) => o.id === id);
        if (!overlay) return;

        const minZ = state.overlays.reduce((min, o) => Math.min(min, o.z), 0);
        get().updateOverlay(id, { z: minZ - 1 });
      },

      lock: (id: string) => {
        get().updateOverlay(id, { locked: true });
      },

      hide: (id: string) => {
        get().updateOverlay(id, { hidden: true });
      },

      remove: (id: string) => {
        const state = get();
        set({
          overlays: state.overlays.filter((o) => o.id !== id),
          selectedId: state.selectedId === id ? undefined : state.selectedId,
        });
      },

      pushUndo: (patch: CanvasPatch) => {
        set((state) => ({
          undo: [...state.undo, patch].slice(-50), // Keep last 50 patches
          redo: [], // Clear redo when new action is performed
        }));
      },

      undoAction: () => {
        set((state) => {
          if (state.undo.length === 0) return state;

          const lastPatch = state.undo[state.undo.length - 1];
          // Implementation would restore state from patch
          // This is a simplified version

          return {
            ...state,
            undo: state.undo.slice(0, -1),
            redo: [...state.redo, lastPatch],
          };
        });
      },

      redoAction: () => {
        set((state) => {
          if (state.redo.length === 0) return state;

          const nextPatch = state.redo[state.redo.length - 1];
          // Implementation would restore state from patch
          // This is a simplified version

          return {
            ...state,
            undo: [...state.undo, nextPatch],
            redo: state.redo.slice(0, -1),
          };
        });
      },

      setPrefs: (prefs: Partial<ExportPrefs>) => {
        set((state) => ({
          prefs: { ...state.prefs, ...prefs },
        }));
      },

      resetDefaults: () => {
        set({
          ...defaultState,
          projectId: `project_${Date.now()}`,
        });
      },

      clearProject: () => {
        set({
          image: undefined,
          videoSrc: undefined,
          overlays: [],
          selectedId: undefined,
          crop: defaultCrop,
        });
      },

      duplicateProject: () => {
        const state = get();
        set({
          ...state,
          projectId: `project_${Date.now()}`,
          selectedId: undefined,
        });
      },
    }),
    { name: "canvas-store" }
  )
);

// Actions are now part of the store itself

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
