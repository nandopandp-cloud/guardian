import {
  C,
  CONTENT_W,
  Layout,
  M,
  PAGE,
  sanitize,
  setDraw,
  setFill,
  txt,
} from "./matrix-doc";
import type { RGB, Doc } from "./matrix-doc";

export interface Column {
  header: string;
  width: number; // fraction of CONTENT_W
  align?: "left" | "center" | "right";
}

export interface Row {
  cells: string[];
  /** Optional per-row colour for a specific cell index. */
  accent?: { col: number; color: RGB };
  /** Optional left band colour (risk swatch). */
  band?: RGB;
}

/** Styled table with header, zebra rows, auto-pagination, and optional bands. */
export function table(L: Layout, cols: Column[], rows: Row[], headFill = C.navy) {
  const d = L.doc;
  const xs: number[] = [];
  let cursor = M.left;
  for (const c of cols) {
    xs.push(cursor);
    cursor += c.width * CONTENT_W;
  }
  const rowH = 22;
  const headH = 24;

  const drawHeader = () => {
    setFill(d, headFill);
    d.roundedRect(M.left, L.y, CONTENT_W, headH, 4, 4, "F");
    cols.forEach((c, i) => {
      const cx =
        c.align === "right"
          ? xs[i] + c.width * CONTENT_W - 8
          : c.align === "center"
            ? xs[i] + (c.width * CONTENT_W) / 2
            : xs[i] + 8;
      txt(d, c.header, cx, L.y + 16, {
        size: 8.5,
        color: C.white,
        weight: "bold",
        align: c.align ?? "left",
      });
    });
    L.y += headH;
  };

  L.ensure(headH + rowH * 2);
  drawHeader();

  rows.forEach((row, ri) => {
    // Measure wrapped height for this row
    d.setFont("helvetica", "normal");
    d.setFontSize(8.5);
    const cellLines = row.cells.map((cell, i) =>
      d.splitTextToSize(sanitize(cell), cols[i].width * CONTENT_W - 16),
    );
    const rh = Math.max(rowH, ...cellLines.map((l: string[]) => l.length * 11 + 10));

    if (L.y + rh > PAGE.h - M.bottom) {
      L.newPage();
      drawHeader();
    }

    if (ri % 2 === 1) {
      setFill(d, [249, 250, 252]);
      d.rect(M.left, L.y, CONTENT_W, rh, "F");
    }
    if (row.band) {
      setFill(d, row.band);
      d.rect(M.left, L.y, 3, rh, "F");
    }

    cols.forEach((c, i) => {
      const isAccent = row.accent?.col === i;
      const color = isAccent ? row.accent!.color : C.body;
      const weight = isAccent ? "bold" : "normal";
      const lines = cellLines[i];
      const baseX =
        c.align === "right"
          ? xs[i] + c.width * CONTENT_W - 8
          : c.align === "center"
            ? xs[i] + (c.width * CONTENT_W) / 2
            : xs[i] + 8;
      lines.forEach((ln: string, li: number) => {
        txt(d, ln, baseX, L.y + 15 + li * 11, {
          size: 8.5,
          color,
          weight,
          align: c.align ?? "left",
        });
      });
    });

    // Row separator
    setDraw(d, C.hair);
    d.setLineWidth(0.4);
    d.line(M.left, L.y + rh, PAGE.w - M.right, L.y + rh);

    L.y += rh;
  });

  L.y += 12;
}

/** A compact legend chip row (used under the bands table). */
export function bandLegend(L: Layout) {
  L.y += 2;
}
