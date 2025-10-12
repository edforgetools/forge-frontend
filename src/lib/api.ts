// Export API_BASE from environment variables
export const API_BASE =
  import.meta.env.VITE_LAYER_BASE || import.meta.env.VITE_FORGE_LAYER_URL || "";

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string) => {
  if (!API_BASE) {
    throw new Error(
      "API_BASE is not configured. Please set VITE_LAYER_BASE in your environment variables."
    );
  }

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  // Remove trailing slash from API_BASE and add endpoint
  const baseUrl = API_BASE.replace(/\/$/, "");
  return `${baseUrl}${normalizedEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  BILLING_CHECKOUT: "/billing/checkout",
  BILLING_PORTAL: "/billing/portal",
  USER_PROFILE: "/user/profile",
  PROJECTS: "/projects",
} as const;
