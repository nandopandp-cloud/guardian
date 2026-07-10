"use client";

import { cn, relativeDate } from "@/lib/utils";
import { riskMeta } from "@/lib/risk";
import type { Student } from "@/lib/types";
import { Avatar } from "./avatar";

interface StudentListProps {
  students: Student[];
  selectedId: string | null;
  onSelect: (student: Student) => void;
  /** True when a search is active (changes the header label). */
  searching: boolean;
}

export function StudentList({
  students,
  selectedId,
  onSelect,
  searching,
}: StudentListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {searching ? "Resultados" : "Top 10 da Liga Genial"}
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {students.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {students.length === 0 ? (
          <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Nenhum estudante encontrado.
          </div>
        ) : (
          <ul className="space-y-1">
            {students.map((s) => {
              const meta = riskMeta(s.risk);
              const active = s.id === selectedId;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => onSelect(s)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-border bg-elevated"
                        : "border-transparent hover:bg-muted/60",
                    )}
                  >
                    <Avatar src={s.avatar} name={s.name} size={38} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {s.name}
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                          #{s.rank}
                        </span>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.school} · {s.className}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                        {relativeDate(s.lastActivity)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: meta.hsl }}
                      >
                        {s.fraudScore}
                      </span>
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: meta.hsl }}
                        title={meta.label}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
