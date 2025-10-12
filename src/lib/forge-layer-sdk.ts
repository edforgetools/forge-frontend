/**
 * Forge Layer SDK - Unified API client for all Forge Layer operations
 * This provides a single interface for all API interactions
 */

// Types for API responses
export interface HealthCheckResponse {
  status: string;
  service: string;
}

export interface VersionInfoResponse {
  version: string;
  service: string;
}

export interface ThumbResponse {
  determinismHash: string;
  data: string;
  cached?: boolean;
  timestamp?: number;
  processingTime?: string;
}

export interface ApiError {
  error: string;
  statusCode?: number;
}

import { API_BASE } from "./api";

const FORGE_LAYER_URL = API_BASE || "https://forge-layer.onrender.com";

// Runtime guard to ensure URL is valid
if (
  typeof FORGE_LAYER_URL !== "string" ||
  !FORGE_LAYER_URL.startsWith("http")
) {
  throw new Error(
    `Invalid FORGE_LAYER_URL: ${FORGE_LAYER_URL}. Expected a valid HTTP/HTTPS URL.`
  );
}

/**
 * Generic API request handler with error handling and rate limit tracking
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${FORGE_LAYER_URL}${endpoint}`;

  // Get authorization from options or try to get from localStorage
  const authToken =
    (options.headers as Record<string, string>)?.["Authorization"] ||
    (typeof window !== "undefined"
      ? localStorage.getItem("forge_api_key")
      : null);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add authorization header if token is available
  if (authToken) {
    headers["Authorization"] = authToken;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Update rate limit info from response headers
    if (response.headers) {
      // Dynamically import to avoid circular dependencies
      const { rateLimitActions } = await import("@/state/rateLimitStore");
      rateLimitActions.updateRateLimit(response.headers);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API request failed: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown API error occurred");
  }
}

/**
 * Forge-specific request handler for processing endpoints
 */
export function forgeRequest(
  endpoint: string,
  payload: unknown
): Promise<ThumbResponse> {
  return apiRequest<ThumbResponse>(`/forge/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((result) => {
    // Map signature to determinismHash for consistency
    if ((result as ThumbResponse & { signature?: string }).signature) {
      result.determinismHash = (
        result as ThumbResponse & { signature: string }
      ).signature;
    }
    return result;
  });
}

/**
 * Health check endpoint
 */
export function healthCheck(): Promise<HealthCheckResponse> {
  return apiRequest<HealthCheckResponse>("/health");
}

/**
 * Version info endpoint
 */
export function getVersionInfo(): Promise<VersionInfoResponse> {
  return apiRequest<VersionInfoResponse>("/version");
}
