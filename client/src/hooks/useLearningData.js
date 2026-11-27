import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

// Loads lessons and progress for both subjects in parallel.
// Each piece that fails falls back to an empty value; status is "error" only if all four fail.

const EMPTY_PROGRESS = { completedLessons: [], xp: 0, streak: 0 };
const EMPTY_LESSONS = { math: [], english: [] };
const EMPTY_PROGRESS_BY_SUBJECT = { math: EMPTY_PROGRESS, english: EMPTY_PROGRESS };

function settledValue(result) {
  return result.status === "fulfilled" ? result.value : null;
}

function toLessonList(value) {
  return Array.isArray(value) ? value : [];
}

function toProgress(value) {
  if (!value || typeof value !== "object") return { ...EMPTY_PROGRESS, completedLessons: [] };
  return {
    completedLessons: Array.isArray(value.completedLessons) ? value.completedLessons : [],
    xp: Number(value.xp) || 0,
    streak: Number(value.streak) || 0,
  };
}

export default function useLearningData() {
  const [state, setState] = useState({
    status: "loading",
    lessons: EMPTY_LESSONS,
    progress: EMPTY_PROGRESS_BY_SUBJECT,
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => (prev.status === "loading" ? prev : { ...prev, status: "loading" }));

    Promise.allSettled([
      apiRequest("/lessons/math"),
      apiRequest("/lessons/english"),
      apiRequest("/progress/math"),
      apiRequest("/progress/english"),
    ]).then(([lessonsMath, lessonsEnglish, progressMath, progressEnglish]) => {
      if (cancelled) return;

      const results = [lessonsMath, lessonsEnglish, progressMath, progressEnglish];
      if (results.every((result) => result.status === "rejected")) {
        setState({ status: "error", lessons: EMPTY_LESSONS, progress: EMPTY_PROGRESS_BY_SUBJECT });
        return;
      }

      setState({
        status: "ready",
        lessons: {
          math: toLessonList(settledValue(lessonsMath)),
          english: toLessonList(settledValue(lessonsEnglish)),
        },
        progress: {
          math: toProgress(settledValue(progressMath)),
          english: toProgress(settledValue(progressEnglish)),
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const totals = useMemo(
    () => ({
      xp: state.progress.math.xp + state.progress.english.xp,
      streak: Math.max(state.progress.math.streak, state.progress.english.streak),
    }),
    [state.progress]
  );

  return {
    status: state.status,
    lessons: state.lessons,
    progress: state.progress,
    totals,
    reload,
  };
}
