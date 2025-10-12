import React from "react";
import { cn } from "@/lib/utils";

interface PanelSectionProps {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  showDivider?: boolean;
}

export function PanelSection({
  title,
  icon,
  children,
  className,
  showDivider = true,
}: PanelSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        {icon && <div className="text-gray-500">{icon}</div>}
        <h4 className="text-lg font-semibold leading-tight text-gray-700">
          {title}
        </h4>
      </div>
      {showDivider && <div className="border-t border-neutral-200" />}
      {children && <div className="pt-1">{children}</div>}
    </div>
  );
}
