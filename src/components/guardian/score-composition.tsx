"use client";

import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { ScoreBreakdown, ScoreComponent } from "@/lib/types";

const PILLARS: {
  key: keyof ScoreBreakdown;
  label: string;
  hint: string;
}[] = [
  {
    key: "behavior",
    label: "Behavior Score",
    hint: "Padrões de interação: movimentos de mouse, scroll e ritmo das ações.",
  },
  {
    key: "technical",
    label: "Technical Score",
    hint: "Sinais técnicos: tempos de resposta, rede e ambiente da sessão.",
  },
  {
    key: "volume",
    label: "Volume Score",
    hint: "Intensidade de uso: duração e quantidade de sessões e tentativas.",
  },
  {
    key: "history",
    label: "History Score",
    hint: "Consistência do desempenho ao longo da temporada.",
  },
];

/** Color scales from neutral → red as the component value rises. */
function barColor(value: number): string {
  if (value >= 80) return "hsl(0 84% 60%)";
  if (value >= 60) return "hsl(25 95% 55%)";
  if (value >= 40) return "hsl(45 93% 55%)";
  if (value >= 20) return "hsl(210 90% 58%)";
  return "hsl(142 60% 45%)";
}

export function ScoreComposition({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        {PILLARS.map((p) => {
          const c: ScoreComponent = breakdown[p.key];
          return (
            <div key={p.key}>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    {p.label}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground/60 hover:text-muted-foreground">
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-56">{p.hint}</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-3 text-xs tabular-nums text-muted-foreground">
                  <span title="Peso do componente no score final">
                    peso {Math.round(c.weight * 100)}%
                  </span>
                  <span
                    title="Contribuição em pontos para o Fraud Score"
                    className="text-foreground"
                  >
                    +{c.contribution}
                  </span>
                  <span className="w-8 text-right font-medium text-foreground">
                    {c.value}
                  </span>
                </div>
              </div>
              <Progress value={c.value} color={barColor(c.value)} />
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
