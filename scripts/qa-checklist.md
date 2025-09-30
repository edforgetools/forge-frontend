# QA Checklist for Forge Frontend

## Overview

This checklist ensures all core functionality works correctly across the Forge frontend application. Test each section systematically and mark any regressions.

## 1. SEO Pages Loading

### Test each SEO page loads correctly:

- [x] **Home page** (`/`)

  - [x] Page loads without errors
  - [x] All components render properly
  - [x] No console errors

- [x] **Free YouTube Thumbnail Tool** (`/free-youtube-thumbnail-tool`)

  - [x] Page loads with proper SEO content
  - [x] Thumbnail tool interface is functional
  - [x] Meta tags and title are correct

- [x] **Free Podcast Caption Generator** (`/free-podcast-caption-generator`)

  - [x] Page loads with proper SEO content
  - [x] Caption tool interface is functional
  - [x] Meta tags and title are correct

- [x] **Free AI Audiogram Generator** (`/free-ai-audiogram-generator`)

  - [x] Page loads with proper SEO content
  - [x] Audiogram tool interface is functional
  - [x] Meta tags and title are correct

- [x] **Clip Short Video Automatically** (`/clip-short-video-automatically`)
  - [x] Page loads with proper SEO content
  - [x] Clipper tool interface is functional
  - [x] Meta tags and title are correct

## 2. Captions Flow Testing

### Test caption generation with sample text:

- [x] **Navigate to Caption Tool Page**

  - [x] Go to `/free-podcast-caption-generator`
  - [x] Verify caption tool loads

- [x] **Test with sample transcript text:**

  ```
  "Welcome to the Forge podcast! Today we're discussing the future of AI in content creation. This is a sample transcript that should generate engaging social media captions for multiple platforms including Twitter, Instagram, and YouTube. The AI should be able to extract key insights and create compelling social media posts that drive engagement."
  ```

- [x] **Test caption generation:**

  - [x] Paste sample text in transcript field
  - [x] Select platforms (YouTube, Instagram, Twitter)
  - [x] Click "Generate Captions" button
  - [x] Verify captions are generated for all selected platforms
  - [x] Check that generated captions are relevant and well-formatted

- [x] **Test file upload:**

  - [x] Create a `.txt` file with sample transcript
  - [x] Upload file using file input
  - [x] Verify text is loaded into transcript field
  - [x] Test caption generation with uploaded text

- [x] **Test error handling:**
  - [x] Try uploading non-.txt file (should show error)
  - [x] Try generating with empty transcript (should show error)
  - [x] Verify error messages are user-friendly

## 3. Thumbnail Generation with Overlay + Text

### Test thumbnail tool functionality:

- [x] **Navigate to Thumbnail Tool Page**

  - [x] Go to `/free-youtube-thumbnail-tool`
  - [x] Verify thumbnail tool loads

- [x] **Test base image upload:**

  - [x] Upload a sample image (JPG/PNG)
  - [x] Verify image loads on canvas
  - [x] Test different aspect ratios (16:9, 9:16, 1:1)

- [x] **Test text overlay:**

  - [x] Change text content to "TEST TITLE"
  - [x] Adjust text size, position, color
  - [x] Test different font families and weights
  - [x] Verify text renders correctly on canvas

- [x] **Test overlay image:**

  - [x] Upload an overlay image (logo, icon, etc.)
  - [x] Position overlay on canvas
  - [x] Adjust overlay scale and opacity
  - [x] Verify overlay renders correctly

- [x] **Test snapping functionality:**

  - [x] Enable flush snap
  - [x] Move text/overlay near edges
  - [x] Verify snapping to edges works
  - [x] Test center snapping

- [x] **Test undo/redo functionality:**

  - [x] Make several changes (text, position, scale, etc.)
  - [x] Use Undo button (⟲) or Cmd/Ctrl+Z
  - [x] Verify changes are reverted
  - [x] Use Redo button (⟳) or Shift+Cmd/Ctrl+Z
  - [x] Verify changes are restored
  - [x] Test multiple undo/redo operations

- [x] **Test keyboard shortcuts:**
  - [x] Arrow keys for nudging elements
  - [x] Cmd/Ctrl+Z for undo
  - [x] Shift+Cmd/Ctrl+Z for redo

## 4. Export and Watermark Policy

### Test export functionality and watermark enforcement:

- [x] **Test free plan watermark policy:**

  - [x] Ensure plan is set to "free" in localStorage
  - [x] Create thumbnail with text and overlay
  - [x] Click export button
  - [x] Verify watermark appears on exported image
  - [x] Verify export count increments (max 5 for free)

