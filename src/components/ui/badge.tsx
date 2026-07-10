import * as React from "react";
import { cn } from "@/lib/utils";
import { riskMeta } from "@/lib/risk";
import type { RiskLevel } from "@/lib/types";

interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: RiskLevel;
  /** Show a leading status dot. */
  dot?: boolean;
}

export function RiskBadge({
  level,
  dot = true,
  className,
  ...props
}: RiskBadgeProps) {
  const meta = riskMeta(level);
  const pulse = level === "high" || level === "critical";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        meta.text,
        meta.bg,
        meta.border,
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex size-1.5">
          {pulse && (
            <span
              className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: meta.hsl }}
            />
          )}
          <span
            className="relative inline-flex size-1.5 rounded-full"
            style={{ backgroundColor: meta.hsl }}
          />
        </span>
      )}
      {meta.label}
    </span>
  );
}
