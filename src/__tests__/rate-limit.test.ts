import { describe, it, expect, beforeEach } from "vitest";
import { rateLimitActions, useRateLimitStore } from "@/state/rateLimitStore";

describe("Rate Limit UI", () => {
  beforeEach(() => {
    // Reset store state before each test
    rateLimitActions.resetRateLimit();
  });

  describe("Header Parsing", () => {
    it("should parse rate limit headers correctly", () => {
      const headers = new Headers({
        "X-RateLimit-Limit": "50",
        "X-RateLimit-Remaining": "25",
        "X-RateLimit-Reset": "1640995200", // Unix timestamp
        "X-Forge-Tier": "free",
      });

      rateLimitActions.updateRateLimit(headers);

      const state = useRateLimitStore.getState();
      expect(state.limit).toBe(50);
      expect(state.remaining).toBe(25);
      expect(state.reset).toBe(1640995200000); // Converted to milliseconds
      expect(state.tier).toBe("free");
      expect(state.isPro).toBe(false);
    });

    it("should handle Pro tier correctly", () => {
      const headers = new Headers({
        "X-RateLimit-Limit": "1000",
        "X-RateLimit-Remaining": "999",
        "X-RateLimit-Reset": "1640995200",
        "X-Forge-Tier": "pro",
      });

      rateLimitActions.updateRateLimit(headers);

      const state = useRateLimitStore.getState();
      expect(state.tier).toBe("pro");
      expect(state.isPro).toBe(true);
      expect(state.showUpgradeCTA).toBe(false); // Pro users don't see upgrade CTA
    });

    it("should show upgrade CTA when free tier limit is reached", () => {
      const headers = new Headers({
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "1640995200",
        "X-Forge-Tier": "free",
      });

      rateLimitActions.updateRateLimit(headers);

      const state = useRateLimitStore.getState();
      expect(state.remaining).toBe(0);
      expect(state.tier).toBe("free");
      expect(state.isPro).toBe(false);
      expect(state.showUpgradeCTA).toBe(true); // Should show upgrade CTA
    });

    it("should hide upgrade CTA for Pro tier even when remaining is 0", () => {
      const headers = new Headers({
        "X-RateLimit-Limit": "1000",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "1640995200",
        "X-Forge-Tier": "pro",
      });

      rateLimitActions.updateRateLimit(headers);

      const state = useRateLimitStore.getState();
      expect(state.remaining).toBe(0);
      expect(state.tier).toBe("pro");
      expect(state.isPro).toBe(true);
      expect(state.showUpgradeCTA).toBe(false); // Pro users don't see upgrade CTA
    });

    it("should handle missing headers gracefully", () => {
      const headers = new Headers();

      rateLimitActions.updateRateLimit(headers);

      const state = useRateLimitStore.getState();
      expect(state.limit).toBe(10); // Default value
      expect(state.remaining).toBe(10); // Default value
      expect(state.tier).toBe("free"); // Default value
      expect(state.isPro).toBe(false);
    });

    it("should handle Retry-After header", () => {
      const headers = new Headers({
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "1640995200",
        "Retry-After": "3600",
        "X-Forge-Tier": "free",
      });

      rateLimitActions.updateRateLimit(headers);

      const state = useRateLimitStore.getState();
      expect(state.retryAfter).toBe(3600);
    });

    it("should handle invalid header values", () => {
      const headers = new Headers({
        "X-RateLimit-Limit": "invalid",
        "X-RateLimit-Remaining": "not-a-number",
        "X-RateLimit-Reset": "invalid-timestamp",
        "X-Forge-Tier": "unknown-tier",
      });

      rateLimitActions.updateRateLimit(headers);

      const state = useRateLimitStore.getState();
      expect(state.limit).toBe(10); // Default fallback
      expect(state.remaining).toBe(10); // Default fallback
      expect(state.tier).toBe("free"); // Default fallback
      expect(state.isPro).toBe(false);
    });
  });

  describe("UI State Management", () => {
    it("should allow dismissing upgrade CTA", () => {
      const headers = new Headers({
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "1640995200",
        "X-Forge-Tier": "free",
      });

      rateLimitActions.updateRateLimit(headers);
      expect(useRateLimitStore.getState().showUpgradeCTA).toBe(true);

      rateLimitActions.dismissUpgradeCTA();
      expect(useRateLimitStore.getState().showUpgradeCTA).toBe(false);
    });

    it("should allow manual state updates", () => {
      rateLimitActions.setRemaining(5);
      rateLimitActions.setLimit(20);
      rateLimitActions.setReset(Date.now() + 3600000);

      const state = useRateLimitStore.getState();
      expect(state.remaining).toBe(5);
      expect(state.limit).toBe(20);
      expect(state.reset).toBeGreaterThan(Date.now());
    });
  });
});
