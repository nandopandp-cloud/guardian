import {
  bullets,
  C,
  callout,
  CONTENT_W,
  drawCover,
  faqItem,
  heading,
  Layout,
  M,
  numberedList,
  paragraph,
  quote,
  resetSections,
  sanitize,
  setFill,
  txt,
} from "./matrix-doc";
import type { Doc, RGB } from "./matrix-doc";

/* ================================================================== *
 * PREMISSAS DE ELEGIBILIDADE & FAQ DE SUPORTE (v2.0)
 * Prepara SP · Liga Genial — saneamento do ranking.
 * Reaproveita o design system do documento da Matriz de Fraude.
 * A cláusula de regulamento 4.2.2 é preservada integralmente.
 * ================================================================== */

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ---- threshold summary strip -------------------------------------- */
function thresholdStrip(L: Layout) {
  const d = L.doc;
  const items: [string, string][] = [
    ["<= 180 s", "Simulado mín."],
    ["1ª válida", "Por dia"],
    ["1.850", "Teto/dia"],
    ["5 min", "Sessão única"],
    ["Desde o", "início"],
  ];
  const gap = 10;
  const cardW = (CONTENT_W - gap * (items.length - 1)) / items.length;
  L.ensure(58);
  items.forEach(([big, small], i) => {
    const x = M.left + i * (cardW + gap);
    setFill(d, C.navy);
    d.roundedRect(x, L.y, cardW, 48, 8, 8, "F");
    setFill(d, C.orange);
    d.roundedRect(x, L.y, cardW, 3, 1.5, 1.5, "F");
    txt(d, big, x + cardW / 2, L.y + 26, {
      size: 13,
      color: C.white,
      weight: "bold",
      align: "center",
    });
    txt(d, small.toUpperCase(), x + cardW / 2, L.y + 39, {
      size: 6.5,
      color: [150, 170, 205],
      weight: "bold",
      spacing: 0.4,
      align: "center",
    });
  });
  L.y += 58;
}

/** A numbered premise block (3.x): title + rule + optional sub-bullets. */
function premise(
  L: Layout,
  code: string,
  title: string,
  body: string,
  sub?: string[],
) {
  const d = L.doc;
  // Header line with code chip
  L.ensure(30);
  d.setFont("helvetica", "bold");
  d.setFontSize(8);
  const chipW = d.getTextWidth(code) + 16;
  setFill(d, C.orange);
  d.roundedRect(M.left, L.y, chipW, 16, 8, 8, "F");
  txt(d, code, M.left + chipW / 2, L.y + 11, {
    size: 8,
    color: C.navy,
    weight: "bold",
    align: "center",
  });
  txt(d, title, M.left + chipW + 10, L.y + 12, {
    size: 11,
    color: C.navy,
    weight: "bold",
  });
  L.y += 24;
  paragraph(L, body, { size: 9.5 });
  if (sub && sub.length) {
    bullets(L, sub, { accent: C.blue });
  }
  L.y += 2;
}

/** The regulation clause card (4.2.2) — preserved integrally. */
function regulationCard(L: Layout) {
  const d = L.doc;
  const paras = [
    "A pontuação obtida por meio de simulados será limitada a 1.850 (mil oitocentos e cinquenta) pontos por estudante, por dia.",
    "Após o atingimento desse limite diário, o estudante poderá continuar realizando simulados normalmente para fins de estudo e acompanhamento pedagógico. Entretanto, as atividades permanecerão registradas na plataforma sem gerar pontuação adicional para o ranking da Liga Genial até o início do próximo dia, conforme o horário oficial da competição.",
  ];
  d.setFont("helvetica", "normal");
  d.setFontSize(9.5);
  const wrapped = paras.map((p) => d.splitTextToSize(sanitize(p), CONTENT_W - 36));
  const textH = wrapped.reduce((a, l) => a + l.length * 14, 0) + (paras.length - 1) * 6;
  const h = 62 + textH;
  L.ensure(h + 10);
  const x = M.left;
  const y = L.y;
  setFill(d, C.navy);
  d.roundedRect(x, y, CONTENT_W, h, 10, 10, "F");
  setFill(d, C.white);
  d.roundedRect(x + 6, y + 40, CONTENT_W - 12, h - 46, 7, 7, "F");
  setFill(d, C.orange);
  d.roundedRect(x + 16, y + 13, 52, 18, 9, 9, "F");
  txt(d, "4.2.2", x + 42, y + 25, {
    size: 9.5,
    color: C.navy,
    weight: "bold",
    align: "center",
  });
  txt(d, "Limite Diário de Pontuação em Simulados", x + 80, y + 25, {
    size: 11,
    color: C.white,
    weight: "bold",
  });
  let ty = y + 40 + 20;
  wrapped.forEach((lines: string[], pi: number) => {
    lines.forEach((line: string) => {
      txt(d, line, x + 18, ty, { size: 9.5, color: C.body });
      ty += 14;
    });
    if (pi < wrapped.length - 1) ty += 6;
  });
  L.y += h + 10;
}

