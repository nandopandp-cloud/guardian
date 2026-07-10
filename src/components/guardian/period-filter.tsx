"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PeriodKey } from "@/lib/types";

const OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "7d", label: "Últimos 7 dias" },
  { key: "30d", label: "Últimos 30 dias" },
  { key: "season", label: "Temporada" },
  { key: "custom", label: "Período personalizado" },
];

interface PeriodFilterProps {
  value: PeriodKey;
  onChange: (value: PeriodKey) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((o) => o.key === value) ?? OPTIONS[1];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <Calendar className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-1.5 w-52 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-xl">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => {
                onChange(o.key);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-muted",
                o.key === value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {o.label}
              {o.key === value && <Check className="size-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
