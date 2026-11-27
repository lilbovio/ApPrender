// Exercise helpers for lessons. Plain JS, no React.
// Recognised kinds:
//  - "choice": one answer picked from `options` (visual, auditory or kinesthetic).
//  - "sum":    drag `items` into a drop zone until they reach `targetSum`.
//  - "order":  tap `sentences` in the right sequence (`correctOrder` holds indices).
// Responses: choice = the option value; sum and order = arrays of index strings.

export function normalizeExercise(ex) {
  if (!ex || typeof ex !== "object" || !ex.question) return null;

  if (Array.isArray(ex.items) && ex.items.length > 0 && typeof ex.targetSum === "number") {
    return { kind: "sum", ...ex };
  }
  if (Array.isArray(ex.sentences) && ex.sentences.length > 0 && Array.isArray(ex.correctOrder)) {
    return { kind: "order", ...ex };
  }
  if (ex.answer !== undefined && Array.isArray(ex.options) && ex.options.length > 0) {
    return { kind: "choice", ...ex };
  }
  return null;
}

/** Response shape for a fresh question of this kind. */
export function emptyResponse(exercise) {
  return exercise?.kind === "choice" ? null : [];
}

/** True when the child has given something that can be checked. */
export function hasResponse(exercise, response) {
  if (exercise?.kind === "choice") return response !== null && response !== undefined;
  return Array.isArray(response) && response.length > 0;
}

/** The sentences in the right order, as text. */
export function correctSequence(exercise) {
  return exercise.correctOrder.map((i) => exercise.sentences[i]);
}

export function isCorrect(exercise, response) {
  if (!exercise) return false;

  switch (exercise.kind) {
    case "choice":
      return response !== null && response !== undefined && String(response) === String(exercise.answer);

    case "sum": {
      if (!Array.isArray(response) || response.length === 0) return false;
      const indices = response.map(Number);
      if (new Set(indices).size !== indices.length) return false;
      if (indices.some((i) => !Number.isInteger(i) || i < 0 || i >= exercise.items.length)) return false;
      const total = indices.reduce((sum, i) => sum + Number(exercise.items[i]), 0);
      return total === exercise.targetSum;
    }

    case "order": {
      if (!Array.isArray(response)) return false;
      const expected = correctSequence(exercise);
      if (response.length !== expected.length) return false;
      return response.every((id, k) => exercise.sentences[Number(id)] === expected[k]);
    }

    default:
      return false;
  }
}

/** Removes emoji from lesson text. Spaces collapse and the result is trimmed. */
export function stripEmoji(s) {
  return String(s ?? "")
    .replace(/[\p{Extended_Pictographic}️‍]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Emoji used as a picture in lesson data, mapped to the Spanish word they stand for.
export const EMOJI_WORDS = {
  "\u{1F436}": "perro",
  "\u{1F431}": "gato",
  "\u{1F426}": "pájaro",
  "\u{1F34E}": "manzana",
  "\u{1F34C}": "plátano",
  "\u{1F34A}": "naranja",
};

// Same emoji mapped to the PictureArt illustration that replaces them on screen.
export const EMOJI_ART = {
  "\u{1F436}": "dog",
  "\u{1F431}": "cat",
  "\u{1F426}": "bird",
  "\u{1F34E}": "apple",
  "\u{1F34C}": "banana",
  "\u{1F34A}": "orange",
};

/** Spanish word for a picture-emoji image, or null when the image is not one of them. */
export function pictureWord(image) {
  if (typeof image !== "string") return null;
  const key = image.trim();
  return Object.prototype.hasOwnProperty.call(EMOJI_WORDS, key) ? EMOJI_WORDS[key] : null;
}

/** PictureArt key for a picture-emoji image, or null. */
export function pictureArt(image) {
  if (typeof image !== "string") return null;
  const key = image.trim();
  return Object.prototype.hasOwnProperty.call(EMOJI_ART, key) ? EMOJI_ART[key] : null;
}

/**
 * Reads "2 bloques rojos + 3 bloques azules" into count groups.
 * Only strings containing "+" count as groups; subtraction-style text returns [].
 */
export function parseCountGroups(image) {
  if (typeof image !== "string" || !image.includes("+")) return [];
  const groups = [];
  for (const part of image.split("+")) {
    const match = part.trim().match(/^(\d+)\s+(.+)$/);
    if (!match) return [];
    const label = match[2].trim();
    if (!/\p{L}/u.test(label)) return [];
    groups.push({ count: Number(match[1]), label });
  }
  return groups;
}

/** Friendly hint shown after a first wrong answer. */
export function hintFor(exercise, modality) {
  if (exercise.kind === "sum") return `Necesitas que sumen ${exercise.targetSum}.`;
  if (exercise.kind === "order") return "Piensa qué se dice primero.";
  if (exercise.kind === "choice" && parseCountGroups(exercise.image).length > 0) {
    return "Cuenta cada grupo y súmalos.";
  }
  if (modality === "auditory") return "Escucha otra vez con calma.";
  return "Mira las opciones con calma.";
}

const PRAISE = {
  visual: "Lo viste en los dibujos.",
  auditory: "Lo escuchaste bien.",
  kinesthetic: "Lo construiste tú.",
};

export function praiseFor(modality) {
  return PRAISE[modality] || "";
}

/** Text that reveals the answer after a second wrong attempt (without the "Casi." prefix). */
export function revealFor(exercise) {
  if (exercise.kind === "choice") return `La respuesta es ${stripEmoji(exercise.answer)}.`;
  if (exercise.kind === "sum") {
    const example = exercise.correctCombinations?.[0];
    if (Array.isArray(example) && example.length > 0) {
      return `Por ejemplo: ${example.join(" + ")}.`;
    }
    return `Necesitas que sumen ${exercise.targetSum}.`;
  }
  return `El orden es: ${correctSequence(exercise).map(stripEmoji).join(" → ")}.`;
}
