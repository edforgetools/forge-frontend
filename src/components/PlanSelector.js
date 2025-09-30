import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { getCurrentPlan, setCurrentPlan, getPlan, } from "../lib/plan";
import { trackRevenue, trackActivity } from "../lib/metrics";
export default function PlanSelector({ className = "" }) {
    const [currentPlan, setCurrentPlanState] = useState(getCurrentPlan());
    // Only show in development mode
    if (process.env.NODE_ENV !== "development") {
        return null;
    }
    const handlePlanChange = (plan) => {
        const previousPlan = currentPlan;
        setCurrentPlan(plan);
        setCurrentPlanState(plan);
        // Track plan upgrade/downgrade
        if (plan !== previousPlan) {
            trackRevenue("upgrade_click", {
                fromPlan: previousPlan,
                toPlan: plan,
            });
            trackActivity("plan_change");
        }
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent("planChanged", { detail: { plan } }));
    };
    // Listen for plan changes from other tabs/windows
    useEffect(() => {
        const handleStorageChange = () => {
            setCurrentPlanState(getCurrentPlan());
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);
    const plans = ["free", "pro", "plus"];
    return (_jsxs("div", { className: `flex items-center gap-2 ${className}`, children: [_jsx("span", { className: "text-sm text-gray-300", children: "Dev Plan:" }), _jsx("div", { className: "flex gap-1", children: plans.map((planId) => {
                    const plan = getPlan(planId);
                    const isActive = currentPlan === planId;
                    return (_jsx("button", { onClick: () => handlePlanChange(planId), className: `px-3 py-1 rounded text-sm font-medium transition-colors ${isActive
                            ? planId === "free"
                                ? "bg-gray-600 text-white"
                                : planId === "pro"
                                    ? "bg-blue-600 text-white"
                                    : "bg-purple-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"}`, title: `${plan.name}: ${plan.watermarkEnforced
                            ? "Watermark enforced"
                            : "Watermark toggle"}, ${plan.unlimitedExports ? "Unlimited exports" : "Usage caps"}, ${plan.premiumPresets ? "Premium presets" : "Basic presets"}, ${plan.scheduler ? "Scheduler included" : "No scheduler"}`, children: plan.name }, planId));
                }) })] }));
}
