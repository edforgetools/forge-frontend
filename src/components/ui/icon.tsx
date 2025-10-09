import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
}

const sizeClasses = {
  sm: "w-[18px] h-[18px]", // 18px for toolbars
  md: "w-5 h-5", // 20px for hero sections
  lg: "w-6 h-6", // 24px for larger UI elements
  xl: "w-8 h-8", // 32px for feature cards
  hero: "w-5 h-5", // 20px for hero sections (same as md)
};

export function Icon({
  icon: IconComponent,
  size = "sm",
  className,
}: IconProps) {
  return (
    <IconComponent
      className={cn(
        sizeClasses[size],
        // Prevent SVGs from affecting line-height
        "inline-block align-middle",
        className
      )}
      style={{
        // Ensure consistent rendering and prevent line-height issues
        verticalAlign: "middle",
        display: "inline-block",
      }}
    />
  );
}

// Convenience components for common use cases
export function ToolbarIcon({
  icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return <Icon icon={icon} size="sm" className={className} />;
}

export function HeroIcon({
  icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return <Icon icon={icon} size="hero" className={className} />;
}

export function FeatureIcon({
  icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return <Icon icon={icon} size="xl" className={className} />;
}
