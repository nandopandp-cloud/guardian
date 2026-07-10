"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";
import { eventsInPeriod, periodLabel } from "@/lib/period";
import type { Period, Student, TimelineEvent } from "@/lib/types";

interface EvidenceDrawerProps {
  student: Student | null;
  period: Period;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/** Group events by calendar day, keeping order. */
function groupByDay(events: TimelineEvent[]): [string, TimelineEvent[]][] {
  const groups = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    const key = e.date.slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return Array.from(groups.entries());
}

export function EvidenceDrawer({
  student,
  period,
  open,
  onOpenChange,
}: EvidenceDrawerProps) {
  if (!student) return null;

  const events = eventsInPeriod(student.timeline, period);
  const total = events.reduce((sum, e) => sum + (e.weight ?? 0), 0);
  const grouped = groupByDay(events);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Evidências da sessão"
      description={`${student.name} · ${periodLabel(period)}`}
      footer={
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Pontuação no período · {events.length} eventos
          </span>
          <span className="font-semibold tabular-nums text-foreground">
            +{total}
          </span>
        </div>
      }
    >
      {events.length === 0 ? (
        <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-muted-foreground">
          Nenhuma evidência registrada neste período.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, dayEvents], gi) => (
            <div key={day}>
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
                  {dayLabel(dayEvents[0].date)}
                </span>
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {dayEvents.filter((e) => e.weight).length} sinais
                </span>
              </div>

              <div className="relative">
                <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />
                <ol className="space-y-5">
                  {dayEvents.map((event, i) => (
                    <motion.li
                      key={event.id}
                      className="relative pl-7"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (gi * 4 + i) * 0.03, duration: 0.25 }}
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-1 size-[15px] rounded-full border-2 border-card",
                          event.weight
                            ? "bg-risk-critical"
                            : "bg-muted-foreground/40",
                        )}
                      />
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {event.time}
                        </span>
                        {event.weight != null && (
                          <span className="rounded-md bg-risk-critical/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-risk-critical">
                            +{event.weight}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.description}
                      </p>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}
