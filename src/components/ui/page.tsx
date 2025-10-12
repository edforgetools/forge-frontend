import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const Page = React.forwardRef<HTMLElement, PageProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "min-h-screen grid place-items-center bg-background text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </main>
    );
  }
);
Page.displayName = "Page";

export { Page };
