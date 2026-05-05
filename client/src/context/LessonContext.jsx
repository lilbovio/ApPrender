import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

/**
 * LessonContext
 * Maneja: lecciones disponibles, progreso, lección activa, completar lección.
 */

const LessonContext = createContext(null);

export function LessonProvider({ children }) {
  const { token, user } = useAuth();

  const [lessons, setLessons] = useState([]);           // todas las lecciones del grado
  const [todayLessons, setTodayLessons] = useState([]); // lecciones del día
  const [activeLesson, setActiveLesson] = useState(null); // lección que se está jugando
  const [progress, setProgress] = useState({});         // { [lessonId]: { completed, score, attempts } }
  const [loadingLessons, setLoadingLessons] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Cargar lecciones según grado y tipo VAK del niño
  const fetchLessons = useCallback(async (subject) => {
    if (!user) return;
    setLoadingLessons(true);
    try {
      const res = await api.get("/lessons", {
        headers: authHeaders,
        params: {
          grade: user.grade,
          vakType: user.vakType,
          subject, // "math" | "english" | undefined (ambas)
        },
      });
      setLessons(res.data.lessons || []);
    } finally {
      setLoadingLessons(false);
    }
  }, [user, token]);

  // Lecciones del día (las siguientes no completadas)
  const fetchTodayLessons = useCallback(async (subject) => {
    if (!user) return;
    const res = await api.get("/lessons/today", {
      headers: authHeaders,
      params: { grade: user.grade, vakType: user.vakType, subject },
    });
    setTodayLessons(res.data.lessons || []);
    setProgress(res.data.progress || {});
  }, [user, token]);

  // Iniciar una lección (cargar preguntas)
  const startLesson = useCallback(async (lessonId) => {
    const res = await api.get(`/lessons/${lessonId}`, { headers: authHeaders });
    setActiveLesson(res.data.lesson);
    return res.data.lesson;
  }, [token]);

  // Completar una lección y guardar progreso
  const completeLesson = useCallback(async (lessonId, { score, correctAnswers, totalQuestions, timeSpent }) => {
    const res = await api.post(
      `/lessons/${lessonId}/complete`,
      { score, correctAnswers, totalQuestions, timeSpent },
      { headers: authHeaders }
    );
    const { xpEarned, newBadges, updatedProgress } = res.data;

    // Actualizar progreso local
    setProgress((prev) => ({
      ...prev,
      [lessonId]: updatedProgress,
    }));

    // Marcar como completada en la lista
    setLessons((prev) =>
      prev.map((l) => l._id === lessonId ? { ...l, ...updatedProgress } : l)
    );
    setTodayLessons((prev) =>
      prev.map((l) => l._id === lessonId ? { ...l, ...updatedProgress } : l)
    );

    setActiveLesson(null);
    return { xpEarned, newBadges };
  }, [token]);

  const clearActiveLesson = useCallback(() => setActiveLesson(null), []);

  // Progreso de una lección específica
  const getLessonProgress = useCallback(
    (lessonId) => progress[lessonId] || { completed: false, score: 0, attempts: 0 },
    [progress]
  );

  const value = {
    lessons,
    todayLessons,
    activeLesson,
    progress,
    loadingLessons,
    fetchLessons,
    fetchTodayLessons,
    startLesson,
    completeLesson,
    clearActiveLesson,
    getLessonProgress,
  };

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}

export function useLesson() {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error("useLesson debe usarse dentro de <LessonProvider>");
  return ctx;
}

export default LessonContext;