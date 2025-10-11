"use client";

import { useInlineToast } from "@/components/ui/inline-toast";

// Simple inline toast hook that doesn't render global toasts
export function useToast() {
  const inlineToast = useInlineToast();

  return {
    toast: (props: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive" | "success" | "warning";
    }) => {
      // Map old toast variants to new ones
      const variantMap = {
        destructive: "destructive" as const,
        default: "default" as const,
      };

      inlineToast.addToast({
        title: props.title,
        description: props.description,
        variant:
          variantMap[props.variant as keyof typeof variantMap] || "default",
      });
    },
    toasts: inlineToast.toasts,
    dismiss: inlineToast.clearToasts,
  };
}

export const toast = useToast().toast;