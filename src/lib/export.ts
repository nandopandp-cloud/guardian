import type { Occurrence, Period, Student, TimelineEvent } from "./types";
import { riskMeta } from "./risk";
import { periodLabel, eventsInPeriod } from "./period";

const GEN_AT = () =>
  new Date().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

function fileStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ *
 * XLSX — one summary sheet + one detail sheet.
 * ------------------------------------------------------------------ */
export async function exportXLSX(students: Student[], period: Period) {
  const XLSX = await import("xlsx");

  const summary = students.map((s) => ({
    Colocação: s.rank,
    Nome: s.name,
    Email: s.email,
    Escola: s.school,
    Turma: s.className,
    Cidade: `${s.city} - ${s.state}`,
    "Fraud Score": s.fraudScore,
    Risco: riskMeta(s.risk).label,
    "Integrity Score": s.integrityScore,
    Behavior: s.breakdown.behavior.value,
    Technical: s.breakdown.technical.value,
    Volume: s.breakdown.volume.value,
    History: s.breakdown.history.value,
    "Última atividade": new Date(s.lastActivity).toLocaleDateString("pt-BR"),
  }));

  // Occurrences detail: one row per firing rule.
  const details: Record<string, string | number>[] = [];
  students.forEach((s) => {
    s.occurrences.forEach((o) => {
      details.push({
        Estudante: s.name,
        Escola: s.school,
        Ocorrência: o.label,
        Categoria: o.category,
        Peso: o.weight,
        Descrição: o.description,
      });
    });
  });

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  wsSummary["!cols"] = [
    { wch: 10 }, { wch: 22 }, { wch: 28 }, { wch: 26 }, { wch: 8 },
    { wch: 20 }, { wch: 11 }, { wch: 12 }, { wch: 14 }, { wch: 9 },
    { wch: 9 }, { wch: 8 }, { wch: 8 }, { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");

  if (details.length) {
    const wsDetails = XLSX.utils.json_to_sheet(details);
    wsDetails["!cols"] = [
      { wch: 22 }, { wch: 26 }, { wch: 28 }, { wch: 12 }, { wch: 6 }, { wch: 44 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDetails, "Ocorrências");
  }

  XLSX.writeFile(
    wb,
    `guardian_relatorio_${students.length}_${fileStamp()}.xlsx`,
  );
}

/* ================================================================== *
 * PDF DESIGN SYSTEM
 * ------------------------------------------------------------------ *
 * A4 portrait, pt units. A small palette + reusable primitives keep
 * every page visually consistent. Adaptive output:
 *   ≤ 20 students → detailed dossier (1 page each)
 *   > 20 students → cover + risk-distribution + summary table
 * ================================================================== */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Doc = any;
type RGB = [number, number, number];

const MARGIN = 44;
const PAGE = { w: 595.28, h: 841.89 };
const CONTENT_W = PAGE.w - MARGIN * 2;

const C = {
  ink: [23, 23, 23] as RGB,
  body: [64, 64, 64] as RGB,
  muted: [130, 130, 130] as RGB,
  faint: [168, 168, 168] as RGB,
  hair: [232, 232, 232] as RGB,
  panel: [247, 247, 247] as RGB,
  panelAlt: [250, 250, 250] as RGB,
  white: [255, 255, 255] as RGB,
  coverBg: [12, 12, 14] as RGB,
  coverInk: [245, 245, 245] as RGB,
  coverMuted: [150, 150, 155] as RGB,
  positive: [200, 62, 62] as RGB, // risk-raising rule
  negative: [40, 150, 90] as RGB, // risk-lowering rule
};

function riskRGB(level: Student["risk"]): RGB {
  switch (level) {
    case "normal": return [30, 155, 90];
    case "low": return [40, 116, 214];
    case "medium": return [199, 148, 22];
    case "high": return [223, 114, 34];
    case "critical": return [206, 52, 52];
  }
}

function riskTint(level: Student["risk"]): RGB {
  // Very light wash of the risk colour for panel backgrounds.
  const [r, g, b] = riskRGB(level);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.9);
  return [mix(r), mix(g), mix(b)];
}

/* ---- primitive drawing helpers ------------------------------------ */

function setFill(doc: Doc, [r, g, b]: RGB) {
  doc.setFillColor(r, g, b);
}
function setText(doc: Doc, [r, g, b]: RGB) {
  doc.setTextColor(r, g, b);
}
function setDraw(doc: Doc, [r, g, b]: RGB) {
  doc.setDrawColor(r, g, b);
}

/** Text helper with font + size + colour in one call. */
function txt(
  doc: Doc,
  s: string,
  x: number,
  y: number,
  opts: {
    size?: number;
    color?: RGB;
    weight?: "normal" | "bold";
    align?: "left" | "center" | "right";
    maxWidth?: number;
    spacing?: number;
  } = {},
) {
  doc.setFont("helvetica", opts.weight ?? "normal");
  doc.setFontSize(opts.size ?? 10);
  setText(doc, opts.color ?? C.body);
  if (opts.spacing != null) doc.setCharSpace(opts.spacing);
  doc.text(s, x, y, { align: opts.align ?? "left", maxWidth: opts.maxWidth });
  if (opts.spacing != null) doc.setCharSpace(0);
}

/** Section heading with a short accent rule beneath it. Returns new y. */
function sectionTitle(doc: Doc, s: string, x: number, y: number): number {
  txt(doc, s, x, y, { size: 11.5, color: C.ink, weight: "bold" });
  setDraw(doc, C.hair);
  doc.setLineWidth(0.6);
  doc.line(x, y + 6, PAGE.w - MARGIN, y + 6);
  return y + 20;
}

/** Rounded pill/chip. Returns its total width. */
function chip(
  doc: Doc,
  label: string,
  x: number,
  y: number,
  fill: RGB,
  fg: RGB,
  size = 8,
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  const padX = 6;
  const w = doc.getTextWidth(label) + padX * 2;
  const h = size + 6;
  setFill(doc, fill);
  doc.roundedRect(x, y - h + 3, w, h, h / 2, h / 2, "F");
  setText(doc, fg);
  doc.text(label, x + padX, y - 1);
  return w;
}

/** Vector shield with an inner radar tick — the Guardian mark. */
function shield(doc: Doc, cx: number, top: number, s: number, stroke: RGB) {
  // Shield outline (scaled path, drawn as line segments).
  const pts: [number, number][] = [
    [0, 0.02], [0.72, 0.24], [0.72, 0.54],
    [0.36, 0.98], [-0.36, 0.98], [-0.72, 0.54], [-0.72, 0.24],
  ];
  setDraw(doc, stroke);
  doc.setLineWidth(1.6);
  doc.setLineJoin("round");
  const P = (p: [number, number]) => [cx + p[0] * s * 0.7, top + p[1] * s];
  for (let i = 0; i < pts.length; i++) {
    const a = P(pts[i]);
    const b = P(pts[(i + 1) % pts.length]);
    doc.line(a[0], a[1], b[0], b[1]);
  }
  // Radar rings + tick
  const rcx = cx;
  const rcy = top + s * 0.5;
  setDraw(doc, [90, 90, 96]);
  doc.setLineWidth(0.8);
  doc.circle(rcx, rcy, s * 0.28, "S");
  doc.circle(rcx, rcy, s * 0.16, "S");
  setDraw(doc, [70, 200, 120]);
  doc.setLineWidth(1.2);
  doc.line(rcx, rcy, rcx, rcy - s * 0.28);
  setFill(doc, C.coverInk);
  doc.circle(rcx, rcy, 1.6, "F");
}

/** Header band drawn on every non-cover page. Returns content start y. */
function pageHeader(doc: Doc, period: Period, subtitle: string): number {
  // Thin brand row
  shield(doc, MARGIN + 7, MARGIN - 4, 20, C.ink);
  txt(doc, "GUARDIAN", MARGIN + 22, MARGIN + 6, {
    size: 10,
    color: C.ink,
    weight: "bold",
    spacing: 0.6,
  });
  txt(doc, subtitle, PAGE.w - MARGIN, MARGIN + 6, {
    size: 8.5,
    color: C.muted,
    align: "right",
  });
  setDraw(doc, C.hair);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, MARGIN + 16, PAGE.w - MARGIN, MARGIN + 16);
  return MARGIN + 40;
}

/** Footer with disclaimer + page number. Call last on each page. */
function pageFooter(doc: Doc, page: number, total: number) {
  const y = PAGE.h - 30;
  setDraw(doc, C.hair);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE.w - MARGIN, y);
  txt(
    doc,
    "Documento de apoio à decisão — não constitui punição.",
    MARGIN,
    y + 13,
    { size: 7.5, color: C.faint },
  );
  txt(doc, `${page} / ${total}`, PAGE.w - MARGIN, y + 13, {
    size: 7.5,
    color: C.faint,
    align: "right",
  });
}

