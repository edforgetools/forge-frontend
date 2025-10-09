import { forgeRequest } from "forge-sdk";

export const thumb = (payload: unknown) => forgeRequest("thumb", payload);

export const healthCheck = async () => {
  return await forgeRequest("health", {});
};

export const getVersionInfo = async () => {
  return await forgeRequest("version", {});
};
