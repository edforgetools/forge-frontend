# Growth Hooks Implementation

## Overview

This implementation adds comprehensive growth hooks to the Forge Tools application, including share buttons, upgrade CTAs, toast confirmations, and analytics events.

## Components Added

### 1. Toast Notification System

- **`src/components/ui/toast.tsx`** - Toast component with success/error/info variants
- **`src/components/ui/toaster.tsx`** - Toaster container component
- **`src/hooks/useToast.ts`** - Hook for managing toast state and actions

### 2. Share Button Component

- **`src/components/ShareButton.tsx`** - Reusable share button with copy link functionality
- Supports native share API (mobile) with clipboard fallback
- Tracks share events with platform-specific analytics

### 3. Upgrade CTA Component

- **`src/components/UpgradeCTA.tsx`** - Flexible upgrade call-to-action component
- Multiple variants: banner, card, button, inline
- Supports Pro and Plus plan targeting
- Tracks upgrade click events

## Analytics Events Implemented

### Page View Events

- `page_view_thumbnail_tool` - YouTube thumbnail tool page views
- `page_view_caption_tool` - Podcast caption tool page views
- `page_view_audiogram_tool` - Audiogram tool page views
- `page_view_clipper_tool` - Video clipper tool page views

### Activation Events

- `thumbnail_export` - When user exports a thumbnail (already implemented)
- `caption_generate` - When user generates captions (already implemented)

### Revenue Events

- `upgrade_click` - When user clicks upgrade CTA
- Enhanced with plan, feature, and context tracking

### Referral Events

- `share_clicked_copy` - When user copies share link
- `share_clicked_native` - When user uses native share API
- `share_clicked_twitter` - Twitter share (extensible)
- `share_clicked_facebook` - Facebook share (extensible)
- `share_clicked_linkedin` - LinkedIn share (extensible)

### Retention Events

- `return_visit` - When user returns to the site

## Integration Points

### App.tsx

- Added toast provider and toaster component
- Enhanced page view tracking with tool-specific events
- Added return visit detection
- Integrated share buttons and upgrade CTAs on homepage

### Tool Pages

- **ThumbnailToolPage.tsx** - Added share buttons, upgrade CTAs, and page view tracking
- **CaptionToolPage.tsx** - Added share buttons, upgrade CTAs, and page view tracking
- **AudiogramToolPage.tsx** - Added share buttons, upgrade CTAs, and page view tracking
- **ClipperToolPage.tsx** - Added share buttons, upgrade CTAs, and page view tracking

### Metrics System

- Enhanced `src/lib/metrics.ts` with new event types and convenience functions
- Added `trackPageViewTool()`, `trackShareClick()`, `trackReturnVisit()` functions
- Maintained backward compatibility with existing analytics

## Testing

### Test Page

- **`test-events.html`** - Standalone test page for verifying all events
- Tests all event types with proper payloads
- Shows real-time event logging
- Can be accessed at `/test-events.html` when running dev server

### Network Verification

All events are sent as POST requests to `/api/log` with the following structure:

```json
{
  "name": "event_name",
  "meta": {
    "category": "acquisition|activation|retention|revenue|referral",
    "timestamp": 1234567890,
    "url": "https://example.com",
    "userAgent": "Mozilla/5.0..."
    // ... additional event-specific properties
  }
}
```

## Usage Examples

### Share Button

```tsx
<ShareButton
  url="https://example.com"
  text="Check this out!"
  variant="outline"
  size="sm"
/>
```

### Upgrade CTA

```tsx
<UpgradeCTA
  variant="banner"
  plan="pro"
  feature="unlimited exports"
  className="mb-8"
/>
```

### Toast Notifications

```tsx
const { success, error, info } = useToast();

// Show success toast
success("Link copied!", "Share link copied to clipboard");

// Show error toast
error("Upload failed", "Please try again");

// Show info toast
info("Processing...", "This may take a moment");
```

## Event Flow

1. **Page Load** → `page_view_*` events fire
2. **User Action** → Tool-specific events (thumbnail_export, caption_generate)
3. **Share Click** → `share_clicked_*` events with platform tracking
4. **Upgrade Click** → `upgrade_click` events with plan/feature context
5. **Return Visit** → `return_visit` events for retention tracking

## Network Tab Verification

To verify events are firing correctly:

1. Open browser DevTools
2. Go to Network tab
3. Filter by "log" to see only analytics requests
4. Interact with the application (share, upgrade, export, etc.)
5. Verify POST requests to `/api/log` with proper event data

All events include proper categorization, timestamps, URLs, and user agents for comprehensive analytics tracking.
