import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import styles from "./Learn.module.css";

const Learn = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSubject) {
      const fetchLessons = async () => {
        setLoading(true);
        try {
          const data = await apiRequest(`/lessons/${selectedSubject}`);
          setLessons(data);
        } catch (error) {
          console.error("Error fetching lessons:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchLessons();
    }
  }, [selectedSubject]);

  const handleLessonClick = (lessonId) => {
    // Navigate to actual lesson viewer (placeholder path)
    navigate(`/learn/lesson/${lessonId}`);
  };

  return (
    <div className={styles.learnContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>¿Qué quieres aprender hoy?</h1>
        <p className={styles.subtitle}>Toca una materia para empezar</p>
      </div>

      <div className={styles.subjectSelector}>
        <div
          className={`${styles.subjectCard} ${styles.english} ${selectedSubject === "english" ? styles.selected : ""}`}
          onClick={() => setSelectedSubject("english")}
        >
          <span className={styles.subjectIcon}>🌍</span>
          <span className={styles.subjectName}>Inglés</span>
        </div>

        <div
          className={`${styles.subjectCard} ${styles.math} ${selectedSubject === "math" ? styles.selected : ""}`}
          onClick={() => setSelectedSubject("math")}
        >
          <span className={styles.subjectIcon}>🧮</span>
          <span className={styles.subjectName}>Matemáticas</span>
        </div>
      </div>

      {selectedSubject && (
        <div className={styles.lessonsSection}>
          <h2 className={styles.sectionTitle}>
            {selectedSubject === "english" ? "📘 Lecciones de Inglés" : "📕 Lecciones de Matemáticas"}
          </h2>
          
          <div className={styles.lessonList}>
            {loading ? (
              <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>Cargando lecciones...</p>
            ) : lessons.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>No hay lecciones disponibles.</p>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className={styles.lessonCard}
                  onClick={() => handleLessonClick(lesson._id)}
                >
                  <div className={styles.lessonIconWrapper}>
                    {lesson.icon || "📚"}
                  </div>
                  <div className={styles.lessonInfo}>
                    <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                    <p className={styles.lessonDesc}>{lesson.description}</p>
                  </div>
                  <button className={styles.playButton}>▶</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;