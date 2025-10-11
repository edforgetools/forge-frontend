import { useRateLimitStore } from "@/state/rateLimitStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { UpgradeModal } from "@/components/UpgradeModal";
import { X, Zap, Crown } from "lucide-react";
import { useState, useEffect } from "react";

interface RateLimitDisplayProps {
  className?: string;
  showUpgradeCTA?: boolean;
}

export function RateLimitDisplay({
  className = "",
  showUpgradeCTA = true,
}: RateLimitDisplayProps) {
  const {
    limit,
    remaining,
    reset,
    isPro,
    showUpgradeCTA: storeShowUpgradeCTA,
    dismissUpgradeCTA,
  } = useRateLimitStore();

  const [timeUntilReset, setTimeUntilReset] = useState<string>("");

  // Calculate time until reset
  useEffect(() => {
    const updateTimeUntilReset = () => {
      const now = Date.now();
      const timeLeft = reset - now;

      if (timeLeft <= 0) {
        setTimeUntilReset("Reset now");
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeUntilReset(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilReset(`${minutes}m`);
      }
    };

    updateTimeUntilReset();
    const interval = setInterval(updateTimeUntilReset, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [reset]);

  const shouldShowUpgrade =
    showUpgradeCTA && (remaining === 0 || storeShowUpgradeCTA) && !isPro;
  const isLow = remaining <= 2 && !isPro;
  const isZero = remaining === 0 && !isPro;

  const getStatusColor = () => {
    if (isPro) return "default";
    if (isZero) return "destructive";
    if (isLow) return "secondary";
    return "default";
  };

  const getStatusIcon = () => {
    if (isPro) return <Crown className="h-3 w-3" />;
    if (isZero) return <Crown className="h-3 w-3" />;
    if (isLow) return <Zap className="h-3 w-3" />;
    return null;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Rate limit badge */}
      <Badge
        variant={getStatusColor()}
        className="flex items-center gap-1.5 px-2 py-1"
      >
        {getStatusIcon()}
        <span className="text-xs font-medium">
          {isPro ? "Unlimited Pro" : `${remaining} of ${limit} free today`}
        </span>
      </Badge>

      {/* Time until reset */}
      {timeUntilReset && !isPro && (
        <span className="text-xs text-muted-foreground">
          Resets in {timeUntilReset}
        </span>
      )}

      {/* Upgrade CTA */}
      {shouldShowUpgrade && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-600" />
            <div className="text-sm">
              <div className="font-medium text-amber-900">
                Free limit reached
              </div>
              <div className="text-xs text-amber-700">
                Upgrade for unlimited generations
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <UpgradeModal>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white h-7 px-3 text-xs"
              >
                Upgrade
              </Button>
            </UpgradeModal>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700"
              onClick={dismissUpgradeCTA}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
