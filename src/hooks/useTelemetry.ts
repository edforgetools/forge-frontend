import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { env, getApiUrl } from "@/env";
import {
  sendTelemetryEvent,
  validateTelemetryEvent,
} from "@/lib/telemetry-api";
import type {
  TelemetryEvent,
  TelemetryConfig,
  TelemetryEventType,
  ControlChangeEvent,
  GenerateClickEvent,
  GenerateSuccessEvent,
  GenerateErrorEvent,
  DownloadClickEvent,
  PageViewEvent,
} from "@/types/telemetry";

// Generate a session ID that persists for the browser session
const getSessionId = (): string => {
  const existing = sessionStorage.getItem("forge-telemetry-session");
  if (existing) return existing;

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem("forge-telemetry-session", sessionId);
  return sessionId;
};

// Check if Do Not Track is enabled
const isDoNotTrackEnabled = (): boolean => {
  if (typeof navigator === "undefined") return false;

  // Check DNT header
  if (navigator.doNotTrack === "1" || navigator.doNotTrack === "yes") {
    return true;
  }

  // Check for DNT in global privacy control
  if (
    "globalPrivacyControl" in navigator &&
    (navigator as any).globalPrivacyControl
  ) {
    return true;
  }

  return false;
};

// Check if analytics are enabled
const isAnalyticsEnabled = (): boolean => {
  // Respect DNT
  if (isDoNotTrackEnabled()) return false;

  // Check feature flag
  return env.VITE_ENABLE_ANALYTICS;
};

// Create base telemetry configuration
const createConfig = (): TelemetryConfig => ({
  enabled: isAnalyticsEnabled(),
  apiUrl: `${getApiUrl()}/telemetry`,
  sessionId: getSessionId(),
  debounceMs: 1000, // 1 second debounce for control changes
});

export const useTelemetry = () => {
  const location = useLocation();
  const [config] = useState<TelemetryConfig>(createConfig);
  const debounceTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastControlValues = useRef<Map<string, unknown>>(new Map());

  // Send telemetry event to API
  const sendEvent = useCallback(
    async (event: TelemetryEvent): Promise<void> => {
      if (!config.enabled) return;

      // Validate event before sending
      if (!validateTelemetryEvent(event)) {
        console.warn("Invalid telemetry event:", event);
        return;
      }

      try {
        await sendTelemetryEvent(event);
      } catch (error) {
        // Silently fail for telemetry - don't interrupt user experience
        if (error instanceof Error) {
          console.warn("Telemetry event failed:", error.message);
        }
      }
    },
    [config.enabled]
  );

  // Create base event data
  const createBaseEvent = useCallback(
    (
      type: TelemetryEventType,
      metadata?: Record<string, unknown>
    ): TelemetryEvent => ({
      type,
      timestamp: Date.now(),
      sessionId: config.sessionId,
      page: location.pathname,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      metadata: metadata || {},
    }),
    [config.sessionId, location.pathname]
  );

  // Track page views
  const trackPageView = useCallback(
    (referrer?: string, previousPage?: string) => {
      const event: PageViewEvent = {
        ...createBaseEvent("page_view"),
        type: "page_view",
        metadata: {
          referrer: referrer || document.referrer || undefined,
          previousPage,
        },
      };
      sendEvent(event);
    },
    [createBaseEvent, sendEvent]
  );

  // Track control changes with debouncing
  const trackControlChange = useCallback(
    (
      controlType: string,
      controlId: string,
      value: unknown,
      customDebounceMs?: number
    ) => {
      const debounceKey = `${controlType}_${controlId}`;
      const debounceMs = customDebounceMs ?? config.debounceMs;

      // Clear existing timeout
      const existingTimeout = debounceTimeouts.current.get(debounceKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Get previous value for comparison
      const previousValue = lastControlValues.current.get(debounceKey);
      lastControlValues.current.set(debounceKey, value);

      // Set new timeout
      const timeout = setTimeout(() => {
        const event: ControlChangeEvent = {
          ...createBaseEvent("control_change"),
          type: "control_change",
          metadata: {
            controlType,
            controlId,
            value,
            previousValue,
          },
        };
        sendEvent(event);
        debounceTimeouts.current.delete(debounceKey);
      }, debounceMs);

      debounceTimeouts.current.set(debounceKey, timeout);
    },
    [config.debounceMs, createBaseEvent, sendEvent]
  );

  // Track generate button clicks
  const trackGenerateClick = useCallback(
    (source: string, settings?: Record<string, unknown>) => {
      const event: GenerateClickEvent = {
        ...createBaseEvent("generate_click"),
        type: "generate_click",
        metadata: {
          source,
          settings,
        },
      };
      sendEvent(event);
    },
    [createBaseEvent, sendEvent]
  );

  // Track successful generation
  const trackGenerateSuccess = useCallback(
    (source: string, duration: number, settings?: Record<string, unknown>) => {
      const event: GenerateSuccessEvent = {
        ...createBaseEvent("generate_success"),
        type: "generate_success",
        metadata: {
          source,
          duration,
          settings,
        },
      };
      sendEvent(event);
    },
    [createBaseEvent, sendEvent]
  );

  // Track generation errors
  const trackGenerateError = useCallback(
    (
      source: string,
      error: string,
      duration?: number,
      settings?: Record<string, unknown>
    ) => {
      const event: GenerateErrorEvent = {
        ...createBaseEvent("generate_error"),
        type: "generate_error",
        metadata: {
          source,
          error,
          duration,
          settings,
        },
      };
      sendEvent(event);
    },
    [createBaseEvent, sendEvent]
  );

  // Track download clicks
  const trackDownloadClick = useCallback(
    (format: string, source: string, size?: number) => {
      const event: DownloadClickEvent = {
        ...createBaseEvent("download_click"),
        type: "download_click",
        metadata: {
          format,
          source,
          size,
        },
      };
      sendEvent(event);
    },
    [createBaseEvent, sendEvent]
  );

  // Track page views on route changes
  useEffect(() => {
    if (config.enabled) {
      trackPageView();
    }
  }, [location.pathname, config.enabled, trackPageView]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      debounceTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      debounceTimeouts.current.clear();
    };
  }, []);

  return {
    enabled: config.enabled,
    trackPageView,
    trackControlChange,
    trackGenerateClick,
    trackGenerateSuccess,
    trackGenerateError,
    trackDownloadClick,
  };
};
