import { PREPARA_SP_LOGO } from "./logo-data";

/* ================================================================== *
 * MATRIZ DE FRAUDE — Documento institucional (Prepara SP · Liga Genial)
 * ------------------------------------------------------------------ *
 * A robust, paginated PDF explaining the Fraud Matrix and the integrity
 * premises. Prepara SP identity (navy + orange). Self-contained design
 * system with an auto-paginating layout engine.
 * ================================================================== */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Doc = any;
type RGB = [number, number, number];

const PAGE = { w: 595.28, h: 841.89 };
const M = { top: 92, bottom: 64, left: 52, right: 52 };
const CONTENT_W = PAGE.w - M.left - M.right;

/* Prepara SP palette (sampled from the logo). */
const C = {
  navy: [20, 34, 66] as RGB, // deep marine
  navy2: [30, 52, 100] as RGB, // brand blue
  blue: [37, 99, 176] as RGB,
  orange: [245, 158, 35] as RGB,
  orangeDeep: [214, 128, 12] as RGB,
  ink: [28, 33, 44] as RGB,
  body: [66, 72, 84] as RGB,
  muted: [122, 130, 142] as RGB,
  faint: [168, 174, 184] as RGB,
  hair: [226, 230, 236] as RGB,
  panel: [244, 247, 251] as RGB,
  panelBlue: [237, 242, 250] as RGB,
  panelOrange: [254, 246, 233] as RGB,
  white: [255, 255, 255] as RGB,
  // Risk bands
  rNormal: [30, 155, 90] as RGB,
  rLow: [40, 116, 214] as RGB,
  rMed: [199, 148, 22] as RGB,
  rHigh: [223, 114, 34] as RGB,
  rVeryHigh: [206, 66, 40] as RGB,
  rCritical: [176, 34, 34] as RGB,
};

/* ---- low-level helpers ------------------------------------------- */
const setFill = (d: Doc, [r, g, b]: RGB) => d.setFillColor(r, g, b);
const setText = (d: Doc, [r, g, b]: RGB) => d.setTextColor(r, g, b);
const setDraw = (d: Doc, [r, g, b]: RGB) => d.setDrawColor(r, g, b);

interface TxtOpts {
  size?: number;
  color?: RGB;
  weight?: "normal" | "bold";
  align?: "left" | "center" | "right";
  maxWidth?: number;
  spacing?: number;
  lineHeight?: number;
}

/**
 * jsPDF's standard Helvetica uses WinAnsi encoding, which lacks several
 * Unicode punctuation glyphs (arrows, true minus, em/en dashes, curly
 * quotes). Map them to safe equivalents so nothing renders as mojibake.
 */
export function sanitize(s: string): string {
  return s
    .replace(/[\u2190-\u21FF\u2794\u27A4]/g, ">") // arrows -> ">"
    .replace(/\u2014/g, "\u2013") // em-dash -> en-dash (en-dash is in WinAnsi)
    .replace(/\u2212/g, "-") // true minus -> hyphen
    .replace(/[\u2018\u2019]/g, "'") // curly single quotes
    .replace(/[\u201C\u201D]/g, '"') // curly double quotes
    .replace(/\u2026/g, "...") // ellipsis
    .replace(/\u00A0/g, " "); // nbsp -> space
}

function txt(d: Doc, s: string, x: number, y: number, o: TxtOpts = {}) {
  d.setFont("helvetica", o.weight ?? "normal");
  d.setFontSize(o.size ?? 10);
  setText(d, o.color ?? C.body);
  if (o.spacing != null) d.setCharSpace(o.spacing);
  d.text(sanitize(s), x, y, { align: o.align ?? "left", maxWidth: o.maxWidth });
  if (o.spacing != null) d.setCharSpace(0);
}

/* ---- layout engine ----------------------------------------------- */
/**
 * Stateful document builder with a running y-cursor and automatic page
 * breaks. Every content primitive advances `y` and requests space first.
 */
class Layout {
  doc: Doc;
  y = M.top;
  page = 1;
  /** Right-aligned header caption; override per document. */
  headerTitle = "Matriz de Fraude & Integridade Competitiva";

  constructor(doc: Doc, headerTitle?: string) {
    this.doc = doc;
    if (headerTitle) this.headerTitle = headerTitle;
  }

  /** Ensure `h` pts fit; otherwise start a new page. */
  ensure(h: number) {
    if (this.y + h > PAGE.h - M.bottom) this.newPage();
  }

  newPage() {
    this.doc.addPage();
    this.page++;
    this.y = M.top;
    this.chrome();
  }

