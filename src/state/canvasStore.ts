import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { track } from "@vercel/analytics";
import { sendTelemetry } from "@/lib/telemetry";

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
  description?: string;
};

export type AspectRatio = "16:9" | "1:1" | "9:16";

export type CanvasState = {
  image?: HTMLImageElement | ImageBitmap;
  videoSrc?: string;
  aspect: AspectRatio;
  crop: Crop;
  overlays: (LogoOverlay | TextOverlay)[];
  selectedId?: string;
  undoStack: any[];
  redoStack: any[];
  prefs: ExportPrefs;
  projectId: string;
  // New toolbar states
  zoom: number;
  showGrid: boolean;
  showSafeZone: boolean;
  // Pro tier state
  isPro: boolean;
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
  // New toolbar defaults
  zoom: 1,
  showGrid: false,
  showSafeZone: false,
  // Pro tier defaults
  isPro: false,
};

export type CanvasActions = {
  setImage: (img?: HTMLImageElement | ImageBitmap) => void;
  setVideo: (src?: string) => void;
  setCrop: (patch: Partial<Crop>) => void;
  toggleCrop: () => void;
  setOverlays: (arr: (LogoOverlay | TextOverlay)[]) => void;
  addOverlay: (overlay: Omit<LogoOverlay | TextOverlay, "id" | "z">) => void;
  updateOverlay: (
    id: string,
    patch: Partial<LogoOverlay | TextOverlay>
  ) => void;
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
  // New toolbar actions
  setAspectRatio: (ratio: AspectRatio) => void;
  setZoom: (zoom: number) => void;
  setZoomPreset: (preset: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  toggleGrid: () => void;
  toggleSafeZone: () => void;
  // Pro tier actions
  setIsPro: (isPro: boolean) => void;
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

      toggleCrop: () => {
        set((state) => ({
          crop: { ...state.crop, active: !state.crop.active },
        }));
      },

      setOverlays: (arr) => set({ overlays: arr }),

      addOverlay: (overlay) => {
        const state = get();
        const maxZ = state.overlays.reduce((max, o) => Math.max(max, o.z), 0);

        const newOverlay = {
          ...overlay,
          id: `overlay_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          z: maxZ + 1,
        } as LogoOverlay | TextOverlay;

        // Push undo state
        get().pushUndo({
          type: "overlay",
          data: [...state.overlays],
          timestamp: Date.now(),
          description: `Add ${overlay.type} overlay`,
        });

        // Track telemetry
        track("overlay_add", {
          type: overlay.type,
          overlayId: newOverlay.id,
        });

        // Send custom telemetry
        sendTelemetry("onOverlayAdd", {
          type: overlay.type,
          overlayId: newOverlay.id,
        });

        set({
          overlays: [...state.overlays, newOverlay],
          selectedId: newOverlay.id,
        });
      },

      updateOverlay: (id, patch) => {
        const state = get();
        const overlay = state.overlays.find((o) => o.id === id);

        // Push undo state for significant changes
        if (
          overlay &&
          ((patch as Record<string, unknown>).text !== undefined ||
            patch.x !== undefined ||
            patch.y !== undefined)
        ) {
          get().pushUndo({
            type: "overlay",
            data: [...state.overlays],
            timestamp: Date.now(),
            description: `Edit ${overlay.type} overlay`,
          });
        }

        // Track telemetry for text overlay edits
        if (overlay?.type === "text") {
          track("text_overlay_edit", {
            overlayId: id,
            properties: Object.keys(patch).join(","),
          });
        }

        // Send custom telemetry for overlay edits
        if (overlay) {
          sendTelemetry("onOverlayEdit", {
            type: overlay.type,
            overlayId: id,
            properties: Object.keys(patch),
          });
        }

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
        const maxZ = Math.max(0, ...state.overlays.map((o) => o.z ?? 0));
        set({
          overlays: state.overlays.map((o) =>
            o.id === id ? { ...o, z: maxZ + 1 } : o
          ),
        });
      },

      sendToBack: (id) => {
        const state = get();
        const minZ = Math.min(0, ...state.overlays.map((o) => o.z ?? 0));
        set({
          overlays: state.overlays.map((o) =>
            o.id === id ? { ...o, z: minZ - 1 } : o
          ),
        });
      },

      lock: (id, v = true) => {
        set({
          overlays: get().overlays.map((o) =>
            o.id === id ? { ...o, locked: v } : o
          ),
        });
      },

      hide: (id, v = true) => {
        set({
          overlays: get().overlays.map((o) =>
            o.id === id ? { ...o, hidden: v } : o
          ),
        });
      },

      remove: (id) => {
        const state = get();
        const overlay = state.overlays.find((o) => o.id === id);

        // Push undo state
        if (overlay) {
          get().pushUndo({
            type: "overlay",
            data: [...state.overlays],
            timestamp: Date.now(),
            description: `Remove ${overlay.type} overlay`,
          });

          // Track telemetry
          track("overlay_remove", {
            type: overlay.type,
            overlayId: id,
          });
        }

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
        const state = get();
        if (state.undoStack.length === 0) return;

        const lastPatch = state.undoStack[state.undoStack.length - 1];
        const newUndoStack = state.undoStack.slice(0, -1);
        const newRedoStack = [
          ...state.redoStack,
          {
            type: lastPatch.type,
            data:
              lastPatch.type === "overlay"
                ? state.overlays
                : lastPatch.type === "crop"
                  ? state.crop
                  : state.image,
            timestamp: Date.now(),
          },
        ];

        // Apply the undo
        if (lastPatch.type === "overlay") {
          set({
            overlays: lastPatch.data,
            undoStack: newUndoStack,
            redoStack: newRedoStack,
          });
        } else if (lastPatch.type === "crop") {
          set({
            crop: lastPatch.data,
            undoStack: newUndoStack,
            redoStack: newRedoStack,
          });
        } else if (lastPatch.type === "image") {
          set({
            image: lastPatch.data,
            undoStack: newUndoStack,
            redoStack: newRedoStack,
          });
        }

        // Track telemetry
        track("undo_action", {
          type: lastPatch.type,
          description: lastPatch.description,
        });
      },

      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return;

        const nextPatch = state.redoStack[state.redoStack.length - 1];
        const newRedoStack = state.redoStack.slice(0, -1);
        const newUndoStack = [
          ...state.undoStack,
          {
            type: nextPatch.type,
            data:
              nextPatch.type === "overlay"
                ? state.overlays
                : nextPatch.type === "crop"
                  ? state.crop
                  : state.image,
            timestamp: Date.now(),
          },
        ];

        // Apply the redo
        if (nextPatch.type === "overlay") {
          set({
            overlays: nextPatch.data,
            undoStack: newUndoStack,
            redoStack: newRedoStack,
          });
        } else if (nextPatch.type === "crop") {
          set({
            crop: nextPatch.data,
            undoStack: newUndoStack,
            redoStack: newRedoStack,
          });
        } else if (nextPatch.type === "image") {
          set({
            image: nextPatch.data,
            undoStack: newUndoStack,
            redoStack: newRedoStack,
          });
        }

        // Track telemetry
        track("redo_action", {
          type: nextPatch.type,
          description: nextPatch.description,
        });
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
          projectId: crypto?.randomUUID?.() ?? "project",
        });
      },

      duplicateProject: () => {
        set({
          projectId: crypto?.randomUUID?.() ?? "project",
        });
      },

      // New toolbar actions
      setAspectRatio: (ratio) => {
        const state = get();
        const newCrop = calculateCropForRatio(state.image, ratio);
        const dimensions = getDimensionsForRatio(ratio);

        // Send telemetry for ratio change
        sendTelemetry("onRatioChange", {
          ratio,
          previousRatio: state.aspect,
          dimensions,
        });

        set({
          aspect: ratio,
          crop: { ...newCrop, active: true },
          prefs: {
            ...state.prefs,
            width: dimensions.width,
            height: dimensions.height,
          },
        });
      },

      setZoom: (zoom) => {
        set({ zoom: Math.max(0.5, Math.min(2, zoom)) });
      },

      setZoomPreset: (preset) => {
        const validPresets = [0.5, 0.75, 1, 1.5, 2];
        if (validPresets.includes(preset)) {
          set({ zoom: preset });
        }
      },

      zoomIn: () => {
        const state = get();
        const newZoom = Math.min(2, state.zoom * 1.2);
        set({ zoom: newZoom });
      },

      zoomOut: () => {
        const state = get();
        const newZoom = Math.max(0.5, state.zoom / 1.2);
        set({ zoom: newZoom });
      },

      resetView: () => {
        set({ zoom: 1 });
      },

      toggleGrid: () => {
        set((state) => ({ showGrid: !state.showGrid }));
      },

      toggleSafeZone: () => {
        set((state) => ({ showSafeZone: !state.showSafeZone }));
      },

      // Pro tier actions
      setIsPro: (isPro) => {
        set({ isPro });
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
  toggleCrop: () => useCanvasStore.getState().toggleCrop(),
  setOverlays: (v) => useCanvasStore.getState().setOverlays(v),
  addOverlay: (overlay) => useCanvasStore.getState().addOverlay(overlay),
  updateOverlay: (id, patch) =>
    useCanvasStore.getState().updateOverlay(id, patch),
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
  // New toolbar actions
  setAspectRatio: (ratio) => useCanvasStore.getState().setAspectRatio(ratio),
  setZoom: (zoom) => useCanvasStore.getState().setZoom(zoom),
  setZoomPreset: (preset) => useCanvasStore.getState().setZoomPreset(preset),
  zoomIn: () => useCanvasStore.getState().zoomIn(),
  zoomOut: () => useCanvasStore.getState().zoomOut(),
  resetView: () => useCanvasStore.getState().resetView(),
  toggleGrid: () => useCanvasStore.getState().toggleGrid(),
  toggleSafeZone: () => useCanvasStore.getState().toggleSafeZone(),
  // Pro tier actions
  setIsPro: (isPro) => useCanvasStore.getState().setIsPro(isPro),
};

function calculateAutoCrop(image: HTMLImageElement | ImageBitmap): Crop {
  return calculateCropForRatio(image, "16:9");
}

function calculateCropForRatio(
  image: HTMLImageElement | ImageBitmap | undefined,
  ratio: AspectRatio
): Crop {
  if (!image) {
    // Default dimensions based on ratio
    const dimensions = getDimensionsForRatio(ratio);
    return {
      x: 0,
      y: 0,
      w: dimensions.width,
      h: dimensions.height,
      active: true,
    };
  }

  const imgWidth = image.width;
  const imgHeight = image.height;
  const targetRatio = getRatioValue(ratio);

  let cropWidth = imgWidth;
  let cropHeight = imgHeight;
  let cropX = 0;
  let cropY = 0;

  const currentRatio = imgWidth / imgHeight;

  if (currentRatio > targetRatio) {
    // Image is wider than target ratio, crop width
    cropWidth = imgHeight * targetRatio;
    cropX = (imgWidth - cropWidth) / 2;
  } else if (currentRatio < targetRatio) {
    // Image is taller than target ratio, crop height
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

function getRatioValue(ratio: AspectRatio): number {
  switch (ratio) {
    case "16:9":
      return 16 / 9;
    case "1:1":
      return 1;
    case "9:16":
      return 9 / 16;
    default:
      return 16 / 9;
  }
}

function getDimensionsForRatio(ratio: AspectRatio): {
  width: number;
  height: number;
} {
  switch (ratio) {
    case "16:9":
      return { width: 1280, height: 720 };
    case "1:1":
      return { width: 1080, height: 1080 };
    case "9:16":
      return { width: 720, height: 1280 };
    default:
      return { width: 1280, height: 720 };
  }
}
