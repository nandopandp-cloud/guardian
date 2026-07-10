import {
  C,
  callout,
  CONTENT_W,
  drawCover,
  heading,
  Layout,
  M,
  paragraph,
  resetSections,
  sanitize,
  setFill,
  txt,
} from "./matrix-doc";
import type { Doc, RGB } from "./matrix-doc";

/* ================================================================== *
 * PREMISSAS ANTIFRAUDE — Ações rápidas (Prepara SP · Liga Genial)
 * ------------------------------------------------------------------ *
 * Documento enxuto e direto: critérios de desconsideração de pontuação
 * para estancar rapidamente a obtenção indevida de pontos, mais a
 * alteração de regulamento (limite diário de simulados). Reaproveita o
 * design system do documento da Matriz de Fraude.
 * ================================================================== */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Premise {
  n: number;
  title: string;
  rule: string;
  /** Short chip summarising the threshold (e.g. "≤ 5 s"). */
  metric: string;
}

const PREMISES: Premise[] = [
  {
    n: 1,
    title: "Tempo de resposta",
    rule: "Não serão considerados para fins de pontuação os quizzes cuja média de tempo de resposta seja igual ou inferior a 5 segundos por rodada de quiz.",
    metric: "Média <= 5 s / rodada",
  },
  {
    n: 2,
    title: "Repetição de atividades",
    rule: "Não serão creditados pontos obtidos por meio da repetição sucessiva da mesma atividade em um intervalo inferior a 8 horas.",
    metric: "Mesma atividade < 8 h",
  },
  {
    n: 3,
    title: "Simulados",
    rule: "Não serão creditados pontos de simulados concluídos em tempo inferior a 5 minutos.",
    metric: "Conclusão < 5 min",
  },
  {
    n: 4,
    title: "Acessos simultâneos",
    rule: "Não serão creditados pontos para usuários que acessarem a plataforma simultaneamente em dispositivos diferentes ou iniciarem uma nova sessão em outro dispositivo dentro de um intervalo de 30 minutos.",
    metric: "Sessões < 30 min entre dispositivos",
  },
];

/** A premise block: number badge + title + metric chip + rule text. */
function premiseBlock(L: Layout, p: Premise) {
  const d = L.doc;
  d.setFont("helvetica", "normal");
  d.setFontSize(9.5);
  const ruleLines: string[] = d.splitTextToSize(sanitize(p.rule), CONTENT_W - 74);
  const bodyH = ruleLines.length * 13.5;
  const h = Math.max(64, 40 + bodyH);
  L.ensure(h + 12);

  const x = M.left;
  const y = L.y;

  // Card
  setFill(d, C.panel);
  d.roundedRect(x, y, CONTENT_W, h, 9, 9, "F");
  setFill(d, C.orange);
  d.roundedRect(x, y, 4, h, 2, 2, "F");

  // Number badge
  setFill(d, C.navy);
  d.circle(x + 34, y + 30, 17, "F");
  txt(d, String(p.n), x + 34, y + 35, {
    size: 15,
    color: C.white,
    weight: "bold",
    align: "center",
  });

  // Title + metric chip
  const tx = x + 62;
  txt(d, p.title, tx, y + 25, { size: 11.5, color: C.navy, weight: "bold" });

  // Metric chip (right)
  d.setFont("helvetica", "bold");
  d.setFontSize(8);
  const chipLabel = sanitize(p.metric);
  const chipW = d.getTextWidth(chipLabel) + 18;
  setFill(d, [237, 242, 250]);
  d.roundedRect(x + CONTENT_W - chipW - 14, y + 14, chipW, 16, 8, 8, "F");
  txt(d, chipLabel, x + CONTENT_W - chipW - 14 + chipW / 2, y + 25, {
    size: 8,
    color: C.blue,
    weight: "bold",
    align: "center",
  });

  // Rule text
  let ry = y + 40;
  for (const line of ruleLines) {
    txt(d, line, tx, ry, { size: 9.5, color: C.body });
    ry += 13.5;
  }

  L.y += h + 12;
}

/** The regulation clause card — official text, formally styled. */
function regulationCard(L: Layout) {
  const d = L.doc;
  const paras = [
    "A pontuação obtida por meio de simulados será limitada a 1.850 (mil oitocentos e cinquenta) pontos por estudante, por dia.",
    "Após o atingimento desse limite diário, o estudante poderá continuar realizando simulados normalmente para fins de estudo e acompanhamento pedagógico. Entretanto, as atividades permanecerão registradas na plataforma sem gerar pontuação adicional para o ranking da Liga Genial até o início do próximo dia, conforme o horário oficial da competição.",
  ];

  // Measure
  d.setFont("helvetica", "normal");
  d.setFontSize(9.5);
  const wrapped = paras.map((p) => d.splitTextToSize(sanitize(p), CONTENT_W - 36));
  const textH = wrapped.reduce((a, l) => a + l.length * 14, 0) + (paras.length - 1) * 6;
  const h = 62 + textH;
  L.ensure(h + 10);

  const x = M.left;
  const y = L.y;

  // Navy header strip with clause number
  setFill(d, C.navy);
  d.roundedRect(x, y, CONTENT_W, h, 10, 10, "F");
  // Inner white body
  setFill(d, C.white);
  d.roundedRect(x + 6, y + 40, CONTENT_W - 12, h - 46, 7, 7, "F");

  // Clause tag
  setFill(d, C.orange);
  d.roundedRect(x + 16, y + 13, 52, 18, 9, 9, "F");
  txt(d, "4.2.2", x + 42, y + 25, {
    size: 9.5,
    color: C.navy,
    weight: "bold",
    align: "center",
  });
  txt(d, "Limite Diário de Pontuação em Simulados", x + 80, y + 25, {
    size: 11,
    color: C.white,
    weight: "bold",
  });

  // Body text
  let ty = y + 40 + 20;
  wrapped.forEach((lines, pi) => {
    lines.forEach((line: string) => {
      txt(d, line, x + 18, ty, { size: 9.5, color: C.body });
      ty += 14;
    });
    if (pi < wrapped.length - 1) ty += 6;
  });

  L.y += h + 10;
}

