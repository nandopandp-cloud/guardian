import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "há 3 dias", "hoje", relative to a fixed "now" so SSR/CSR agree. */
const NOW = new Date("2026-07-10T09:00:00Z");

export function relativeDate(iso: string): string {
  const then = new Date(iso);
  const days = Math.round(
    (NOW.getTime() - then.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  if (days < 14) return "há 1 semana";
  return `há ${Math.floor(days / 7)} semanas`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
