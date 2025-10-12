import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SnapthumbConfig,
  SnapthumbConfigSchema,
  DEFAULT_CONFIG,
  GridPosition,
  BackgroundFit,
  Quality,
} from "@/components/SnapthumbCanvas/types";

// URL query parameter keys
const QUERY_PARAMS = {
  GRID_POSITION: "pos",
  PADDING: "pad",
  SCALE: "scale",
  OPACITY: "opacity",
  BACKGROUND_FIT: "fit",
  QUALITY: "quality",
  CANVAS_WIDTH: "width",
  CANVAS_HEIGHT: "height",
} as const;

// LocalStorage key
const STORAGE_KEY = "snapthumb-config";

// URL parameter serialization/deserialization
function serializeConfig(config: SnapthumbConfig): Record<string, string> {
  const params: Record<string, string> = {};

  if (config.gridPosition !== DEFAULT_CONFIG.gridPosition) {
    params[QUERY_PARAMS.GRID_POSITION] = config.gridPosition;
  }
  if (config.padding !== DEFAULT_CONFIG.padding) {
    params[QUERY_PARAMS.PADDING] = config.padding.toString();
  }
  if (config.scale !== DEFAULT_CONFIG.scale) {
    params[QUERY_PARAMS.SCALE] = config.scale.toString();
  }
  if (config.opacity !== DEFAULT_CONFIG.opacity) {
    params[QUERY_PARAMS.OPACITY] = config.opacity.toString();
  }
  if (config.backgroundFit !== DEFAULT_CONFIG.backgroundFit) {
    params[QUERY_PARAMS.BACKGROUND_FIT] = config.backgroundFit;
  }
  if (config.quality !== DEFAULT_CONFIG.quality) {
    params[QUERY_PARAMS.QUALITY] = config.quality;
  }
  if (config.canvasWidth !== DEFAULT_CONFIG.canvasWidth) {
    params[QUERY_PARAMS.CANVAS_WIDTH] = config.canvasWidth.toString();
  }
  if (config.canvasHeight !== DEFAULT_CONFIG.canvasHeight) {
    params[QUERY_PARAMS.CANVAS_HEIGHT] = config.canvasHeight.toString();
  }

  return params;
}

function deserializeConfig(
  searchParams: URLSearchParams
): Partial<SnapthumbConfig> {
  const config: Partial<SnapthumbConfig> = {};

  const gridPosition = searchParams.get(QUERY_PARAMS.GRID_POSITION);
  if (
    gridPosition &&
    Object.values(GridPosition).includes(gridPosition as GridPosition)
  ) {
    config.gridPosition = gridPosition as GridPosition;
  }

  const padding = searchParams.get(QUERY_PARAMS.PADDING);
  if (padding) {
    const parsed = parseInt(padding, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      config.padding = parsed;
    }
  }

  const scale = searchParams.get(QUERY_PARAMS.SCALE);
  if (scale) {
    const parsed = parseFloat(scale);
    if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 1.5) {
      config.scale = parsed;
    }
  }

  const opacity = searchParams.get(QUERY_PARAMS.OPACITY);
  if (opacity) {
    const parsed = parseInt(opacity, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      config.opacity = parsed;
    }
  }

  const backgroundFit = searchParams.get(QUERY_PARAMS.BACKGROUND_FIT);
  if (
    backgroundFit &&
    Object.values(BackgroundFit).includes(backgroundFit as BackgroundFit)
  ) {
    config.backgroundFit = backgroundFit as BackgroundFit;
  }

  const quality = searchParams.get(QUERY_PARAMS.QUALITY);
  if (quality && Object.values(Quality).includes(quality as Quality)) {
    config.quality = quality as Quality;
  }

  const canvasWidth = searchParams.get(QUERY_PARAMS.CANVAS_WIDTH);
  if (canvasWidth) {
    const parsed = parseInt(canvasWidth, 10);
    if (!isNaN(parsed) && parsed >= 100 && parsed <= 4000) {
      config.canvasWidth = parsed;
    }
  }

  const canvasHeight = searchParams.get(QUERY_PARAMS.CANVAS_HEIGHT);
  if (canvasHeight) {
    const parsed = parseInt(canvasHeight, 10);
    if (!isNaN(parsed) && parsed >= 100 && parsed <= 4000) {
      config.canvasHeight = parsed;
    }
  }

  return config;
}

// Zustand store interface
interface SnapthumbStore {
  config: SnapthumbConfig;
  updateConfig: (updates: Partial<SnapthumbConfig>) => void;
  resetConfig: () => void;
  syncWithURL: () => void;
  syncToURL: () => void;
}

// Create the store with persistence and URL sync
export const useSnapthumbStore = create<SnapthumbStore>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,

      updateConfig: (updates) => {
        const currentConfig = get().config;
        const newConfig = { ...currentConfig, ...updates };

        // Validate the merged config
        const validatedConfig = SnapthumbConfigSchema.parse(newConfig);

        set({ config: validatedConfig });

        // Auto-sync to URL
        get().syncToURL();
      },

      resetConfig: () => {
        set({ config: DEFAULT_CONFIG });
        get().syncToURL();
      },

      syncWithURL: () => {
        if (typeof window === "undefined") return;

        const searchParams = new URLSearchParams(window.location.search);
        const urlConfig = deserializeConfig(searchParams);

        if (Object.keys(urlConfig).length > 0) {
          const currentConfig = get().config;
          const mergedConfig = { ...currentConfig, ...urlConfig };
          const validatedConfig = SnapthumbConfigSchema.parse(mergedConfig);

          set({ config: validatedConfig });
        }
      },

      syncToURL: () => {
        if (typeof window === "undefined") return;

        const config = get().config;
        const params = serializeConfig(config);

        const url = new URL(window.location.href);
        url.search = "";

        // Add non-default parameters to URL
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });

        // Update URL without triggering navigation
        window.history.replaceState(null, "", url.toString());
      },
    }),
    {
      name: STORAGE_KEY,
      // Only persist non-default values to keep localStorage clean
      partialize: (state) => {
        const persisted: Partial<SnapthumbConfig> = {};

        Object.entries(state.config).forEach(([key, value]) => {
          const defaultValue = DEFAULT_CONFIG[key as keyof SnapthumbConfig];
          if (value !== defaultValue) {
            persisted[key as keyof SnapthumbConfig] = value as any;
          }
        });

        return { config: persisted };
      },
      // Merge with defaults on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          const mergedConfig = { ...DEFAULT_CONFIG, ...state.config };
          const validatedConfig = SnapthumbConfigSchema.parse(mergedConfig);
          state.config = validatedConfig;
        }
      },
    }
  )
);

// Hook to initialize URL sync on mount
export function useSnapthumbURLSync() {
  const syncWithURL = useSnapthumbStore((state) => state.syncWithURL);

  React.useEffect(() => {
    // Sync URL params on mount
    syncWithURL();

    // Listen for browser back/forward navigation
    const handlePopState = () => {
      syncWithURL();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [syncWithURL]);
}

// Utility functions for external use
export function getSnapthumbConfig(): SnapthumbConfig {
  return useSnapthumbStore.getState().config;
}

export function updateSnapthumbConfig(updates: Partial<SnapthumbConfig>): void {
  useSnapthumbStore.getState().updateConfig(updates);
}

export function resetSnapthumbConfig(): void {
  useSnapthumbStore.getState().resetConfig();
}

// Import React for the hook
import React from "react";
