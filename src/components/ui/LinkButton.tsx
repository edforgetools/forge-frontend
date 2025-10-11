import * as React from "react";
import { Link } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const linkButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 w-full sm:w-auto min-h-[40px]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-2",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-8 py-3",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
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
          className={cn(linkButtonVariants({ variant, size, className }))}
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
        className={cn(linkButtonVariants({ variant, size, className }))}
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
