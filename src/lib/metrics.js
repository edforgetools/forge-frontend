/**
 * Metrics Module - AARRR Framework Event Tracking
 *
 * This module provides a minimal metrics tracking system that logs page views and key actions
 * via the existing logEvent function. Events are mapped to the AARRR framework for easy
 * migration to a real analytics backend later.
 *
 * AARRR Framework Mapping:
 * - Acquisition: How users discover and land on the product
 * - Activation: First successful use of the product
 * - Retention: Users coming back to use the product again
 * - Revenue: Users upgrading to paid plans
 * - Referral: Users sharing or referring others
 */
import { logEvent } from "./logEvent";
// ===== EVENT CATEGORIES =====
export const EVENT_CATEGORIES = {
    ACQUISITION: "acquisition",
    ACTIVATION: "activation",
    RETENTION: "retention",
    REVENUE: "revenue",
    REFERRAL: "referral",
};
// ===== AARRR MAPPING =====
export const AARRR_MAPPING = {
    // Acquisition Events
    page_view: EVENT_CATEGORIES.ACQUISITION,
    tool_discovery: EVENT_CATEGORIES.ACQUISITION,
    external_referral: EVENT_CATEGORIES.ACQUISITION,
    search_landing: EVENT_CATEGORIES.ACQUISITION,
    // Activation Events
    first_file_upload: EVENT_CATEGORIES.ACTIVATION,
    first_export: EVENT_CATEGORIES.ACTIVATION,
    first_tool_use: EVENT_CATEGORIES.ACTIVATION,
    onboarding_complete: EVENT_CATEGORIES.ACTIVATION,
    session_start: EVENT_CATEGORIES.ACTIVATION,
    caption_generate: EVENT_CATEGORIES.ACTIVATION,
    thumbnail_export: EVENT_CATEGORIES.ACTIVATION,
    // Retention Events
    return_visit: EVENT_CATEGORIES.RETENTION,
    tool_reuse: EVENT_CATEGORIES.RETENTION,
    session_extension: EVENT_CATEGORIES.RETENTION,
    feature_exploration: EVENT_CATEGORIES.RETENTION,
    // Revenue Events
    plan_upgrade_clicked: EVENT_CATEGORIES.REVENUE,
    plan_upgrade_completed: EVENT_CATEGORIES.REVENUE,
    premium_feature_attempted: EVENT_CATEGORIES.REVENUE,
    watermark_removal_attempted: EVENT_CATEGORIES.REVENUE,
    upgrade_click: EVENT_CATEGORIES.REVENUE,
    // Referral Events
    share_clicked: EVENT_CATEGORIES.REFERRAL,
    export_shared: EVENT_CATEGORIES.REFERRAL,
    social_share: EVENT_CATEGORIES.REFERRAL,
    referral_link_used: EVENT_CATEGORIES.REFERRAL,
};
// ===== CORE METRICS FUNCTIONS =====
/**
 * Track a metrics event with AARRR categorization
 */
export function trackEvent(event, properties) {
    const category = AARRR_MAPPING[event];
    logEvent(event, {
        category,
        ...properties,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
    });
}
/**
 * Track page views with route information
 */
export function trackPageView(page, additionalProps) {
    trackEvent("page_view", {
        page,
        route: window.location.pathname,
        ...additionalProps,
    });
}
/**
 * Track tool usage with context
 */
export function trackToolUse(tool, action, additionalProps) {
    trackEvent("tool_reuse", {
        tool,
        action,
        ...additionalProps,
    });
}
/**
 * Track user activation events
 */
export function trackActivation(event, context) {
    trackEvent(event, context);
}
/**
 * Track revenue-related events
 */
export function trackRevenue(event, context) {
    trackEvent(event, context);
}
/**
 * Track referral and sharing events
 */
export function trackReferral(event, context) {
    trackEvent(event, context);
}
// ===== CONVENIENCE FUNCTIONS =====
/**
 * Track when a user first uploads a file (activation milestone)
 */
export function trackFirstFileUpload(tool, fileType) {
    trackActivation("first_file_upload", { tool, fileType });
}
/**
 * Track when a user first exports content (activation milestone)
 */
export function trackFirstExport(tool, format) {
    trackActivation("first_export", { tool, format });
}
/**
 * Track when a user attempts to use a premium feature
 */
