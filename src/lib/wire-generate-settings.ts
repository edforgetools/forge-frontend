/**
 * Wire Generate Settings Management
 * Handles persistence of wire generation settings and provides utilities for reset/restore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WireGenerateInput } from "./wire-generate";

// Default settings for wire generation
export const DEFAULT_WIRE_GENERATE_SETTINGS: Partial<WireGenerateInput> = {
  aspect: "16:9",
  crop: {
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    active: false,
  },
  overlays: [],
  prefs: {
    format: "jpeg",
    quality: 0.8,
    width: 1280,
    height: 720,
    keepUnderMB: 2,
  },
  snapthumb: {
    gridPosition: "bottom-right",
    padding: 20,
    scale: 0.3,
    opacity: 80,
    backgroundFit: "cover",
    quality: "high",
    canvasWidth: 1280,
    canvasHeight: 720,
  },
};

export interface WireGenerateSettingsState {
  lastSettings: Partial<WireGenerateInput> | null;
  hasLastSettings: boolean;
  saveLastSettings: (settings: Partial<WireGenerateInput>) => void;
  useLastSettings: () => Partial<WireGenerateInput> | null;
  resetToDefaults: () => void;
  clearLastSettings: () => void;
}

// Create the settings store with persistence
export const useWireGenerateSettings = create<WireGenerateSettingsState>()(
  persist(
    (set, get) => ({
      lastSettings: null,
      hasLastSettings: false,

      saveLastSettings: (settings: Partial<WireGenerateInput>) => {
        // Filter out the image/video data as it's not needed for restoration
        const {
          image: _image,
          videoSrc: _videoSrc,
          ...settingsToSave
        } = settings;

        set({
          lastSettings: settingsToSave,
          hasLastSettings: true,
        });
      },

      useLastSettings: () => {
        const { lastSettings } = get();
        return lastSettings;
      },

      resetToDefaults: () => {
        set({
          lastSettings: DEFAULT_WIRE_GENERATE_SETTINGS,
          hasLastSettings: true,
        });
      },

      clearLastSettings: () => {
        set({
          lastSettings: null,
          hasLastSettings: false,
        });
      },
    }),
    {
      name: "wire-generate-settings",
      partialize: (state) => ({
        lastSettings: state.lastSettings,
        hasLastSettings: state.hasLastSettings,
      }),
    }
  )
);

// Utility functions for external use
export function saveWireGenerateSettings(
  settings: Partial<WireGenerateInput>
): void {
  useWireGenerateSettings.getState().saveLastSettings(settings);
}

export function getLastWireGenerateSettings(): Partial<WireGenerateInput> | null {
  return useWireGenerateSettings.getState().useLastSettings();
}

export function resetWireGenerateToDefaults(): void {
  useWireGenerateSettings.getState().resetToDefaults();
}

export function clearWireGenerateSettings(): void {
  useWireGenerateSettings.getState().clearLastSettings();
}

export function hasWireGenerateSettings(): boolean {
  return useWireGenerateSettings.getState().hasLastSettings;
}
