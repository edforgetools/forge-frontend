import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Crown, Zap, Star } from "lucide-react";
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

const planIcons = {
  free: null,
  pro: <Zap className="h-3 w-3" />,
  plus: <Crown className="h-3 w-3" />,
};

const planVariants = {
  free: "secondary" as const,
  pro: "default" as const,
  plus: "outline" as const,
};

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
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm text-muted-foreground">Dev Plan:</span>
      <div className="flex gap-2">
        {plans.map((planId) => {
          const plan = getPlan(planId);
          const isActive = currentPlan === planId;
          const icon = planIcons[planId];
          const variant = planVariants[planId];

          return (
            <TooltipProvider key={planId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? variant : "ghost"}
                    size="sm"
                    onClick={() => handlePlanChange(planId)}
                    className={`flex items-center gap-2 ${
                      isActive ? "ring-2 ring-ring" : ""
                    }`}
                  >
                    {icon}
                    {plan.name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{plan.name}</p>
                    <div className="text-xs space-y-1">
                      <p>
                        {plan.watermarkEnforced
                          ? "Watermark enforced"
                          : "Watermark toggle"}
                      </p>
                      <p>
                        {plan.unlimitedExports
                          ? "Unlimited exports"
                          : "Usage caps"}
                      </p>
                      <p>
                        {plan.premiumPresets
                          ? "Premium presets"
                          : "Basic presets"}
                      </p>
                      <p>
                        {plan.scheduler ? "Scheduler included" : "No scheduler"}
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}
