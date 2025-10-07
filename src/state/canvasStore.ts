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

export const useCanvasStore = create<CanvasState>()(
  devtools(
    () => ({
      ...defaultState,
    }),
    { name: "canvas-store" }
  )
);

export const canvasActions = {
  setImage: (image: HTMLImageElement | ImageBitmap) => {
    const state = useCanvasStore.getState();
    const newCrop = calculateAutoCrop(image, state.aspect);

    useCanvasStore.setState({
      image,
      crop: { ...newCrop, active: true },
      videoSrc: undefined,
    });
  },

  setVideo: (videoSrc: string) => {
    useCanvasStore.setState({
      videoSrc,
      image: undefined,
      crop: { ...defaultCrop, active: true },
    });
  },

  setCrop: (crop: Partial<Crop>) => {
    useCanvasStore.setState((state) => ({
      crop: { ...state.crop, ...crop },
    }));
  },

  addOverlay: (overlay: Omit<LogoOverlay | TextOverlay, "id" | "z">) => {
    const state = useCanvasStore.getState();
    const maxZ = state.overlays.reduce((max, o) => Math.max(max, o.z), 0);

    const newOverlay = {
      ...overlay,
      id: `overlay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      z: maxZ + 1,
    } as LogoOverlay | TextOverlay;

    useCanvasStore.setState({
      overlays: [...state.overlays, newOverlay],
      selectedId: newOverlay.id,
    });
  },

  updateOverlay: (id: string, updates: Partial<LogoOverlay | TextOverlay>) => {
    useCanvasStore.setState((state) => ({
      overlays: state.overlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      ),
    }));
  },

  select: (id?: string) => {
    useCanvasStore.setState({ selectedId: id });
  },

  bringToFront: (id: string) => {
    const state = useCanvasStore.getState();
    const overlay = state.overlays.find((o) => o.id === id);
    if (!overlay) return;

    const maxZ = state.overlays.reduce((max, o) => Math.max(max, o.z), 0);
    canvasActions.updateOverlay(id, { z: maxZ + 1 });
  },

  sendToBack: (id: string) => {
    const state = useCanvasStore.getState();
    const overlay = state.overlays.find((o) => o.id === id);
    if (!overlay) return;

    const minZ = state.overlays.reduce((min, o) => Math.min(min, o.z), 0);
    canvasActions.updateOverlay(id, { z: minZ - 1 });
  },

  lock: (id: string) => {
    canvasActions.updateOverlay(id, { locked: true });
  },

  hide: (id: string) => {
    canvasActions.updateOverlay(id, { hidden: true });
  },

  remove: (id: string) => {
    const state = useCanvasStore.getState();
    useCanvasStore.setState({
      overlays: state.overlays.filter((o) => o.id !== id),
      selectedId: state.selectedId === id ? undefined : state.selectedId,
    });
  },

  pushUndo: (patch: CanvasPatch) => {
    const state = useCanvasStore.getState();
    useCanvasStore.setState({
      undo: [...state.undo, patch].slice(-50), // Keep last 50 patches
      redo: [], // Clear redo when new action is performed
    });
  },

  undo: () => {
    const state = useCanvasStore.getState();
    if (state.undo.length === 0) return;

    const lastPatch = state.undo[state.undo.length - 1];
    // Implementation would restore state from patch
    // This is a simplified version

    useCanvasStore.setState({
      undo: state.undo.slice(0, -1),
      redo: [...state.redo, lastPatch],
    });
  },

  redo: () => {
    const state = useCanvasStore.getState();
    if (state.redo.length === 0) return;

    const nextPatch = state.redo[state.redo.length - 1];
    // Implementation would restore state from patch
    // This is a simplified version

    useCanvasStore.setState({
      undo: [...state.undo, nextPatch],
      redo: state.redo.slice(0, -1),
    });
  },

  setPrefs: (prefs: Partial<ExportPrefs>) => {
    useCanvasStore.setState((state) => ({
      prefs: { ...state.prefs, ...prefs },
    }));
  },

  resetDefaults: () => {
    useCanvasStore.setState({
      ...defaultState,
      projectId: `project_${Date.now()}`,
    });
  },

  clearProject: () => {
    useCanvasStore.setState({
      image: undefined,
      videoSrc: undefined,
      overlays: [],
      selectedId: undefined,
      crop: defaultCrop,
    });
  },

  duplicateProject: () => {
    const state = useCanvasStore.getState();
    useCanvasStore.setState({
      ...state,
      projectId: `project_${Date.now()}`,
      selectedId: undefined,
    });
  },
};

function calculateAutoCrop(
  image: HTMLImageElement | ImageBitmap,
  aspect: "16:9"
): Crop {
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