/** Donut ring showing the fraud score, drawn as arc segments. */
function scoreRing(
  doc: Doc,
  cx: number,
  cy: number,
  radius: number,
  score: number,
  color: RGB,
) {
  const thickness = radius * 0.34;
  // Track
  ring(doc, cx, cy, radius, thickness, 0, 360, C.hair);
  // Progress
  const sweep = Math.max(4, (score / 100) * 360);
  ring(doc, cx, cy, radius, thickness, -90, -90 + sweep, color);
  // Center number
  txt(doc, String(score), cx, cy + 5, {
    size: 22,
    color,
    weight: "bold",
    align: "center",
  });
  txt(doc, "/100", cx, cy + 16, {
    size: 7,
    color: C.muted,
    align: "center",
  });
}

/** Draw a thick arc by stroking a sequence of short segments. */
function ring(
  doc: Doc,
  cx: number,
  cy: number,
  radius: number,
  thickness: number,
  startDeg: number,
  endDeg: number,
  color: RGB,
) {
  setDraw(doc, color);
  doc.setLineWidth(thickness);
  doc.setLineCap("round");
  const steps = Math.max(2, Math.round(Math.abs(endDeg - startDeg) / 6));
  const rad = (d: number) => (d * Math.PI) / 180;
  let prev: [number, number] | null = null;
  for (let i = 0; i <= steps; i++) {
    const d = startDeg + ((endDeg - startDeg) * i) / steps;
    const p: [number, number] = [
      cx + radius * Math.cos(rad(d)),
      cy + radius * Math.sin(rad(d)),
    ];
    if (prev) doc.line(prev[0], prev[1], p[0], p[1]);
    prev = p;
  }
  doc.setLineCap("butt");
}

