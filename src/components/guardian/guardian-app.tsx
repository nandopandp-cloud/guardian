"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { searchStudents, TOP_STUDENTS } from "@/lib/mock";
import type { PeriodKey, Student } from "@/lib/types";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { PeriodFilter } from "./period-filter";
import { SearchBar } from "./search-bar";
import { StudentList } from "./student-list";
import { DetailPanel } from "./detail-panel";
import { EvidenceDrawer } from "./evidence-drawer";

export function GuardianApp() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [selected, setSelected] = useState<Student | null>(TOP_STUDENTS[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const results = useMemo(() => searchStudents(query), [query]);
  const searching = query.trim().length > 0;

  return (
    <div className="relative min-h-screen">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 bg-dot-grid opacity-40" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,hsl(142_60%_45%/0.05),transparent_65%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 pb-5">
          <Logo size={34} />
          <div className="flex items-center gap-3">
            <PeriodFilter value={period} onChange={setPeriod} />
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
              onSelect={setSelected}
              searching={searching}
            />
          </Card>

          <Card className="max-h-[calc(100vh-180px)] overflow-hidden p-6">
            <DetailPanel
              student={selected}
              onOpenEvidence={() => setDrawerOpen(true)}
            />
          </Card>
        </div>
      </div>

      <EvidenceDrawer
        student={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
