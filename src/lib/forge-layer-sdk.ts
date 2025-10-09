// Mock Forge Layer SDK implementation
// This simulates the @forge-layer/sdk package interface

const FORGE_LAYER_URL =
  import.meta.env.VITE_FORGE_LAYER_URL || "https://forge-layer.onrender.com";

export function forgeRequest(endpoint: string, payload: unknown) {
  const url = `${FORGE_LAYER_URL}/forge/${endpoint}`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    const result = await response.json();
    // Map signature to determinismHash for consistency
    if (result.signature) {
      result.determinismHash = result.signature;
    }
    return result;
  });
}