/** Labeled progress bar for a score pillar. Returns new y. */
function pillarBar(
  doc: Doc,
  label: string,
  value: number,
  x: number,
  y: number,
  w: number,
  color: RGB,
): number {
  txt(doc, label, x, y, { size: 8.5, color: C.body });
  txt(doc, String(value), x + w, y, {
    size: 8.5,
    color: C.ink,
    weight: "bold",
    align: "right",
  });
  const barY = y + 5;
  const barH = 5;
  setFill(doc, C.hair);
  doc.roundedRect(x, barY, w, barH, barH / 2, barH / 2, "F");
  setFill(doc, color);
  doc.roundedRect(
    x,
    barY,
    Math.max(barH, (value / 100) * w),
    barH,
    barH / 2,
    barH / 2,
    "F",
  );
  return barY + barH + 12;
}

/* ---- cover -------------------------------------------------------- */

function drawCover(doc: Doc, students: Student[], period: Period) {
  setFill(doc, C.coverBg);
  doc.rect(0, 0, PAGE.w, PAGE.h, "F");

  // Faint corner glow
  setFill(doc, [22, 34, 26]);
  doc.circle(PAGE.w - 40, 70, 150, "F");

  const cx = PAGE.w / 2;
  shield(doc, cx, 120, 78, C.coverInk);

  txt(doc, "GUARDIAN · INTEGRITY ANALYSIS TOOL", cx, 250, {
    size: 7.5,
    color: C.coverMuted,
    weight: "bold",
    spacing: 1.4,
    align: "center",
  });

  txt(doc, "Relatório de Integridade", cx, 292, {
    size: 27,
    color: C.coverInk,
    weight: "bold",
    align: "center",
  });
  txt(doc, "Liga Genial · Jovens Gênios", cx, 314, {
    size: 11,
    color: C.coverMuted,
    align: "center",
  });

  // Divider
  setDraw(doc, [55, 55, 60]);
  doc.setLineWidth(0.8);
  doc.line(cx - 90, 344, cx + 90, 344);

  // Meta card
  const cardW = 300;
  const cardX = cx - cardW / 2;
  const cardY = 372;
  setFill(doc, [20, 20, 24]);
  doc.roundedRect(cardX, cardY, cardW, 108, 10, 10, "F");
  setDraw(doc, [42, 42, 48]);
  doc.setLineWidth(0.8);
  doc.roundedRect(cardX, cardY, cardW, 108, 10, 10, "S");

  const metaRow = (label: string, value: string, ry: number) => {
    txt(doc, label, cardX + 20, ry, { size: 8, color: C.coverMuted });
    txt(doc, value, cardX + cardW - 20, ry, {
      size: 9.5,
      color: C.coverInk,
      weight: "bold",
      align: "right",
    });
  };
  metaRow("Período analisado", periodLabel(period), cardY + 28);
  setDraw(doc, [38, 38, 42]);
  doc.line(cardX + 20, cardY + 40, cardX + cardW - 20, cardY + 40);
  metaRow("Estudantes no relatório", String(students.length), cardY + 60);
  setDraw(doc, [38, 38, 42]);
  doc.line(cardX + 20, cardY + 72, cardX + cardW - 20, cardY + 72);
  metaRow(
    "Tipo",
    students.length <= DETAIL_THRESHOLD ? "Dossiê detalhado" : "Resumo executivo",
    cardY + 92,
  );

  txt(doc, `Gerado em ${GEN_AT()}`, cx, cardY + 138, {
    size: 8,
    color: C.coverMuted,
    align: "center",
  });

  // Footer disclaimer
  txt(
    doc,
    "Documento confidencial de apoio à decisão. Não constitui punição. Recomenda-se auditoria manual antes de qualquer medida.",
    cx,
    PAGE.h - 48,
    { size: 8, color: [90, 90, 96], align: "center", maxWidth: 380 },
  );
}

