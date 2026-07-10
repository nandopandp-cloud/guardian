"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Icon rendered on the left. */
  icon?: React.ReactNode;
  /** Element rendered on the right (e.g. password toggle). */
  trailing?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, trailing, ...props }, ref) => {
    return (
      <div className="group relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-elevated/60 text-sm text-foreground placeholder:text-muted-foreground",
            "transition-colors focus:border-ring/60 focus:bg-elevated focus:outline-none focus:ring-2 focus:ring-ring/25",
            icon ? "pl-10" : "pl-3.5",
            trailing ? "pr-11" : "pr-3.5",
            className,
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {trailing}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
