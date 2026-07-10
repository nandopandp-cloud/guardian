"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";
import type { Student } from "@/lib/types";

interface EvidenceDrawerProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EvidenceDrawer({
  student,
  open,
  onOpenChange,
}: EvidenceDrawerProps) {
  if (!student) return null;

  const total = student.timeline.reduce((sum, e) => sum + (e.weight ?? 0), 0);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Evidências da sessão"
      description={`${student.name} · ${student.school}`}
      footer={
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Pontuação da sessão</span>
          <span className="font-semibold tabular-nums text-foreground">
            +{total}
          </span>
        </div>
      }
    >
      <div className="relative">
        {/* Vertical guide line */}
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />

        <ol className="space-y-5">
          {student.timeline.map((event, i) => (
            <motion.li
              key={event.id}
              className="relative pl-7"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
            >
              <span
                className={cn(
                  "absolute left-0 top-1 size-[15px] rounded-full border-2 border-background",
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
    </Drawer>
  );
}
