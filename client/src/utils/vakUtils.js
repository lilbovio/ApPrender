// VAK scoring and local helpers. Plain JS only (no React imports).
import { MODALITIES, findOption } from "../data/vakBank.js";

export { MODALITIES };

export const VAK_SECONDARY_KEY = "apprender.vakSecondary";

/**
 * Spanish copy for each modality. Superpower language only, never clinical.
 * Names and phrases are verbatim product copy.
 */
export const MODALITY_COPY = {
  visual: {
    name: "Visual",
    how: "Aprendes mirando: dibujos, colores y formas.",
    likes: "mirar dibujos",
    gerund: "mirando",
    icon: "eye",
  },
  auditivo: {
    name: "Auditivo",
    how: "Aprendes escuchando: voces, rimas y canciones.",
    likes: "escuchar y hablar",
    gerund: "escuchando",
    icon: "ear",
  },
  kinestesico: {
    name: "Kinestésico",
    how: "Aprendes haciendo: mover, tocar y construir.",
    likes: "mover las cosas",
    gerund: "construyendo",
    icon: "hand",
  },
};

/**
 * Score answers of shape `{ questionId, optionId }`.
 * Modality is resolved through the bank; "No lo sé" and unknown ids add nothing.
 * Ties are broken by the fixed MODALITIES order (visual, auditivo, kinestesico).
 * Returns only `{ dominant, secondary }`; no numeric scores leave this module.
 * secondary is null when the second modality has no points.
 */
export function scoreVAK(answers = []) {
  const counts = Object.fromEntries(MODALITIES.map((m) => [m, 0]));

  for (const answer of answers) {
    const option = findOption(answer?.questionId, answer?.optionId);
    if (option?.modality && option.modality in counts) {
      counts[option.modality] += 1;
    }
  }

  // Array.prototype.sort is stable, and MODALITIES is the initial order.
  const ranked = [...MODALITIES].sort((a, b) => counts[b] - counts[a]);
  const [dominant, second] = ranked;

  return {
    dominant,
    secondary: second && counts[second] > 0 ? second : null,
  };
}

/**
 * The secondary modality is stored in localStorage under "apprender.vakSecondary".
 * It is browser-local: it does NOT follow the child to another device.
 * The server only receives the dominant modality.
 */
export function saveSecondary(userId, secondary) {
  try {
    if (!secondary) {
      localStorage.removeItem(VAK_SECONDARY_KEY);
      return;
    }
    localStorage.setItem(VAK_SECONDARY_KEY, JSON.stringify({ userId, secondary }));
  } catch {
    // Storage can be unavailable (private mode). The secondary modality is optional.
  }
}

/**
 * Returns the stored secondary modality only if it belongs to `userId`.
 * Returns null on mismatch, missing data, or a parse failure.
 */
export function readSecondary(userId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(VAK_SECONDARY_KEY));
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.userId !== userId) return null;
    return MODALITIES.includes(parsed.secondary) ? parsed.secondary : null;
  } catch {
    return null;
  }
}

/** Removes the stored secondary modality (for example on logout). */
export function clearSecondary() {
  try {
    localStorage.removeItem(VAK_SECONDARY_KEY);
  } catch {
    // Ignore storage failures.
  }
}
