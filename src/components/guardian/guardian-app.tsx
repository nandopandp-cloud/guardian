"use client";

import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { searchStudents, STUDENTS } from "@/lib/mock";
import { studentsInPeriod } from "@/lib/period";
import type { Period, Student } from "@/lib/types";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { PeriodFilter } from "./period-filter";
import { HeaderExport } from "./header-export";
import { SearchBar } from "./search-bar";
import { StudentList } from "./student-list";
import { DetailPanel } from "./detail-panel";
import { EvidenceDrawer } from "./evidence-drawer";
import { SelectionBar } from "./selection-bar";

export function GuardianApp() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<Period>({ key: "30d" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(
    () => searchStudents(query, period),
    [query, period],
  );
  const searching = query.trim().length > 0;

  // Keep a valid selection whenever the visible list changes.
  const selected =
    results.find((s) => s.id === selectedId) ?? results[0] ?? null;

  const toggleCheck = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setCheckedIds((prev) => {
      const allShown = results.every((s) => prev.has(s.id));
      if (allShown) {
        const next = new Set(prev);
        results.forEach((s) => next.delete(s.id));
        return next;
      }
      const next = new Set(prev);
      results.forEach((s) => next.add(s.id));
      return next;
    });
  }, [results]);

  const checkedStudents = useMemo(
    () => STUDENTS.filter((s) => checkedIds.has(s.id)),
    [checkedIds],
  );

  // For the header export: everything currently in the filtered period.
  const periodStudents = useMemo(
    () => studentsInPeriod(STUDENTS, period),
    [period],
  );

  return (
    <div className="relative min-h-screen">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 bg-dot-grid opacity-40" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,hsl(var(--risk-normal)/0.05),transparent_65%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 pb-5">
          <Logo size={34} />
          <div className="flex items-center gap-2.5">
            <HeaderExport
              periodStudents={periodStudents}
              current={selected}
              period={period}
            />
            <PeriodFilter value={period} onChange={setPeriod} />
            <ThemeToggle />
            <div className="h-6 w-px bg-border" />
            <UserMenu />
          </div>
        </header>

        {/* Search */}
        <div className="pb-5">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {/* Two-pane layout */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="flex max-h-[calc(100vh-180px)] flex-col overflow-hidden p-3 lg:sticky lg:top-5">
            <StudentList
              students={results}
              selectedId={selected?.id ?? null}
              onSelect={(s) => setSelectedId(s.id)}
              searching={searching}
              checkedIds={checkedIds}
              onToggleCheck={toggleCheck}
              onToggleAll={toggleAll}
            />
          </Card>

          <Card className="max-h-[calc(100vh-180px)] overflow-hidden p-6">
            <DetailPanel
              student={selected}
              period={period}
              onOpenEvidence={() => setDrawerOpen(true)}
            />
          </Card>
        </div>
      </div>

      <EvidenceDrawer
        student={selected}
        period={period}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      <SelectionBar
        selected={checkedStudents}
        period={period}
        onClear={() => setCheckedIds(new Set())}
      />
    </div>
  );
}
