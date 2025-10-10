import { describe, it, expect } from "vitest";
import {
  SnapthumbConfigSchema,
  DEFAULT_CONFIG,
  GridPosition,
  BackgroundFit,
  Quality,
} from "../types";

describe("Slider Ranges", () => {
  describe("Padding Slider", () => {
    it("should accept valid padding values", () => {
      const validPaddings = [0, 10, 24, 50, 75, 100];

      validPaddings.forEach((padding) => {
        const config = SnapthumbConfigSchema.parse({
          ...DEFAULT_CONFIG,
          padding,
        });

        expect(config.padding).toBe(padding);
      });
    });

    it("should reject invalid padding values", () => {
      const invalidPaddings = [-1, 101, 150, -50];

      invalidPaddings.forEach((padding) => {
        expect(() => {
          SnapthumbConfigSchema.parse({
            ...DEFAULT_CONFIG,
            padding,
          });
        }).toThrow();
      });
    });

    it("should clamp padding to valid range", () => {
      // Test edge cases
      const testCases = [
        { input: -5, expected: "error" },
        { input: 0, expected: 0 },
        { input: 100, expected: 100 },
        { input: 105, expected: "error" },
      ];

      testCases.forEach(({ input, expected }) => {
        if (expected === "error") {
          expect(() => {
            SnapthumbConfigSchema.parse({
              ...DEFAULT_CONFIG,
              padding: input,
            });
          }).toThrow();
        } else {
          const config = SnapthumbConfigSchema.parse({
            ...DEFAULT_CONFIG,
            padding: input,
          });
          expect(config.padding).toBe(expected);
        }
      });
    });
  });

  describe("Scale Slider", () => {
    it("should accept valid scale values", () => {
      const validScales = [0.1, 0.25, 0.5, 0.8, 1.0, 1.25, 1.5];

      validScales.forEach((scale) => {
        const config = SnapthumbConfigSchema.parse({
          ...DEFAULT_CONFIG,
          scale,
        });

        expect(config.scale).toBe(scale);
      });
    });

    it("should reject invalid scale values", () => {
      const invalidScales = [0.05, 1.51, 2.0, -0.1];

      invalidScales.forEach((scale) => {
        expect(() => {
          SnapthumbConfigSchema.parse({
            ...DEFAULT_CONFIG,
            scale,
          });
        }).toThrow();
      });
    });

    it("should handle decimal precision", () => {
      const preciseScales = [0.123, 0.456, 0.789, 1.234];

      preciseScales.forEach((scale) => {
        if (scale >= 0.1 && scale <= 1.5) {
          const config = SnapthumbConfigSchema.parse({
            ...DEFAULT_CONFIG,
            scale,
          });
          expect(config.scale).toBe(scale);
        } else {
          expect(() => {
            SnapthumbConfigSchema.parse({
              ...DEFAULT_CONFIG,
              scale,
            });
          }).toThrow();
        }
      });
    });
  });

  describe("Opacity Slider", () => {
    it("should accept valid opacity values", () => {
      const validOpacities = [0, 25, 50, 75, 100];

      validOpacities.forEach((opacity) => {
        const config = SnapthumbConfigSchema.parse({
          ...DEFAULT_CONFIG,
          opacity,
        });

        expect(config.opacity).toBe(opacity);
      });
    });

    it("should reject invalid opacity values", () => {
      const invalidOpacities = [-1, 101, 150, -25];

      invalidOpacities.forEach((opacity) => {
        expect(() => {
          SnapthumbConfigSchema.parse({
            ...DEFAULT_CONFIG,
            opacity,
          });
        }).toThrow();
      });
    });

    it("should handle edge cases", () => {
      // Test 0% opacity (fully transparent)
      const transparentConfig = SnapthumbConfigSchema.parse({
        ...DEFAULT_CONFIG,
        opacity: 0,
      });
      expect(transparentConfig.opacity).toBe(0);

      // Test 100% opacity (fully opaque)
      const opaqueConfig = SnapthumbConfigSchema.parse({
        ...DEFAULT_CONFIG,
        opacity: 100,
      });
      expect(opaqueConfig.opacity).toBe(100);
    });
  });

  describe("Canvas Width Slider", () => {
    it("should accept valid width values", () => {
      const validWidths = [100, 500, 1920, 2560, 4000];

      validWidths.forEach((width) => {
        const config = SnapthumbConfigSchema.parse({
          ...DEFAULT_CONFIG,
          canvasWidth: width,
        });

        expect(config.canvasWidth).toBe(width);
      });
    });

    it("should reject invalid width values", () => {
      const invalidWidths = [50, 4500, 8000, -100];

      invalidWidths.forEach((width) => {
        expect(() => {
          SnapthumbConfigSchema.parse({
            ...DEFAULT_CONFIG,
            canvasWidth: width,
          });
        }).toThrow();
      });
    });

    it("should handle common resolutions", () => {
      const commonResolutions = [
        { width: 640, height: 480 }, // VGA
        { width: 1280, height: 720 }, // HD
        { width: 1920, height: 1080 }, // Full HD
        { width: 2560, height: 1440 }, // 2K
        { width: 3840, height: 2160 }, // 4K
      ];

      commonResolutions.forEach(({ width, height }) => {
        if (width >= 100 && width <= 4000 && height >= 100 && height <= 4000) {
          const config = SnapthumbConfigSchema.parse({
            ...DEFAULT_CONFIG,
            canvasWidth: width,
            canvasHeight: height,
          });
          expect(config.canvasWidth).toBe(width);
          expect(config.canvasHeight).toBe(height);
        }
      });
    });
  });

  describe("Canvas Height Slider", () => {
    it("should accept valid height values", () => {
      const validHeights = [100, 500, 1080, 1440, 4000];

      validHeights.forEach((height) => {
        const config = SnapthumbConfigSchema.parse({
          ...DEFAULT_CONFIG,
          canvasHeight: height,
        });

        expect(config.canvasHeight).toBe(height);
      });
    });

    it("should reject invalid height values", () => {
      const invalidHeights = [50, 4500, 8000, -100];

      invalidHeights.forEach((height) => {
        expect(() => {
          SnapthumbConfigSchema.parse({
            ...DEFAULT_CONFIG,
            canvasHeight: height,
          });
        }).toThrow();
      });
    });
  });

  describe("Combined Slider Validation", () => {
    it("should validate all sliders together", () => {
      const validConfig = SnapthumbConfigSchema.parse({
        padding: 30,
        scale: 0.7,
        opacity: 85,
        canvasWidth: 1600,
        canvasHeight: 900,
        gridPosition: GridPosition.CENTER,
        backgroundFit: BackgroundFit.COVER,
        quality: Quality.MEDIUM,
      });

      expect(validConfig.padding).toBe(30);
      expect(validConfig.scale).toBe(0.7);
      expect(validConfig.opacity).toBe(85);
      expect(validConfig.canvasWidth).toBe(1600);
      expect(validConfig.canvasHeight).toBe(900);
    });

    it("should reject config with multiple invalid sliders", () => {
      expect(() => {
        SnapthumbConfigSchema.parse({
          padding: 150, // Invalid
          scale: 2.0, // Invalid
          opacity: 150, // Invalid
          canvasWidth: 5000, // Invalid
          canvasHeight: 50, // Invalid
          gridPosition: GridPosition.CENTER,
          backgroundFit: BackgroundFit.COVER,
          quality: Quality.MEDIUM,
        });
      }).toThrow();
    });

    it("should handle partial validation", () => {
      // Test with some valid and some invalid values
      const partialConfig = {
        padding: 50, // Valid
        scale: 2.0, // Invalid
        opacity: 75, // Valid
        canvasWidth: 1920, // Valid
        canvasHeight: 50, // Invalid
        gridPosition: GridPosition.CENTER,
        backgroundFit: BackgroundFit.COVER,
        quality: Quality.MEDIUM,
      };

      expect(() => {
        SnapthumbConfigSchema.parse(partialConfig);
      }).toThrow();
    });
  });

  describe("Slider Step Validation", () => {
    it("should handle step increments correctly", () => {
      // Test padding with step of 1
      const paddingSteps = [0, 1, 2, 24, 99, 100];
      paddingSteps.forEach((padding) => {
        const config = SnapthumbConfigSchema.parse({
          ...DEFAULT_CONFIG,
          padding,
        });
        expect(config.padding).toBe(padding);
      });

      // Test scale with step of 0.01
      const scaleSteps = [0.1, 0.11, 0.12, 0.8, 1.49, 1.5];
      scaleSteps.forEach((scale) => {
        const config = SnapthumbConfigSchema.parse({
          ...DEFAULT_CONFIG,
          scale,
        });
        expect(config.scale).toBe(scale);
      });

      // Test canvas width with step of 10
      const widthSteps = [100, 110, 120, 1920, 3990, 4000];
      widthSteps.forEach((width) => {
        const config = SnapthumbConfigSchema.parse({
          ...DEFAULT_CONFIG,
          canvasWidth: width,
        });
        expect(config.canvasWidth).toBe(width);
      });
    });
  });

  describe("Default Values", () => {
    it("should use correct default values for all sliders", () => {
      const config = SnapthumbConfigSchema.parse({});

      expect(config.padding).toBe(DEFAULT_CONFIG.padding);
      expect(config.scale).toBe(DEFAULT_CONFIG.scale);
      expect(config.opacity).toBe(DEFAULT_CONFIG.opacity);
      expect(config.canvasWidth).toBe(DEFAULT_CONFIG.canvasWidth);
      expect(config.canvasHeight).toBe(DEFAULT_CONFIG.canvasHeight);
    });

    it("should merge partial configs with defaults", () => {
      const partialConfig = {
        padding: 50,
        scale: 0.7,
      };

      const config = SnapthumbConfigSchema.parse(partialConfig);

      expect(config.padding).toBe(50);
      expect(config.scale).toBe(0.7);
      expect(config.opacity).toBe(DEFAULT_CONFIG.opacity);
      expect(config.canvasWidth).toBe(DEFAULT_CONFIG.canvasWidth);
      expect(config.canvasHeight).toBe(DEFAULT_CONFIG.canvasHeight);
    });
  });
});
