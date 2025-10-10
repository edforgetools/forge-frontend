/**
 * Mock Wire Generate API for testing
 * This simulates the wire generation API response
 */

import { WireGenerateResponse } from "./wire-generate";

// Mock cache to simulate caching behavior
const mockCache = new Map<string, WireGenerateResponse>();

export async function mockWireGenerateRequest(
  input: unknown,
  delay: number = 2000
): Promise<WireGenerateResponse> {
  // Create a hash for caching simulation
  const inputHash = btoa(JSON.stringify(input)).replace(/[^a-zA-Z0-9]/g, "");

  // Check if we have a cached response
  if (mockCache.has(inputHash)) {
    const cached = mockCache.get(inputHash)!;
    return {
      ...cached,
      cached: true,
      processingTime: "0ms",
    };
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Generate mock response
  const mockResponse: WireGenerateResponse = {
    determinismHash: inputHash.slice(0, 16),
    data: "mock-wire-frame-data",
    previewUrl:
      "https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Wire+Frame+Preview",
    downloadUrl:
      "https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Download+Wire+Frame",
    cached: false,
    timestamp: Date.now(),
    processingTime: `${delay}ms`,
  };

  // Cache the response
  mockCache.set(inputHash, mockResponse);

  return mockResponse;
}

// Mock API endpoint handler
export async function handleMockWireGenerate(
  request: Request
): Promise<Response> {
  try {
    const input = await request.json();

    // Simulate different processing times based on input complexity
    const overlayCount = Array.isArray(input.overlays)
      ? input.overlays.length
      : 0;
    const delay = Math.min(1000 + overlayCount * 200, 5000); // 1-5 seconds

    const result = await mockWireGenerateRequest(input, delay);

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
