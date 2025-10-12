/**
 * Test utility for rate limiting functionality
 * This can be used to simulate API responses with rate limit headers
 */

import { rateLimitActions } from "@/state/rateLimitStore";

/**
 * Simulate an API response with rate limit headers
 */
export function simulateRateLimitResponse(
  limit: number,
  remaining: number,
  reset?: number
) {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", limit.toString());
  headers.set("X-RateLimit-Remaining", remaining.toString());

  if (reset) {
    headers.set("X-RateLimit-Reset", reset.toString());
  } else {
    // Default to 24 hours from now
    const tomorrow = Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000);
    headers.set("X-RateLimit-Reset", tomorrow.toString());
  }

  // Update the rate limit store
  rateLimitActions.updateRateLimit(headers);
}

/**
 * Test scenarios for rate limiting
 */
export const rateLimitTestScenarios = {
  // Normal usage - plenty of requests left
  normal: () => simulateRateLimitResponse(10, 8),

  // Low usage - only a few requests left
  low: () => simulateRateLimitResponse(10, 2),

  // Zero remaining - should show upgrade CTA
  zero: () => simulateRateLimitResponse(10, 0),

  // Reset in 1 hour
  resetSoon: () =>
    simulateRateLimitResponse(
      10,
      3,
      Math.floor((Date.now() + 60 * 60 * 1000) / 1000)
    ),

  // Reset in 5 minutes
  resetVerySoon: () =>
    simulateRateLimitResponse(
      10,
      1,
      Math.floor((Date.now() + 5 * 60 * 1000) / 1000)
    ),
};

/**
 * Test the rate limiting display in different states
 */
export function testRateLimitDisplay() {
  console.log("Testing rate limit display scenarios...");

  // Test normal state
  console.log("1. Normal state (8/10 remaining):");
  rateLimitTestScenarios.normal();

  // Test low state
  setTimeout(() => {
    console.log("2. Low state (2/10 remaining):");
    rateLimitTestScenarios.low();
  }, 2000);

  // Test zero state
  setTimeout(() => {
    console.log("3. Zero state (0/10 remaining):");
    rateLimitTestScenarios.zero();
  }, 4000);

  // Test reset soon
  setTimeout(() => {
    console.log("4. Reset soon (3/10 remaining, resets in 1 hour):");
    rateLimitTestScenarios.resetSoon();
  }, 6000);
}
