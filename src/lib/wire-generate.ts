/**
 * Wire Generate API client with retry/backoff and caching
 */

import { useCanvasStore } from "@/state/canvasStore";
import { useSnapthumbStore } from "@/lib/snapthumb-state";
import { saveWireGenerateSettings } from "./wire-generate-settings";
import { ThumbResponse } from "./api";
import { validateApiKey, getPayloadSizeLimit } from "./auth-utils";

// Layer schema types for wire generation
export interface WireGenerateInput {
  // Canvas state
  image?: string; // base64 encoded image
  videoSrc?: string;
  aspect: "16:9" | "1:1" | "9:16";
  crop: {
    x: number;
    y: number;
    w: number;
    h: number;
    active: boolean;
  };

  // Overlays
  overlays: Array<{
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
    // Logo-specific
    src?: string;
    blend?: GlobalCompositeOperation;
    // Text-specific
    text?: string;
    font?: string;
    size?: number;
    weight?: number;
    letter?: number;
    shadow?: boolean;
    align?: "left" | "center" | "right";
    color?: string;
  }>;

  // Export preferences
  prefs: {
    format: "jpeg" | "png" | "webp";
    quality: number;
    width: number;
    height: number;
    keepUnderMB: number;
  };

  // Snapthumb configuration
  snapthumb: {
    gridPosition: string;
    padding: number;
    scale: number;
    opacity: number;
    backgroundFit: string;
    quality: string;
    canvasWidth: number;
    canvasHeight: number;
  };
}

export interface WireGenerateResponse extends ThumbResponse {
  previewUrl?: string;
  downloadUrl?: string;
  cached?: boolean;
  processingTime?: string;
}

export interface WireGenerateState {
  isGenerating: boolean;
  progress: number;
  result?: WireGenerateResponse;
  error?: string;
  isCached: boolean;
  lastSuccessfulInput?: WireGenerateInput;
}

// Cache for identical inputs
const inputCache = new Map<string, WireGenerateResponse>();

/**
 * Serialize canvas and snapthumb state to wire generate input schema
 */
export function serializeWireGenerateInput(): WireGenerateInput {
  const canvasState = useCanvasStore.getState();
  const snapthumbState = useSnapthumbStore.getState();

  // Convert image to base64 if present
  let imageBase64: string | undefined;
  if (canvasState.image) {
    // This would need to be implemented based on how images are handled
    // For now, we'll assume the image source is available
    if ("src" in canvasState.image) {
      imageBase64 = canvasState.image.src || undefined;
    }
  }

  return {
    image: imageBase64,
    videoSrc: canvasState.videoSrc,
    aspect: canvasState.aspect,
    crop: canvasState.crop,
    overlays: canvasState.overlays.map((overlay) => ({
      id: overlay.id,
      type: overlay.type,
      x: overlay.x,
      y: overlay.y,
      w: overlay.w,
      h: overlay.h,
      rot: overlay.rot,
      z: overlay.z,
      locked: overlay.locked,
      hidden: overlay.hidden,
      opacity: overlay.opacity,
      ...(overlay.type === "logo"
        ? {
            src: overlay.src,
            blend: overlay.blend,
          }
        : {
            text: overlay.text,
            font: overlay.font,
            size: overlay.size,
            weight: overlay.weight,
            letter: overlay.letter,
            shadow: overlay.shadow,
            align: overlay.align,
            color: overlay.color,
          }),
    })),
    prefs: canvasState.prefs,
    snapthumb: snapthumbState.config,
  };
}

/**
 * Generate a hash for input caching
 */
