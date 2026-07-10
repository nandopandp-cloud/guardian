"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BeamButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * Pill button with a conic "border beam" that spins on hover and a shimmer
 * sweep across the surface. Adapted from the reference decks.
 */
export const BeamButton = React.forwardRef<HTMLButtonElement, BeamButtonProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl p-[1px] font-medium",
          "transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0",
          "disabled:pointer-events-none disabled:opacity-60",
          className,
        )}
        {...props}
      >
        {/* Spinning conic border, revealed on hover */}
        <span className="absolute inset-[-200%] animate-[guardian-spin_2.5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_320deg,hsl(0_0%_100%)_360deg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {/* Static border */}
        <span className="absolute inset-0 rounded-xl bg-border transition-opacity duration-300 group-hover:opacity-0" />

        {/* Surface */}
        <span className="relative z-10 flex h-full w-full items-center justify-center gap-2 rounded-[11px] bg-foreground px-6 text-sm text-background shadow-[inset_0_1px_0_hsl(0_0%_100%/0.25)]">
          {/* Shimmer */}
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[11px]">
            <span className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-background/25 to-transparent opacity-0 group-hover:animate-[guardian-shimmer_1.4s_ease-in-out] group-hover:opacity-100" />
          </span>
          <span className="relative z-10 flex items-center gap-2">{children}</span>
        </span>
      </button>
    );
  },
);
BeamButton.displayName = "BeamButton";
