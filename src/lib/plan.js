const PLAN_STORAGE_KEY = "forge_plan";
// Plan constants
export const PLANS = {
    FREE: "free",
    PRO: "pro",
    PLUS: "plus",
};
// Plan features configuration
export const PLAN_FEATURES = {
    [PLANS.FREE]: {
        name: "Free",
        watermarkEnforced: true,
        usageCaps: true,
        unlimitedExports: false,
        premiumPresets: false,
        scheduler: false,
    },
    [PLANS.PRO]: {
        name: "Pro",
        watermarkEnforced: false,
        usageCaps: false,
        unlimitedExports: true,
        premiumPresets: true,
        scheduler: false,
    },
    [PLANS.PLUS]: {
        name: "Plus",
        watermarkEnforced: false,
        usageCaps: false,
        unlimitedExports: true,
        premiumPresets: true,
        scheduler: true,
    },
};
/**
 * Get the current plan from localStorage
 * Defaults to "free" if no plan is set
 */
export function getCurrentPlan() {
    const stored = localStorage.getItem(PLAN_STORAGE_KEY);
    if (stored === "pro" || stored === "plus") {
        return stored;
    }
    return "free";
}
/**
 * Get plan information by plan type
 */
export function getPlan(plan = getCurrentPlan()) {
    return PLAN_FEATURES[plan];
}
/**
 * Set the current plan in localStorage
 */
export function setCurrentPlan(plan) {
    localStorage.setItem(PLAN_STORAGE_KEY, plan);
}
/**
 * Check if a specific feature is allowed for the current plan
 */
export function isFeatureAllowed(feature) {
    const plan = getCurrentPlan();
    return Boolean(PLAN_FEATURES[plan][feature]);
}
/**
 * Check if the current plan allows watermark removal
 * @deprecated Use isFeatureAllowed('watermarkEnforced') instead
 */
export function canRemoveWatermark() {
    return !isFeatureAllowed("watermarkEnforced");
}
/**
 * Check if the current plan is free
 */
export function isFreePlan() {
    return getCurrentPlan() === "free";
}
/**
 * Check if the current plan allows unlimited exports
 */
export function hasUnlimitedExports() {
    return isFeatureAllowed("unlimitedExports");
}
/**
 * Check if the current plan allows premium presets
 */
export function hasPremiumPresets() {
    return isFeatureAllowed("premiumPresets");
}
/**
 * Check if the current plan includes scheduler
 */
export function hasScheduler() {
    return isFeatureAllowed("scheduler");
}
