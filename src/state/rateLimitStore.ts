import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { validateApiKey, type Tier } from "@/lib/auth-utils";

export type RateLimitState = {
  // Rate limit information from X-RateLimit-* headers
  limit: number; // X-RateLimit-Limit
  remaining: number; // X-RateLimit-Remaining
  reset: number; // X-RateLimit-Reset (timestamp)
  retryAfter?: number; // Retry-After header (seconds)

  // Tier information
  tier: Tier;
  isPro: boolean;

  // UI state
  showUpgradeCTA: boolean;
  lastUpdated: number;
};

export type RateLimitActions = {
  // Update rate limit info from API response headers
  updateRateLimit: (headers: Headers) => void;

  // Tier management
  updateTier: () => void;

  // Manual updates
  setRemaining: (remaining: number) => void;
  setLimit: (limit: number) => void;
  setReset: (reset: number) => void;

  // UI actions
  setShowUpgradeCTA: (show: boolean) => void;
  dismissUpgradeCTA: () => void;

  // Reset
  resetRateLimit: () => void;
};

export type RateLimitStore = RateLimitState & RateLimitActions;

const defaultState: RateLimitState = {
  limit: 10, // Default to 10 free per day
  remaining: 10,
  reset: Date.now() + 24 * 60 * 60 * 1000, // Reset in 24 hours
  retryAfter: undefined,
  tier: "free",
  isPro: false,
  showUpgradeCTA: false,
  lastUpdated: Date.now(),
};

export const useRateLimitStore = create<RateLimitStore>()(
  devtools(
    (set) => ({
      ...defaultState,

      updateRateLimit: (headers: Headers) => {
        const limitStr = headers.get("X-RateLimit-Limit");
        const remainingStr = headers.get("X-RateLimit-Remaining");
        const resetStr = headers.get("X-RateLimit-Reset");
        const retryAfter = headers.get("Retry-After");
        const tier = (headers.get("X-Forge-Tier") as Tier) || "free";

        // Parse with fallbacks for invalid values
        const limit = limitStr
          ? isNaN(parseInt(limitStr))
            ? 10
            : parseInt(limitStr)
          : 10;
        const remaining = remainingStr
          ? isNaN(parseInt(remainingStr))
            ? 10
            : parseInt(remainingStr)
          : 10;
        const reset = resetStr
          ? isNaN(parseInt(resetStr))
            ? 0
            : parseInt(resetStr)
          : 0;

        const newState = {
          limit,
          remaining,
          reset: reset > 0 ? reset * 1000 : Date.now() + 24 * 60 * 60 * 1000, // Convert to milliseconds
          retryAfter: retryAfter
            ? parseInt(retryAfter) || undefined
            : undefined,
          tier: tier === "pro" || tier === "free" ? tier : "free", // Validate tier
          isPro: tier === "pro",
          lastUpdated: Date.now(),
          showUpgradeCTA: remaining === 0 && tier === "free",
        };

        set(newState);
      },

      updateTier: () => {
        const authToken =
          typeof window !== "undefined"
            ? localStorage.getItem("forge_api_key")
            : null;
        const { tier } = validateApiKey(authToken ? `Bearer ${authToken}` : "");

        set({
          tier,
          isPro: tier === "pro",
          lastUpdated: Date.now(),
        });
      },

      setRemaining: (remaining) => {
        set({
          remaining,
          lastUpdated: Date.now(),
          showUpgradeCTA: remaining === 0,
        });
      },

      setLimit: (limit) => {
        set({
          limit,
          lastUpdated: Date.now(),
        });
      },

      setReset: (reset) => {
        set({
          reset,
          lastUpdated: Date.now(),
        });
      },

      setShowUpgradeCTA: (show) => {
        set({ showUpgradeCTA: show });
      },

      dismissUpgradeCTA: () => {
        set({ showUpgradeCTA: false });
      },

      resetRateLimit: () => {
        set({
          ...defaultState,
          lastUpdated: Date.now(),
        });
      },
    }),
    { name: "rate-limit-store" }
  )
);

// Convenience exports for easy access
export const rateLimitActions = {
  updateRateLimit: (headers: Headers) =>
    useRateLimitStore.getState().updateRateLimit(headers),
  updateTier: () => useRateLimitStore.getState().updateTier(),
  setRemaining: (remaining: number) =>
    useRateLimitStore.getState().setRemaining(remaining),
  setLimit: (limit: number) => useRateLimitStore.getState().setLimit(limit),
  setReset: (reset: number) => useRateLimitStore.getState().setReset(reset),
  setShowUpgradeCTA: (show: boolean) =>
    useRateLimitStore.getState().setShowUpgradeCTA(show),
  dismissUpgradeCTA: () => useRateLimitStore.getState().dismissUpgradeCTA(),
  resetRateLimit: () => useRateLimitStore.getState().resetRateLimit(),
};