  /** Header + footer drawn on every content page. */
  chrome() {
    const d = this.doc;
    // Header rule with small brand mark
    setFill(d, C.navy);
    d.rect(0, 0, PAGE.w, 6, "F");
    setFill(d, C.orange);
    d.rect(0, 0, PAGE.w * 0.4, 6, "F");

    txt(d, "PREPARA SP · LIGA GENIAL", M.left, 40, {
      size: 8,
      color: C.navy2,
      weight: "bold",
      spacing: 1.2,
    });
    txt(d, this.headerTitle, PAGE.w - M.right, 40, {
      size: 8,
      color: C.muted,
      align: "right",
    });
    setDraw(d, C.hair);
    d.setLineWidth(0.6);
    d.line(M.left, 52, PAGE.w - M.right, 52);

    // Footer
    const fy = PAGE.h - 40;
    d.line(M.left, fy, PAGE.w - M.right, fy);
    txt(d, "Documento interno · confidencial", M.left, fy + 13, {
      size: 7.5,
      color: C.faint,
    });
    txt(d, `${this.page}`, PAGE.w - M.right, fy + 13, {
      size: 7.5,
      color: C.faint,
      align: "right",
    });
  }

  gap(h: number) {
    this.y += h;
  }
}

/* ---- content primitives ------------------------------------------ */

let SECTION = 0;

/** Reset the section counter — call once at the start of each build. */
export function resetSections() {
  SECTION = 0;
}

/** Numbered section heading with an orange accent tab. */
function heading(L: Layout, title: string, opts: { number?: boolean } = {}) {
  const d = L.doc;
  L.ensure(52);
  L.gap(6);
  const n = opts.number === false ? "" : `${++SECTION}`;
  // Accent tab
  setFill(d, C.orange);
  d.rect(M.left, L.y - 2, 4, 18, "F");
  if (n) {
    txt(d, n.padStart(2, "0"), M.left + 12, L.y + 12, {
      size: 15,
      color: C.orange,
      weight: "bold",
    });
    txt(d, title, M.left + 40, L.y + 12, {
      size: 15,
      color: C.navy,
      weight: "bold",
    });
  } else {
    txt(d, title, M.left + 12, L.y + 12, {
      size: 15,
      color: C.navy,
      weight: "bold",
    });
  }
  L.y += 24;
  setDraw(d, C.hair);
  d.setLineWidth(0.6);
  d.line(M.left, L.y, PAGE.w - M.right, L.y);
  L.y += 16;
}

/** Sub-heading. */
function subheading(L: Layout, title: string, color: RGB = C.navy2) {
  L.ensure(28);
  txt(L.doc, title, M.left, L.y + 9, { size: 10.5, color, weight: "bold" });
  L.y += 20;
}

/** Body paragraph with wrapping + auto page-break per line. */
function paragraph(L: Layout, text: string, opts: TxtOpts = {}) {
  const d = L.doc;
  const size = opts.size ?? 9.5;
  const lh = opts.lineHeight ?? 14;
  d.setFont("helvetica", opts.weight ?? "normal");
  d.setFontSize(size);
  const lines: string[] = d.splitTextToSize(
    sanitize(text),
    opts.maxWidth ?? CONTENT_W,
  );
  for (const line of lines) {
    L.ensure(lh);
    txt(d, line, M.left, L.y + size, {
      size,
      color: opts.color ?? C.body,
      weight: opts.weight,
    });
    L.y += lh;
  }
  L.y += 4;
}

/** Bulleted list; each item wraps and paginates. */
function bullets(
  L: Layout,
  items: (string | [string, string])[],
  opts: { accent?: RGB } = {},
) {
  const d = L.doc;
  const accent = opts.accent ?? C.orange;
  const size = 9.5;
  const lh = 13.5;
  const indent = 16;
  for (const it of items) {
    const isPair = Array.isArray(it);
    const lead = isPair ? (it as [string, string])[0] : "";
    const rest = isPair ? (it as [string, string])[1] : (it as string);
    const full = isPair ? `${lead}  ${rest}` : rest;
    d.setFont("helvetica", "normal");
    d.setFontSize(size);
    const lines: string[] = d.splitTextToSize(sanitize(full), CONTENT_W - indent);
    lines.forEach((line, i) => {
      L.ensure(lh);
      if (i === 0) {
        setFill(d, accent);
        d.circle(M.left + 3, L.y + size - 3, 1.6, "F");
      }
      // First line: render lead bold if pair
      if (i === 0 && isPair) {
        txt(d, lead, M.left + indent, L.y + size, {
          size,
          color: C.ink,
          weight: "bold",
        });
        const lw = d.getTextWidth(lead + "  ");
        txt(d, rest, M.left + indent + lw, L.y + size, {
          size,
          color: C.body,
        });
      } else {
        txt(d, line, M.left + indent, L.y + size, { size, color: C.body });
      }
      L.y += lh;
    });
    L.y += 3;
  }
  L.y += 2;
}

