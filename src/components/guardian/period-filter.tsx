"use client";

import { useEffect, useRef, useState } from "react";
import type { DateRange as RdpRange } from "react-day-picker";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { periodLabel } from "@/lib/period";
import type { Period, PeriodKey } from "@/lib/types";

const OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "7d", label: "Últimos 7 dias" },
  { key: "30d", label: "Últimos 30 dias" },
  { key: "season", label: "Temporada" },
  { key: "custom", label: "Período personalizado" },
];

interface PeriodFilterProps {
  value: Period;
  onChange: (value: Period) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const [open, setOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState<RdpRange | undefined>(
    value.range
      ? { from: new Date(value.range.from), to: new Date(value.range.to) }
      : undefined,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function selectOption(key: PeriodKey) {
    if (key === "custom") {
      setShowCalendar(true);
      return;
    }
    onChange({ key });
    setOpen(false);
  }

  function applyRange() {
    if (range?.from && range?.to) {
      onChange({
        key: "custom",
        range: { from: range.from.toISOString(), to: range.to.toISOString() },
      });
      setOpen(false);
      setShowCalendar(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-elevated px-3.5 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <Calendar className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">{periodLabel(value)}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && !showCalendar && (
        <div className="absolute right-0 z-40 mt-1.5 w-56 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => selectOption(o.key)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted",
                o.key === value.key
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {o.label}
              {o.key === value.key && <Check className="size-4" />}
            </button>
          ))}
        </div>
      )}

      {open && showCalendar && (
        <div className="absolute right-0 z-40 mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <CalendarUI
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
            defaultMonth={range?.from}
          />
          <div className="flex items-center justify-between gap-2 border-t border-border p-3">
            <button
              onClick={() => setShowCalendar(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Voltar
            </button>
            <Button
              size="sm"
              onClick={applyRange}
              disabled={!range?.from || !range?.to}
            >
              Aplicar período
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
