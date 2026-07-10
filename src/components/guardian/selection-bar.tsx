"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Period, Student } from "@/lib/types";
import { ExportActions } from "./export-menu";

interface SelectionBarProps {
  selected: Student[];
  period: Period;
  onClear: () => void;
}

export function SelectionBar({ selected, period, onClear }: SelectionBarProps) {
  const count = selected.length;
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 24, x: "-50%" }}
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-4 rounded-2xl border border-border bg-card/90 px-4 py-2.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background tabular-nums">
              {count}
            </span>
            <span className="text-sm text-foreground">
              {count === 1 ? "estudante" : "estudantes"} selecionado
              {count === 1 ? "" : "s"}
            </span>
          </div>

          <div className="h-5 w-px bg-border" />

          <ExportActions students={selected} period={period} variant="bar" />

          <button
            onClick={onClear}
            aria-label="Limpar seleção"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
