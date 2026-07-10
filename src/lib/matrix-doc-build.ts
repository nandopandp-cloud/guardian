import {
  bullets,
  C,
  callout,
  CONTENT_W,
  drawCover,
  heading,
  Layout,
  M,
  paragraph,
  resetSections,
  sanitize,
  setFill,
  txt,
} from "./matrix-doc";
import type { Doc, RGB } from "./matrix-doc";
import { table } from "./matrix-doc-tables";

/* ------------------------------------------------------------------ *
 * Weighted-score visual: four pillars with percentages.
 * ------------------------------------------------------------------ */
function scoreModel(L: Layout) {
  const d = L.doc;
  const pillars: [string, string, number, RGB][] = [
    ["Behavior", "Interação humana: mouse, scroll, toque e ritmo", 35, C.blue],
    ["Technical", "Sinais técnicos: tempo, rede, dispositivo, API", 35, C.navy2],
    ["Volume", "Intensidade: quizzes, sessões e tentativas", 20, C.orange],
    ["Integrity", "Consistência histórica e de desempenho", 10, C.rNormal],
  ];
  const gap = 12;
  const cardW = (CONTENT_W - gap * 3) / 4;
  L.ensure(96);
  pillars.forEach(([name, desc, pct, color], i) => {
    const x = M.left + i * (cardW + gap);
    setFill(d, C.panel);
    d.roundedRect(x, L.y, cardW, 84, 8, 8, "F");
    setFill(d, color);
    d.roundedRect(x, L.y, cardW, 4, 2, 2, "F");
    txt(d, `${pct}%`, x + 10, L.y + 30, {
      size: 20,
      color,
      weight: "bold",
    });
    txt(d, name, x + 10, L.y + 46, {
      size: 9.5,
      color: C.ink,
      weight: "bold",
    });
    const lines: string[] = d.splitTextToSize(sanitize(desc), cardW - 18);
    lines.slice(0, 3).forEach((ln, li) => {
      txt(d, ln, x + 10, L.y + 58 + li * 9, { size: 7, color: C.muted });
    });
  });
  L.y += 96;
}

/** The Fraud Score formula, rendered as a tidy equation strip. */
function formulaStrip(L: Layout) {
  const d = L.doc;
  L.ensure(44);
  setFill(d, C.navy);
  d.roundedRect(M.left, L.y, CONTENT_W, 34, 7, 7, "F");
  txt(
    d,
    "Fraud Score  =  0,35 · Behavior  +  0,35 · Technical  +  0,20 · Volume  +  0,10 · Integrity",
    M.left + CONTENT_W / 2,
    L.y + 21,
    { size: 10, color: C.white, weight: "bold", align: "center" },
  );
  L.y += 44;
}

/* ------------------------------------------------------------------ *
 * Full document assembly.
 * ------------------------------------------------------------------ */
