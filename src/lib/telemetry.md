# Telemetry System

A lightweight event logging system for tracking user interactions and application usage.

## Features

- **Privacy-First**: Respects "Do Not Track" (DNT) settings
- **Debounced Events**: Control changes are debounced to prevent spam
- **Type-Safe**: Full TypeScript support with validated event types
- **Performance-Optimized**: Non-blocking, fails silently
- **Session-Based**: Tracks events per browser session

## Usage

### Basic Setup

```tsx
import { useTelemetry } from "@/hooks/useTelemetry";

function MyComponent() {
  const { trackControlChange, trackGenerateClick, trackDownloadClick } =
    useTelemetry();

  // Track control changes (automatically debounced)
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    trackControlChange("slider", "quality", value);
  };

  // Track generate button clicks
  const handleGenerate = async () => {
    trackGenerateClick("my-component", { quality: 0.8 });
    // ... generation logic
  };

  // Track downloads
  const handleDownload = () => {
    trackDownloadClick("png", "export-dialog", fileSize);
  };
}
```

### Event Types

#### Page Views

Automatically tracked on route changes. No manual tracking needed.

#### Control Changes

Track user interactions with controls (sliders, buttons, selects):

```tsx
trackControlChange("slider", "zoom", newValue);
trackControlChange("button", "toggleGrid", true);
trackControlChange("select", "format", "png");
```

#### Generate Events

Track generation actions:

```tsx
// Track click
trackGenerateClick("wire-generate", { settings });

// Track success
trackGenerateSuccess("wire-generate", duration, settings);

// Track error
trackGenerateError("wire-generate", errorMessage, duration, settings);
```

#### Download Events

Track file downloads:

```tsx
trackDownloadClick("png", "export-dialog", fileSize);
```

## Configuration

### Environment Variables

- `VITE_ENABLE_ANALYTICS`: Enable/disable telemetry (default: false)
- `VITE_API_URL` or `VITE_API_BASE_URL`: API endpoint for telemetry

### Do Not Track Support

The system automatically respects:

- `navigator.doNotTrack` header
- Global Privacy Control
- Feature flag `VITE_ENABLE_ANALYTICS`

## API Integration

### Current Implementation

- Mock API endpoint in development
- Logs events to console in dev mode
- Ready for backend integration

### Backend Integration

Replace the mock implementation in `src/lib/telemetry-api.ts`:

```tsx
export const sendTelemetryEvent = async (
  event: TelemetryEvent
): Promise<void> => {
  const response = await fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(`Telemetry failed: ${response.status}`);
  }
};
```

### Supabase Integration

Events can be forwarded to Supabase for storage and analysis:

```tsx
// In your backend
const { data, error } = await supabase.from("telemetry_events").insert([
  {
    type: event.type,
    timestamp: event.timestamp,
    session_id: event.sessionId,
    page: event.page,
    metadata: event.metadata,
    user_agent: event.userAgent,
    viewport: event.viewport,
  },
]);
```

## Event Schema

All events include:

- `type`: Event type (page_view, control_change, etc.)
- `timestamp`: Unix timestamp
- `sessionId`: Unique session identifier
- `page`: Current page path
- `userAgent`: Browser user agent
- `viewport`: Screen dimensions
- `metadata`: Event-specific data

## Performance Considerations

- Events are sent asynchronously
- Failed requests don't block user experience
- Control changes are debounced (1 second default)
- Validation prevents invalid events
- Automatic cleanup on component unmount

## Privacy & Compliance

- Respects Do Not Track settings
- No personally identifiable information collected
- Session-based tracking only
- User can disable via environment variable
- Events are anonymous by default
