import type { RiskLevel } from "./types";

export interface RiskMeta {
  level: RiskLevel;
  label: string;
  /** Lower bound of the band (inclusive). */
  min: number;
  /** Tailwind text color class. */
  text: string;
  /** Tailwind background tint class. */
  bg: string;
  /** Tailwind border class. */
  border: string;
  /** Raw HSL string for SVG / inline styling. */
  hsl: string;
}

export const RISK_BANDS: RiskMeta[] = [
  {
    level: "normal",
    label: "Normal",
    min: 0,
    text: "text-risk-normal",
    bg: "bg-risk-normal/10",
    border: "border-risk-normal/30",
    hsl: "hsl(142 60% 45%)",
  },
  {
    level: "low",
    label: "Baixo risco",
    min: 20,
    text: "text-risk-low",
    bg: "bg-risk-low/10",
    border: "border-risk-low/30",
    hsl: "hsl(210 90% 58%)",
  },
  {
    level: "medium",
    label: "Médio risco",
    min: 40,
    text: "text-risk-medium",
    bg: "bg-risk-medium/10",
    border: "border-risk-medium/30",
    hsl: "hsl(45 93% 55%)",
  },
  {
    level: "high",
    label: "Alto risco",
    min: 60,
    text: "text-risk-high",
    bg: "bg-risk-high/10",
    border: "border-risk-high/30",
    hsl: "hsl(25 95% 55%)",
  },
  {
    level: "critical",
    label: "Crítico",
    min: 80,
    text: "text-risk-critical",
    bg: "bg-risk-critical/10",
    border: "border-risk-critical/30",
    hsl: "hsl(0 84% 60%)",
  },
];

export function riskFromScore(score: number): RiskMeta {
  // Walk bands descending; first whose min the score clears wins.
  for (let i = RISK_BANDS.length - 1; i >= 0; i--) {
    if (score >= RISK_BANDS[i].min) return RISK_BANDS[i];
  }
  return RISK_BANDS[0];
}

export function riskMeta(level: RiskLevel): RiskMeta {
  return RISK_BANDS.find((b) => b.level === level) ?? RISK_BANDS[0];
}

/** Upper bound (inclusive) of the band whose lower bound is `min`. */
export function bandUpperBound(min: number): number {
  const idx = RISK_BANDS.findIndex((b) => b.min === min);
  const next = RISK_BANDS[idx + 1];
  return next ? next.min - 1 : 100;
}

/**
 * Auto-generated rubric text keyed off the score band. Mirrors the tone an
 * analyst would expect: descriptive, non-accusatory, ends with a recommendation.
 */
export function rubricForScore(score: number): string {
  const { level } = riskFromScore(score);
  switch (level) {
    case "critical":
      return "Este estudante apresentou um conjunto expressivo de comportamentos atípicos durante o período analisado. Foram detectadas respostas muito abaixo do tempo médio esperado, intervalos constantes entre ações e sessões prolongadas — padrões fortemente compatíveis com automação. Recomenda-se auditoria manual imediata antes de qualquer decisão sobre a colocação na Liga.";
    case "high":
      return "Foram observados diversos indícios relevantes de comportamento incomum, incluindo tempos de resposta reduzidos e padrões de interação pouco naturais. Ainda que não conclusivos isoladamente, em conjunto elevam de forma significativa a probabilidade de assistência automatizada. Recomenda-se auditoria manual.";
    case "medium":
      return "O estudante apresentou alguns sinais que merecem atenção, como respostas ocasionalmente rápidas ou sessões acima da média. Os indícios são moderados e podem ter explicações legítimas. Sugere-se acompanhamento e uma revisão pontual das evidências.";
    case "low":
      return "Foram detectados poucos sinais de baixa relevância. O comportamento é, em sua maior parte, compatível com o de um estudante engajado. Não há, neste momento, motivos consistentes para auditoria.";
    default:
      return "Nenhum comportamento atípico relevante foi identificado no período. Os tempos de resposta, os intervalos entre ações e a duração das sessões estão dentro do esperado. Nenhuma ação é recomendada.";
  }
}
