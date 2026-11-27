// VAK question bank: 12 scenarios, 4 per modality (DESIGN.md section 13).
// Plain JS only: this file is imported by vakUtils.js, which must stay free of React.
// Option order rotates so each modality appears once in each position exactly 4 times.

export const MODALITIES = ["visual", "auditivo", "kinestesico"];

const ICON = { visual: "eye", auditivo: "ear", kinestesico: "hand" };

// Each question lists its three options in display order.
// `text` is verbatim Spanish product copy.
const RAW = [
  {
    id: "q1",
    prompt: "Al aprender algo nuevo, ¿qué prefieres?",
    order: ["visual", "auditivo", "kinestesico"],
    texts: { visual: "Ver un dibujo", auditivo: "Escuchar una historia", kinestesico: "Mover piezas" },
  },
  {
    id: "q2",
    prompt: "Para recordar una palabra, ¿qué te ayuda?",
    order: ["auditivo", "kinestesico", "visual"],
    texts: { visual: "Una imagen", auditivo: "Repetirla en voz alta", kinestesico: "Escribirla con bloques" },
  },
  {
    id: "q3",
    prompt: "¿Cómo resuelves un problema?",
    order: ["kinestesico", "visual", "auditivo"],
    texts: { visual: "Dibujarlo", auditivo: "Contarlo en voz alta", kinestesico: "Construirlo" },
  },
  {
    id: "q4",
    prompt: "En un cuento, ¿qué recuerdas mejor?",
    order: ["kinestesico", "visual", "auditivo"],
    texts: { visual: "Los dibujos", auditivo: "Las voces", kinestesico: "Mover las figuras" },
  },
  {
    id: "q5",
    prompt: "¿Cómo te explican mejor una suma?",
    order: ["visual", "kinestesico", "auditivo"],
    texts: { visual: "Con un dibujo", auditivo: "Con una rima", kinestesico: "Con fichas" },
  },
  {
    id: "q6",
    prompt: "¿Qué te calma cuando estás triste?",
    order: ["auditivo", "visual", "kinestesico"],
    texts: { visual: "Mirar un cuadro", auditivo: "Escuchar música", kinestesico: "Apretar una pelota" },
  },
  {
    id: "q7",
    prompt: "¿Qué te gusta hacer en clase?",
    order: ["visual", "auditivo", "kinestesico"],
    texts: { visual: "Mirar láminas", auditivo: "Escuchar y hablar", kinestesico: "Armar y tocar" },
  },
  {
    id: "q8",
    prompt: 'Para aprender "apple", ¿qué prefieres?',
    order: ["auditivo", "kinestesico", "visual"],
    texts: { visual: "Ver una manzana", auditivo: "Oír y repetir", kinestesico: "Poner una ficha en una cesta" },
  },
  {
    id: "q9",
    prompt: "¿Cómo aprendes a contar?",
    order: ["kinestesico", "auditivo", "visual"],
    texts: { visual: "Con dibujos", auditivo: "Cantando números", kinestesico: "Saltando y contando" },
  },
  {
    id: "q10",
    prompt: "¿Cómo armas un rompecabezas?",
    order: ["visual", "kinestesico", "auditivo"],
    texts: { visual: "Mirar la imagen", auditivo: "Preguntar en voz alta", kinestesico: "Girar las piezas" },
  },
  {
    id: "q11",
    prompt: "¿Cuál es tu actividad favorita?",
    order: ["auditivo", "visual", "kinestesico"],
    texts: { visual: "Pintar", auditivo: "Escuchar cuentos", kinestesico: "Construir con bloques" },
  },
  {
    id: "q12",
    prompt: "Al terminar, ¿qué te gusta?",
    order: ["kinestesico", "auditivo", "visual"],
    texts: { visual: "Ver tu dibujo ganador", auditivo: "Oír tu nombre felicitado", kinestesico: "Tocar tu insignia" },
  },
];

const SUFFIX = { visual: "v", auditivo: "a", kinestesico: "k" };

export const VAK_BANK = RAW.map((question, qIndex) => {
  const n = qIndex + 1;
  return {
    id: question.id,
    prompt: question.prompt,
    options: question.order.map((modality) => ({
      id: `q${n}-${SUFFIX[modality]}`,
      text: question.texts[modality],
      modality,
      icon: ICON[modality],
    })),
    // "No lo sé" is rendered separately and quietly; it adds to no modality.
    unknownOption: { id: `q${n}-x`, text: "No lo sé", modality: null },
  };
});

/**
 * Resolve an answer back to its option. Returns null for unknown ids.
 * The "No lo sé" option is returned with modality null.
 */
export function findOption(questionId, optionId) {
  const question = VAK_BANK.find((q) => q.id === questionId);
  if (!question) return null;
  if (question.unknownOption.id === optionId) return question.unknownOption;
  return question.options.find((o) => o.id === optionId) ?? null;
}