/* ---- dossier (detailed, ≤20) ------------------------------------- */

function drawDossier(doc: Doc, s: Student, period: Period) {
  const rColor = riskRGB(s.risk);
  let y = pageHeader(doc, period, periodLabel(period));

  /* Identity band */
  const bandH = 74;
  setFill(doc, C.panel);
  doc.roundedRect(MARGIN, y, CONTENT_W, bandH, 10, 10, "F");

  // Rank medallion
  const medX = MARGIN + 30;
  const medY = y + bandH / 2;
  setFill(doc, C.ink);
  doc.circle(medX, medY, 20, "F");
  txt(doc, `#${s.rank}`, medX, medY + 3.5, {
    size: 11,
    color: C.white,
    weight: "bold",
    align: "center",
  });

  const infoX = medX + 34;
  txt(doc, s.name, infoX, y + 26, { size: 15, color: C.ink, weight: "bold" });
  chip(doc, riskMeta(s.risk).label, infoX + doc.getTextWidth(s.name) + 12, y + 25, riskTint(s.risk), rColor, 8);
  txt(doc, `${s.school} · ${s.className}`, infoX, y + 42, {
    size: 9,
    color: C.body,
  });
  txt(
    doc,
    `${s.city} - ${s.state}  ·  ${s.email}`,
    infoX,
    y + 56,
    { size: 8.5, color: C.muted },
  );

  // Score ring (right side of band)
  scoreRing(doc, MARGIN + CONTENT_W - 44, y + bandH / 2, 26, s.fraudScore, rColor);

  y += bandH + 26;

  /* Two-column: composition (left) + key stats (right) */
  const colGap = 24;
  const leftW = (CONTENT_W - colGap) * 0.58;
  const rightX = MARGIN + leftW + colGap;
  const rightW = CONTENT_W - leftW - colGap;
  const blockTop = y;

  // Left: composition
  let ly = sectionTitle(doc, "Composição do score", MARGIN, y);
  const pillars: [string, number][] = [
    ["Behavior", s.breakdown.behavior.value],
    ["Technical", s.breakdown.technical.value],
    ["Volume", s.breakdown.volume.value],
    ["History", s.breakdown.history.value],
  ];
  pillars.forEach(([label, val]) => {
    ly = pillarBar(doc, label, val, MARGIN, ly, leftW, rColor);
  });

  // Right: stat cards (Integrity + Fraud faixa)
  let ry = sectionTitle(doc, "Indicadores", rightX, blockTop);
  const statCard = (label: string, value: string, cy: number): number => {
    const h = 40;
    setFill(doc, C.panelAlt);
    doc.roundedRect(rightX, cy, rightW, h, 8, 8, "F");
    setDraw(doc, C.hair);
    doc.setLineWidth(0.6);
    doc.roundedRect(rightX, cy, rightW, h, 8, 8, "S");
    txt(doc, label, rightX + 12, cy + 16, { size: 7.5, color: C.muted, weight: "bold" });
    txt(doc, value, rightX + 12, cy + 32, { size: 13, color: C.ink, weight: "bold" });
    return cy + h + 10;
  };
  ry = statCard("INTEGRITY SCORE", `${s.integrityScore} / 100`, ry);
  ry = statCard("FRAUD SCORE", `${s.fraudScore} · ${riskMeta(s.risk).label}`, ry);

  y = Math.max(ly, ry) + 10;

  /* Occurrences */
  y = sectionTitle(doc, "Principais ocorrências", MARGIN, y);
  if (s.occurrences.length === 0) {
    txt(doc, "Nenhuma ocorrência relevante contribuiu no período.", MARGIN, y, {
      size: 9,
      color: C.muted,
    });
    y += 18;
  } else {
    s.occurrences.forEach((o) => {
      y = occurrenceRow(doc, o, MARGIN, y, CONTENT_W);
    });
  }
  y += 10;

  /* Evidence timeline */
  const events = eventsInPeriod(s.timeline, period);
  y = sectionTitle(doc, `Evidências no período`, MARGIN, y);
  drawTimeline(doc, events, MARGIN, y, rColor);

  /* Rubric strip at the very bottom (above footer) */
  const rubY = PAGE.h - 78;
  setFill(doc, riskTint(s.risk));
  doc.roundedRect(MARGIN, rubY, CONTENT_W, 34, 8, 8, "F");
  // Accent bar
  setFill(doc, rColor);
  doc.roundedRect(MARGIN, rubY, 4, 34, 2, 2, "F");
  txt(doc, "RECOMENDAÇÃO", MARGIN + 14, rubY + 14, {
    size: 7,
    color: rColor,
    weight: "bold",
    spacing: 1,
  });
  txt(doc, recommendation(s), MARGIN + 14, rubY + 26, {
    size: 8.5,
    color: C.body,
    maxWidth: CONTENT_W - 28,
  });
}

