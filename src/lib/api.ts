/**
 * Unified API surface for Forge Layer operations
 * All API interactions should go through this module
 */

import {
  forgeRequest,
  healthCheck,
  getVersionInfo,
  type ThumbResponse,
  type HealthCheckResponse,
  type VersionInfoResponse,
  type ApiError,
} from "./forge-layer-sdk";

// Re-export types for consumers
export type {
  ThumbResponse,
  HealthCheckResponse,
  VersionInfoResponse,
  ApiError,
};

// Re-export all API functions
export { forgeRequest, healthCheck, getVersionInfo };

/**
 * Thumbnail generation endpoint
 */
export const thumb = (payload: unknown): Promise<ThumbResponse> =>
  forgeRequest("thumb", payload);
