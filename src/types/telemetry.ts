// Telemetry event types and interfaces
export type TelemetryEventType =
  | "page_view"
  | "control_change"
  | "generate_click"
  | "generate_success"
  | "generate_error"
  | "download_click";

export interface TelemetryEvent {
  type: TelemetryEventType;
  timestamp: number;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  metadata?: Record<string, unknown>;
}

export interface TelemetryConfig {
  enabled: boolean;
  apiUrl: string;
  sessionId: string;
  userId?: string;
  debounceMs: number;
}

export interface ControlChangeEvent extends TelemetryEvent {
  type: "control_change";
  metadata: {
    controlType: string;
    controlId: string;
    value: unknown;
    previousValue?: unknown;
  };
}

export interface GenerateClickEvent extends TelemetryEvent {
  type: "generate_click";
  metadata: {
    source: string;
    settings?: Record<string, unknown>;
  };
}

export interface GenerateSuccessEvent extends TelemetryEvent {
  type: "generate_success";
  metadata: {
    source: string;
    duration: number;
    settings?: Record<string, unknown>;
  };
}

export interface GenerateErrorEvent extends TelemetryEvent {
  type: "generate_error";
  metadata: {
    source: string;
    error: string;
    duration?: number;
    settings?: Record<string, unknown>;
  };
}

export interface DownloadClickEvent extends TelemetryEvent {
  type: "download_click";
  metadata: {
    format: string;
    size?: number;
    source: string;
  };
}

export interface PageViewEvent extends TelemetryEvent {
  type: "page_view";
  metadata: {
    referrer?: string;
    previousPage?: string;
  };
}
