"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  size?: number;
  className?: string;
  /** Animate the radar sweep (used on login / idle surfaces). */
  animated?: boolean;
}

/**
 * Guardian mark — a shield (protection / integrity) enclosing a radar
 * sweep and a target reticle (fraud detection). Pure SVG, monochrome with
 * a subtle vertical gradient so it reads on any dark surface.
 */
export function LogoMark({ size = 32, className, animated = false }: LogoMarkProps) {
  const gid = "guardian-grad";
  const sweepId = "guardian-sweep";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#a3a3a3" />
        </linearGradient>
        <radialGradient id={sweepId} cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="hsl(142 60% 55%)" stopOpacity="0.55" />
          <stop offset="1" stopColor="hsl(142 60% 55%)" stopOpacity="0" />
        </radialGradient>
        <clipPath id="shield-clip">
          <path d="M24 3.5 L40.5 9 V23 C40.5 33.5 33.5 41 24 44.5 C14.5 41 7.5 33.5 7.5 23 V9 Z" />
        </clipPath>
      </defs>

      {/* Shield body */}
      <path
        d="M24 3.5 L40.5 9 V23 C40.5 33.5 33.5 41 24 44.5 C14.5 41 7.5 33.5 7.5 23 V9 Z"
        fill="hsl(0 0% 8%)"
        stroke={`url(#${gid})`}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Radar rings */}
      <g clipPath="url(#shield-clip)" opacity="0.9">
        <circle cx="24" cy="23" r="12" stroke="hsl(0 0% 100% / 0.18)" strokeWidth="1" />
        <circle cx="24" cy="23" r="7.5" stroke="hsl(0 0% 100% / 0.28)" strokeWidth="1" />

        {/* Rotating sweep */}
        {animated ? (
          <motion.g
            style={{ originX: "24px", originY: "23px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          >
            <path d="M24 23 L24 9 A14 14 0 0 1 36 16 Z" fill={`url(#${sweepId})`} />
            <line x1="24" y1="23" x2="24" y2="9" stroke="hsl(142 60% 55%)" strokeWidth="1.2" />
          </motion.g>
        ) : (
          <>
            <path d="M24 23 L24 9 A14 14 0 0 1 36 16 Z" fill={`url(#${sweepId})`} />
            <line x1="24" y1="23" x2="24" y2="9" stroke="hsl(142 60% 55%)" strokeWidth="1.2" />
          </>
        )}
      </g>

      {/* Center reticle */}
      <circle cx="24" cy="23" r="2.4" fill={`url(#${gid})`} />
      <circle cx="24" cy="23" r="2.4" fill="none" stroke="hsl(0 0% 8%)" strokeWidth="0.6" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
  /** Hide the wordmark, show only the mark. */
  markOnly?: boolean;
  subtitle?: boolean;
}

export function Logo({
  className,
  size = 34,
  animated = false,
  markOnly = false,
  subtitle = true,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} animated={animated} />
      {!markOnly && (
        <div className="leading-none">
          <div className="font-display text-[15px] font-semibold tracking-tight text-foreground">
            Guardian
          </div>
          {subtitle && (
            <div className="mt-0.5 text-[11px] font-medium tracking-wide text-muted-foreground">
              Integrity Analysis Tool
            </div>
          )}
        </div>
      )}
    </div>
  );
}
