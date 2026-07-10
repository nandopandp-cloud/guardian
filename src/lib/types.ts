export type RiskLevel = "normal" | "low" | "medium" | "high" | "critical";

/** The four pillars that compose the Fraud Score. */
export interface ScoreComponent {
  /** Raw component value, 0–100. */
  value: number;
  /** Relative weight of this component in the final score, 0–1. */
  weight: number;
  /** Points this component contributes to the final Fraud Score. */
  contribution: number;
}

export interface ScoreBreakdown {
  behavior: ScoreComponent;
  technical: ScoreComponent;
  volume: ScoreComponent;
  history: ScoreComponent;
}

export type OccurrenceCategory =
  | "behavior"
  | "technical"
  | "volume"
  | "history";

/** A single rule that fired and moved the score up or down. */
export interface Occurrence {
  id: string;
  /** Points applied — positive raises risk, negative lowers it. */
  weight: number;
  label: string;
  description: string;
  category: OccurrenceCategory;
}

export interface TimelineEvent {
  id: string;
  /** HH:MM */
  time: string;
  title: string;
  description: string;
  /** Points applied by this event, if any. */
  weight?: number;
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  email: string;
  school: string;
  className: string;
  city: string;
  state: string;

  /** 0–100. */
  fraudScore: number;
  /** 0–100. Inverse-ish signal of trust. */
  integrityScore: number;
  risk: RiskLevel;

  /** League rank (1 = first place). */
  rank: number;
  /** ISO date of last activity. */
  lastActivity: string;

  breakdown: ScoreBreakdown;
  occurrences: Occurrence[];
  timeline: TimelineEvent[];
}

export type PeriodKey = "7d" | "30d" | "season" | "custom";
