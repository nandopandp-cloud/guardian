"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Period, Student } from "@/lib/types";
import { ExportActions } from "./export-menu";

interface HeaderExportProps {
  /** All students active in the current period. */
  periodStudents: Student[];
  /** The currently selected/focused student, if any. */
  current: Student | null;
  period: Period;
}

/** Header dropdown to export the current student or everyone in the period. */
export function HeaderExport({
  periodStudents,
  current,
  period,
}: HeaderExportProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-elevated px-3.5 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <Download className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">Exportar</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-1.5 w-64 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl">
          {current && (
            <div className="mb-1 border-b border-border pb-1">
              <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Estudante atual
              </p>
              <ExportActions
                students={[current]}
                period={period}
                variant="menu"
              />
            </div>
          )}
          <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Todos no período · {periodStudents.length}
          </p>
          <ExportActions
            students={periodStudents}
            period={period}
            variant="menu"
          />
        </div>
      )}
    </div>
  );
}
