# Metrics Module Documentation

This document describes the minimal metrics module that logs page views and key actions via `logEvent`. The module is designed with the AARRR framework in mind for easy migration to a real analytics backend later.

## Overview

The metrics module (`src/lib/metrics.ts`) provides a structured way to track user behavior across the Forge Tools application. All events are logged through the existing `logEvent` function and are categorized according to the AARRR framework.

## AARRR Framework Mapping

### Acquisition Events

How users discover and land on the product:

- `page_view` - User visits any page
- `tool_discovery` - User discovers a tool from homepage or navigation
- `external_referral` - User arrives from external source
- `search_landing` - User arrives from search

### Activation Events

First successful use of the product:

- `first_file_upload` - User uploads their first file
- `first_export` - User exports content for the first time
- `first_tool_use` - User uses any tool for the first time
- `onboarding_complete` - User completes initial workflow

### Retention Events

Users coming back to use the product again:

- `return_visit` - User returns to the application
- `tool_reuse` - User uses a tool they've used before
- `session_extension` - User continues activity after 5+ minute gap
- `feature_exploration` - User explores different features

### Revenue Events

Users upgrading to paid plans:

- `plan_upgrade_clicked` - User clicks to upgrade plan
- `plan_upgrade_completed` - User successfully upgrades
- `premium_feature_attempted` - User tries to use premium feature
- `watermark_removal_attempted` - User tries to remove watermark

### Referral Events

Users sharing or referring others:

- `share_clicked` - User clicks share button
- `export_shared` - User shares exported content
- `social_share` - User shares on social media
- `referral_link_used` - User uses referral link

## Usage

### Basic Event Tracking

```typescript
import { trackEvent, trackPageView, trackToolUse } from "../lib/metrics";

// Track any event
trackEvent("custom_event", { property: "value" });

// Track page views
trackPageView("home", { referrer: "google.com" });

// Track tool usage
trackToolUse("thumbnail-tool", "export", { format: "jpg" });
```

### Convenience Functions

```typescript
import {
  trackFirstFileUpload,
  trackFirstExport,
  trackPremiumFeatureAttempt,
  trackContentShare,
} from "../lib/metrics";

// Track activation milestones
trackFirstFileUpload("caption-tool", "txt");
trackFirstExport("thumbnail-tool", "image");

// Track revenue events
trackPremiumFeatureAttempt("watermark_removal", "free");

// Track sharing
trackContentShare("download", "thumbnail-tool");
```

### Session Tracking

```typescript
import { initSession, trackActivity, getSessionInfo } from "../lib/metrics";

// Initialize session (called on app start)
initSession();

// Track user activity
trackActivity("button_click");

// Get session information
const { sessionId, duration } = getSessionInfo();
```

## Integration Points

### Page Views

- **App.tsx**: Tracks route changes and page views
- **Tool Pages**: Each tool page tracks its own view

### User Actions

- **File Uploads**: CaptionTool, ThumbTool track file uploads
- **Exports**: Both tools track successful exports
- **Tool Usage**: All major tool interactions are tracked
- **Plan Changes**: PlanSelector tracks upgrade attempts

### Error Tracking

- **Global Errors**: main.tsx tracks unhandled errors
- **Component Errors**: Individual components track their errors

## Event Structure

All events follow this structure:

```typescript
{
  event: string,           // Event name
  category: string,        // AARRR category
  properties: {            // Event-specific data
    // ... custom properties
  },
  timestamp: number,       // Unix timestamp
  url: string,            // Current URL
  userAgent: string,      // Browser user agent
  sessionId?: string,     // Session identifier (if available)
}
```

## Migration to Real Analytics

When ready to migrate to a real analytics backend (e.g., Mixpanel, Amplitude, PostHog):

1. **Replace logEvent calls**: Update the `trackEvent` function to send data to your analytics service
2. **Add user identification**: Include user IDs when available
3. **Batch events**: Implement batching for better performance
4. **Add persistence**: Store events locally for offline scenarios
5. **Privacy compliance**: Add opt-out mechanisms and data retention policies

### Example Migration

```typescript
// Before (current)
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  logEvent(event, { category, ...properties });
}

// After (with real analytics)
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  // Send to real analytics service
  analytics.track(event, {
    category,
    ...properties,
    userId: getCurrentUserId(),
    timestamp: new Date().toISOString(),
  });

  // Keep logEvent for debugging
  logEvent(event, { category, ...properties });
}
```

## Event Examples

### Page View

```json
{
  "event": "page_view",
  "category": "acquisition",
  "page": "free-youtube-thumbnail-tool",
  "path": "/free-youtube-thumbnail-tool",
  "referrer": "https://google.com",
  "timestamp": 1703123456789
}
```

### First File Upload

```json
{
  "event": "first_file_upload",
  "category": "activation",
  "tool": "caption-tool",
  "fileType": "txt",
  "timestamp": 1703123456789
}
```

### Premium Feature Attempt

```json
{
  "event": "premium_feature_attempted",
  "category": "revenue",
  "feature": "watermark_removal",
  "plan": "free",
  "timestamp": 1703123456789
}
```

## Monitoring and Debugging

- All events are logged via the existing `logEvent` function
- Check browser console for event logs
- Events include timestamps and context for debugging
- Session tracking helps identify user journeys

## Privacy Considerations

- No personally identifiable information is collected
- Events are anonymous by default
- User agent and URL information is included for context
- Consider adding opt-out mechanisms for production use
