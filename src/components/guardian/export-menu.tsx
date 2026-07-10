"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { exportPDF, exportXLSX } from "@/lib/export";
import type { Period, Student } from "@/lib/types";

interface ExportActionsProps {
  students: Student[];
  period: Period;
  /** Rendered inline (action bar) or stacked (menu). */
  variant?: "bar" | "menu";
}

export function ExportActions({
  students,
  period,
  variant = "bar",
}: ExportActionsProps) {
  const [busy, setBusy] = useState<null | "xlsx" | "pdf">(null);

  async function run(kind: "xlsx" | "pdf") {
    if (busy || students.length === 0) return;
    setBusy(kind);
    try {
      if (kind === "xlsx") await exportXLSX(students, period);
      else await exportPDF(students, period);
    } finally {
      setBusy(null);
    }
  }

  const base =
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60";

  if (variant === "menu") {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => run("xlsx")}
          disabled={!!busy}
          className={`${base} justify-start text-foreground hover:bg-muted`}
        >
          {busy === "xlsx" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="size-4 text-risk-normal" />
          )}
          Exportar XLSX
        </button>
        <button
          onClick={() => run("pdf")}
          disabled={!!busy}
          className={`${base} justify-start text-foreground hover:bg-muted`}
        >
          {busy === "pdf" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileText className="size-4 text-risk-critical" />
          )}
          Exportar PDF
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => run("xlsx")}
        disabled={!!busy}
        className={`${base} border border-border bg-elevated text-foreground hover:bg-muted`}
      >
        {busy === "xlsx" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-4" />
        )}
        XLSX
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => run("pdf")}
        disabled={!!busy}
        className={`${base} bg-foreground text-background hover:bg-foreground/90`}
      >
        {busy === "pdf" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
        PDF
      </motion.button>
    </div>
  );
}