/** Callout box (info / warning) with title + text. */
function callout(
  L: Layout,
  title: string,
  text: string,
  variant: "info" | "orange" | "risk" = "info",
) {
  const d = L.doc;
  const pal =
    variant === "orange"
      ? { bg: C.panelOrange, ac: C.orangeDeep }
      : variant === "risk"
        ? { bg: [252, 240, 238] as RGB, ac: C.rCritical }
        : { bg: C.panelBlue, ac: C.blue };

  d.setFont("helvetica", "normal");
  d.setFontSize(9);
  const lines: string[] = d.splitTextToSize(sanitize(text), CONTENT_W - 40);
  const h = 26 + lines.length * 12.5 + 6;
  L.ensure(h + 6);
  setFill(d, pal.bg);
  d.roundedRect(M.left, L.y, CONTENT_W, h, 7, 7, "F");
  setFill(d, pal.ac);
  d.roundedRect(M.left, L.y, 4, h, 2, 2, "F");
  txt(d, title.toUpperCase(), M.left + 16, L.y + 17, {
    size: 8,
    color: pal.ac,
    weight: "bold",
    spacing: 0.8,
  });
  let ty = L.y + 31;
  for (const line of lines) {
    txt(d, line, M.left + 16, ty, { size: 9, color: C.body });
    ty += 12.5;
  }
  L.y += h + 10;
}

/* ---- cover -------------------------------------------------------- */

interface CoverOpts {
  title?: string;
  subtitle?: string;
  description?: string;
  chips?: string[];
  /** Split the title into two lines (used for long titles). */
  titleLine2?: string;
}

function drawCover(doc: Doc, opts: CoverOpts = {}) {
  const title = opts.title ?? "Matriz de Fraude";
  const subtitle = opts.subtitle ?? "& Plano de Integridade Competitiva";
  const description =
    opts.description ??
    "Como funcionam a pontuação de risco (Fraud Score), as premissas de detecção e as ações proporcionais para preservar a justiça da competição.";
  const chips = opts.chips ?? [
    "Documento de trabalho",
    "Squad Prepara SP",
    `v1.0 · ${new Date().toLocaleDateString("pt-BR")}`,
  ];

  // Navy background with a subtle vertical gradient (banded fills).
  const bands = 60;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const r = Math.round(C.navy[0] + (10 - C.navy[0]) * t);
    const g = Math.round(C.navy[1] + (18 - C.navy[1]) * t);
    const b = Math.round(C.navy[2] + (38 - C.navy[2]) * t);
    setFill(doc, [r, g, b]);
    doc.rect(0, (PAGE.h / bands) * i, PAGE.w, PAGE.h / bands + 1, "F");
  }

  // Orange accent bar at top
  setFill(doc, C.orange);
  doc.rect(0, 0, PAGE.w, 8, "F");

  // Logo (centered)
  const logoW = 150;
  const logoH = logoW * (843 / 780);
  try {
    doc.addImage(
      PREPARA_SP_LOGO,
      "PNG",
      (PAGE.w - logoW) / 2,
      112,
      logoW,
      logoH,
    );
  } catch {
    /* image optional */
  }

  const cx = PAGE.w / 2;
  let y = 112 + logoH + 46;

  txt(doc, "LIGA GENIAL · PREPARA SP", cx, y, {
    size: 9,
    color: C.orange,
    weight: "bold",
    spacing: 2,
    align: "center",
  });
  y += 34;
  txt(doc, title, cx, y, {
    size: 30,
    color: C.white,
    weight: "bold",
    align: "center",
  });
  y += 30;
  if (opts.titleLine2) {
    txt(doc, opts.titleLine2, cx, y, {
      size: 30,
      color: C.white,
      weight: "bold",
      align: "center",
    });
    y += 30;
  }
  txt(doc, subtitle, cx, y, {
    size: 16,
    color: [200, 214, 236],
    align: "center",
    maxWidth: 440,
  });
  y += 30;

  // Divider
  setDraw(doc, [70, 90, 130]);
  doc.setLineWidth(1);
  doc.line(cx - 70, y, cx + 70, y);
  y += 26;

  txt(doc, description, cx, y, {
    size: 10.5,
    color: [186, 200, 224],
    align: "center",
    maxWidth: 400,
  });

  // Meta chips at the bottom
  let chy = PAGE.h - 120;
  txt(doc, "PARA COMPARTILHAMENTO INTERNO", cx, chy, {
    size: 8,
    color: [120, 140, 176],
    weight: "bold",
    spacing: 1.5,
    align: "center",
  });
  chy += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const widths = chips.map((c) => doc.getTextWidth(c) + 24);
  const totalW = widths.reduce((a, b) => a + b, 0) + (chips.length - 1) * 8;
  let chx = cx - totalW / 2;
  chips.forEach((c, i) => {
    setFill(doc, [28, 44, 82]);
    doc.roundedRect(chx, chy, widths[i], 20, 10, 10, "F");
    setDraw(doc, [50, 70, 116]);
    doc.setLineWidth(0.6);
    doc.roundedRect(chx, chy, widths[i], 20, 10, 10, "S");
    txt(doc, c, chx + widths[i] / 2, chy + 13.5, {
      size: 8.5,
      color: [206, 218, 240],
      weight: "bold",
      align: "center",
    });
    chx += widths[i] + 8;
  });
}

export {
  Layout,
  drawCover,
  heading,
  subheading,
  paragraph,
  bullets,
  callout,
  C,
  M,
  PAGE,
  CONTENT_W,
  txt,
  setFill,
  setText,
  setDraw,
};
export type { Doc, RGB };
