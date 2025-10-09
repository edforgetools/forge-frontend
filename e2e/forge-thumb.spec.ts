import { test, expect } from "@playwright/test";

test.describe("Forge Thumb Endpoint", () => {
  test("should respond to /api/forge/thumb endpoint", async ({ request }) => {
    // Test the /api/forge/thumb endpoint which should proxy to forge-layer
    const response = await request.post("/api/forge/thumb", {
      data: {
        // Minimal test payload - just check that endpoint is accessible
        test: true,
      },
    });

    // We expect either a successful response or a specific error from forge-layer
    // The important thing is that the endpoint is accessible and routes correctly
    expect(response.status()).toBeLessThan(500); // Not a server error

    // If it's a 4xx error, that's expected if forge-layer requires specific payload
    // The key is that the routing works and we don't get a 404 or 500
    const status = response.status();
    expect([200, 201, 400, 401, 422].includes(status)).toBe(true);
  });

  test("should handle health check endpoint", async ({ request }) => {
    // Test the health endpoint as well to ensure routing works
    const response = await request.get("/api/health");

    // Health endpoint should be accessible
    expect(response.status()).toBeLessThan(500);
  });
});