/* ---- FAQ data ----------------------------------------------------- */
const FAQ: [string, string][] = [
  ["“Meus pontos sumiram. O que aconteceu?”", "O ranking foi recalculado com os critérios de elegibilidade da Liga Genial. Algumas atividades continuam registradas no histórico pedagógico, mas deixaram de gerar pontos competitivos quando não atenderam às regras de tempo mínimo, primeira conclusão válida, limite diário ou sessão competitiva única. Isso não significa que sua atividade foi apagada — apenas que parte da pontuação deixou de ser considerada no ranking."],
  ["“Por que meu total diminuiu de uma hora para outra?”", "A alteração ocorreu porque o ranking foi reprocessado de forma uniforme para todos os participantes. O sistema revisou as atividades desde o início da competição e recalculou somente os pontos elegíveis de acordo com as regras vigentes."],
  ["“Eu fui acusado de fraude?”", "Não. Uma alteração de pontuação não representa, por si só, uma acusação de fraude. O processo trata da elegibilidade da pontuação no ranking. Atividades que não atendem aos critérios competitivos podem permanecer registradas para fins pedagógicos, mas sem gerar pontos."],
  ["“As atividades que eu fiz foram apagadas?”", "Não. Os registros pedagógicos das atividades são preservados. O que pode mudar é apenas a quantidade de pontos considerada no ranking competitivo."],
  ["“Por que um simulado rápido não pontuou?”", "Simulados concluídos em tempo menor ou igual a três minutos não são elegíveis para pontuação no ranking. Essa regra é aplicada igualmente a todos os participantes. O simulado continua registrado no histórico, mas seus pontos de conclusão e eventuais bônus não entram no ranking."],
  ["“Terminei o simulado exatamente em três minutos. Ele pontua?”", "Não. A regra considera inelegíveis os simulados concluídos em três minutos ou menos, incluindo exatamente 3 minutos ou 180 segundos."],
  ["“Fiz novamente o mesmo simulado. Por que não recebi novos pontos?”", "Para o ranking, somente a primeira conclusão válida do mesmo simulado pelo estudante no mesmo dia gera pontos. As repetições continuam disponíveis e registradas para estudo e aprendizagem, mas não geram pontuação competitiva adicional."],
  ["“Minha primeira tentativa foi muito rápida, mas depois refiz o simulado corretamente. A segunda pode pontuar?”", "Sim, desde que seja a primeira conclusão válida daquele simulado no dia e atenda aos demais critérios. Uma tentativa concluída em três minutos ou menos não ocupa a posição de primeira conclusão válida — o sistema procura a próxima conclusão elegível realizada no mesmo dia."],
  ["“Quantas vezes posso refazer um simulado?”", "O estudante pode refazer o simulado para fins pedagógicos, conforme disponibilidade da plataforma. Porém, para o ranking, somente a primeira conclusão válida do mesmo simulado no dia pode gerar pontos."],
  ["“Existe um limite de pontos de simulados por dia?”", "Sim. Depois da aplicação dos critérios de elegibilidade, a pontuação proveniente de simulados é limitada a 1.850 pontos por estudante por dia. Atividades acima desse limite continuam registradas, mas não aumentam a pontuação diária no ranking."],
  ["“Fiz várias atividades, mas minha pontuação não aumentou. Por quê?”", "Isso pode acontecer quando: o simulado foi concluído em três minutos ou menos; a atividade era repetição do mesmo simulado no dia; o estudante já atingiu o limite diário de 1.850 pontos; a atividade foi realizada em sessão concorrente; ou a atividade não atendia a algum outro critério de elegibilidade do regulamento."],
  ["“Posso usar a plataforma no celular e no computador?”", "Sim, desde que a mesma conta não seja utilizada de forma simultânea em sessões diferentes para gerar pontos. O estudante pode trocar de dispositivo. O que não é permitido para fins de pontuação é manter atividades competitivas simultâneas em navegadores, perfis ou dispositivos diferentes."],
  ["“O que é uma sessão concorrente?”", "É uma sessão diferente da conta que realiza atividade enquanto outra sessão da mesma conta registrou atividade autenticada nos cinco minutos anteriores. Somente os eventos da sessão competitiva principal são elegíveis para pontuação; as atividades das sessões concorrentes podem permanecer registradas, mas não geram pontos adicionais."],
  ["“Abri duas abas no mesmo navegador. Vou perder pontos?”", "Duas abas da mesma sessão não significam automaticamente uso de dois dispositivos. A regra busca impedir atividades competitivas simultâneas em sessões distintas. Ainda assim, recomendamos realizar uma atividade por vez."],
  ["“Troquei do celular para o computador. Vou perder pontos?”", "A simples troca de dispositivo não remove automaticamente os pontos já obtidos. A restrição se aplica quando há atividade concorrente em sessões diferentes dentro da janela de cinco minutos. Para evitar conflito, encerre a atividade no primeiro dispositivo antes de continuar no outro."],
  ["“Outra pessoa usou minha conta. Posso recuperar os pontos?”", "A conta é pessoal e o titular é responsável pela segurança das credenciais; não é permitido compartilhar login e senha. A pontuação é calculada com base nos eventos registrados na conta. Havendo suspeita de acesso indevido, altere a senha e procure o canal oficial de suporte."],
  ["“Por que as regras foram aplicadas desde o início da competição?”", "Para garantir tratamento igual entre todos os participantes. Aplicar os critérios apenas a partir da data da atualização manteria no ranking pontos antigos não elegíveis pelas mesmas regras. Por isso o ranking foi reprocessado desde o início, preservando as atividades válidas."],
  ["“Vocês retiraram todos os pontos de quem teve alguma atividade irregular?”", "Não. O saneamento é feito por atividade e por evento de pontuação. Os pontos válidos são preservados; somente os pontos associados a atividades não elegíveis são desconsiderados."],
  ["“Como sei exatamente quais pontos não foram considerados?”", "O suporte poderá solicitar os dados necessários para localizar o cadastro e verificar a composição da pontuação (estudante, escola, turma, período e atividades). Por segurança e privacidade, informações detalhadas da conta só são fornecidas após validação da identidade do solicitante."],
  ["“O ranking pode mudar novamente?”", "Sim. O ranking é atualizado conforme novas atividades válidas são concluídas e pode ser corrigido quando forem identificados erros técnicos ou inconsistências. Qualquer correção segue os mesmos critérios para todos os participantes."],
  ["“A plataforma apresentou erro durante meu simulado. O que devo fazer?”", "Registre a ocorrência pelo canal oficial e informe, quando possível: nome completo, escola e turma, data e horário aproximado, nome da atividade, descrição do erro, captura de tela ou vídeo, e dispositivo/navegador. O envio não garante restituição automática; o caso será analisado com base nas evidências."],
  ["“Posso pedir revisão da minha pontuação?”", "Sim. O estudante ou educador pode solicitar análise pelo canal oficial, informando os dados para localizar a conta e a atividade. A revisão verifica se houve erro técnico ou aplicação incorreta dos critérios. Pontos só são restituídos quando há evidência de que uma atividade válida deixou de ser contabilizada indevidamente."],
  ["“Quanto tempo leva a revisão?”", "O prazo segue o nível de serviço vigente do suporte. Não informe um prazo específico sem confirmação operacional. Registre o protocolo e oriente o solicitante a acompanhar a resposta pelo mesmo canal."],
  ["“Um educador pode pedir a revisão de vários estudantes?”", "Sim, desde que informe escola, turma, nomes dos estudantes, período e motivo. Casos coletivos devem ser encaminhados para análise técnica consolidada, evitando múltiplos chamados sobre o mesmo incidente."],
  ["“Por que outro estudante continua com muitos pontos?”", "O suporte não deve comentar dados individuais de outros participantes. Resposta recomendada: todos estão sujeitos aos mesmos critérios; por privacidade, não é possível fornecer detalhes sobre a conta de terceiros. Havendo dúvida sobre a própria pontuação, oriente a abertura de uma revisão."],
  ["“Quero saber se outro estudante está fraudando.”", "Não é possível confirmar ou discutir publicamente a situação de outro participante. O estudante ou educador pode encaminhar uma sinalização ao canal oficial, com as evidências disponíveis; a equipe responsável fará a análise técnica sem exposição dos envolvidos."],
  ["“Por que vocês não avisaram antes de alterar o ranking?”", "Resposta recomendada: o ranking foi atualizado para refletir de forma uniforme os critérios de elegibilidade. A medida busca garantir isonomia. Estamos reforçando as orientações para que estudantes e educadores compreendam como a pontuação é calculada e possam solicitar revisão em caso de erro técnico."],
  ["“Vou receber de volta os pontos retirados?”", "Somente quando a revisão identificar erro técnico ou aplicação incorreta das regras. Pontos associados a atividades que não atendem aos critérios não serão restituídos, ainda que a atividade permaneça no histórico pedagógico."],
  ["“Essas regras valem para todos?”", "Sim. Os mesmos critérios são aplicados a todos os participantes elegíveis da Liga Genial, sem ajuste manual baseado em posição, escola ou estudante."],
  ["“O suporte consegue alterar minha pontuação manualmente?”", "O suporte não deve prometer alterações manuais. Sua função é registrar o caso, coletar as informações necessárias e encaminhá-lo para análise. Qualquer correção deve ser técnica, auditável e baseada em evidências."],
];

