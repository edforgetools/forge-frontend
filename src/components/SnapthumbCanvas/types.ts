import { z } from "zod";

// Grid position enum for 9-grid presets
export enum GridPosition {
  TOP_LEFT = "top-left",
  TOP_CENTER = "top-center",
  TOP_RIGHT = "top-right",
  CENTER_LEFT = "center-left",
  CENTER = "center",
  CENTER_RIGHT = "center-right",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_CENTER = "bottom-center",
  BOTTOM_RIGHT = "bottom-right",
}

// Background fit options
export enum BackgroundFit {
  CONTAIN = "contain",
  COVER = "cover",
  CROP_16_9 = "crop-16-9",
}

// Quality levels
export enum Quality {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// Snapthumb configuration schema
export const SnapthumbConfigSchema = z.object({
  // Position and layout
  gridPosition: z.nativeEnum(GridPosition).default(GridPosition.BOTTOM_RIGHT),
  padding: z.number().min(0).max(100).default(24),

  // Overlay settings
  scale: z.number().min(0.1).max(1.5).default(0.8),
  opacity: z.number().min(0).max(100).default(100),

  // Background settings
  backgroundFit: z.nativeEnum(BackgroundFit).default(BackgroundFit.CROP_16_9),

  // Quality settings
  quality: z.nativeEnum(Quality).default(Quality.HIGH),

  // Canvas dimensions
  canvasWidth: z.number().min(100).max(4000).default(1920),
  canvasHeight: z.number().min(100).max(4000).default(1080),
});

// TypeScript type from schema
export type SnapthumbConfig = z.infer<typeof SnapthumbConfigSchema>;

// Position calculation result
export interface CalculatedPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

// Grid position mapping
export const GRID_POSITION_MAP: Record<GridPosition, { x: number; y: number }> =
  {
    [GridPosition.TOP_LEFT]: { x: 0, y: 0 },
    [GridPosition.TOP_CENTER]: { x: 0.5, y: 0 },
    [GridPosition.TOP_RIGHT]: { x: 1, y: 0 },
    [GridPosition.CENTER_LEFT]: { x: 0, y: 0.5 },
    [GridPosition.CENTER]: { x: 0.5, y: 0.5 },
    [GridPosition.CENTER_RIGHT]: { x: 1, y: 0.5 },
    [GridPosition.BOTTOM_LEFT]: { x: 0, y: 1 },
    [GridPosition.BOTTOM_CENTER]: { x: 0.5, y: 1 },
    [GridPosition.BOTTOM_RIGHT]: { x: 1, y: 1 },
  };

// Quality to compression mapping
export const QUALITY_COMPRESSION_MAP: Record<
  Quality,
  { jpeg: number; webp: number }
> = {
  [Quality.LOW]: { jpeg: 0.6, webp: 0.7 },
  [Quality.MEDIUM]: { jpeg: 0.8, webp: 0.85 },
  [Quality.HIGH]: { jpeg: 0.95, webp: 0.9 },
};

// Default configuration
export const DEFAULT_CONFIG: SnapthumbConfig = {
  gridPosition: GridPosition.BOTTOM_RIGHT,
  padding: 24,
  scale: 0.8,
  opacity: 100,
  backgroundFit: BackgroundFit.CROP_16_9,
  quality: Quality.HIGH,
  canvasWidth: 1920,
  canvasHeight: 1080,
};
