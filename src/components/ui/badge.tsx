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
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: meta.hsl }}
        />
      )}
      {meta.label}
    </span>
  );
}
