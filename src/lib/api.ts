// Forge Layer API client
const FORGE_LAYER_URL =
  process.env.FORGE_LAYER_URL || "https://forge-layer.onrender.com";

async function forgeRequest(endpoint: string, payload: unknown) {
  const url = `${FORGE_LAYER_URL}/forge/${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return await response.json();
}

export const thumb = (payload: unknown) => forgeRequest("thumb", payload);

export const healthCheck = async () => {
  const response = await fetch(`${FORGE_LAYER_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return await response.json();
};

export const getVersionInfo = async () => {
  const response = await fetch(`${FORGE_LAYER_URL}/version`);
  if (!response.ok) {
    throw new Error(`Version check failed: ${response.statusText}`);
  }
  return await response.json();
};
