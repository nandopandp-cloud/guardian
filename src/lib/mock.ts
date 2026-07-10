import { riskFromScore } from "./risk";
import type {
  Occurrence,
  ScoreBreakdown,
  ScoreComponent,
  Student,
  TimelineEvent,
} from "./types";

/* ------------------------------------------------------------------ *
 * Seeded PRNG — deterministic so server and client render identically
 * (no hydration mismatch) and data is stable across reloads.
 * ------------------------------------------------------------------ */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260710);
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;

/* ------------------------------------------------------------------ *
 * Source pools
 * ------------------------------------------------------------------ */
const FIRST_NAMES = [
  "Ana", "Beatriz", "Bruno", "Camila", "Carlos", "Daniel", "Eduarda",
  "Enzo", "Fernanda", "Felipe", "Gabriel", "Giovanna", "Gustavo", "Helena",
  "Igor", "Isabela", "João", "Júlia", "Kaique", "Larissa", "Lucas",
  "Manuela", "Marcos", "Mariana", "Matheus", "Natália", "Nicolas", "Otávio",
  "Paula", "Pedro", "Rafael", "Rebeca", "Sofia", "Thiago", "Valentina",
  "Vitor", "Yasmin", "Arthur", "Laura", "Miguel",
];
const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
  "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
  "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha",
  "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado",
];
const SCHOOLS = [
  "EE Prof. João Machado", "EE Dom Pedro II", "EE Anhanguera",
  "EE Cel. Fernando Prestes", "EE Culto à Ciência", "EE Rui Barbosa",
  "EE Monteiro Lobato", "EE Cecília Meireles", "EE Tiradentes",
  "EE Visconde de Itaúna", "ETEC de Campinas", "ETEC Bento Quirino",
  "EE Sud Mennucci", "EE Padre Anchieta", "EE Castro Alves",
];
const CLASSES = [
  "1º A", "1º B", "2º A", "2º B", "2º C", "3º A", "3º B", "3º C", "9º A", "9º B",
];
const CITIES: [string, string][] = [
  ["São Paulo", "SP"], ["Campinas", "SP"], ["Santos", "SP"],
  ["Ribeirão Preto", "SP"], ["Sorocaba", "SP"], ["São José dos Campos", "SP"],
  ["Bauru", "SP"], ["Piracicaba", "SP"], ["Presidente Prudente", "SP"],
  ["Marília", "SP"], ["Araraquara", "SP"], ["Franca", "SP"],
];

/* Positive (risk-raising) and negative (risk-lowering) rule catalog. */
const POSITIVE_RULES: Omit<Occurrence, "id">[] = [
  { weight: 25, label: "Respostas abaixo de 700 ms", description: "Múltiplas respostas com tempo incompatível com leitura humana.", category: "technical" },
  { weight: 20, label: "Intervalos robóticos", description: "Espaçamento quase constante entre ações consecutivas.", category: "behavior" },
  { weight: 15, label: "Sessão superior a 5 horas", description: "Sessão contínua muito acima da média da Liga.", category: "volume" },
  { weight: 18, label: "Ausência de scroll", description: "Questões respondidas sem qualquer rolagem de tela.", category: "behavior" },
  { weight: 12, label: "Padrão de acerto perfeito", description: "Sequência longa de acertos sem hesitação.", category: "history" },
  { weight: 10, label: "Múltiplas abas detectadas", description: "Troca frequente de foco durante a prova.", category: "technical" },
  { weight: 14, label: "Mesmo IP de outro finalista", description: "Endereço de rede compartilhado com outra conta bem colocada.", category: "technical" },
  { weight: 8, label: "Volume atípico de tentativas", description: "Número de submissões acima do padrão do período.", category: "volume" },
];
const NEGATIVE_RULES: Omit<Occurrence, "id">[] = [
  { weight: -10, label: "Movimentos naturais de mouse", description: "Trajetória de cursor compatível com uso humano.", category: "behavior" },
  { weight: -15, label: "Tempo de leitura compatível", description: "Tempo por questão alinhado à média esperada.", category: "technical" },
  { weight: -8, label: "Histórico consistente", description: "Desempenho estável ao longo da temporada.", category: "history" },
  { weight: -6, label: "Sessões em horários regulares", description: "Atividade concentrada em horários usuais de estudo.", category: "volume" },
];

/* ------------------------------------------------------------------ *
 * Builders
 * ------------------------------------------------------------------ */
function buildComponent(value: number, weight: number): ScoreComponent {
  return {
    value,
    weight,
    contribution: Math.round(value * weight),
  };
}

