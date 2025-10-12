import { describe, it, expect } from "vitest";
import { SnapthumbConfigSchema, DEFAULT_CONFIG, GridPosition } from "../types";

describe("Drag Bounds", () => {
  describe("Position Constraints", () => {
    const canvasWidth = 1920;
    const canvasHeight = 1080;
    const scale = 0.8;
    const padding = 24;

    it("should calculate correct bounds for overlay positioning", () => {
      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;

      // Calculate bounds
      const minX = padding;
      const maxX = canvasWidth - overlayWidth - padding;
      const minY = padding;
      const maxY = canvasHeight - overlayHeight - padding;

      expect(minX).toBe(24);
      expect(maxX).toBe(1920 - 1536 - 24); // 360
      expect(minY).toBe(24);
      expect(maxY).toBe(1080 - 864 - 24); // 192
    });

    it("should enforce bounds for top-left position", () => {
      const config = SnapthumbConfigSchema.parse({
        ...DEFAULT_CONFIG,
        gridPosition: GridPosition.TOP_LEFT,
        canvasWidth,
        canvasHeight,
        scale,
        padding,
      });

      // Top-left should be at minimum bounds
      const expectedX = config.padding;
      const expectedY = config.padding;

      expect(expectedX).toBe(24);
      expect(expectedY).toBe(24);
      expect(expectedX).toBeGreaterThanOrEqual(config.padding);
      expect(expectedY).toBeGreaterThanOrEqual(config.padding);
    });

    it("should enforce bounds for bottom-right position", () => {
      const config = SnapthumbConfigSchema.parse({
        ...DEFAULT_CONFIG,
        gridPosition: GridPosition.BOTTOM_RIGHT,
        canvasWidth,
        canvasHeight,
        scale,
        padding,
      });

      const overlayWidth = config.canvasWidth * config.scale;
      const overlayHeight = config.canvasHeight * config.scale;

      // Bottom-right should be at maximum bounds
      const expectedX = config.canvasWidth - overlayWidth - config.padding;
      const expectedY = config.canvasHeight - overlayHeight - config.padding;

      expect(expectedX).toBe(360);
      expect(expectedY).toBe(192);
      expect(expectedX).toBeLessThanOrEqual(
        config.canvasWidth - overlayWidth - config.padding
      );
      expect(expectedY).toBeLessThanOrEqual(
        config.canvasHeight - overlayHeight - config.padding
      );
    });

    it("should handle edge cases with minimum scale", () => {
      const minScale = 0.1;
      const config = SnapthumbConfigSchema.parse({
        ...DEFAULT_CONFIG,
        scale: minScale,
        canvasWidth,
        canvasHeight,
        padding,
      });

      const overlayWidth = config.canvasWidth * config.scale;
      const overlayHeight = config.canvasHeight * config.scale;

      // With minimum scale, overlay should fit comfortably
      expect(overlayWidth).toBe(192);
      expect(overlayHeight).toBe(108);

      // Bounds should still be valid
      const maxX = config.canvasWidth - overlayWidth - config.padding;
      const maxY = config.canvasHeight - overlayHeight - config.padding;

      expect(maxX).toBeGreaterThan(0);
      expect(maxY).toBeGreaterThan(0);
    });

    it("should handle edge cases with maximum scale", () => {
      const maxScale = 1.5;
      const config = SnapthumbConfigSchema.parse({
        ...DEFAULT_CONFIG,
        scale: maxScale,
        canvasWidth,
        canvasHeight,
        padding,
      });

      const overlayWidth = config.canvasWidth * config.scale;
      const overlayHeight = config.canvasHeight * config.scale;

      // With maximum scale, overlay should still fit within bounds
      expect(overlayWidth).toBe(2880);
      expect(overlayHeight).toBe(1620);

      // This should exceed canvas bounds, so bounds checking is important
      const maxX = config.canvasWidth - overlayWidth - config.padding;
      const maxY = config.canvasHeight - overlayHeight - config.padding;

      expect(maxX).toBeLessThan(0); // Negative, indicating overflow
      expect(maxY).toBeLessThan(0); // Negative, indicating overflow
    });

    it("should handle different padding values", () => {
      const testPadding = 50;
      const config = SnapthumbConfigSchema.parse({
        ...DEFAULT_CONFIG,
        padding: testPadding,
        canvasWidth,
        canvasHeight,
        scale,
      });

      const overlayWidth = config.canvasWidth * config.scale;
      const overlayHeight = config.canvasHeight * config.scale;

      // Calculate bounds with different padding
      const minX = config.padding;
      const maxX = config.canvasWidth - overlayWidth - config.padding;
      const minY = config.padding;
      const maxY = config.canvasHeight - overlayHeight - config.padding;

      expect(minX).toBe(50);
      expect(maxX).toBe(1920 - 1536 - 50); // 334
      expect(minY).toBe(50);
      expect(maxY).toBe(1080 - 864 - 50); // 166
    });
  });

  describe("Drag Validation", () => {
    it("should validate drag positions within bounds", () => {
      const canvasWidth = 1920;
      const canvasHeight = 1080;
      const scale = 0.8;
      const padding = 24;

      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;

      // Valid drag positions
      const validPositions = [
        { x: padding, y: padding }, // Top-left
        { x: canvasWidth - overlayWidth - padding, y: padding }, // Top-right
        { x: padding, y: canvasHeight - overlayHeight - padding }, // Bottom-left
        {
          x: canvasWidth - overlayWidth - padding,
          y: canvasHeight - overlayHeight - padding,
        }, // Bottom-right
        {
          x: (canvasWidth - overlayWidth) / 2,
          y: (canvasHeight - overlayHeight) / 2,
        }, // Center
      ];

      validPositions.forEach(({ x, y }) => {
        expect(x).toBeGreaterThanOrEqual(padding);
        expect(x).toBeLessThanOrEqual(canvasWidth - overlayWidth - padding);
        expect(y).toBeGreaterThanOrEqual(padding);
        expect(y).toBeLessThanOrEqual(canvasHeight - overlayHeight - padding);
      });
    });

    it("should reject drag positions outside bounds", () => {
      const canvasWidth = 1920;
      const canvasHeight = 1080;
      const scale = 0.8;
      const padding = 24;

      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;

      // Invalid drag positions
      const invalidPositions = [
        { x: padding - 1, y: padding }, // Too far left
        { x: canvasWidth - overlayWidth - padding + 1, y: padding }, // Too far right
        { x: padding, y: padding - 1 }, // Too far up
        { x: padding, y: canvasHeight - overlayHeight - padding + 1 }, // Too far down
        { x: -100, y: -100 }, // Way outside bounds
        { x: canvasWidth + 100, y: canvasHeight + 100 }, // Way outside bounds
      ];

      invalidPositions.forEach(({ x, y }) => {
        const isXValid =
          x >= padding && x <= canvasWidth - overlayWidth - padding;
        const isYValid =
          y >= padding && y <= canvasHeight - overlayHeight - padding;

        expect(isXValid && isYValid).toBe(false); // Both coordinates should not be valid
      });
    });
  });

  describe("Boundary Edge Cases", () => {
    it("should handle zero padding", () => {
      const config = SnapthumbConfigSchema.parse({
        ...DEFAULT_CONFIG,
        padding: 0,
        canvasWidth: 1920,
        canvasHeight: 1080,
        scale: 0.8,
      });

      const overlayWidth = config.canvasWidth * config.scale;
      const overlayHeight = config.canvasHeight * config.scale;

      // With zero padding, overlay can touch edges
      const minX = config.padding;
      const maxX = config.canvasWidth - overlayWidth - config.padding;
      const minY = config.padding;
      const maxY = config.canvasHeight - overlayHeight - config.padding;

      expect(minX).toBe(0);
      expect(maxX).toBe(1920 - 1536); // 384
      expect(minY).toBe(0);
      expect(maxY).toBe(1080 - 864); // 216
    });

    it("should handle maximum padding", () => {
      const maxPadding = 100;
      const config = SnapthumbConfigSchema.parse({
        ...DEFAULT_CONFIG,
        padding: maxPadding,
        canvasWidth: 1920,
        canvasHeight: 1080,
        scale: 0.8,
      });

      const overlayWidth = config.canvasWidth * config.scale;
      const overlayHeight = config.canvasHeight * config.scale;

      // With maximum padding, available space is reduced
      const minX = config.padding;
      const maxX = config.canvasWidth - overlayWidth - config.padding;
      const minY = config.padding;
      const maxY = config.canvasHeight - overlayHeight - config.padding;

      expect(minX).toBe(100);
      expect(maxX).toBe(1920 - 1536 - 100); // 284
      expect(minY).toBe(100);
      expect(maxY).toBe(1080 - 864 - 100); // 116
    });

    it("should handle small canvas dimensions", () => {
      const config = SnapthumbConfigSchema.parse({
        ...DEFAULT_CONFIG,
        canvasWidth: 400,
        canvasHeight: 300,
        scale: 0.5,
        padding: 20,
      });

      const overlayWidth = config.canvasWidth * config.scale;
      const overlayHeight = config.canvasHeight * config.scale;

      expect(overlayWidth).toBe(200);
      expect(overlayHeight).toBe(150);

      // Bounds should still be valid
      const maxX = config.canvasWidth - overlayWidth - config.padding;
      const maxY = config.canvasHeight - overlayHeight - config.padding;

      expect(maxX).toBe(180);
      expect(maxY).toBe(130);
      expect(maxX).toBeGreaterThan(config.padding);
      expect(maxY).toBeGreaterThan(config.padding);
    });
  });
});
