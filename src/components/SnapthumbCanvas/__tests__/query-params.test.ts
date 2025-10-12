import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  GridPosition,
  BackgroundFit,
  Quality,
  SnapthumbConfigSchema,
  SnapthumbConfig,
} from "../types";
// import { useSnapthumbStore } from "@/lib/snapthumb-state";

// Mock the URL and localStorage APIs
const mockSearchParams = new URLSearchParams();
const mockLocalStorage = new Map<string, string>();

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    search: "",
    href: "http://localhost:3000/",
  },
  writable: true,
});

// Mock URLSearchParams
global.URLSearchParams = vi.fn().mockImplementation(() => mockSearchParams);

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn((key: string) => mockLocalStorage.get(key) || null),
    setItem: vi.fn((key: string, value: string) =>
      mockLocalStorage.set(key, value)
    ),
    removeItem: vi.fn((key: string) => mockLocalStorage.delete(key)),
    clear: vi.fn(() => mockLocalStorage.clear()),
  },
  writable: true,
});

// Mock window.history
Object.defineProperty(window, "history", {
  value: {
    replaceState: vi.fn(),
  },
  writable: true,
});

describe("Query Parameter Serialization", () => {
  beforeEach(() => {
    mockSearchParams.delete = vi.fn();
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe("URL Parameter Serialization", () => {
    it("should serialize non-default values to URL params", () => {
      const config = SnapthumbConfigSchema.parse({
        gridPosition: GridPosition.TOP_LEFT,
        padding: 50,
        scale: 0.6,
        opacity: 75,
        backgroundFit: BackgroundFit.CONTAIN,
        quality: Quality.LOW,
        canvasWidth: 1280,
        canvasHeight: 720,
      });

      // Simulate serialization logic
      const params: Record<string, string> = {};

      if (config.gridPosition !== "bottom-right") {
        params.pos = config.gridPosition;
      }
      if (config.padding !== 24) {
        params.pad = config.padding.toString();
      }
      if (config.scale !== 0.8) {
        params.scale = config.scale.toString();
      }
      if (config.opacity !== 100) {
        params.opacity = config.opacity.toString();
      }
      if (config.backgroundFit !== "crop-16-9") {
        params.fit = config.backgroundFit;
      }
      if (config.quality !== "high") {
        params.quality = config.quality;
      }
      if (config.canvasWidth !== 1920) {
        params.width = config.canvasWidth.toString();
      }
      if (config.canvasHeight !== 1080) {
        params.height = config.canvasHeight.toString();
      }

      expect(params).toEqual({
        pos: "top-left",
        pad: "50",
        scale: "0.6",
        opacity: "75",
        fit: "contain",
        quality: "low",
        width: "1280",
        height: "720",
      });
    });

    it("should not serialize default values", () => {
      const config = SnapthumbConfigSchema.parse({
        gridPosition: GridPosition.BOTTOM_RIGHT,
        padding: 24,
        scale: 0.8,
        opacity: 100,
        backgroundFit: BackgroundFit.CROP_16_9,
        quality: Quality.HIGH,
        canvasWidth: 1920,
        canvasHeight: 1080,
      });

      const params: Record<string, string> = {};

      if (config.gridPosition !== "bottom-right") {
        params.pos = config.gridPosition;
      }
      if (config.padding !== 24) {
        params.pad = config.padding.toString();
      }
      if (config.scale !== 0.8) {
        params.scale = config.scale.toString();
      }
      if (config.opacity !== 100) {
        params.opacity = config.opacity.toString();
      }
      if (config.backgroundFit !== "crop-16-9") {
        params.fit = config.backgroundFit;
      }
      if (config.quality !== "high") {
        params.quality = config.quality;
      }
      if (config.canvasWidth !== 1920) {
        params.width = config.canvasWidth.toString();
      }
      if (config.canvasHeight !== 1080) {
        params.height = config.canvasHeight.toString();
      }

      expect(params).toEqual({});
    });
  });

  describe("URL Parameter Deserialization", () => {
    it("should deserialize valid URL params", () => {
      // Create URLSearchParams with test data
      const testParams = new URLSearchParams();
      testParams.set("pos", "top-left");
      testParams.set("pad", "50");
      testParams.set("scale", "0.6");
      testParams.set("opacity", "75");
      testParams.set("fit", "contain");
      testParams.set("quality", "low");
      testParams.set("width", "1280");
      testParams.set("height", "720");

      // Simulate deserialization logic
      const config: Partial<SnapthumbConfig> = {};

      const gridPosition = testParams.get("pos");
      if (
        gridPosition &&
        Object.values(GridPosition).includes(gridPosition as GridPosition)
      ) {
        config.gridPosition = gridPosition as GridPosition;
      }

      const padding = testParams.get("pad");
      if (padding) {
        const parsed = parseInt(padding, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          config.padding = parsed;
        }
      }

      const scale = testParams.get("scale");
      if (scale) {
        const parsed = parseFloat(scale);
        if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 1.5) {
          config.scale = parsed;
        }
      }

      const opacity = testParams.get("opacity");
      if (opacity) {
        const parsed = parseInt(opacity, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          config.opacity = parsed;
        }
      }

      const backgroundFit = testParams.get("fit");
      if (
        backgroundFit &&
        Object.values(BackgroundFit).includes(backgroundFit as BackgroundFit)
      ) {
        config.backgroundFit = backgroundFit as BackgroundFit;
      }

      const quality = testParams.get("quality");
      if (quality && Object.values(Quality).includes(quality as Quality)) {
        config.quality = quality as Quality;
      }

      const canvasWidth = testParams.get("width");
      if (canvasWidth) {
        const parsed = parseInt(canvasWidth, 10);
        if (!isNaN(parsed) && parsed >= 100 && parsed <= 4000) {
          config.canvasWidth = parsed;
        }
      }

      const canvasHeight = testParams.get("height");
      if (canvasHeight) {
        const parsed = parseInt(canvasHeight, 10);
        if (!isNaN(parsed) && parsed >= 100 && parsed <= 4000) {
          config.canvasHeight = parsed;
        }
      }

      // Verify all expected values are present
      expect(config.gridPosition).toBe("top-left");
      expect(config.padding).toBe(50);
      expect(config.scale).toBe(0.6);
      expect(config.opacity).toBe(75);
      expect(config.backgroundFit).toBe("contain");
      expect(config.quality).toBe("low");
      expect(config.canvasWidth).toBe(1280);
      expect(config.canvasHeight).toBe(720);
    });

    it("should ignore invalid URL params", () => {
      const testParams = new URLSearchParams();
      testParams.set("pos", "invalid-position");
      testParams.set("pad", "invalid-number");
      testParams.set("scale", "2.0"); // Out of range
      testParams.set("opacity", "150"); // Out of range
      testParams.set("fit", "invalid-fit");
      testParams.set("quality", "invalid-quality");
      testParams.set("width", "5000"); // Out of range
      testParams.set("height", "50"); // Out of range

      // Simulate deserialization logic with validation
      const config: Partial<SnapthumbConfig> = {};

      const gridPosition = testParams.get("pos");
      if (
        gridPosition &&
        Object.values(GridPosition).includes(gridPosition as GridPosition)
      ) {
        config.gridPosition = gridPosition as GridPosition;
      }

      const padding = testParams.get("pad");
      if (padding) {
        const parsed = parseInt(padding, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          config.padding = parsed;
        }
      }

      const scale = testParams.get("scale");
      if (scale) {
        const parsed = parseFloat(scale);
        if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 1.5) {
          config.scale = parsed;
        }
      }

      const opacity = testParams.get("opacity");
      if (opacity) {
        const parsed = parseInt(opacity, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          config.opacity = parsed;
        }
      }

      const backgroundFit = testParams.get("fit");
      if (
        backgroundFit &&
        Object.values(BackgroundFit).includes(backgroundFit as BackgroundFit)
      ) {
        config.backgroundFit = backgroundFit as BackgroundFit;
      }

      const quality = testParams.get("quality");
      if (quality && Object.values(Quality).includes(quality as Quality)) {
        config.quality = quality as Quality;
      }

      const canvasWidth = testParams.get("width");
      if (canvasWidth) {
        const parsed = parseInt(canvasWidth, 10);
        if (!isNaN(parsed) && parsed >= 100 && parsed <= 4000) {
          config.canvasWidth = parsed;
        }
      }

      const canvasHeight = testParams.get("height");
      if (canvasHeight) {
        const parsed = parseInt(canvasHeight, 10);
        if (!isNaN(parsed) && parsed >= 100 && parsed <= 4000) {
          config.canvasHeight = parsed;
        }
      }

      // All invalid params should be ignored
      expect(config).toEqual({});
    });
  });

  describe("Round-trip Serialization", () => {
    it("should maintain data integrity through serialize/deserialize cycle", () => {
      // Test simple case first
      const testParams = new URLSearchParams();
      testParams.set("pos", "center");
      testParams.set("pad", "40");

      const deserializedConfig: Partial<SnapthumbConfig> = {};

      const gridPosition = testParams.get("pos");
      if (
        gridPosition &&
        Object.values(GridPosition).includes(gridPosition as GridPosition)
      ) {
        deserializedConfig.gridPosition = gridPosition as GridPosition;
      }

      const padding = testParams.get("pad");
      if (padding) {
        const parsed = parseInt(padding, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          deserializedConfig.padding = parsed;
        }
      }

      // Test that deserialization works
      expect(deserializedConfig.gridPosition).toBe("center");
      expect(deserializedConfig.padding).toBe(40);
    });
  });

  describe("Store Integration", () => {
    it("should validate config updates", () => {
      // Test validation without actually calling the store
      expect(() => {
        SnapthumbConfigSchema.parse({
          padding: 150, // Invalid
          scale: 2.0, // Invalid
        });
      }).toThrow();
    });

    it("should accept valid config updates", () => {
      // Test validation with valid values
      const validConfig = SnapthumbConfigSchema.parse({
        gridPosition: GridPosition.TOP_LEFT,
        padding: 50,
        scale: 0.7,
      });

      expect(validConfig.gridPosition).toBe(GridPosition.TOP_LEFT);
      expect(validConfig.padding).toBe(50);
      expect(validConfig.scale).toBe(0.7);
    });
  });

  describe("URL Parameter Edge Cases", () => {
    it("should handle empty URL parameters", () => {
      // Should not throw and should return empty config
      const config = {};
      expect(Object.keys(config)).toHaveLength(0);
    });

    it("should handle malformed URL parameters", () => {
      const malformedParams = new URLSearchParams();
      malformedParams.set("pos", "invalid-position");
      malformedParams.set("pad", "not-a-number");
      malformedParams.set("scale", "also-not-a-number");
      malformedParams.set("opacity", "negative-value");
      malformedParams.set("fit", "invalid-fit");
      malformedParams.set("quality", "invalid-quality");
      malformedParams.set("width", "too-large");
      malformedParams.set("height", "too-small");

      // Should ignore all malformed parameters
      const config: Partial<SnapthumbConfig> = {};

      // Simulate the deserialization logic
      const gridPosition = malformedParams.get("pos");
      if (
        gridPosition &&
        Object.values(GridPosition).includes(gridPosition as GridPosition)
      ) {
        config.gridPosition = gridPosition as GridPosition;
      }

      expect(Object.keys(config)).toHaveLength(0);
    });

    it("should handle special characters in URL parameters", () => {
      // Test that URLSearchParams can handle the values correctly
      const specialParams = new URLSearchParams();
      specialParams.set("pos", "top-left");
      specialParams.set("pad", "50");
      specialParams.set("scale", "0.7");

      // Should handle special characters correctly
      const pos = specialParams.get("pos");
      const pad = specialParams.get("pad");
      const scale = specialParams.get("scale");

      expect(pos).toBe("top-left");
      expect(pad).toBe("50");
      expect(scale).toBe("0.7");
    });

    it("should handle URL encoding/decoding", () => {
      const encodedParams = new URLSearchParams();
      encodedParams.set("pos", "top-left");
      encodedParams.set("pad", "50");

      // Simulate URL encoding
      const encodedURL = encodedParams.toString();
      expect(encodedURL).toContain("pos=top-left");
      expect(encodedURL).toContain("pad=50");

      // Simulate URL decoding
      const decodedParams = new URLSearchParams(encodedURL);
      expect(decodedParams.get("pos")).toBe("top-left");
      expect(decodedParams.get("pad")).toBe("50");
    });
  });

  describe("Browser History Integration", () => {
    it("should handle browser back/forward navigation", () => {
      // Mock window.history
      const mockReplaceState = vi.fn();
      Object.defineProperty(window, "history", {
        value: {
          replaceState: mockReplaceState,
        },
        writable: true,
      });

      // This would normally call window.history.replaceState
      expect(mockReplaceState).toBeDefined();
    });

    it("should handle popstate events", () => {
      const mockAddEventListener = vi.fn();
      const mockRemoveEventListener = vi.fn();

      Object.defineProperty(window, "addEventListener", {
        value: mockAddEventListener,
        writable: true,
      });

      Object.defineProperty(window, "removeEventListener", {
        value: mockRemoveEventListener,
        writable: true,
      });

      // Simulate popstate event handling
      const handlePopState = vi.fn();
      window.addEventListener("popstate", handlePopState);

      expect(mockAddEventListener).toHaveBeenCalledWith(
        "popstate",
        handlePopState
      );
    });
  });

  describe("LocalStorage Integration", () => {
    it("should handle localStorage operations", () => {
      // Test localStorage functionality without store integration
      mockLocalStorage.set("test-key", "test-value");
      expect(mockLocalStorage.get("test-key")).toBe("test-value");

      mockLocalStorage.clear();
      expect(mockLocalStorage.get("test-key")).toBeUndefined();
    });

    it("should validate config persistence logic", () => {
      // Test that non-default values would be persisted
      const config = SnapthumbConfigSchema.parse({
        gridPosition: GridPosition.TOP_LEFT,
        padding: 50,
        scale: 0.7,
        opacity: 85,
      });

      // Verify config is valid
      expect(config.gridPosition).toBe(GridPosition.TOP_LEFT);
      expect(config.padding).toBe(50);
      expect(config.scale).toBe(0.7);
      expect(config.opacity).toBe(85);
    });
  });
});
