"use client";

import { motion } from "framer-motion";
import { RISK_BANDS, riskFromScore } from "@/lib/risk";

interface GaugeProps {
  /** 0–100 */
  score: number;
  size?: number;
}

/**
 * Semicircular speedometer. The arc is split into the five risk bands;
 * a needle points at the current score.
 */
export function Gauge({ score, size = 220 }: GaugeProps) {
  const meta = riskFromScore(score);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 18;
  const stroke = 12;

  // Map score 0..100 → angle 180°..0° (left to right across the top).
  const angleFor = (v: number) => Math.PI * (1 - v / 100);
  const point = (v: number, radius: number) => {
    const a = angleFor(v);
    return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
  };

  const arcPath = (from: number, to: number, radius: number) => {
    const start = point(from, radius);
    const end = point(to, radius);
    const large = to - from > 50 ? 1 : 0;
    // sweep 1 goes clockwise along the top
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`;
  };

  // Band segments (with small gaps for definition).
  const segments = RISK_BANDS.map((band, i) => {
    const next = RISK_BANDS[i + 1];
    const from = band.min;
    const to = next ? next.min : 100;
    return { from, to, hsl: band.hsl };
  });

  const needle = point(score, r - 2);
  const height = cy + stroke; // only need the top half + a little

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={height + 8}
        viewBox={`0 0 ${size} ${height + 8}`}
        className="overflow-visible"
      >
        {/* Track */}
        {segments.map((seg, i) => (
          <path
            key={i}
            d={arcPath(seg.from + (i === 0 ? 0 : 0.6), seg.to, r)}
            fill="none"
            stroke={seg.hsl}
            strokeWidth={stroke}
            strokeLinecap="round"
            opacity={0.28}
          />
        ))}

        {/* Active fill up to the score */}
        <motion.path
          d={arcPath(0, Math.max(1, score), r)}
          fill="none"
          stroke={meta.hsl}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        {/* Needle */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke="hsl(var(--foreground))"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ x2: point(0, r - 2).x, y2: point(0, r - 2).y }}
          animate={{ x2: needle.x, y2: needle.y }}
          transition={{ type: "spring", stiffness: 90, damping: 15 }}
        />
        <circle cx={cx} cy={cy} r={5} fill="hsl(var(--foreground))" />
        <circle cx={cx} cy={cy} r={9} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
      </svg>

      {/* Center readout */}
      <div className="pointer-events-none absolute inset-x-0" style={{ top: cy - 52 }}>
        <div className="flex flex-col items-center">
          <motion.span
            key={score}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-5xl font-semibold tabular-nums leading-none tracking-tight"
            style={{ color: meta.hsl }}
          >
            {score}
          </motion.span>
          <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Fraud Score
          </span>
        </div>
      </div>
    </div>
  );
}
