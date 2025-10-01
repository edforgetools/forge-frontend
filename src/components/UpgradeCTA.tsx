import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Star, ArrowRight } from "lucide-react";
import { trackRevenue } from "@/lib/metrics";

interface UpgradeCTAProps {
  variant?: "banner" | "card" | "button" | "inline";
  size?: "sm" | "md" | "lg";
  className?: string;
  feature?: string;
  plan?: "pro" | "plus";
  children?: React.ReactNode;
}

const planData = {
  pro: {
    name: "Pro",
    icon: <Zap className="h-4 w-4" />,
    color: "bg-blue-500",
    features: ["Unlimited exports", "Premium presets", "No watermarks"],
    price: "$9/month",
  },
  plus: {
    name: "Plus",
    icon: <Crown className="h-4 w-4" />,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    features: ["Everything in Pro", "AI scheduler", "Priority support"],
    price: "$19/month",
  },
};

export function UpgradeCTA({
  variant = "button",
  size = "md",
  className = "",
  feature,
  plan = "pro",
  children,
}: UpgradeCTAProps) {
  const planInfo = planData[plan];

  const handleUpgradeClick = () => {
    trackRevenue("upgrade_click", {
      plan,
      feature,
      variant,
      size,
      url: window.location.href,
    });

    // In a real app, this would open a checkout flow
    console.log(`Upgrade to ${planInfo.name} clicked`, { feature, variant });
  };

  if (variant === "banner") {
    return (
      <Card className={`border-primary/20 bg-primary/5 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${planInfo.color} text-white`}>
                {planInfo.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Upgrade to {planInfo.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature ? `Unlock ${feature}` : planInfo.features[0]}
                </p>
              </div>
            </div>
            <Button onClick={handleUpgradeClick} size="sm">
              Upgrade Now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "card") {
    return (
      <Card className={`border-primary/20 bg-primary/5 ${className}`}>
        <CardContent className="p-6 text-center">
          <div
            className={`w-12 h-12 mx-auto mb-4 rounded-lg ${planInfo.color} flex items-center justify-center text-white`}
          >
            {planInfo.icon}
          </div>
          <h3 className="text-lg font-semibold mb-2">{planInfo.name} Plan</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {feature ? `Unlock ${feature}` : planInfo.features.join(", ")}
          </p>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{planInfo.price}</div>
            <Button onClick={handleUpgradeClick} className="w-full">
              Upgrade to {planInfo.name}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Badge variant="outline" className="text-xs">
          {planInfo.icon}
          {planInfo.name}
        </Badge>
        <Button
          onClick={handleUpgradeClick}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  // Default button variant
  return (
    <Button
      onClick={handleUpgradeClick}
      variant="default"
      size={size}
      className={`${className}`}
    >
      {planInfo.icon}
      {children || `Upgrade to ${planInfo.name}`}
    </Button>
  );
}