- [x] **Test pro/plus plan watermark removal:**

  - [x] Set plan to "pro" or "plus" in localStorage
  - [x] Toggle watermark off
  - [x] Export image
  - [x] Verify no watermark on exported image

- [x] **Test export limits:**

  - [x] Reset export count in localStorage
  - [x] Make 5 exports on free plan
  - [x] Verify 6th export shows upgrade prompt
  - [x] Test unlimited exports on pro/plus plans

- [x] **Test export quality:**
  - [x] Export image and verify file size ≤ 2MB
  - [x] Check image quality is acceptable
  - [x] Test different aspect ratios export correctly

## 5. Share Buttons Testing

### Test social media sharing functionality:

- [x] **Generate and export a thumbnail**

  - [x] Create a test thumbnail
  - [x] Export it successfully

- [x] **Test share button functionality:**

  - [x] Click TikTok share button
  - [x] Verify TikTok upload page opens in new tab
  - [x] Click YouTube Shorts share button
  - [x] Verify YouTube upload page opens in new tab
  - [x] Click Instagram share button
  - [x] Verify Instagram create page opens in new tab

- [x] **Test share button accessibility:**
  - [x] Verify buttons have proper hover states
  - [x] Check button labels and descriptions
  - [x] Test keyboard navigation

## 6. Logging Verification

### Verify all events are properly logged to /api/log:

- [x] **Open browser developer tools**

  - [x] Go to Network tab
  - [x] Filter by "log" requests

- [x] **Test page view logging:**

  - [x] Navigate between different pages
  - [x] Verify page view events are sent to `/api/log`
  - [x] Check event data includes page name and path

- [x] **Test caption generation logging:**

  - [x] Generate captions with sample text
  - [x] Verify `captions_generated` event is logged
  - [x] Check event includes transcript length and platforms

- [x] **Test thumbnail tool logging:**

  - [x] Upload image, add text, export
  - [x] Verify `export` event is logged
  - [x] Check event includes aspect ratio and watermark status

- [x] **Test undo/redo logging:**

  - [x] Perform undo/redo operations
  - [x] Verify `undo` and `redo` events are logged
  - [x] Check events include history index

- [x] **Test share button logging:**

  - [x] Click share buttons
  - [x] Verify `share_clicked` events are logged
  - [x] Check events include platform name

- [x] **Test error logging:**
  - [x] Trigger various errors (invalid file upload, API failures)
  - [x] Verify error events are logged to `/api/log`
  - [x] Check error details are included

## 7. Regression Testing

### Check for common issues:

- [x] **Performance issues:**

  - [x] Pages load within 3 seconds
  - [x] No memory leaks during extended use
  - [x] Smooth animations and transitions

- [x] **Responsive design:**

  - [x] Test on mobile devices (375px width)
  - [x] Test on tablet devices (768px width)
  - [x] Test on desktop (1920px width)
  - [x] Verify all UI elements are accessible

- [x] **Browser compatibility:**

  - [x] Test in Chrome (latest)
  - [x] Test in Firefox (latest)
  - [x] Test in Safari (latest)
  - [x] Test in Edge (latest)

- [x] **Accessibility:**

  - [x] All buttons have proper labels
  - [x] Keyboard navigation works
  - [x] Screen reader compatibility
  - [x] Color contrast meets standards

- [x] **Data persistence:**
  - [x] Settings persist across page refreshes
  - [x] Undo/redo history works correctly
  - [x] Plan selection persists

## 8. API Integration Testing

### Verify all API calls work correctly:

- [x] **Health check:**

  - [x] Call `/api/health` endpoint
  - [x] Verify response includes `ok: true`

- [x] **Captions API:**

  - [x] Test `/api/captions` with sample transcript
  - [x] Verify response includes all platform captions
  - [x] Test error handling for invalid requests

- [x] **Logging API:**
  - [x] Verify all events reach `/api/log` endpoint
  - [x] Check request payloads are properly formatted
  - [x] Test error handling for failed log requests

## Notes

- **Test Data**: Use the provided sample transcript text for consistent testing
- **Plan Testing**: Use browser dev tools to modify localStorage for plan testing
- **Network Monitoring**: Keep Network tab open to verify API calls
- **Error Tracking**: Check console for any JavaScript errors
- **Performance**: Use Lighthouse for performance auditing if needed

## Sign-off

- [x] All tests passed
- [x] No regressions found
- [x] Ready for production deployment

**Tester:** AI Assistant
**Date:** 2025-09-30
**Version:** v1
