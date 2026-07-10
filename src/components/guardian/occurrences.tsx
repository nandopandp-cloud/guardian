"use client";

import {
  Activity,
  Cpu,
  Gauge as GaugeIcon,
  History,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Occurrence, OccurrenceCategory } from "@/lib/types";

const CATEGORY_META: Record<
  OccurrenceCategory,
  { label: string; icon: typeof Activity }
> = {
  behavior: { label: "Comportamento", icon: Activity },
  technical: { label: "Técnico", icon: Cpu },
  volume: { label: "Volume", icon: GaugeIcon },
  history: { label: "Histórico", icon: History },
};

export function Occurrences({ occurrences }: { occurrences: Occurrence[] }) {
  if (occurrences.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma regra contribuiu significativamente para o score neste período.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {occurrences.map((o) => {
        const positive = o.weight > 0;
        const cat = CATEGORY_META[o.category];
        const Icon = cat.icon;
        return (
          <li
            key={o.id}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
            }}
            className="flashlight flex items-center gap-3 rounded-lg border border-border bg-elevated/40 px-3 py-2.5 transition-colors hover:border-border/80"
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-md",
                positive
                  ? "bg-risk-critical/10 text-risk-critical"
                  : "bg-risk-normal/10 text-risk-normal",
              )}
            >
              <Icon className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {o.label}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {o.description}
              </p>
              <span className="mt-0.5 inline-block text-[11px] uppercase tracking-wide text-muted-foreground/60">
                {cat.label}
              </span>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-sm font-semibold tabular-nums",
                positive
                  ? "bg-risk-critical/10 text-risk-critical"
                  : "bg-risk-normal/10 text-risk-normal",
              )}
            >
              {positive ? (
                <Plus className="size-3" />
              ) : (
                <Minus className="size-3" />
              )}
              {Math.abs(o.weight)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
