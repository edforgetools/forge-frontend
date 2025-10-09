import { forgeRequest } from "./forge-layer-sdk";

export const thumb = (payload: unknown) => forgeRequest("thumb", payload);

const FORGE_LAYER_URL =
  import.meta.env.VITE_FORGE_LAYER_URL || "https://forge-layer.onrender.com";

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
