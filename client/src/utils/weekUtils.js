// Weekly lesson count, recorded on this device. Plain JS, no React.
//
// Browser-local only: the server stores no completion dates, so this record is never
// synced and is lost if the browser storage is cleared. It holds one week for one user.
// A new week or a different user replaces the record, which resets the count.

export const WEEKLY_GOAL = 5;

const WEEK_KEY = "apprender.week";

/** Local-calendar Monday of the week containing `date`, as "YYYY-MM-DD". */
function mondayKey(date = new Date()) {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offsetFromMonday = (day.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  day.setDate(day.getDate() - offsetFromMonday);
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, "0");
  const d = String(day.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function readWeek() {
  try {
    const parsed = JSON.parse(localStorage.getItem(WEEK_KEY));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeWeek(value) {
  try {
    localStorage.setItem(WEEK_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode): the goal simply does not show.
  }
}

/** Records a completed lesson for this week and user. Duplicates are ignored. */
export function recordLessonThisWeek(userId, lessonId) {
  if (!userId || !lessonId) return;

  const weekStart = mondayKey();
  const stored = readWeek();
  const sameWeek = stored && stored.userId === userId && stored.weekStart === weekStart;
  const known = sameWeek && Array.isArray(stored.lessonIds) ? stored.lessonIds.map(String) : [];
  const id = String(lessonId);

  writeWeek({
    userId,
    weekStart,
    lessonIds: known.includes(id) ? known : [...known, id],
  });
}

/** Number of distinct lessons completed this week by `userId`; 0 for another week or user. */
export function lessonsThisWeek(userId) {
  if (!userId) return 0;
  const stored = readWeek();
  if (!stored || stored.userId !== userId || stored.weekStart !== mondayKey()) return 0;
  return Array.isArray(stored.lessonIds) ? stored.lessonIds.length : 0;
}