/** One occurrence row: weight chip + label + category. Returns new y. */
function occurrenceRow(
  doc: Doc,
  o: Occurrence,
  x: number,
  y: number,
  w: number,
): number {
  const positive = o.weight > 0;
  const accent = positive ? C.positive : C.negative;
  const h = 26;
  setFill(doc, C.panelAlt);
  doc.roundedRect(x, y, w, h, 6, 6, "F");

  // Weight badge
  const badge = `${positive ? "+" : ""}${o.weight}`;
  setFill(doc, accent);
  doc.roundedRect(x + 8, y + 6, 34, 14, 4, 4, "F");
  txt(doc, badge, x + 8 + 17, y + 16, {
    size: 9,
    color: C.white,
    weight: "bold",
    align: "center",
  });

  txt(doc, o.label, x + 52, y + 12, { size: 9, color: C.ink, weight: "bold" });
  txt(doc, o.description, x + 52, y + 21.5, {
    size: 7.5,
    color: C.muted,
    maxWidth: w - 160,
  });
  // Category tag (right)
  chip(doc, o.category, x + w - 12 - doc.getTextWidth(o.category) - 12, y + 17, C.panel, C.muted, 7);
  return y + h + 6;
}

/** Vertical timeline with a rail and dated nodes. Returns new y. */
function drawTimeline(
  doc: Doc,
  events: TimelineEvent[],
  x: number,
  y: number,
  accent: RGB,
) {
  if (events.length === 0) {
    txt(doc, "Nenhuma evidência registrada neste período.", x, y, {
      size: 9,
      color: C.muted,
    });
    return;
  }
  const railX = x + 3;
  const maxRows = 8;
  const shown = events.slice(0, maxRows);
  const rowH = 15;
  // Rail
  setDraw(doc, C.hair);
  doc.setLineWidth(1);
  doc.line(railX, y - 2, railX, y - 2 + shown.length * rowH);

  shown.forEach((e, i) => {
    const ry = y + i * rowH;
    // Node
    setFill(doc, e.weight ? accent : C.faint);
    doc.circle(railX, ry, 2.6, "F");
    const d = new Date(e.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
    txt(doc, `${d} · ${e.time}`, x + 14, ry + 3, {
      size: 7.5,
      color: C.muted,
    });
    txt(doc, e.title, x + 92, ry + 3, { size: 8.5, color: C.ink });
    if (e.weight) {
      txt(doc, `+${e.weight}`, x + CONTENT_W - 4, ry + 3, {
        size: 8.5,
        color: C.positive,
        weight: "bold",
        align: "right",
      });
    }
  });
  if (events.length > maxRows) {
    txt(
      doc,
      `+ ${events.length - maxRows} eventos adicionais no período`,
      x + 14,
      y + shown.length * rowH + 4,
      { size: 7.5, color: C.faint },
    );
  }
}

function recommendation(s: Student): string {
  switch (s.risk) {
    case "critical":
      return "Auditoria manual imediata recomendada antes de qualquer decisão sobre a colocação.";
    case "high":
      return "Indícios relevantes de automação. Recomenda-se auditoria manual.";
    case "medium":
      return "Sinais moderados. Sugere-se acompanhamento e revisão pontual das evidências.";
    case "low":
      return "Poucos sinais de baixa relevância. Sem motivos consistentes para auditoria.";
    default:
      return "Comportamento dentro do esperado. Nenhuma ação recomendada.";
  }
}

/* ---- summary (executive, >20) ------------------------------------ */

function drawRiskDistribution(doc: Doc, students: Student[], period: Period) {
  let y = pageHeader(doc, period, periodLabel(period));
  y = sectionTitle(doc, "Panorama de risco", MARGIN, y);

  const levels: Student["risk"][] = ["critical", "high", "medium", "low", "normal"];
  const counts = levels.map(
    (lv) => students.filter((s) => s.risk === lv).length,
  );
  const max = Math.max(1, ...counts);
  const total = students.length;

  // KPI row
  const kpis: [string, string][] = [
    ["Estudantes", String(total)],
    ["Alto risco +", String(counts[0] + counts[1])],
    ["Score médio", String(Math.round(students.reduce((a, s) => a + s.fraudScore, 0) / total))],
  ];
  const kpiW = (CONTENT_W - 20) / 3;
  kpis.forEach(([label, value], i) => {
    const kx = MARGIN + i * (kpiW + 10);
    setFill(doc, C.panel);
    doc.roundedRect(kx, y, kpiW, 52, 8, 8, "F");
    txt(doc, label.toUpperCase(), kx + 14, y + 18, { size: 7.5, color: C.muted, weight: "bold", spacing: 0.8 });
    txt(doc, value, kx + 14, y + 40, { size: 20, color: C.ink, weight: "bold" });
  });
  y += 78;

  // Horizontal bars per risk level
  y = sectionTitle(doc, "Distribuição por faixa", MARGIN, y);
  const labelW = 90;
  const barMaxW = CONTENT_W - labelW - 46;
  levels.forEach((lv, i) => {
    const rColor = riskRGB(lv);
    const rowY = y + i * 26;
    txt(doc, riskMeta(lv).label, MARGIN, rowY + 9, { size: 9, color: C.body });
    setFill(doc, C.hair);
    doc.roundedRect(MARGIN + labelW, rowY, barMaxW, 12, 6, 6, "F");
    const bw = Math.max(counts[i] > 0 ? 8 : 0, (counts[i] / max) * barMaxW);
    if (bw > 0) {
      setFill(doc, rColor);
      doc.roundedRect(MARGIN + labelW, rowY, bw, 12, 6, 6, "F");
    }
    txt(doc, String(counts[i]), MARGIN + labelW + barMaxW + 12, rowY + 9, {
      size: 9,
      color: C.ink,
      weight: "bold",
    });
  });
}

function drawSummaryTable(doc: Doc, students: Student[], autoTable: Doc, period: Period) {
  doc.addPage();
  const startY = pageHeader(doc, period, periodLabel(period));
  sectionTitle(doc, "Resumo dos estudantes", MARGIN, startY);

  autoTable(doc, {
    startY: startY + 14,
    margin: { left: MARGIN, right: MARGIN, bottom: 48 },
    head: [["#", "Nome", "Escola", "Turma", "Score", "Risco", "Integ."]],
    body: students.map((s) => [
      s.rank,
      s.name,
      s.school,
      s.className,
      s.fraudScore,
      riskMeta(s.risk).label,
      s.integrityScore,
    ]),
    theme: "plain",
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
      textColor: C.body,
      lineColor: C.hair,
      lineWidth: 0.4,
    },
    headStyles: {
      fillColor: C.ink,
      textColor: C.white,
      fontStyle: "bold",
      halign: "left",
      cellPadding: { top: 7, bottom: 7, left: 6, right: 6 },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 28, halign: "center", textColor: C.muted },
      2: { cellWidth: 130 },
      4: { cellWidth: 44, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 62 },
      6: { cellWidth: 40, halign: "center" },
    },
    didParseCell: (data: Doc) => {
      if (data.section !== "body") return;
      const s = students[data.row.index];
      if (data.column.index === 4 || data.column.index === 5) {
        data.cell.styles.textColor = riskRGB(s.risk);
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
}

/* ---- orchestration ------------------------------------------------ */

const DETAIL_THRESHOLD = 20;

/** Build the document (no download) — reusable for tests and previews. */
export async function buildPDF(students: Student[], period: Period) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  drawCover(doc, students, period);

  if (students.length <= DETAIL_THRESHOLD) {
    students.forEach((s) => {
      doc.addPage();
      drawDossier(doc, s, period);
    });
  } else {
    doc.addPage();
    drawRiskDistribution(doc, students, period);
    drawSummaryTable(doc, students, autoTable, period);
  }

  // Footers with page numbers (skip the cover = page 1).
  const total = doc.getNumberOfPages();
  for (let p = 2; p <= total; p++) {
    doc.setPage(p);
    pageFooter(doc, p, total);
  }

  return doc;
}

export async function exportPDF(students: Student[], period: Period) {
  const doc = await buildPDF(students, period);
  doc.save(`guardian_relatorio_${students.length}_${fileStamp()}.pdf`);
}
