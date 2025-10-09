import { test, expect } from "@playwright/test";

const FORGE_LAYER_URL = "http://localhost:3001";

test.describe("Cache + Determinism Verification", () => {
  test("should verify cache + determinism for thumb API", async ({
    request,
  }) => {
    // Test payload - using a consistent payload to ensure determinism
    const testPayload = {
      url: "https://example.com/test-image.jpg",
      options: {
        quality: 0.8,
        format: "jpeg",
        width: 800,
        height: 600,
      },
      timestamp: 1640995200000, // Fixed timestamp for determinism
    };

    console.log("Making first thumb API call...");
    const startTime1 = Date.now();

    const response1 = await request.post(`${FORGE_LAYER_URL}/forge/thumb`, {
      data: testPayload,
    });

    const endTime1 = Date.now();
    const latency1 = endTime1 - startTime1;

    console.log(`First call latency: ${latency1}ms`);
    console.log(`First call status: ${response1.status()}`);

    // Verify first call was successful
    expect(response1.status()).toBeLessThan(500);

    let result1;
    try {
      result1 = await response1.json();
      console.log("First call result:", JSON.stringify(result1, null, 2));
    } catch (error) {
      console.error("Failed to parse first response:", error);
      throw error;
    }

    // Verify determinismHash exists in first response
    expect(result1).toHaveProperty("determinismHash");
    expect(typeof result1.determinismHash).toBe("string");
    expect(result1.determinismHash.length).toBeGreaterThan(0);

    const firstDeterminismHash = result1.determinismHash;
    console.log(`First determinismHash: ${firstDeterminismHash}`);

    // Wait a small amount to ensure timing difference is measurable
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("Making second thumb API call with identical payload...");
    const startTime2 = Date.now();

    const response2 = await request.post(`${FORGE_LAYER_URL}/forge/thumb`, {
      data: testPayload,
    });

    const endTime2 = Date.now();
    const latency2 = endTime2 - startTime2;

    console.log(`Second call latency: ${latency2}ms`);
    console.log(`Second call status: ${response2.status()}`);

    // Verify second call was successful
    expect(response2.status()).toBeLessThan(500);

    let result2;
    try {
      result2 = await response2.json();
      console.log("Second call result:", JSON.stringify(result2, null, 2));
    } catch (error) {
      console.error("Failed to parse second response:", error);
      throw error;
    }

    // Verify determinismHash exists in second response
    expect(result2).toHaveProperty("determinismHash");
    expect(typeof result2.determinismHash).toBe("string");
    expect(result2.determinismHash.length).toBeGreaterThan(0);

    const secondDeterminismHash = result2.determinismHash;
    console.log(`Second determinismHash: ${secondDeterminismHash}`);

    // Verify determinism: identical payload should produce identical hash
    expect(secondDeterminismHash).toBe(firstDeterminismHash);
    console.log(
      "✅ Determinism verified: identical payloads produced identical determinismHash"
    );

    // Verify caching: second call should be faster (at least 50ms faster)
    const latencyDifference = latency1 - latency2;
    console.log(
      `Latency difference: ${latencyDifference}ms (first: ${latency1}ms, second: ${latency2}ms)`
    );

    expect(latencyDifference).toBeGreaterThanOrEqual(50);
    console.log("✅ Cache verified: second call was at least 50ms faster");

    // Additional verification: if caching is working, we might also expect
    // the same response body (if the API returns cached results)
    if (result1.data && result2.data) {
      expect(result2.data).toBe(result1.data);
      console.log("✅ Cache verified: identical response data returned");
    }

    console.log("🎉 All cache + determinism tests passed!");
  });

  test("should verify determinism with different payloads produces different hashes", async ({
    request,
  }) => {
    const basePayload = {
      url: "https://example.com/test-image-2.jpg",
      options: {
        quality: 0.8,
        format: "jpeg",
        width: 800,
        height: 600,
      },
      timestamp: 1640995200000,
    };

    // Test with different quality setting
    const payload1 = { ...basePayload };
    const payload2 = {
      ...basePayload,
      options: { ...basePayload.options, quality: 0.9 },
    };

    console.log("Payload 1:", JSON.stringify(payload1, null, 2));
    console.log("Payload 2:", JSON.stringify(payload2, null, 2));

    console.log("Testing determinism with different payloads...");

    const response1 = await request.post(`${FORGE_LAYER_URL}/forge/thumb`, {
      data: payload1,
    });

    const response2 = await request.post(`${FORGE_LAYER_URL}/forge/thumb`, {
      data: payload2,
    });

    expect(response1.status()).toBeLessThan(500);
    expect(response2.status()).toBeLessThan(500);

    const result1 = await response1.json();
    const result2 = await response2.json();

    expect(result1).toHaveProperty("determinismHash");
    expect(result2).toHaveProperty("determinismHash");

    console.log(`Hash 1: ${result1.determinismHash}`);
    console.log(`Hash 2: ${result2.determinismHash}`);

    // Different payloads should produce different hashes
    expect(result1.determinismHash).not.toBe(result2.determinismHash);
    console.log(
      "✅ Determinism verified: different payloads produced different determinismHash"
    );
  });
});