/** Compact stat/threshold highlight row for the summary strip. */
function thresholdStrip(L: Layout) {
  const d = L.doc;
  const items: [string, string][] = [
    ["<= 5 s", "Tempo médio"],
    ["< 8 h", "Repetição"],
    ["< 5 min", "Simulado"],
    ["30 min", "Sessões"],
    ["1.850", "Limite/dia"],
  ];
  const gap = 10;
  const cardW = (CONTENT_W - gap * (items.length - 1)) / items.length;
  L.ensure(58);
  items.forEach(([big, small], i) => {
    const x = M.left + i * (cardW + gap);
    setFill(d, C.navy);
    d.roundedRect(x, L.y, cardW, 48, 8, 8, "F");
    setFill(d, C.orange);
    d.roundedRect(x, L.y, cardW, 3, 1.5, 1.5, "F");
    txt(d, big, x + cardW / 2, L.y + 26, {
      size: 15,
      color: C.white,
      weight: "bold",
      align: "center",
    });
    txt(d, small.toUpperCase(), x + cardW / 2, L.y + 39, {
      size: 6.5,
      color: [150, 170, 205],
      weight: "bold",
      spacing: 0.5,
      align: "center",
    });
  });
  L.y += 58;
}

export async function buildAntifraudDoc() {
  const { jsPDF } = await import("jspdf");
  const doc: Doc = new jsPDF({ unit: "pt", format: "a4" });
  resetSections();

  drawCover(doc, {
    title: "Premissas Antifraude",
    subtitle: "Ações rápidas de integridade · Liga Genial",
    description:
      "Critérios imediatos para desconsiderar pontuação obtida de forma indevida, enquanto a arquitetura completa do Fraud Score não é implementada.",
    chips: [
      "Ação imediata",
      "Squad Prepara SP",
      `v1.0 · ${new Date().toLocaleDateString("pt-BR")}`,
    ],
  });

  const L = new Layout(doc, "Premissas Antifraude · Liga Genial");
  doc.addPage();
  L.page = 2;
  L.y = M.top;
  L.chrome();

  /* Intro */
  heading(L, "Contexto e objetivo");
  paragraph(
    L,
    "Este documento reúne as premissas iniciais para reduzir, de forma rápida, a obtenção indevida de pontos na Liga Genial. São medidas de contenção aplicáveis desde já — sem depender da implementação completa da Matriz de Fraude — para preservar a justiça da competição.",
  );
  paragraph(
    L,
    "As premissas definem critérios de elegibilidade para pontuação: atividades que se enquadrem em qualquer uma das regras poderão ter sua pontuação desconsiderada para fins de classificação, independentemente de a atividade ter sido concluída. As regras poderão ser revisadas conforme a evolução da plataforma e a análise dos dados.",
  );
  callout(
    L,
    "Natureza das regras",
    "Estes são critérios de desconsideração de pontuação, não punições. A atividade continua registrada; apenas a pontuação indevida deixa de ser creditada ao ranking.",
    "orange",
  );

  /* Threshold overview */
  heading(L, "Limiares em resumo");
  paragraph(
    L,
    "Os cinco limiares abaixo concentram as ações imediatas. Os quatro primeiros desconsideram pontuação; o último, definido em regulamento, limita o ganho diário em simulados.",
  );
  thresholdStrip(L);

  /* Premises */
  heading(L, "Premissas de desconsideração de pontuação");
  paragraph(
    L,
    "Cada premissa descreve uma condição objetiva. Ao ser atendida, a pontuação correspondente não é creditada para a classificação da Liga Genial.",
  );
  PREMISES.forEach((p) => premiseBlock(L, p));

  /* Regulation change */
  heading(L, "Alteração no regulamento");
  paragraph(
    L,
    "Complementando as premissas técnicas, a seguinte cláusula passa a integrar o regulamento oficial da competição, estabelecendo um teto diário de pontuação por simulados:",
  );
  regulationCard(L);
  callout(
    L,
    "Efeito prático",
    "O estudante nunca é impedido de estudar: após 1.850 pontos/dia em simulados, as atividades seguem disponíveis e registradas, apenas sem gerar pontuação adicional para o ranking até o próximo dia.",
    "info",
  );

  /* Observation / closing */
  heading(L, "Observação final");
  callout(
    L,
    "Elegibilidade de pontuação",
    "Estas premissas definem critérios de elegibilidade para pontuação na Liga Genial. Atividades enquadradas em qualquer uma das regras acima poderão ter sua pontuação desconsiderada para fins de classificação, independentemente da conclusão da atividade. As regras são premissas iniciais e podem ser calibradas com base nos dados reais da temporada.",
    "orange",
  );

  return doc;
}

export async function exportAntifraudDoc() {
  const doc = await buildAntifraudDoc();
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`prepara-sp_premissas-antifraude_${stamp}.pdf`);
}

/* Keep RGB import referenced for type-only builds. */
export type { RGB };
