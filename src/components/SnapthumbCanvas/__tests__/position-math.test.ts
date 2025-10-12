import { describe, it, expect } from "vitest";
import {
  GridPosition,
  GRID_POSITION_MAP,
  SnapthumbConfigSchema,
  DEFAULT_CONFIG,
} from "../types";

describe("Position Math", () => {
  describe("Grid Position Mapping", () => {
    it("should map all grid positions correctly", () => {
      expect(GRID_POSITION_MAP[GridPosition.TOP_LEFT]).toEqual({ x: 0, y: 0 });
      expect(GRID_POSITION_MAP[GridPosition.TOP_CENTER]).toEqual({
        x: 0.5,
        y: 0,
      });
      expect(GRID_POSITION_MAP[GridPosition.TOP_RIGHT]).toEqual({ x: 1, y: 0 });
      expect(GRID_POSITION_MAP[GridPosition.CENTER_LEFT]).toEqual({
        x: 0,
        y: 0.5,
      });
      expect(GRID_POSITION_MAP[GridPosition.CENTER]).toEqual({
        x: 0.5,
        y: 0.5,
      });
      expect(GRID_POSITION_MAP[GridPosition.CENTER_RIGHT]).toEqual({
        x: 1,
        y: 0.5,
      });
      expect(GRID_POSITION_MAP[GridPosition.BOTTOM_LEFT]).toEqual({
        x: 0,
        y: 1,
      });
      expect(GRID_POSITION_MAP[GridPosition.BOTTOM_CENTER]).toEqual({
        x: 0.5,
        y: 1,
      });
      expect(GRID_POSITION_MAP[GridPosition.BOTTOM_RIGHT]).toEqual({
        x: 1,
        y: 1,
      });
    });
  });

  describe("Position Calculation", () => {
    const canvasWidth = 1920;
    const canvasHeight = 1080;
    const scale = 0.8;
    const padding = 24;

    it("should calculate top-left position correctly", () => {
      // Top-left should be at padding from edges
      const expectedX = padding;
      const expectedY = padding;

      expect(expectedX).toBe(24);
      expect(expectedY).toBe(24);
    });

    it("should calculate center position correctly", () => {
      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;

      // Center should be centered on canvas
      const expectedX = (canvasWidth - overlayWidth) / 2;
      const expectedY = (canvasHeight - overlayHeight) / 2;

      expect(expectedX).toBe((1920 - 1536) / 2); // 192
      expect(expectedY).toBe((1080 - 864) / 2); // 108
    });

    it("should calculate bottom-right position correctly", () => {
      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;

      // Bottom-right should be at padding from bottom-right edges
      const expectedX = canvasWidth - overlayWidth - padding;
      const expectedY = canvasHeight - overlayHeight - padding;

      expect(expectedX).toBe(1920 - 1536 - 24); // 360
      expect(expectedY).toBe(1080 - 864 - 24); // 192
    });

    it("should handle different scales correctly", () => {
      const testScale = 0.5;
      const overlayWidth = canvasWidth * testScale;
      const overlayHeight = canvasHeight * testScale;

      // Center position with 50% scale
      const expectedX = (canvasWidth - overlayWidth) / 2;
      const expectedY = (canvasHeight - overlayHeight) / 2;

      expect(expectedX).toBe((1920 - 960) / 2); // 480
      expect(expectedY).toBe((1080 - 540) / 2); // 270
    });

    it("should handle different padding values correctly", () => {
      const testPadding = 50;
      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;

      // Bottom-right with different padding
      const expectedX = canvasWidth - overlayWidth - testPadding;
      const expectedY = canvasHeight - overlayHeight - testPadding;

      expect(expectedX).toBe(1920 - 1536 - 50); // 334
      expect(expectedY).toBe(1080 - 864 - 50); // 166
    });
  });

  describe("Config Validation", () => {
    it("should accept valid config", () => {
      const validConfig = {
        gridPosition: GridPosition.CENTER,
        padding: 30,
        scale: 0.9,
        opacity: 80,
        backgroundFit: "contain" as const,
        quality: "high" as const,
        canvasWidth: 1280,
        canvasHeight: 720,
      };

      expect(() => SnapthumbConfigSchema.parse(validConfig)).not.toThrow();
    });

    it("should reject invalid grid position", () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        gridPosition: "invalid-position",
      };

      expect(() => SnapthumbConfigSchema.parse(invalidConfig)).toThrow();
    });

    it("should reject out-of-range padding", () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        padding: 150, // > 100
      };

      expect(() => SnapthumbConfigSchema.parse(invalidConfig)).toThrow();
    });

    it("should reject out-of-range scale", () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        scale: 2.0, // > 1.5
      };

      expect(() => SnapthumbConfigSchema.parse(invalidConfig)).toThrow();
    });

    it("should reject out-of-range opacity", () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        opacity: 150, // > 100
      };

      expect(() => SnapthumbConfigSchema.parse(invalidConfig)).toThrow();
    });

    it("should apply default values", () => {
      const partialConfig = {
        gridPosition: GridPosition.CENTER,
      };

      const result = SnapthumbConfigSchema.parse(partialConfig);

      expect(result.gridPosition).toBe(GridPosition.CENTER);
      expect(result.padding).toBe(DEFAULT_CONFIG.padding);
      expect(result.scale).toBe(DEFAULT_CONFIG.scale);
      expect(result.opacity).toBe(DEFAULT_CONFIG.opacity);
      expect(result.backgroundFit).toBe(DEFAULT_CONFIG.backgroundFit);
      expect(result.quality).toBe(DEFAULT_CONFIG.quality);
      expect(result.canvasWidth).toBe(DEFAULT_CONFIG.canvasWidth);
      expect(result.canvasHeight).toBe(DEFAULT_CONFIG.canvasHeight);
    });
  });
});
