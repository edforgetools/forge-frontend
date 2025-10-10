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

const FORGE_LAYER_URL =
  import.meta.env.VITE_FORGE_LAYER_URL || "https://forge-layer.onrender.com";

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
 * Generic API request handler with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${FORGE_LAYER_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

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
