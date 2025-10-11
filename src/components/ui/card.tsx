import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      "w-full rounded-[var(--radius)] border p-6 sm:p-8 shadow-sm bg-white",
      className
    )}
    {...props}
  >
    {children}
  </section>
));
Card.displayName = "Card";

export { Card };
