import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-forge/40",
  {
    variants: {
      variant: {
        primary:
          "bg-black text-white border border-transparent hover:bg-black/90 hover:shadow-md active:scale-[.99]",
        secondary:
          "bg-white text-black border border-neutral-300 hover:bg-neutral-50 active:scale-[.99]",
        ghost:
          "bg-transparent text-black hover:bg-neutral-100 active:scale-[.99]",
        outline:
          "bg-transparent text-forge border border-forge hover:bg-forge/10 active:scale-[.99]",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
