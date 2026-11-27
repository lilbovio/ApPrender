// Lesson and progress helpers. Plain JS, no React.

export const SUBJECTS = {
  math: { key: "math", name: "Matemáticas", icon: "apple", tone: "math" },
  english: { key: "english", name: "Inglés", icon: "book", tone: "english" },
};

export const LAST_SUBJECT_KEY = "apprender.lastSubject";

// lesson.content keys differ from the vakType values stored on the user.
export const VAK_CONTENT_KEY = {
  visual: "visual",
  auditivo: "auditory",
  kinestesico: "kinesthetic",
};

/** Removes leading emoji/symbols so titles like "🔢 Suma Básica" read as "Suma Básica". */
export function cleanTitle(title) {
  return String(title || "").replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

/** Accepts a plain ObjectId string or a populated lesson object. */
export function idOf(x) {
  return typeof x === "object" && x ? String(x._id) : String(x);
}

export function completedSet(progress) {
  const ids = new Set();
  (progress?.completedLessons || []).forEach((item) => ids.add(idOf(item)));
  return ids;
}

/** First lesson (in server order) that the user has not completed, or null. */
export function nextLesson(lessons, progress) {
  const done = completedSet(progress);
  return (lessons || []).find((lesson) => !done.has(idOf(lesson._id))) || null;
}

export function rememberSubject(subject) {
  try {
    localStorage.setItem(LAST_SUBJECT_KEY, subject);
  } catch {
    // Storage can be unavailable (private mode); the default subject is used instead.
  }
}

export function lastSubject() {
  try {
    const stored = localStorage.getItem(LAST_SUBJECT_KEY);
    return stored && SUBJECTS[stored] ? stored : "math";
  } catch {
    return "math";
  }
}

/** Level derived from XP: one level every 100 XP, starting at level 1. */
export function levelFor(xp) {
  return Math.floor((Number(xp) || 0) / 100) + 1;
}

/** Time-aware greeting from the local hour: 5-11 morning, 12-19 afternoon, otherwise night. */
export function greetingFor(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour <= 11) return "Buenos días";
  if (hour >= 12 && hour <= 19) return "Buenas tardes";
  return "Buenas noches";
}
