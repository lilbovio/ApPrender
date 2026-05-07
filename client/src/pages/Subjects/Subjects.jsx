import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import styles from "./Subjects.module.css";

const Subjects = () => {
  const navigate = useNavigate();
  const [englishStats, setEnglishStats] = useState({ completed: 0, total: 10, percent: 0 });
  const [mathStats, setMathStats] = useState({ completed: 0, total: 10, percent: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [engLessons, mathLessons, engProg, mathProg] = await Promise.all([
          apiRequest("/lessons/english"),
          apiRequest("/lessons/math"),
          apiRequest("/progress/english"),
          apiRequest("/progress/math"),
        ]);

        const engTotal = engLessons.length || 1;
        const engComp = engProg.completedLessons ? engProg.completedLessons.length : 0;
        setEnglishStats({
          completed: engComp,
          total: engTotal,
          percent: Math.round((engComp / engTotal) * 100),
        });

        const mathTotal = mathLessons.length || 1;
        const mathComp = mathProg.completedLessons ? mathProg.completedLessons.length : 0;
        setMathStats({
          completed: mathComp,
          total: mathTotal,
          percent: Math.round((mathComp / mathTotal) * 100),
        });
      } catch (err) {
        console.error("Error fetching subject progress:", err);
      }
    };
    fetchStats();
  }, []);

  const handleSubjectClick = () => {
    navigate("/learn");
  };

  return (
    <div className={styles.subjectsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tus Materias</h1>
        <p className={styles.subtitle}>Mira tu progreso en cada área</p>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.subjectCard} ${styles.english}`} onClick={handleSubjectClick}>
          <div className={styles.iconWrapper}>🌍</div>
          <div className={styles.info}>
            <h2 className={styles.subjectName}>Inglés</h2>
            <p className={styles.subjectDesc}>{englishStats.completed} de {englishStats.total} lecciones completadas</p>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar} style={{ width: `${englishStats.percent}%` }} />
            </div>
          </div>
        </div>

        <div className={`${styles.subjectCard} ${styles.math}`} onClick={handleSubjectClick}>
          <div className={styles.iconWrapper}>🧮</div>
          <div className={styles.info}>
            <h2 className={styles.subjectName}>Matemáticas</h2>
            <p className={styles.subjectDesc}>{mathStats.completed} de {mathStats.total} lecciones completadas</p>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar} style={{ width: `${mathStats.percent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subjects;