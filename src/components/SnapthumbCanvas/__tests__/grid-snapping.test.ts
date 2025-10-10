import { describe, it, expect } from "vitest";
import {
  GridPosition,
  GRID_POSITION_MAP,
  CalculatedPosition,
} from "../types";

// Helper function to calculate position based on grid position
function calculateGridPosition(
  gridPosition: GridPosition,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  padding: number
): CalculatedPosition {
  const overlayWidth = canvasWidth * scale;
  const overlayHeight = canvasHeight * scale;

  const gridPos = GRID_POSITION_MAP[gridPosition];

  // Calculate position based on grid position
  const availableWidth = canvasWidth - padding * 2;
  const availableHeight = canvasHeight - padding * 2;

  const x = padding + (availableWidth - overlayWidth) * gridPos.x;
  const y = padding + (availableHeight - overlayHeight) * gridPos.y;

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(overlayWidth),
    height: Math.round(overlayHeight),
    scale,
  };
}

describe("Grid Snapping Math", () => {
  const canvasWidth = 1920;
  const canvasHeight = 1080;
  const scale = 0.8;
  const padding = 24;

  describe("Grid Position Calculations", () => {
    it("should calculate top-left position correctly", () => {
      const position = calculateGridPosition(
        GridPosition.TOP_LEFT,
        canvasWidth,
        canvasHeight,
        scale,
        padding
      );

      expect(position.x).toBe(padding);
      expect(position.y).toBe(padding);
    });

    it("should calculate top-center position correctly", () => {
      const position = calculateGridPosition(
        GridPosition.TOP_CENTER,
        canvasWidth,
        canvasHeight,
        scale,
        padding
      );

      const overlayWidth = canvasWidth * scale;
      const expectedX = (canvasWidth - overlayWidth) / 2;

      expect(position.x).toBe(Math.round(expectedX));
      expect(position.y).toBe(padding);
    });

    it("should calculate top-right position correctly", () => {
      const position = calculateGridPosition(
        GridPosition.TOP_RIGHT,
        canvasWidth,
        canvasHeight,
        scale,
        padding
      );

      const overlayWidth = canvasWidth * scale;
      const expectedX = canvasWidth - overlayWidth - padding;

      expect(position.x).toBe(expectedX);
      expect(position.y).toBe(padding);
    });

    it("should calculate center-left position correctly", () => {
      const position = calculateGridPosition(
        GridPosition.CENTER_LEFT,
        canvasWidth,
        canvasHeight,
        scale,
        padding
      );

      const overlayHeight = canvasHeight * scale;
      const expectedY = (canvasHeight - overlayHeight) / 2;

      expect(position.x).toBe(padding);
      expect(position.y).toBe(Math.round(expectedY));
    });

    it("should calculate center position correctly", () => {
      const position = calculateGridPosition(
        GridPosition.CENTER,
        canvasWidth,
        canvasHeight,
        scale,
        padding
      );

      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;
      const expectedX = (canvasWidth - overlayWidth) / 2;
      const expectedY = (canvasHeight - overlayHeight) / 2;

      expect(position.x).toBe(Math.round(expectedX));
      expect(position.y).toBe(Math.round(expectedY));
    });

    it("should calculate center-right position correctly", () => {
      const position = calculateGridPosition(
        GridPosition.CENTER_RIGHT,
        canvasWidth,
        canvasHeight,
        scale,
        padding
      );

      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;
      const expectedX = canvasWidth - overlayWidth - padding;
      const expectedY = (canvasHeight - overlayHeight) / 2;

      expect(position.x).toBe(expectedX);
      expect(position.y).toBe(Math.round(expectedY));
    });

    it("should calculate bottom-left position correctly", () => {
      const position = calculateGridPosition(
        GridPosition.BOTTOM_LEFT,
        canvasWidth,
        canvasHeight,
        scale,
        padding
      );

      const overlayHeight = canvasHeight * scale;
      const expectedY = canvasHeight - overlayHeight - padding;

      expect(position.x).toBe(padding);
      expect(position.y).toBe(expectedY);
    });

    it("should calculate bottom-center position correctly", () => {
      const position = calculateGridPosition(
        GridPosition.BOTTOM_CENTER,
        canvasWidth,
        canvasHeight,
        scale,
        padding
      );

      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;
      const expectedX = (canvasWidth - overlayWidth) / 2;
      const expectedY = canvasHeight - overlayHeight - padding;

      expect(position.x).toBe(Math.round(expectedX));
      expect(position.y).toBe(expectedY);
    });

    it("should calculate bottom-right position correctly", () => {
      const position = calculateGridPosition(
        GridPosition.BOTTOM_RIGHT,
        canvasWidth,
        canvasHeight,
        scale,
        padding
      );

      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;
      const expectedX = canvasWidth - overlayWidth - padding;
      const expectedY = canvasHeight - overlayHeight - padding;

      expect(position.x).toBe(expectedX);
      expect(position.y).toBe(expectedY);
    });
  });

  describe("Scale Impact on Positioning", () => {
    it("should maintain grid alignment with different scales", () => {
      const scales = [0.5, 0.8, 1.0, 1.2];

      scales.forEach((testScale) => {
        const centerPosition = calculateGridPosition(
          GridPosition.CENTER,
          canvasWidth,
          canvasHeight,
          testScale,
          padding
        );

        const overlayWidth = canvasWidth * testScale;
        const overlayHeight = canvasHeight * testScale;
        const expectedX = (canvasWidth - overlayWidth) / 2;
        const expectedY = (canvasHeight - overlayHeight) / 2;

        expect(centerPosition.x).toBe(Math.round(expectedX));
        expect(centerPosition.y).toBe(Math.round(expectedY));
      });
    });

    it("should handle minimum scale correctly", () => {
      const minScale = 0.1;
      const position = calculateGridPosition(
        GridPosition.CENTER,
        canvasWidth,
        canvasHeight,
        minScale,
        padding
      );

      const overlayWidth = canvasWidth * minScale;
      const overlayHeight = canvasHeight * minScale;
      const expectedX = (canvasWidth - overlayWidth) / 2;
      const expectedY = (canvasHeight - overlayHeight) / 2;

      expect(position.x).toBe(Math.round(expectedX));
      expect(position.y).toBe(Math.round(expectedY));
      expect(position.width).toBe(overlayWidth);
      expect(position.height).toBe(overlayHeight);
    });

    it("should handle maximum scale correctly", () => {
      const maxScale = 1.5;
      const position = calculateGridPosition(
        GridPosition.BOTTOM_RIGHT,
        canvasWidth,
        canvasHeight,
        maxScale,
        padding
      );

      const overlayWidth = canvasWidth * maxScale;
      const overlayHeight = canvasHeight * maxScale;
      const expectedX = canvasWidth - overlayWidth - padding;
      const expectedY = canvasHeight - overlayHeight - padding;

      expect(position.x).toBe(expectedX);
      expect(position.y).toBe(expectedY);
      expect(position.width).toBe(overlayWidth);
      expect(position.height).toBe(overlayHeight);
    });
  });

  describe("Padding Impact on Positioning", () => {
    it("should adjust positions based on padding", () => {
      const paddings = [0, 24, 50, 100];

      paddings.forEach((testPadding) => {
        const topLeftPosition = calculateGridPosition(
          GridPosition.TOP_LEFT,
          canvasWidth,
          canvasHeight,
          scale,
          testPadding
        );

        expect(topLeftPosition.x).toBe(testPadding);
        expect(topLeftPosition.y).toBe(testPadding);

        const bottomRightPosition = calculateGridPosition(
          GridPosition.BOTTOM_RIGHT,
          canvasWidth,
          canvasHeight,
          scale,
          testPadding
        );

        const overlayWidth = canvasWidth * scale;
        const overlayHeight = canvasHeight * scale;
        const expectedX = canvasWidth - overlayWidth - testPadding;
        const expectedY = canvasHeight - overlayHeight - testPadding;

        expect(bottomRightPosition.x).toBe(expectedX);
        expect(bottomRightPosition.y).toBe(expectedY);
      });
    });

    it("should handle zero padding", () => {
      const position = calculateGridPosition(
        GridPosition.TOP_LEFT,
        canvasWidth,
        canvasHeight,
        scale,
        0
      );

      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    it("should handle maximum padding", () => {
      const maxPadding = 100;
      const position = calculateGridPosition(
        GridPosition.BOTTOM_RIGHT,
        canvasWidth,
        canvasHeight,
        scale,
        maxPadding
      );

      const overlayWidth = canvasWidth * scale;
      const overlayHeight = canvasHeight * scale;
      const expectedX = canvasWidth - overlayWidth - maxPadding;
      const expectedY = canvasHeight - overlayHeight - maxPadding;

      expect(position.x).toBe(expectedX);
      expect(position.y).toBe(expectedY);
    });
  });

  describe("Canvas Size Impact on Positioning", () => {
    it("should work with different canvas sizes", () => {
      const canvasSizes = [
        { width: 640, height: 480 },
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
        { width: 2560, height: 1440 },
      ];

      canvasSizes.forEach(({ width, height }) => {
        const centerPosition = calculateGridPosition(
          GridPosition.CENTER,
          width,
          height,
          scale,
          padding
        );

        const overlayWidth = width * scale;
        const overlayHeight = height * scale;
        const expectedX = (width - overlayWidth) / 2;
        const expectedY = (height - overlayHeight) / 2;

        expect(centerPosition.x).toBe(Math.round(expectedX));
        expect(centerPosition.y).toBe(Math.round(expectedY));
        expect(centerPosition.width).toBe(overlayWidth);
        expect(centerPosition.height).toBe(overlayHeight);
      });
    });

    it("should handle small canvas sizes", () => {
      const smallCanvas = { width: 400, height: 300 };
      const position = calculateGridPosition(
        GridPosition.CENTER,
        smallCanvas.width,
        smallCanvas.height,
        scale,
        padding
      );

      const overlayWidth = smallCanvas.width * scale;
      const overlayHeight = smallCanvas.height * scale;
      const expectedX = (smallCanvas.width - overlayWidth) / 2;
      const expectedY = (smallCanvas.height - overlayHeight) / 2;

      expect(position.x).toBe(Math.round(expectedX));
      expect(position.y).toBe(Math.round(expectedY));
      expect(position.width).toBe(overlayWidth);
      expect(position.height).toBe(overlayHeight);
    });

    it("should handle large canvas sizes", () => {
      const largeCanvas = { width: 3840, height: 2160 };
      const position = calculateGridPosition(
        GridPosition.BOTTOM_RIGHT,
        largeCanvas.width,
        largeCanvas.height,
        scale,
        padding
      );

      const overlayWidth = largeCanvas.width * scale;
      const overlayHeight = largeCanvas.height * scale;
      const expectedX = largeCanvas.width - overlayWidth - padding;
      const expectedY = largeCanvas.height - overlayHeight - padding;

      expect(position.x).toBe(expectedX);
      expect(position.y).toBe(expectedY);
      expect(position.width).toBe(overlayWidth);
      expect(position.height).toBe(overlayHeight);
    });
  });

  describe("Precision and Rounding", () => {
    it("should round positions to integers", () => {
      const position = calculateGridPosition(
        GridPosition.CENTER,
        1000,
        600,
        0.333, // This will create non-integer results
        15
      );

      // All position values should be integers
      expect(Number.isInteger(position.x)).toBe(true);
      expect(Number.isInteger(position.y)).toBe(true);
      expect(Number.isInteger(position.width)).toBe(true);
      expect(Number.isInteger(position.height)).toBe(true);
    });

    it("should handle fractional scales correctly", () => {
      const fractionalScales = [0.123, 0.456, 0.789, 1.234];

      fractionalScales.forEach((testScale) => {
        if (testScale >= 0.1 && testScale <= 1.5) {
          const position = calculateGridPosition(
            GridPosition.CENTER,
            canvasWidth,
            canvasHeight,
            testScale,
            padding
          );

          expect(Number.isInteger(position.x)).toBe(true);
          expect(Number.isInteger(position.y)).toBe(true);
          expect(position.scale).toBe(testScale);
        }
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle overlay larger than canvas", () => {
      const largeScale = 1.5; // This will make overlay larger than canvas
      const position = calculateGridPosition(
        GridPosition.CENTER,
        canvasWidth,
        canvasHeight,
        largeScale,
        padding
      );

      const overlayWidth = canvasWidth * largeScale;
      const overlayHeight = canvasHeight * largeScale;
      const expectedX = (canvasWidth - overlayWidth) / 2;
      const expectedY = (canvasHeight - overlayHeight) / 2;

      // Position can be negative when overlay is larger than canvas
      expect(position.x).toBe(Math.round(expectedX));
      expect(position.y).toBe(Math.round(expectedY));
      expect(position.width).toBe(overlayWidth);
      expect(position.height).toBe(overlayHeight);
    });

    it("should handle overlay exactly canvas size", () => {
      const exactScale = 1.0;
      const position = calculateGridPosition(
        GridPosition.CENTER,
        canvasWidth,
        canvasHeight,
        exactScale,
        padding
      );

      const overlayWidth = canvasWidth * exactScale;
      const overlayHeight = canvasHeight * exactScale;
      const expectedX = (canvasWidth - overlayWidth) / 2;
      const expectedY = (canvasHeight - overlayHeight) / 2;

      expect(position.x).toBe(Math.round(expectedX));
      expect(position.y).toBe(Math.round(expectedY));
      expect(position.width).toBe(overlayWidth);
      expect(position.height).toBe(overlayHeight);
    });
  });
});
