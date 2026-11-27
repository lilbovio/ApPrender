// Badge (insignia) computation. Plain JS, no React.
import { completedSet, idOf } from "./lessonUtils";

/**
 * Returns the badge list in fixed order. Each badge is `earned` when its rule holds.
 * `lessons` is `{ math: [], english: [] }`, `progress` is `{ math, english }` (per-subject
 * progress objects), `totals` is `{ xp, streak }`.
 */
export function computeBadges({ lessons = {}, progress = {}, totals = {} }) {
  const mathLessons = lessons.math || [];
  const englishLessons = lessons.english || [];
  const mathDone = completedSet(progress.math);
  const englishDone = completedSet(progress.english);

  const allDone = (list, done) =>
    list.length > 0 && list.every((lesson) => done.has(idOf(lesson._id)));

  const definitions = [
    {
      id: "primeros-numeros",
      icon: "apple",
      title: "Primeros números",
      earned: mathDone.size >= 1,
      earnedMeta: "Tu primera lección de matemáticas",
      lockedMeta: "Termina una lección de matemáticas",
    },
    {
      id: "primeras-palabras",
      icon: "book",
      title: "Primeras palabras",
      earned: englishDone.size >= 1,
      earnedMeta: "Tu primera lección de inglés",
      lockedMeta: "Termina una lección de inglés",
    },
    {
      id: "racha-3",
      icon: "star",
      title: "Racha de 3 días",
      earned: (totals.streak || 0) >= 3,
      earnedMeta: "Aprendiste 3 días seguidos",
      lockedMeta: "Aprende 3 días seguidos",
    },
    {
      id: "cinco-lecciones",
      icon: "trophy",
      title: "Cinco lecciones",
      earned: mathDone.size + englishDone.size >= 5,
      earnedMeta: "Ya llevas cinco",
      lockedMeta: "Termina cinco lecciones",
    },
    {
      id: "mente-matematica",
      icon: "medal",
      title: "Mente matemática",
      earned: allDone(mathLessons, mathDone),
      earnedMeta: "Terminaste todas las de matemáticas",
      lockedMeta: "Termina todas las de matemáticas",
    },
    {
      id: "voz-en-ingles",
      icon: "ear",
      title: "Voz en inglés",
      earned: allDone(englishLessons, englishDone),
      earnedMeta: "Terminaste todas las de inglés",
      lockedMeta: "Termina todas las de inglés",
    },
  ];

  return definitions;
}
