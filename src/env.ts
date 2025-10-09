import { z } from "zod";

// Define the environment schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Vite specific
  VITE_APP_TITLE: z.string().optional(),
  VITE_APP_DESCRIPTION: z.string().optional(),

  // API endpoints
  VITE_API_URL: z.string().url().optional(),
  VITE_API_BASE_URL: z.string().url().optional(),

  // Authentication
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),

  // Analytics
  VITE_VERCEL_ANALYTICS_ID: z.string().optional(),
  VITE_GOOGLE_ANALYTICS_ID: z.string().optional(),

  // Feature flags
  VITE_ENABLE_ANALYTICS: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  VITE_ENABLE_DEBUG: z
    .string()
    .default("false")
    .transform((val) => val === "true"),

  // Build info
  VITE_BUILD_TIME: z.string().optional(),
  VITE_BUILD_VERSION: z.string().optional(),
  VITE_BUILD_COMMIT: z.string().optional(),

  // External services
  VITE_SANITY_PROJECT_ID: z.string().optional(),
  VITE_SANITY_DATASET: z.string().optional(),
  VITE_SANITY_API_VERSION: z.string().default("2024-01-01"),

  // Development tools
  VITE_ENABLE_MOCK_API: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  VITE_MOCK_API_DELAY: z
    .string()
    .default("500")
    .transform((val) => parseInt(val, 10)),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => {
        if (
          err.code === "invalid_type" &&
          "received" in err &&
          err.received === "undefined"
        ) {
          return `${err.path.join(".")} is required but not set`;
        }
        return `${err.path.join(".")}: ${err.message}`;
      });

      const errorMessage = new Error(
        `Environment validation failed:\n${missingVars.join("\n")}`
      );
      (errorMessage as Error & { cause?: unknown }).cause = error;
      throw errorMessage;
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>;

// Helper function to check if we're in development
export const isDevelopment = env.NODE_ENV === "development";

// Helper function to check if we're in production
export const isProduction = env.NODE_ENV === "production";

// Helper function to check if we're in test
export const isTest = env.NODE_ENV === "test";

// Helper function to get API URL
export const getApiUrl = () => {
  return env.VITE_API_URL ?? env.VITE_API_BASE_URL ?? "/api";
};

// Helper function to get build info
export const getBuildInfo = () => {
  return {
    time: env.VITE_BUILD_TIME,
    version: env.VITE_BUILD_VERSION,
    commit: env.VITE_BUILD_COMMIT,
  };
};

// Helper function to get feature flags
export const getFeatureFlags = () => {
  return {
    analytics: env.VITE_ENABLE_ANALYTICS,
    debug: env.VITE_ENABLE_DEBUG,
    mockApi: env.VITE_ENABLE_MOCK_API,
  };
};
