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
import { bandUpperBound, riskFromScore, rubricForScore } from "@/lib/risk";
import { formatDate } from "@/lib/utils";
import type { Student } from "@/lib/types";
import { Avatar } from "./avatar";
import { Gauge } from "./gauge";
import { ScoreComposition } from "./score-composition";
import { Occurrences } from "./occurrences";

interface DetailPanelProps {
  student: Student | null;
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

export function DetailPanel({ student, onOpenEvidence }: DetailPanelProps) {
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

  const meta = riskFromScore(student.fraudScore);
  const rubric = rubricForScore(student.fraudScore);

  return (
    <motion.div
      key={student.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col overflow-y-auto pr-1"
    >
      {/* Identity header */}
      <div className="flex items-start gap-4">
        <Avatar src={student.avatar} name={student.name} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              {student.name}
            </h2>
            <RiskBadge level={student.risk} />
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {student.city} · {student.state}
          </p>
          <p className="text-sm text-muted-foreground">{student.email}</p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Meta label="Escola" value={student.school} />
        <Meta label="Turma" value={student.className} />
        <Meta label="Colocação" value={`#${student.rank}`} />
        <Meta label="Última atividade" value={formatDate(student.lastActivity)} />
      </dl>

      {/* Score block */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="order-2 lg:order-1">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Composição do score
          </h3>
          <ScoreComposition breakdown={student.breakdown} />

          <div className="mt-5 flex items-center gap-4 rounded-lg border border-border bg-elevated/40 px-4 py-3">
            <ShieldCheck className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Integrity Score</p>
              <p className="text-sm font-medium text-foreground">
                {student.integrityScore} / 100
              </p>
            </div>
          </div>
        </div>

        <div className="order-1 flex flex-col items-center justify-start lg:order-2">
          <Gauge score={student.fraudScore} size={220} />
          <RiskBadge level={student.risk} className="mt-1" />
          <span className="mt-2 text-xs text-muted-foreground">
            Faixa {meta.min}
            {meta.level === "critical" ? "+" : `–${bandUpperBound(meta.min)}`}
          </span>
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

      {/* Action */}
      <div className="mt-6 pb-2">
        <Button className="w-full" onClick={onOpenEvidence}>
          <FileSearch className="size-4" />
          Ver evidências
        </Button>
      </div>
    </motion.div>
  );
}
