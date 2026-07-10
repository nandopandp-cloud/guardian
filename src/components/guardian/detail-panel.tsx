"use client";

import { motion } from "framer-motion";
import { FileSearch, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { riskFromScore, rubricForScore } from "@/lib/risk";
import { formatDate } from "@/lib/utils";
import { eventsInPeriod, periodLabel } from "@/lib/period";
import type { Period, Student } from "@/lib/types";
import { Avatar } from "./avatar";
import { ScoreRing } from "./score-ring";
import { ScoreComposition } from "./score-composition";
import { Occurrences } from "./occurrences";

interface DetailPanelProps {
  student: Student | null;
  period: Period;
  onOpenEvidence: () => void;
}

function Meta({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function DetailPanel({
  student,
  period,
  onOpenEvidence,
}: DetailPanelProps) {
  if (!student) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-elevated text-muted-foreground">
          <FileSearch className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Selecione um estudante
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha alguém na lista para ver a análise de integridade.
          </p>
        </div>
      </div>
    );
  }

  const rubric = rubricForScore(student.fraudScore);
  const evidenceCount = eventsInPeriod(student.timeline, period).filter(
    (e) => e.weight,
  ).length;

  return (
    <motion.div
      key={student.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col overflow-y-auto pr-1"
    >
      {/* Identity card — with evidence CTA docked to the top-right */}
      <div className="rounded-2xl border border-border bg-elevated/40 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar src={student.avatar} name={student.name} size={60} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  {student.name}
                </h2>
                <RiskBadge level={student.risk} />
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {student.city} · {student.state}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {student.email}
              </p>
            </div>
          </div>

          <Button
            onClick={onOpenEvidence}
            variant="secondary"
            size="sm"
            className="shrink-0"
          >
            <FileSearch className="size-4" />
            <span className="hidden sm:inline">Ver evidências</span>
            {evidenceCount > 0 && (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-risk-critical/15 px-1.5 text-[11px] font-semibold text-risk-critical tabular-nums">
                {evidenceCount}
              </span>
            )}
          </Button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          <Meta label="Escola" value={student.school} />
          <Meta label="Turma" value={student.className} />
          <Meta label="Colocação" value={`#${student.rank}`} />
          <Meta
            label="Última atividade"
            value={formatDate(student.lastActivity)}
          />
        </dl>
      </div>

      {/* Score block */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="order-2 lg:order-1">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Composição do score
          </h3>
          <ScoreComposition breakdown={student.breakdown} />

          <div className="mt-5 flex items-center gap-4 rounded-xl border border-border bg-elevated/40 px-4 py-3">
            <ShieldCheck className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Integrity Score</p>
              <p className="text-sm font-medium text-foreground">
                {student.integrityScore} / 100
              </p>
            </div>
          </div>
        </div>

        <div className="order-1 flex items-center justify-center lg:order-2">
          <ScoreRing score={student.fraudScore} size={208} />
        </div>
      </div>

      {/* Occurrences */}
      <div className="mt-7">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Principais ocorrências
        </h3>
        <Occurrences occurrences={student.occurrences} />
      </div>

      {/* Rubric */}
      <div className="mt-6">
        <Accordion
          type="single"
          collapsible
          defaultValue="rubric"
          className="rounded-xl border border-border bg-elevated/40 px-4"
        >
          <AccordionItem value="rubric">
            <AccordionTrigger>Rubrica automática</AccordionTrigger>
            <AccordionContent>
              <p className="leading-relaxed text-muted-foreground">{rubric}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <p className="mt-4 pb-2 text-center text-[11px] text-muted-foreground/60">
        Análise referente ao período: {periodLabel(period)}
      </p>
    </motion.div>
  );
}
