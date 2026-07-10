import type { DateRange, Period, Student, TimelineEvent } from "./types";

/** Fixed "now" so mock data and filtering agree across SSR/CSR. */
export const NOW = new Date("2026-07-10T09:00:00Z");

/** Start of the current season (mock). */
const SEASON_START = new Date("2026-02-01T00:00:00Z");

/** Resolve a Period into a concrete [from, to] window. */
export function resolveWindow(period: Period): DateRange {
  const to = NOW;
  if (period.key === "custom" && period.range) {
    return period.range;
  }
  let from: Date;
  switch (period.key) {
    case "7d":
      from = new Date(to.getTime() - 7 * 864e5);
      break;
    case "30d":
      from = new Date(to.getTime() - 30 * 864e5);
      break;
    case "season":
    default:
      from = SEASON_START;
      break;
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

export function periodLabel(period: Period): string {
  switch (period.key) {
    case "7d":
      return "Últimos 7 dias";
    case "30d":
      return "Últimos 30 dias";
    case "season":
      return "Temporada";
    case "custom":
      if (period.range) {
        return `${fmt(period.range.from)} – ${fmt(period.range.to)}`;
      }
      return "Período personalizado";
  }
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function inWindow(iso: string, w: DateRange): boolean {
  const t = new Date(iso).getTime();
  return t >= new Date(w.from).getTime() && t <= new Date(w.to).getTime();
}

/** Students whose last activity falls inside the resolved window. */
export function studentsInPeriod(
  students: Student[],
  period: Period,
): Student[] {
  const w = resolveWindow(period);
  return students.filter((s) => inWindow(s.lastActivity, w));
}

/** Timeline events for a student that fall inside the resolved window. */
export function eventsInPeriod(
  events: TimelineEvent[],
  period: Period,
): TimelineEvent[] {
  const w = resolveWindow(period);
  return events.filter((e) => inWindow(e.date, w));
}
