"use client";

import { motion } from "framer-motion";
import { riskFromScore } from "@/lib/risk";

interface ScoreRingProps {
  /** 0–100 */
  score: number;
  size?: number;
}

/**
 * Circular progress ring. The full circle represents 0–100; the coloured
 * arc fills to the score and the value + risk band sit cleanly in the centre.
 * Readable at every score — no needle overlap.
 */
export function ScoreRing({ score, size = 208 }: ScoreRingProps) {
  const meta = riskFromScore(score);
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={meta.hsl}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${meta.hsl}40)` }}
        />
      </svg>

      {/* Center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Fraud Score
        </span>
        <motion.span
          key={score}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="font-display text-[56px] font-semibold leading-none tracking-tight tabular-nums"
          style={{ color: meta.hsl }}
        >
          {score}
        </motion.span>
        <span
          className="mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            color: meta.hsl,
            backgroundColor: `hsl(var(--risk-${meta.level}) / 0.12)`,
          }}
        >
          {meta.label}
        </span>
      </div>
    </div>
  );
}