export function generateInputHash(input: WireGenerateInput): string {
  // Create a stable hash of the input for caching
  const inputString = JSON.stringify(input, Object.keys(input).sort());
  return btoa(inputString).replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * API client with retry/backoff logic
 */
class WireGenerateClient {
  private maxRetries = 3;
  private baseDelay = 1000; // 1 second
  private maxDelay = 10000; // 10 seconds

  async generate(
    input: WireGenerateInput,
    onProgress?: (progress: number) => void
  ): Promise<WireGenerateResponse> {
    const inputHash = generateInputHash(input);

    // Check cache first
    if (inputCache.has(inputHash)) {
      const cached = inputCache.get(inputHash)!;
      onProgress?.(100);
      return { ...cached, cached: true };
    }

    // Make API request with retry logic
    return this.requestWithRetry(input, onProgress);
  }

  private async requestWithRetry(
    input: WireGenerateInput,
    onProgress?: (progress: number) => void
  ): Promise<WireGenerateResponse> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        onProgress?.(attempt * 25); // Progress based on attempts

        const response = await this.makeRequest(input);

        // Cache successful response
        const inputHash = generateInputHash(input);
        inputCache.set(inputHash, response);

        onProgress?.(100);
        return response;
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          this.maxDelay
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private async makeRequest(
    input: WireGenerateInput
  ): Promise<WireGenerateResponse> {
    // For development, use mock API
    if (import.meta.env.DEV) {
      const { mockWireGenerateRequest } = await import("./mock-wire-generate");
      const overlayCount = input.overlays.length;
      const delay = Math.min(1000 + overlayCount * 200, 5000); // 1-5 seconds
      return mockWireGenerateRequest(input, delay);
    }

    // Get authorization token from localStorage
    const authToken =
      typeof window !== "undefined"
        ? localStorage.getItem("forge_api_key")
        : null;
    const { tier } = validateApiKey(authToken);

    // Validate payload size based on tier
    const payload = JSON.stringify(input);
    const payloadSize = new Blob([payload]).size;
    const sizeLimit = getPayloadSizeLimit(tier);

    if (payloadSize > sizeLimit) {
      throw new Error(
        `Payload size (${Math.round(payloadSize / 1024 / 1024)}MB) exceeds limit for ${tier} tier (${Math.round(sizeLimit / 1024 / 1024)}MB)`
      );
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token is available
    if (authToken) {
      headers["Authorization"] = authToken;
    }

    // Production API call
    const response = await fetch("/api/wire-generate", {
      method: "POST",
      headers,
      body: payload,
    });

    // Update rate limit info from response headers
    if (response.headers) {
      const { rateLimitActions } = await import("@/state/rateLimitStore");
      rateLimitActions.updateRateLimit(response.headers);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Request failed: ${response.statusText}`
      );
    }

    return await response.json();
  }
}

// Export singleton instance
export const wireGenerateClient = new WireGenerateClient();

/**
 * Hook for managing wire generate state
 */
export function useWireGenerate() {
  const [state, setState] = React.useState<WireGenerateState>({
    isGenerating: false,
    progress: 0,
    isCached: false,
  });

  const generate = async (customInput?: WireGenerateInput) => {
    try {
      setState({
        isGenerating: true,
        progress: 0,
        isCached: false,
      });

      const input = customInput || serializeWireGenerateInput();
      const result = await wireGenerateClient.generate(input, (progress) => {
        setState((prev) => ({ ...prev, progress }));
      });

      // Save successful input for regeneration
      setState({
        isGenerating: false,
        progress: 100,
        result,
        isCached: result.cached || false,
        lastSuccessfulInput: input,
      });

      // Save settings on successful generation
      saveWireGenerateSettings(input);

      return result;
    } catch (error) {
      setState({
        isGenerating: false,
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        isCached: false,
      });
      throw error;
    }
  };

  const regenerateWithNewFrame = async () => {
    if (!state.lastSuccessfulInput) {
      throw new Error("No previous generation to regenerate from");
    }

    // Create new input with current frame but keeping overlay settings
    const currentInput = serializeWireGenerateInput();
    const regeneratedInput = {
      ...state.lastSuccessfulInput,
      // Keep current image/video but use previous overlay settings
      image: currentInput.image,
      videoSrc: currentInput.videoSrc,
      // Keep previous overlay settings
      overlays: state.lastSuccessfulInput.overlays,
      snapthumb: state.lastSuccessfulInput.snapthumb,
    };

    return generate(regeneratedInput);
  };

  const reset = () => {
    setState({
      isGenerating: false,
      progress: 0,
      isCached: false,
      lastSuccessfulInput: undefined,
    });
  };

  return {
    ...state,
    generate,
    regenerateWithNewFrame,
    reset,
    canRegenerate: !!state.lastSuccessfulInput,
  };
}

// Import React for the hook
import React from "react";
