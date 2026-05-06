import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

/**
 * Home — Dashboard principal (Enfocado en Inglés)
 * Muestra: progreso, racha, logros y temas de inglés
 * MODO DEMO: Datos simulados para navegar sin backend
 */
const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState({ xp: 0, streak: 0 });

  useEffect(() => {
    // Cargar datos desde localStorage (simulado en Login)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Datos DEMO de lecciones de Inglés
    const demoLessons = [
      {
        id: 1,
        title: "Saludos y Presentación",
        icon: "👋",
        xp: 50,
        completed: true,
        progress: 100,
        grade: "Grado 1",
      },
      {
        id: 2,
        title: "Números del 1-10",
        icon: "🔢",
        xp: 75,
        completed: true,
        progress: 100,
        grade: "Grado 1",
      },
      {
        id: 3,
        title: "Colores Básicos",
        icon: "🎨",
        xp: 60,
        completed: false,
        progress: 65,
        grade: "Grado 1",
      },
      {
        id: 4,
        title: "Animales Comunes",
        icon: "🐶",
        xp: 80,
        completed: false,
        progress: 30,
        grade: "Grado 2",
      },
      {
        id: 5,
        title: "Partes del Cuerpo",
        icon: "👨",
        xp: 70,
        completed: false,
        progress: 0,
        grade: "Grado 2",
      },
      {
        id: 6,
        title: "Comidas y Bebidas",
        icon: "🍎",
        xp: 85,
        completed: false,
        progress: 0,
        grade: "Grado 2",
      },
    ];

    setLessons(demoLessons);

    // Stats demo
    setStats({
      xp: 1250,
      streak: 7,
    });
  }, []);

  const handleLessonClick = (lessonId) => {
    // Navegar a detalles de la lección
    navigate(`/learn?lesson=${lessonId}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días!";
    if (hour < 18) return "¡Buenas tardes!";
    return "¡Buenas noches!";
  };

  const completedLessons = lessons.filter((l) => l.completed).length;
  const totalLessons = lessons.length;
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className={styles.homeContainer}>
      {/* Header con saludo */}
      <div className={styles.header}>
        <div className={styles.greeting}>
          <div className={styles.greetingText}>
            <h2>{getGreeting()}</h2>
            <p>{user?.name || "Estudiante"} 👋</p>
          </div>
          <div
            className={styles.profileIcon}
            onClick={() => navigate("/profile")}
            title="Ir al perfil"
          >
            👤
          </div>
        </div>
      </div>

      {/* Stats Grid - XP y Racha */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⚡</div>
          <p className={styles.statValue}>{stats.xp}</p>
          <p className={styles.statLabel}>Puntos XP</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <p className={styles.statValue}>{stats.streak}</p>
          <p className={styles.statLabel}>Racha</p>
        </div>
      </div>

      {/* Progress Card - Inglés */}
      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <h3>📚 Inglés</h3>
          <span className={styles.progressPercentage}>{overallProgress}%</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className={styles.progressText}>
          {completedLessons} de {totalLessons} lecciones completadas
        </p>
      </div>

      {/* CTA Button */}
      <button className={styles.ctaButton} onClick={() => handleLessonClick(3)}>
        🎯 Continuar Aprendiendo
      </button>

      {/* Lecciones por Grado */}
      <h3 className={styles.sectionTitle}>📖 Tus Lecciones</h3>

      {/* Grado 1 */}
      <h4 className={styles.gradeTitle}>🎯 Grado 1</h4>
      <div className={styles.lessonsContainer}>
        {lessons
          .filter((l) => l.grade === "Grado 1")
          .map((lesson) => (
            <div
              key={lesson.id}
              className={`${styles.lessonCard} ${
                lesson.completed ? styles.lessonCompleted : ""
              }`}
              onClick={() => handleLessonClick(lesson.id)}
            >
              <div className={styles.lessonHeader}>
                <div className={styles.lessonIcon}>{lesson.icon}</div>
                <div className={styles.lessonInfo}>
                  <p className={styles.lessonTitle}>{lesson.title}</p>
                  <p className={styles.lessonSubtitle}>+{lesson.xp} XP</p>
                </div>
                {lesson.completed && (
                  <div className={styles.completedBadge}>✓</div>
                )}
              </div>
              <div className={styles.lessonProgressBar}>
                <div
                  className={styles.lessonProgressFill}
                  style={{ width: `${lesson.progress}%` }}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Grado 2 */}
      <h4 className={styles.gradeTitle}>⭐ Grado 2</h4>
      <div className={styles.lessonsContainer}>
        {lessons
          .filter((l) => l.grade === "Grado 2")
          .map((lesson) => (
            <div
              key={lesson.id}
              className={`${styles.lessonCard} ${
                lesson.completed ? styles.lessonCompleted : ""
              }`}
              onClick={() => handleLessonClick(lesson.id)}
            >
              <div className={styles.lessonHeader}>
                <div className={styles.lessonIcon}>{lesson.icon}</div>
                <div className={styles.lessonInfo}>
                  <p className={styles.lessonTitle}>{lesson.title}</p>
                  <p className={styles.lessonSubtitle}>+{lesson.xp} XP</p>
                </div>
                {lesson.completed && (
                  <div className={styles.completedBadge}>✓</div>
                )}
              </div>
              <div className={styles.lessonProgressBar}>
                <div
                  className={styles.lessonProgressFill}
                  style={{ width: `${lesson.progress}%` }}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Actividad Reciente */}
      <h3 className={styles.sectionTitle}>✨ Logros Recientes</h3>
      <div>
        <div className={styles.activityCard}>
          <p className={styles.activityTitle}>🏆 Hablador Seguro</p>
          <p className={styles.activitySubtitle}>
            Ganado hace 2 días · +50 XP
          </p>
        </div>

        <div className={styles.activityCard}>
          <p className={styles.activityTitle}>🔥 7 días de racha</p>
          <p className={styles.activitySubtitle}>
            ¡Mantén el momentum! Hoy ya completaste 2 lecciones
          </p>
        </div>

        <div className={styles.activityCard}>
          <p className={styles.activityTitle}>🌟 Nivel 5: Estudiante Dedicado</p>
          <p className={styles.activitySubtitle}>
            Subiste de nivel hace 1 semana
          </p>
        </div>
      </div>

      {/* Footer con tip */}
      <div
        style={{
          marginTop: 24,
          padding: "16px",
          background: "linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid rgba(124, 58, 237, 0.2)",
          textAlign: "center",
          fontSize: "13px",
          color: "var(--text-secondary)",
        }}
      >
        💡 <strong>Tip:</strong> Completa todas las lecciones y desbloquea nuevos temas
      </div>
    </div>
  );
};

export default Home;