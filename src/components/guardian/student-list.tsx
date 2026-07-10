"use client";

import { Check } from "lucide-react";
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
  /** IDs checked for export. */
  checkedIds: Set<string>;
  onToggleCheck: (id: string) => void;
  onToggleAll: () => void;
}

export function StudentList({
  students,
  selectedId,
  onSelect,
  searching,
  checkedIds,
  onToggleCheck,
  onToggleAll,
}: StudentListProps) {
  const allChecked =
    students.length > 0 && students.every((s) => checkedIds.has(s.id));
  const someChecked = students.some((s) => checkedIds.has(s.id));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleAll}
            aria-label="Selecionar todos"
            className={cn(
              "flex size-[18px] items-center justify-center rounded-[5px] border transition-colors",
              allChecked
                ? "border-foreground bg-foreground text-background"
                : someChecked
                  ? "border-foreground bg-foreground/20 text-foreground"
                  : "border-border hover:border-muted-foreground",
            )}
          >
            {allChecked && <Check className="size-3" strokeWidth={3} />}
            {!allChecked && someChecked && (
              <span className="size-2 rounded-[2px] bg-foreground" />
            )}
          </button>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {searching ? "Resultados" : "Top da Liga Genial"}
          </h2>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {students.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {students.length === 0 ? (
          <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Nenhum estudante encontrado neste período.
          </div>
        ) : (
          <ul className="space-y-1">
            {students.map((s) => {
              const meta = riskMeta(s.risk);
              const active = s.id === selectedId;
              const checked = checkedIds.has(s.id);
              return (
                <li key={s.id}>
                  <div
                    className={cn(
                      "group flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 transition-colors",
                      active
                        ? "border-border bg-elevated"
                        : "border-transparent hover:bg-muted/60",
                    )}
                  >
                    {/* Checkbox — appears on hover or when checked */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCheck(s.id);
                      }}
                      aria-label={`Selecionar ${s.name}`}
                      className={cn(
                        "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all",
                        checked
                          ? "border-foreground bg-foreground text-background opacity-100"
                          : "border-border opacity-0 hover:border-muted-foreground group-hover:opacity-100",
                      )}
                    >
                      {checked && <Check className="size-3" strokeWidth={3} />}
                    </button>

                    <button
                      onClick={() => onSelect(s)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
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
                          className="font-display text-sm font-semibold tabular-nums"
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
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