export async function buildMatrixDoc() {
  const { jsPDF } = await import("jspdf");
  const doc: Doc = new jsPDF({ unit: "pt", format: "a4" });
  resetSections();

  // Cover
  drawCover(doc);

  // Start content
  const L = new Layout(doc);
  doc.addPage();
  L.page = 2;
  L.y = M.top;
  L.chrome();

  /* ---- 1. Objetivo ---------------------------------------------- */
  heading(L, "Objetivo e escopo");
  paragraph(
    L,
    "Este documento define como a Liga Genial identifica comportamentos incompatíveis com o uso humano da plataforma e como aplica ações proporcionais para preservar a justiça da competição. Ele consolida a Matriz de Fraude (pontuação de risco) e as premissas de detecção que orientam tanto as decisões automatizadas quanto as auditorias humanas.",
  );
  paragraph(
    L,
    "O propósito central é atribuir a cada estudante um Fraud Score — um indicador numérico de risco — e, a partir dele, disparar respostas graduais: desde o simples monitoramento até a invalidação de pontuação e a auditoria manual. Nenhuma penalização é automática e definitiva sem registro de evidências e possibilidade de revisão.",
  );
  callout(
    L,
    "Princípio orientador",
    "A ferramenta apoia a decisão; ela não pune sozinha. Toda medida relevante exige evidências registradas e admite revisão manual dos casos limítrofes.",
    "orange",
  );

  /* ---- 2. Como funciona a matriz -------------------------------- */
  heading(L, "Como funciona a Matriz de Fraude");
  paragraph(
    L,
    "O modelo recomendado utiliza quatro scores independentes, cada um observando uma dimensão do comportamento. Eles são combinados em um Fraud Score Final por média ponderada, de modo que sinais comportamentais e técnicos tenham o maior peso, e volume e histórico complementem a leitura.",
  );
  scoreModel(L);
  L.gap(6);
  formulaStrip(L);
  paragraph(
    L,
    "Cada score varia de 0 a 100. Regras específicas (a Matriz de Pesos) somam pontos ao detectar comportamentos suspeitos, enquanto os redutores subtraem pontos diante de sinais compatíveis com uso humano legítimo. O resultado é posicionado em uma das faixas de classificação, que determina a ação recomendada.",
  );
  callout(
    L,
    "Exemplo ilustrativo",
    "Um estudante com Behavior 70, Technical 76, Volume 60 e Integrity 40 obtém Fraud Score = 0,35·70 + 0,35·76 + 0,20·60 + 0,10·40 = 67 → faixa Alto risco. A ação recomendada é congelar a pontuação da sessão e encaminhar para revisão.",
    "info",
  );

  /* ---- 3. Faixas de classificação ------------------------------- */
  heading(L, "Faixas de classificação");
  paragraph(
    L,
    "A pontuação final é traduzida em uma faixa de risco. Cada faixa carrega uma ação padrão, do monitoramento passivo à invalidação da pontuação. As cores acompanham a leitura de severidade utilizada no dashboard operacional.",
  );
  table(
    L,
    [
      { header: "Score", width: 0.16, align: "center" },
      { header: "Classificação", width: 0.32 },
      { header: "Ação recomendada", width: 0.52 },
    ],
    [
      { cells: ["0–19", "Normal", "Nenhuma ação"], band: C.rNormal, accent: { col: 1, color: C.rNormal } },
      { cells: ["20–39", "Baixo risco", "Monitoramento"], band: C.rLow, accent: { col: 1, color: C.rLow } },
      { cells: ["40–59", "Médio risco", "Revisão automática"], band: C.rMed, accent: { col: 1, color: C.rMed } },
      { cells: ["60–79", "Alto risco", "Congelar pontuação da sessão"], band: C.rHigh, accent: { col: 1, color: C.rHigh } },
      { cells: ["80–99", "Muito alto", "Auditoria obrigatória"], band: C.rVeryHigh, accent: { col: 1, color: C.rVeryHigh } },
      { cells: ["100+", "Crítico", "Invalidar pontuação até conclusão da auditoria"], band: C.rCritical, accent: { col: 1, color: C.rCritical } },
    ],
  );

  /* ---- 4. Matriz de pesos --------------------------------------- */
  heading(L, "Matriz de pesos");
  paragraph(
    L,
    "Cada comportamento observável recebe um peso. Pesos maiores indicam sinais mais fortes de automação ou manipulação. Quando um comportamento admite intensidades (por exemplo, sessões de 3h a 12h), o peso cresce proporcionalmente à gravidade.",
  );
  const wRow = (cat: string, beh: string, peso: string): { cells: string[]; accent: { col: number; color: RGB } } => ({
    cells: [cat, beh, peso],
    accent: { col: 2, color: C.orangeDeep },
  });
  table(
    L,
    [
      { header: "Categoria", width: 0.22 },
      { header: "Comportamento", width: 0.56 },
      { header: "Peso", width: 0.22, align: "right" },
    ],
    [
      wRow("Velocidade", "Resposta < 300 ms", "+40"),
      wRow("Velocidade", "Resposta < 700 ms", "+25"),
      wRow("Velocidade", "Resposta < 1 s", "+10"),
      wRow("Ritmo", "Intervalos robóticos", "+20"),
      wRow("Ritmo", "30 respostas com baixa variação", "+30"),
      wRow("Volume", "150 / 250 / 400 / 600 quizzes", "+15 / +30 / +60 / +100"),
      wRow("Sessão", "3h / 5h / 8h / 12h contínuas", "+10 / +20 / +40 / +80"),
      wRow("Navegação", "Fluxo impossível / telas ignoradas", "+25 a +40"),
      wRow("Mouse", "Sem movimento / padrão linear", "+15 a +20"),
      wRow("Scroll", "Ausente ou constante", "+10 a +20"),
      wRow("Touch", "Toques idênticos", "+15 a +20"),
      wRow("Dispositivo", "Muitos dispositivos / IPs", "+20 a +80"),
      wRow("API", "Headers, tokens, fluxo anormal", "+30 a +50"),
      wRow("Automação", "Selenium, Playwright, Puppeteer", "+100"),
      wRow("Fluxo", "Pontuação sem eventos", "+100"),
      wRow("Repetição", "Mesmo padrão por dezenas de quizzes", "+30 a +40"),
      wRow("Acertos", "100% por longos períodos", "+20 a +25"),
      wRow("Simultaneidade", "Atividades incompatíveis", "+60 a +80"),
      wRow("Histórico", "Produtividade incompatível", "+10 a +20"),
      wRow("Fraude confirmada", "Primeira / reincidência", "+100 / +200 / +300"),
    ],
  );

  /* ---- 5. Redutores --------------------------------------------- */
  heading(L, "Redutores de score");
  paragraph(
    L,
    "Sinais compatíveis com uso humano legítimo reduzem o Fraud Score, evitando falsos positivos. Eles equilibram a matriz: um estudante engajado, com interação natural e ritmo humano, tende a acumular redutores que neutralizam pontuações pontuais.",
  );
  bullets(
    L,
    [
      ["Movimentos naturais de mouse", "(−10)"],
      ["Scroll compatível com leitura", "(−10)"],
      ["Pausas humanas frequentes", "(−15)"],
      ["Tempo de leitura coerente", "(−15)"],
      ["Variação natural entre respostas", "(−20)"],
      ["Dispositivo conhecido", "(−10)"],
    ],
    { accent: C.rNormal },
  );

  /* ---- 6. Regras de correlação ---------------------------------- */
  heading(L, "Regras de correlação");
  paragraph(
    L,
    "Alguns sinais, isoladamente, podem ter explicações legítimas. As regras de correlação combinam múltiplos indícios para disparar ações decisivas com maior confiança. São gatilhos críticos que sobrepõem a simples soma de pesos.",
  );
  bullets(
    L,
    [
      "Resposta impossível + ausência de mouse + ausência de scroll → congelar a pontuação da sessão.",
      "WebDriver ou ferramenta de automação detectada → bloqueio imediato da pontuação da sessão.",
      "Pontuação gerada sem os eventos esperados → invalidar a sessão.",
      "Três ou mais regras críticas acionadas → auditoria manual obrigatória.",
    ],
    { accent: C.rCritical },
  );

  /* ---- 7. Premissas de detecção --------------------------------- */
  heading(L, "Premissas de identificação de fraude");
  paragraph(
    L,
    "As premissas descrevem, em linguagem operacional, os comportamentos que a plataforma monitora e a ação direta associada a cada um. Elas são a base conceitual que alimenta a Matriz de Pesos.",
  );
  const premises: [string, string, string][] = [
    ["Tempo de resposta impossível", "Respostas em tempos incompatíveis com leitura humana (centenas de milissegundos).", "Marcar evento suspeito e aumentar Fraud Score."],
    ["Intervalo robótico", "Mesmo intervalo entre respostas repetido continuamente.", "Aumentar Fraud Score."],
    ["Volume anormal", "Quantidade de quizzes/simulados muito acima do esperado.", "Auditoria automática."],
    ["Sessões excessivamente longas", "Uso contínuo por muitas horas sem pausas.", "Elevar risco."],
    ["Fluxo impossível", "Conclusão de atividades sem eventos intermediários esperados.", "Bloquear pontuação da sessão."],
    ["Navegação automatizada", "Mudanças de tela rápidas e repetitivas.", "Registrar evidências."],
    ["Ausência de interação humana", "Sem movimento de mouse, scroll ou gestos compatíveis.", "Elevar risco."],
    ["Fingerprint suspeito", "Mesmo usuário em muitos dispositivos/IPs incompatíveis.", "Solicitar revisão."],
    ["Requisições anômalas", "Chamadas repetidas, headers alterados ou APIs fora do fluxo.", "Invalidar sessão e registrar."],
    ["Atividades simultâneas", "Mesmo usuário executando atividades incompatíveis ao mesmo tempo.", "Congelar pontuação."],
    ["Padrão repetitivo", "Sequências idênticas de cliques e tempos.", "Auditoria."],
    ["Pontuação incompatível", "Grande evolução em curto período sem comportamento correspondente.", "Revisão manual."],
  ];
  premises.forEach(([title, premise, action]) => {
    premiseCard(L, title, premise, action);
  });

  /* ---- 8. Escalonamento ----------------------------------------- */
  heading(L, "Escalonamento de ações");
  paragraph(
    L,
    "A resposta é sempre proporcional ao risco. O escalonamento garante que decisões severas — como remoção de pontuação ou exclusão — sejam reservadas a casos confirmados ou reincidentes, sempre conforme o regulamento.",
  );
  table(
    L,
    [
      { header: "Nível", width: 0.28 },
      { header: "Ação", width: 0.72 },
    ],
    [
      { cells: ["Score baixo", "Apenas monitoramento."], band: C.rLow },
      { cells: ["Score médio", "Congelar temporariamente a pontuação da sessão."], band: C.rMed },
      { cells: ["Score alto", "Auditoria automática e revisão manual."], band: C.rHigh },
      { cells: ["Fraude confirmada", "Remoção da pontuação obtida de forma irregular."], band: C.rVeryHigh },
      { cells: ["Reincidência", "Exclusão da competição e bloqueio para temporadas futuras, conforme regulamento."], band: C.rCritical },
    ],
  );

  /* ---- 9. Recomendações de produto ------------------------------ */
  heading(L, "Recomendações de produto");
  paragraph(
    L,
    "Para que a matriz cumpra seu papel com transparência e segurança jurídica, recomendamos acompanhá-la das seguintes práticas de produto e operação:",
  );
  bullets(
    L,
    [
      "Exibir aviso de monitoramento em tempo real na Liga.",
      "Adicionar uma seção de Fair Play no regulamento.",
      "Implementar o Fraud Score com dashboard para a operação (Guardian).",
      "Registrar todas as evidências antes de qualquer penalização.",
      "Permitir revisão manual dos casos limítrofes.",
    ],
    { accent: C.blue },
  );

  /* ---- 10. Glossário -------------------------------------------- */
  heading(L, "Glossário");
  const glossary: [string, string][] = [
    ["Fraud Score", "Indicador numérico de risco (0–100+) calculado pela média ponderada dos quatro scores."],
    ["Behavior Score", "Mede a naturalidade da interação humana: mouse, scroll, toque e ritmo das ações."],
    ["Technical Score", "Avalia sinais técnicos: tempo de resposta, rede, dispositivo e uso de API."],
    ["Volume Score", "Reflete a intensidade de uso: número de quizzes, sessões e tentativas."],
    ["Integrity Score", "Consistência do desempenho e do histórico ao longo da temporada."],
    ["Redutor", "Sinal compatível com uso humano que subtrai pontos do Fraud Score."],
    ["Regra de correlação", "Combinação de múltiplos indícios que dispara uma ação decisiva."],
    ["Congelar pontuação", "Suspender temporariamente a validade da pontuação da sessão até revisão."],
  ];
  glossary.forEach(([term, def]) => {
    L.ensure(26);
    txt(L.doc, term, M.left, L.y + 9, { size: 9, color: C.navy2, weight: "bold" });
    const defLines: string[] = doc.splitTextToSize(sanitize(def), CONTENT_W - 130);
    defLines.forEach((ln, i) => {
      txt(L.doc, ln, M.left + 130, L.y + 9 + i * 11, { size: 9, color: C.body });
    });
    L.y += Math.max(18, defLines.length * 11 + 6);
  });

  /* ---- Closing disclaimer --------------------------------------- */
  L.gap(8);
  callout(
    L,
    "Nota final",
    "Este é um documento de trabalho para a squad Prepara SP. Os pesos e faixas aqui descritos são premissas de partida e podem ser calibrados com base nos dados reais da temporada. Nenhuma penalização deve ocorrer sem registro de evidências e sem a possibilidade de revisão manual.",
    "orange",
  );

  return doc;
}