/** Produce a breakdown whose weighted sum lands on the target score. */
function buildBreakdown(target: number): {
  breakdown: ScoreBreakdown;
  occurrences: Occurrence[];
} {
  // Weights sum to 1. Behavior + technical dominate.
  const weights = { behavior: 0.35, technical: 0.3, volume: 0.15, history: 0.2 };

  // Spread the target across pillars with some jitter, keeping the
  // weighted average near `target`.
  const jitter = () => target + between(-14, 14);
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  const behavior = clamp(jitter());
  const technical = clamp(jitter());
  const volume = clamp(jitter());
  const history = clamp(jitter());

  const breakdown: ScoreBreakdown = {
    behavior: buildComponent(behavior, weights.behavior),
    technical: buildComponent(technical, weights.technical),
    volume: buildComponent(volume, weights.volume),
    history: buildComponent(history, weights.history),
  };

  // Occurrences: more positive rules the higher the score.
  const positiveCount =
    target >= 80 ? between(4, 5) : target >= 60 ? between(3, 4) : target >= 40 ? between(2, 3) : target >= 20 ? between(1, 2) : 0;
  const negativeCount = target < 40 ? between(1, 3) : between(0, 1);

  const shuffledPos = [...POSITIVE_RULES].sort(() => rand() - 0.5);
  const shuffledNeg = [...NEGATIVE_RULES].sort(() => rand() - 0.5);

  const occurrences: Occurrence[] = [
    ...shuffledPos.slice(0, positiveCount),
    ...shuffledNeg.slice(0, negativeCount),
  ].map((r, i) => ({ ...r, id: `occ-${i}` }));

  // Sort by absolute weight, strongest first.
  occurrences.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  return { breakdown, occurrences };
}

function buildTimeline(occurrences: Occurrence[]): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { id: "t0", time: "08:31", title: "Quiz iniciado", description: "Sessão de prova aberta pelo estudante." },
  ];
  let minute = 31;
  const positives = occurrences.filter((o) => o.weight > 0);
  positives.forEach((o, i) => {
    minute += between(0, 2);
    events.push({
      id: `t${i + 1}`,
      time: `08:${String(minute).padStart(2, "0")}`,
      title: o.label,
      description: o.description,
      weight: o.weight,
    });
  });
  minute += between(1, 4);
  events.push({
    id: "tend",
    time: `08:${String(Math.min(59, minute)).padStart(2, "0")}`,
    title: "Sessão finalizada",
    description: "Prova submetida e sessão encerrada.",
  });
  return events;
}

function daysAgoISO(days: number): string {
  const d = new Date("2026-07-10T09:00:00Z");
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/* ------------------------------------------------------------------ *
 * Distribution: most students are clean, a meaningful tail is risky.
 * ------------------------------------------------------------------ */
function targetScoreForIndex(i: number): number {
  const r = rand();
  // Rank 1..12 skew higher (finalists are the ones worth auditing).
  const isTopContender = i < 14;
  if (isTopContender) {
    if (r < 0.35) return between(80, 96); // critical
    if (r < 0.6) return between(60, 79); // high
    if (r < 0.8) return between(40, 59); // medium
    return between(15, 39);
  }
  if (r < 0.55) return between(0, 19); // normal
  if (r < 0.78) return between(20, 39); // low
  if (r < 0.9) return between(40, 59); // medium
  if (r < 0.97) return between(60, 79); // high
  return between(80, 94); // critical
}

function makeStudent(i: number): Student {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const [city, state] = pick(CITIES);
  const fraudScore = targetScoreForIndex(i);
  const { breakdown, occurrences } = buildBreakdown(fraudScore);
  const timeline = buildTimeline(occurrences);
  const risk = riskFromScore(fraudScore).level;
  const slug = name.toLowerCase().replace(/[^a-z]/g, "");

  return {
    id: `stu_${String(i + 1).padStart(4, "0")}`,
    name,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${slug}${i}&backgroundColor=1e1e1e,262626,2d2d2d`,
    email: `${slug}@escola.sp.gov.br`,
    school: pick(SCHOOLS),
    className: pick(CLASSES),
    city,
    state,
    fraudScore,
    integrityScore: Math.max(0, 100 - fraudScore - between(0, 6)),
    risk,
    rank: i + 1,
    lastActivity: daysAgoISO(between(0, 29)),
    breakdown,
    occurrences,
    timeline,
  };
}

/* Build once at module load. Index order = league rank (1 = first place). */
export const STUDENTS: Student[] = Array.from({ length: 200 }, (_, i) =>
  makeStudent(i),
);

/** Default view: the top 10 of the league leaderboard. */
export const TOP_STUDENTS = STUDENTS.slice(0, 10);

export function searchStudents(query: string): Student[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOP_STUDENTS;
  return STUDENTS.filter((s) =>
    [s.name, s.email, s.id, s.school, s.className, s.city]
      .join(" ")
      .toLowerCase()
      .includes(q),
  ).slice(0, 40);
}
