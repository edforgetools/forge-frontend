/**
 * Authorization utilities for API key validation and tier management
 */

import { env } from "@/env";

export type Tier = "free" | "pro";

export interface AuthResult {
  isValid: boolean;
  tier: Tier;
  key?: string;
}

/**
 * Validates a Bearer token against the configured API keys
 */
export function validateApiKey(authHeader: string | null): AuthResult {
  if (!authHeader) {
    return { isValid: false, tier: "free" };
  }

  // Extract Bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { isValid: false, tier: "free" };
  }

  const token = match[1];
  const validKeys = env.VITE_FORGE_API_KEYS;

  // Check if token matches any valid key
  const isValid = validKeys.includes(token || "");

  return {
    isValid,
    tier: isValid ? "pro" : "free",
    key: isValid ? token : undefined,
  };
}

/**
 * Gets the tier from a request's Authorization header
 */
export function getTierFromRequest(request: Request): Tier {
  const authHeader = request.headers.get("Authorization");
  const { tier } = validateApiKey(authHeader);
  return tier;
}

/**
 * Checks if a request has valid pro authorization
 */
export function isProRequest(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  const { isValid, tier } = validateApiKey(authHeader);
  return isValid && tier === "pro";
}

/**
 * Gets payload size limits based on tier
 */
export function getPayloadSizeLimit(tier: Tier): number {
  switch (tier) {
    case "pro":
      return 50 * 1024 * 1024; // 50MB for pro
    case "free":
    default:
      return 10 * 1024 * 1024; // 10MB for free
  }
}

/**
 * Checks if a payload size is within the tier's limit
 */
export function isPayloadSizeValid(payloadSize: number, tier: Tier): boolean {
  const limit = getPayloadSizeLimit(tier);
  return payloadSize <= limit;
}