/** Build + trigger download of the institutional Fraud Matrix document. */
export async function exportMatrixDoc() {
  const doc = await buildMatrixDoc();
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`prepara-sp_matriz-de-fraude_${stamp}.pdf`);
}

/** A premise card: title + premise + direct action, colour-coded. */
function premiseCard(
  L: Layout,
  title: string,
  premise: string,
  action: string,
) {
  const d = L.doc;
  d.setFont("helvetica", "normal");
  d.setFontSize(8.5);
  const pLines: string[] = d.splitTextToSize(sanitize(`Premissa: ${premise}`), CONTENT_W - 28);
  const aLines: string[] = d.splitTextToSize(sanitize(`Ação direta: ${action}`), CONTENT_W - 28);
  const h = 20 + pLines.length * 11 + aLines.length * 11 + 12;
  L.ensure(h + 8);

  setFill(d, C.panel);
  d.roundedRect(M.left, L.y, CONTENT_W, h, 7, 7, "F");
  setFill(d, C.orange);
  d.roundedRect(M.left, L.y, 4, h, 2, 2, "F");

  txt(d, title, M.left + 16, L.y + 16, { size: 9.5, color: C.navy, weight: "bold" });
  let ty = L.y + 30;
  pLines.forEach((ln) => {
    txt(d, ln, M.left + 16, ty, { size: 8.5, color: C.body });
    ty += 11;
  });
  aLines.forEach((ln) => {
    txt(d, ln, M.left + 16, ty, { size: 8.5, color: C.orangeDeep, weight: "bold" });
    ty += 11;
  });
  L.y += h + 8;
}
