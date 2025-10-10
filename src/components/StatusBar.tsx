import { useCanvasStore } from "@/state/canvasStore";
import { RateLimitDisplay } from "@/components/RateLimitDisplay";

interface StatusBarProps {
  className?: string;
}

export function StatusBar({ className = "" }: StatusBarProps) {
  const { crop } = useCanvasStore();

  // Calculate the actual aspect ratio from crop dimensions
  const actualRatio = crop.w / crop.h;

  // Determine the closest standard aspect ratio
  const getClosestAspectRatio = (ratio: number): string => {
    const ratios = [
      { name: "16:9", value: 16 / 9 },
      { name: "1:1", value: 1 },
      { name: "9:16", value: 9 / 16 },
      { name: "4:3", value: 4 / 3 },
      { name: "3:2", value: 3 / 2 },
      { name: "21:9", value: 21 / 9 },
    ];

    const closest = ratios.reduce((prev, curr) =>
      Math.abs(curr.value - ratio) < Math.abs(prev.value - ratio) ? curr : prev
    );

    // Only show the standard ratio if it's close enough (within 2% tolerance)
    const tolerance = 0.02;
    if (Math.abs(closest.value - ratio) <= tolerance) {
      return closest.name;
    }

    // Otherwise, show the actual ratio in simplified form
    return simplifyRatio(ratio);
  };

  // Simplify a ratio to its lowest terms
  const simplifyRatio = (ratio: number): string => {
    // Find the greatest common divisor
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

    // Convert to a reasonable integer ratio
    const precision = 1000;
    const numerator = Math.round(ratio * precision);
    const denominator = precision;
    const divisor = gcd(numerator, denominator);

    const simplifiedNum = numerator / divisor;
    const simplifiedDen = denominator / divisor;

    // If the numbers are too large, round them to reasonable values
    if (simplifiedNum > 50 || simplifiedDen > 50) {
      return `${ratio.toFixed(2)}:1`;
    }

    return `${simplifiedNum}:${simplifiedDen}`;
  };

  // Format resolution with proper separators
  const formatResolution = (width: number, height: number): string => {
    return `${Math.round(width).toLocaleString()} × ${Math.round(
      height
    ).toLocaleString()}`;
  };

  const aspectRatioText = getClosestAspectRatio(actualRatio);
  const resolutionText = formatResolution(crop.w, crop.h);

  return (
    <div
      className={`absolute bottom-0 right-0 left-0 h-12 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 flex items-center justify-between text-sm text-gray-600 whitespace-nowrap z-10 ${className}`}
    >
      {/* Left side - Rate limit for mobile */}
      <div className="lg:hidden">
        <RateLimitDisplay showUpgradeCTA={false} />
      </div>

      {/* Right side - Aspect ratio and resolution */}
      <div className="flex items-center">
        <span className="font-medium">{aspectRatioText}</span>
        <span className="text-gray-400 mx-2">•</span>
        <span className="font-mono">{resolutionText}</span>
      </div>
    </div>
  );
}
