import * as React from "react";
import { Link } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const linkButtonVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-black text-white hover:bg-black/90 active:scale-[.99]",
        outline:
          "border border-neutral-300 bg-white text-black hover:bg-neutral-50 active:scale-[.99]",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkButtonVariants> {
  to?: string;
  href?: string;
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ className, variant, size, to, href, children, ...props }, ref) => {
    const isExternal = href && !href.startsWith("/");

    if (isExternal) {
      return (
        <a
          className={cn(linkButtonVariants({ variant, size }), className)}
          href={href}
          ref={ref}
          {...props}
        >
          {children}
        </a>
      );
    }

    const linkTo = to || href;

    return (
      <Link
        className={cn(linkButtonVariants({ variant, size }), className)}
        to={linkTo || "#"}
        ref={ref}
        {...props}
      >
        {children}
      </Link>
    );
  }
);
LinkButton.displayName = "LinkButton";

export { LinkButton, linkButtonVariants };