export function trackPremiumFeatureAttempt(feature, plan) {
    trackRevenue("premium_feature_attempted", { feature, plan });
}
/**
 * Track when a user shares content
 */
export function trackContentShare(platform, tool) {
    trackReferral("export_shared", { platform, tool });
}
/**
 * Track tool discovery on homepage
 */
export function trackToolDiscovery(tool, source) {
    trackEvent("tool_discovery", { tool, source });
}
// ===== SESSION TRACKING =====
let sessionStartTime = null;
let lastActivityTime = null;
let sessionId = null;
/**
 * Initialize session tracking
 */
export function initSession() {
    sessionStartTime = Date.now();
    lastActivityTime = Date.now();
    sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    // Track session start
    trackEvent("session_start", {
        sessionId,
        timestamp: sessionStartTime,
    });
}
/**
 * Track user activity for session extension detection
 */
export function trackActivity(action) {
    const now = Date.now();
    const timeSinceLastActivity = lastActivityTime ? now - lastActivityTime : 0;
    // Consider it session extension if more than 5 minutes since last activity
    if (timeSinceLastActivity > 5 * 60 * 1000) {
        trackEvent("session_extension", {
            sessionId,
            timeSinceLastActivity,
            action,
        });
    }
    lastActivityTime = now;
}
/**
 * Get current session info
 */
export function getSessionInfo() {
    return {
        sessionId,
        duration: sessionStartTime ? Date.now() - sessionStartTime : null,
    };
}
// ===== USAGE ANALYTICS =====
/**
 * Track feature usage patterns
 */
export function trackFeatureUsage(feature, context) {
    trackEvent("feature_exploration", {
        feature,
        ...context,
    });
}
/**
 * Track error events for debugging
 */
export function trackError(error, context) {
    logEvent("error_occurred", {
        error,
        category: "error",
        ...context,
        timestamp: Date.now(),
        url: window.location.href,
    });
}
// ===== EXPORT FOR EXTERNAL ANALYTICS =====
/**
 * Get all tracked events for external analytics systems
 * This can be used to batch send events to external services
 */
export function getEventHistory() {
    // This would typically read from a local storage buffer
    // For now, return empty array as events are sent immediately via logEvent
    return [];
}
/**
 * Clear event history (useful for privacy compliance)
 */
export function clearEventHistory() {
    // Implementation would clear local storage buffer
    logEvent("event_history_cleared");
}
// ===== MIGRATION TO EXTERNAL ANALYTICS =====
/**
 * Example: How to migrate to external analytics services
 *
 * 1. Google Analytics 4 (GA4):
 *    - Replace logEvent calls with gtag('event', eventName, parameters)
 *    - Map AARRR categories to GA4 custom dimensions
 *    - Use GA4's built-in ecommerce events for revenue tracking
 *
 * 2. Mixpanel:
 *    - Replace logEvent with mixpanel.track(eventName, properties)
 *    - Use Mixpanel's cohort analysis for retention tracking
 *    - Leverage Mixpanel's funnel analysis for conversion tracking
 *
 * 3. Amplitude:
 *    - Replace logEvent with amplitude.track(eventName, properties)
 *    - Use Amplitude's behavioral cohorts for user segmentation
 *    - Implement Amplitude's revenue tracking for monetization insights
 *
 * 4. PostHog:
 *    - Replace logEvent with posthog.capture(eventName, properties)
 *    - Use PostHog's feature flags for A/B testing
 *    - Leverage PostHog's session recordings for user behavior analysis
 *
 * Migration Steps:
 * 1. Install the external analytics SDK
 * 2. Create a new analytics adapter that implements the same interface
 * 3. Update the logEvent function to use the external service
 * 4. Map AARRR categories to the external service's event structure
 * 5. Test event tracking in development environment
 * 6. Deploy with feature flag to gradually roll out
 *
 * Example adapter for Google Analytics 4:
 *
 * ```typescript
 * import { gtag } from 'ga-gtag';
 *
 * export function logEvent(name: string, meta?: Record<string, unknown>): void {
 *   gtag('event', name, {
 *     event_category: meta?.category,
 *     event_label: meta?.tool,
 *     value: meta?.value,
 *     custom_map: meta
 *   });
 * }
 * ```
 */
