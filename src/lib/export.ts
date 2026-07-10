import type { Period, Student } from "./types";
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

/* ------------------------------------------------------------------ *
 * PDF — adaptive: ≤20 students → detailed dossier (1 page each);
 * otherwise a cover + summary table.
 * ------------------------------------------------------------------ */
const DETAIL_THRESHOLD = 20;

export async function exportPDF(students: Student[], period: Period) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  drawCover(doc, students.length, period, W);

  if (students.length <= DETAIL_THRESHOLD) {
    students.forEach((s) => drawDossier(doc, s, period, W));
  } else {
    doc.addPage();
    drawSummaryTable(doc, students, autoTable);
  }

  doc.save(`guardian_relatorio_${students.length}_${fileStamp()}.pdf`);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Doc = any;

function riskRGB(level: Student["risk"]): [number, number, number] {
  switch (level) {
    case "normal": return [34, 160, 90];
    case "low": return [37, 120, 220];
    case "medium": return [200, 150, 20];
    case "high": return [225, 120, 35];
    case "critical": return [210, 55, 55];
  }
}

function drawCover(doc: Doc, count: number, period: Period, W: number) {
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");

  // Shield glyph (simple)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.5);
  const cx = W / 2;
  doc.setFontSize(11);
  doc.setTextColor(150, 150, 150);
  doc.text("GUARDIAN", cx, 150, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("Relatório de Integridade", cx, 200, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(170, 170, 170);
  doc.text("Liga Genial · Jovens Gênios", cx, 226, { align: "center" });

  doc.setDrawColor(60, 60, 60);
  doc.line(cx - 120, 260, cx + 120, 260);

  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  doc.text(`Período analisado: ${periodLabel(period)}`, cx, 292, {
    align: "center",
  });
  doc.text(`Estudantes no relatório: ${count}`, cx, 312, { align: "center" });
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  doc.text(`Gerado em ${GEN_AT()}`, cx, 332, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(
    "Documento de apoio à decisão. Não constitui punição. Recomenda-se auditoria manual.",
    cx,
    doc.internal.pageSize.getHeight() - 40,
    { align: "center", maxWidth: W - 100 },
  );
}

function drawSummaryTable(doc: Doc, students: Student[], autoTable: Doc) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text("Resumo dos estudantes", 40, 50);

  autoTable(doc, {
    startY: 66,
    head: [["#", "Nome", "Escola", "Turma", "Score", "Risco", "Integrity"]],
    body: students.map((s) => [
      s.rank,
      s.name,
      s.school,
      s.className,
      s.fraudScore,
      riskMeta(s.risk).label,
      s.integrityScore,
    ]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [20, 20, 20], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 26 },
      4: { cellWidth: 40, halign: "center" },
      6: { cellWidth: 52, halign: "center" },
    },
    didParseCell: (data: Doc) => {
      if (data.section === "body" && data.column.index === 5) {
        const s = students[data.row.index];
        const [r, g, b] = riskRGB(s.risk);
        data.cell.styles.textColor = [r, g, b];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
}

function drawDossier(doc: Doc, s: Student, period: Period, W: number) {
  doc.addPage();
  let y = 54;

  // Header band
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, W, 88, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text(s.name, 40, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(110, 110, 110);
  doc.text(
    `${s.school} · ${s.className} · ${s.city}-${s.state} · #${s.rank}`,
    40,
    62,
  );

  // Score chip (right)
  const [r, g, b] = riskRGB(s.risk);
  doc.setFillColor(r, g, b);
  doc.roundedRect(W - 150, 26, 110, 40, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(String(s.fraudScore), W - 132, 52);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(riskMeta(s.risk).label, W - 100, 52);

  y = 118;

  // Score composition
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("Composição do score", 40, y);
  y += 16;
  const pillars: [string, number][] = [
    ["Behavior", s.breakdown.behavior.value],
    ["Technical", s.breakdown.technical.value],
    ["Volume", s.breakdown.volume.value],
    ["History", s.breakdown.history.value],
  ];
  doc.setFontSize(9);
  pillars.forEach(([label, val]) => {
    doc.setTextColor(80, 80, 80);
    doc.text(label, 40, y + 8);
    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(140, y, 300, 8, 4, 4, "F");
    const [rr, gg, bb] = riskRGB(s.risk);
    doc.setFillColor(rr, gg, bb);
    doc.roundedRect(140, y, Math.max(6, (val / 100) * 300), 8, 4, 4, "F");
    doc.setTextColor(40, 40, 40);
    doc.text(String(val), 452, y + 8);
    y += 20;
  });

  // Occurrences
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("Principais ocorrências", 40, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (s.occurrences.length === 0) {
    doc.setTextColor(120, 120, 120);
    doc.text("Nenhuma ocorrência relevante no período.", 40, y);
    y += 14;
  } else {
    s.occurrences.forEach((o) => {
      const sign = o.weight > 0 ? "+" : "";
      const [rr, gg, bb] = o.weight > 0 ? [190, 60, 60] : [40, 150, 80];
      doc.setTextColor(rr, gg, bb);
      doc.setFont("helvetica", "bold");
      doc.text(`${sign}${o.weight}`, 40, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(o.label, 78, y);
      doc.setTextColor(140, 140, 140);
      doc.text(`(${o.category})`, 78 + doc.getTextWidth(o.label) + 8, y);
      y += 15;
    });
  }

  // Evidence timeline for the filtered period
  const events = eventsInPeriod(s.timeline, period);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(`Evidências no período (${periodLabel(period)})`, 40, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const pageH = doc.internal.pageSize.getHeight();
  events.slice(0, 24).forEach((e) => {
    if (y > pageH - 40) return;
    doc.setTextColor(120, 120, 120);
    const d = new Date(e.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    doc.text(`${d} ${e.time}`, 40, y);
    doc.setTextColor(40, 40, 40);
    doc.text(e.title, 120, y);
    if (e.weight) {
      doc.setTextColor(190, 60, 60);
      doc.text(`+${e.weight}`, 460, y);
    }
    y += 13;
  });

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Guardian · documento de apoio à decisão — não constitui punição.",
    40,
    pageH - 24,
  );
}