export async function buildAntifraudDoc() {
  const { jsPDF } = await import("jspdf");
  const doc: Doc = new jsPDF({ unit: "pt", format: "a4" });
  resetSections();

  drawCover(doc, {
    title: "Premissas de Elegibilidade",
    titleLine2: "da Pontuação & FAQ",
    subtitle: "Saneamento do ranking · Liga Genial PreparaSP",
    description:
      "Critérios objetivos de elegibilidade da pontuação competitiva e guia de suporte. Elegibilidade · isonomia · rastreabilidade · revisão.",
    chips: [
      "2ª e 3ª série · EM",
      "Squad Prepara SP",
      `v2.0 · ${new Date().toLocaleDateString("pt-BR")}`,
    ],
  });

  const L = new Layout(doc, "Premissas e FAQ de suporte · Liga Genial");
  doc.addPage();
  L.page = 2;
  L.y = M.top;
  L.chrome();

  /* 1. Objetivo */
  heading(L, "Objetivo");
  paragraph(
    L,
    "Definir os critérios objetivos usados no saneamento do ranking da Liga Genial PreparaSP e orientar o time de suporte na comunicação com estudantes e educadores.",
  );
  callout(
    L,
    "Natureza do saneamento",
    "O saneamento trata de elegibilidade da pontuação competitiva, não de acusação automática de fraude. As atividades permanecem registradas para fins pedagógicos sempre que tecnicamente possível, ainda que não gerem pontos no ranking.",
    "orange",
  );

  /* 2. Princípios */
  heading(L, "Princípios de aplicação");
  bullets(
    L,
    [
      "Os mesmos critérios são aplicados a todos os participantes elegíveis.",
      "O ranking é reprocessado desde o início da competição, sem cortes individuais ou semanais arbitrários.",
      "Somente os eventos de pontuação não elegíveis são retirados; pontos válidos são preservados.",
      "Nenhum estudante é classificado como fraudador apenas por ter a pontuação recalculada.",
      "Correções precisam ser reproduzíveis, auditáveis e baseadas em evidências técnicas.",
      "Atividades pedagógicas e pontuação competitiva são tratadas separadamente.",
    ],
    { accent: C.blue },
  );

  /* Threshold overview */
  heading(L, "Critérios em resumo");
  paragraph(
    L,
    "Os limiares abaixo concentram as regras de elegibilidade aplicadas ao saneamento do ranking.",
  );
  thresholdStrip(L);

  /* 3. Premissas aprovadas */
  heading(L, "Premissas aprovadas para o saneamento do ranking");
  premise(
    L,
    "3.1",
    "Reprocessamento desde o início",
    "O ranking será recalculado considerando todos os eventos disponíveis desde o início da Liga Genial. Não será aplicado corte a partir de uma semana específica nem remoção integral do saldo de um estudante.",
  );
  premise(
    L,
    "3.2",
    "Tempo mínimo dos simulados",
    "Simulados concluídos em tempo menor ou igual a 3 minutos (180 segundos) não são elegíveis para pontuação. A duração é calculada entre a primeira resposta registrada e o maior horário entre a última resposta e a conclusão do report. Quando o report for inelegível por tempo, são desconsiderados:",
    [
      "os pontos de conclusão do simulado;",
      "os bônus de desempenho ou acurácia associados ao mesmo report.",
    ],
  );
  premise(
    L,
    "3.3",
    "Primeira conclusão válida no dia",
    "Para cada combinação estudante + simulado + dia, somente a primeira conclusão válida será elegível para pontuação.",
    [
      "Tentativas concluídas em até 180 segundos não consomem a oportunidade diária.",
      "O sistema procura a primeira conclusão posterior que cumpra os critérios.",
      "Repetições posteriores permanecem registradas pedagogicamente, sem nova pontuação.",
    ],
  );
  premise(
    L,
    "3.4",
    "Teto diário de simulados",
    "Depois dos filtros de tempo e repetição, a pontuação de simulados é limitada a 1.850 pontos por estudante por dia — pontos válidos = min(soma dos pontos elegíveis, 1.850). Atividades acima do teto permanecem registradas, mas não aumentam o ranking naquele dia.",
  );
  premise(
    L,
    "3.5",
    "Uma única sessão competitiva ativa",
    "Cada estudante poderá manter somente uma sessão competitiva ativa por vez. É concorrente qualquer sessão distinta que realize atividade autenticada enquanto outra sessão da mesma conta tiver registrado atividade nos cinco minutos anteriores.",
    [
      "Somente os eventos da sessão competitiva principal são elegíveis para pontuação.",
      "Atividades em sessões concorrentes permanecem registradas, sem pontos adicionais.",
      "A simples troca de dispositivo não remove automaticamente pontos anteriores.",
      "Duas sessões no mesmo dia não bastam; deve existir sobreposição na janela de cinco minutos.",
    ],
  );
  premise(
    L,
    "3.6",
    "Aplicabilidade técnica da regra de sessão",
    "A retirada retroativa de pontos por sessão concorrente exige vínculo confiável entre user_id, session_id, timestamp e evento pontuável. Na simulação, o vínculo foi confirmado para conversa com Tutor Inteligente e leitura completa de resumo. Não foi confirmado para simulados e conclusões de grupos de questões — esses eventos não devem perder pontos por inferência temporal. Para cobertura futura, o session_id deve ser registrado diretamente neles.",
  );
  premise(
    L,
    "3.7",
    "Demais funcionalidades",
    "Os pontos já válidos e os limites existentes de grupos de questões, Tutor Inteligente e leitura de resumos serão preservados, exceto quando houver evidência verificável de sessão concorrente.",
  );

  /* 4. Ordem de aplicação */
  heading(L, "Ordem de aplicação");
  paragraph(
    L,
    "A sequência abaixo define, passo a passo, como o reprocessamento do ranking é executado:",
  );
  numberedList(L, [
    "Ler todos os eventos desde o início da competição.",
    "Excluir reports de simulados com duração menor ou igual a 180 segundos.",
    "Encontrar a primeira conclusão válida por estudante, simulado e dia.",
    "Preservar conclusão e bônus do report válido.",
    "Desconsiderar repetições posteriores do mesmo simulado no dia.",
    "Desconsiderar eventos vinculados de forma verificável a sessões concorrentes.",
    "Somar os pontos válidos de simulados por estudante e dia.",
    "Aplicar o teto diário de 1.850 pontos de simulados.",
    "Somar os pontos válidos das demais funcionalidades.",
    "Recalcular separadamente os rankings da 2ª e da 3ª série.",
  ]);

  /* 5. Critérios excluídos */
  heading(L, "Critérios que não serão usados automaticamente");
  paragraph(L, "Não serão utilizados como fundamento automático de retirada de pontos:");
  bullets(
    L,
    [
      "exclusão genérica de todos os simulados abaixo de cinco minutos;",
      "acurácia perfeita isolada;",
      "attempt_id zerado isoladamente;",
      "simples troca de dispositivo;",
      "existência de duas sessões no mesmo dia sem sobreposição real;",
      "corte semanal arbitrário;",
      "remoção integral do saldo do estudante;",
      "inferência de sessão quando não houver vínculo técnico confiável.",
    ],
    { accent: C.rCritical },
  );

  /* 6. Governança */
  heading(L, "Governança e revisão");
  bullets(
    L,
    [
      "A redução de pontos não constitui acusação automática de fraude.",
      "O suporte não deve expor dados ou pontuação de outros participantes.",
      "Solicitações de revisão devem ser analisadas com base em registros auditáveis.",
      "Pontos podem ser restituídos quando houver evidência de erro técnico ou aplicação incorreta.",
      "O suporte não deve prometer restituição, prazo não aprovado ou alteração manual de saldo.",
      "Dados detalhados da conta só devem ser fornecidos após validação da identidade.",
    ],
    { accent: C.blue },
  );

  /* Regulamento — preservado integralmente */
  heading(L, "Alteração no regulamento");
  paragraph(
    L,
    "Complementando as premissas, a seguinte cláusula integra o regulamento oficial da competição, estabelecendo o teto diário de pontuação por simulados:",
  );
  regulationCard(L);

  /* ============ FAQ ============ */
  heading(L, "FAQ de suporte — atualização do ranking");
  paragraph(
    L,
    "Público: time de suporte técnico. Uso: respostas a estudantes e educadores após o saneamento do ranking. Objetivo: comunicação clara, consistente e neutra, sem atribuir fraude a participantes.",
  );
  callout(
    L,
    "Mensagem-base para o suporte",
    "O ranking da Liga Genial foi recalculado para aplicar de forma uniforme os critérios de elegibilidade da pontuação competitiva. As atividades continuam registradas para fins pedagógicos, mas nem toda atividade gera pontos no ranking. O objetivo é preservar a isonomia da competição, aplicando as mesmas regras a todos.",
    "info",
  );

  L.gap(2);
  FAQ.forEach(([q, a], i) => faqItem(L, q, a, i + 1));

  /* Resposta curta */
  heading(L, "Resposta curta para o primeiro contato");
  quote(
    L,
    "O ranking da Liga Genial foi recalculado para aplicar os mesmos critérios de elegibilidade a todos os participantes. As atividades permanecem registradas para fins pedagógicos, mas podem não gerar pontos quando não atendem às regras de tempo mínimo, primeira conclusão válida, limite diário ou sessão competitiva única. Essa atualização não representa acusação de fraude. Se identificar possível erro na sua pontuação, envie nome completo, escola, turma, atividade e data aproximada para análise pelo canal oficial de suporte.",
  );

  /* Dados mínimos */
  heading(L, "Dados mínimos para abrir uma revisão");
  numberedList(L, [
    "nome completo do estudante;",
    "escola;",
    "turma e série;",
    "identificação usada na plataforma, conforme processo interno;",
    "atividade ou simulado questionado;",
    "data e horário aproximado;",
    "descrição objetiva do problema;",
    "captura de tela ou vídeo, quando disponível;",
    "dispositivo e navegador utilizados;",
    "número do protocolo, se for uma reabertura.",
  ]);
  callout(L, "Atenção", "Não solicitar a senha do estudante em nenhuma hipótese.", "risk");

  /* Orientação de linguagem */
  heading(L, "Orientação interna ao suporte");
  subheadingRow(L, "Linguagem recomendada", C.rNormal);
  bullets(
    L,
    [
      "“pontuação não elegível para o ranking”;",
      "“revisão da composição da pontuação”;",
      "“atividade preservada para fins pedagógicos”;",
      "“aplicação uniforme dos critérios”;",
      "“possível inconsistência técnica em análise”.",
    ],
    { accent: C.rNormal },
  );
  subheadingRow(L, "Linguagem que deve ser evitada", C.rCritical);
  bullets(
    L,
    [
      "“você fraudou”; “você usou robô”; “você trapaceou”;",
      "“sua conta foi punida”; “o sistema detectou fraude”;",
      "“seus pontos foram apagados definitivamente”.",
    ],
    { accent: C.rCritical },
  );

  /* O suporte não deve */
  heading(L, "O suporte não deve");
  bullets(
    L,
    [
      "discutir a pontuação de terceiros;",
      "prometer restituição de pontos ou prazo não aprovado;",
      "atribuir fraude com base apenas na redução da pontuação;",
      "solicitar senha ou fazer alteração manual de saldo;",
      "orientar o estudante a refazer a mesma atividade para recuperar pontos;",
      "afirmar que toda atividade abaixo de cinco minutos é inválida — o limite aprovado é de três minutos ou menos.",
    ],
    { accent: C.rCritical },
  );

  /* Escalonamento */
  heading(L, "Escalonamento interno sugerido");
  escalation(L, "Nível 1 — Orientação", [
    "Usar o FAQ quando a dúvida puder ser respondida pelas regras gerais.",
  ], C.rNormal);
  escalation(L, "Nível 2 — Revisão individual", [
    "divergência entre histórico visível e pontuação;",
    "atividade aparentemente válida sem pontos;",
    "alegação de erro técnico com data e atividade identificáveis;",
    "dúvida sobre composição do saldo.",
  ], C.rLow);
  escalation(L, "Nível 3 — Incidente coletivo", [
    "vários estudantes da mesma turma/escola com o mesmo problema;",
    "indisponibilidade da plataforma; falha generalizada no registro de conclusão;",
    "alteração massiva incompatível com as regras publicadas.",
  ], C.rHigh);
  escalation(L, "Nível 4 — Segurança ou integridade", [
    "suspeita de comprometimento de conta; compartilhamento de credenciais;",
    "evidência técnica de automação; exploração de vulnerabilidade;",
    "exposição de dados pessoais.",
  ], C.rCritical);
  paragraph(
    L,
    "Não discutir detalhes técnicos sensíveis com o solicitante antes da análise responsável.",
    { size: 8.5, color: C.muted },
  );

  return doc;
}

/** Small coloured sub-heading with a dot. */
function subheadingRow(L: Layout, title: string, color: RGB) {
  const d = L.doc;
  L.ensure(22);
  setFill(d, color);
  d.circle(M.left + 3, L.y + 6, 2.4, "F");
  txt(d, title, M.left + 14, L.y + 9, { size: 10, color: C.navy, weight: "bold" });
  L.y += 18;
}

/** Escalation level: coloured title bar + bullets. */
function escalation(L: Layout, title: string, items: string[], color: RGB) {
  const d = L.doc;
  L.ensure(24);
  setFill(d, color);
  d.roundedRect(M.left, L.y, 4, 14, 2, 2, "F");
  txt(d, title, M.left + 12, L.y + 11, { size: 10, color: C.navy, weight: "bold" });
  L.y += 18;
  bullets(L, items, { accent: color });
}

export async function exportAntifraudDoc() {
  const doc = await buildAntifraudDoc();
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`prepara-sp_premissas-antifraude-faq-v2_${stamp}.pdf`);
}

export type { RGB };
