import React, { useState, useEffect } from "react";
import {
  getCurrentPlan,
  setCurrentPlan,
  getPlan,
  type Plan,
} from "../lib/plan";
import { trackRevenue, trackActivity } from "../lib/metrics";

interface PlanSelectorProps {
  className?: string;
}

export default function PlanSelector({ className = "" }: PlanSelectorProps) {
  const [currentPlan, setCurrentPlanState] = useState<Plan>(getCurrentPlan());

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handlePlanChange = (plan: Plan) => {
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

  const plans: Plan[] = ["free", "pro", "plus"];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-300">Dev Plan:</span>
      <div className="flex gap-1">
        {plans.map((planId) => {
          const plan = getPlan(planId);
          const isActive = currentPlan === planId;
          return (
            <button
              key={planId}
              onClick={() => handlePlanChange(planId)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isActive
                  ? planId === "free"
                    ? "bg-gray-600 text-white"
                    : planId === "pro"
                    ? "bg-blue-600 text-white"
                    : "bg-purple-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
              title={`${plan.name}: ${
                plan.watermarkEnforced
                  ? "Watermark enforced"
                  : "Watermark toggle"
              }, ${
                plan.unlimitedExports ? "Unlimited exports" : "Usage caps"
              }, ${
                plan.premiumPresets ? "Premium presets" : "Basic presets"
              }, ${plan.scheduler ? "Scheduler included" : "No scheduler"}`}
            >
              {plan.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
