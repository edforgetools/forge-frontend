"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { XCircle, Info } from "lucide-react";

export interface InlineToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  className?: string;
  onDismiss?: () => void;
}

export function InlineToast({
  title,
  description,
  variant = "default",
  className,
  onDismiss,
}: InlineToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  React.useEffect(() => {
    if (variant !== "destructive") {
      // Auto-dismiss non-error messages after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [variant]);

  if (!isVisible) return null;

  const variants = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    destructive: "bg-red-50 border-red-200 text-red-800",
  };

  const icons = {
    default: Info,
    destructive: XCircle,
  };

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border p-3 text-sm",
        variants[variant],
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {title && <div className="font-medium">{title}</div>}
        {description && <div className="mt-1 opacity-90">{description}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Hook for managing inline toasts within components
export function useInlineToast() {
  const [toasts, setToasts] = React.useState<
    Array<InlineToastProps & { id: string }>
  >([]);

  const addToast = React.useCallback(
    (toast: Omit<InlineToastProps, "onDismiss">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = {
        ...toast,
        id,
        onDismiss: () => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        },
      };
      setToasts((prev) => [newToast, ...prev].slice(0, 3)); // Limit to 3 toasts
    },
    []
  );

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    clearToasts,
  };
}
