import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

import { apiRequest } from "../../services/api";

/**
 * Home — Dashboard principal con diseño gamificado
 */
const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mathLessons, setMathLessons] = useState([]);
  const [englishLessons, setEnglishLessons] = useState([]);
  const [mathProgress, setMathProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [englishProgress, setEnglishProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [stats, setStats] = useState({ xp: 0, streak: 0, level: 1, badges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const fetchHomeData = async () => {
      try {
        // Fetch both math and english lessons and progress
        const [mathLessonsData, englishLessonsData, mathProgressData, englishProgressData] = await Promise.all([
          apiRequest("/lessons/math"),
          apiRequest("/lessons/english"),
          apiRequest("/progress/math"),
          apiRequest("/progress/english")
        ]);

        // Process Math
        const mathCompletedIds = mathProgressData.completedLessons?.map(l => typeof l === 'object' ? l._id : l) || [];
        const mathWithStatus = mathLessonsData.map(lesson => ({
          ...lesson,
          completed: mathCompletedIds.includes(lesson._id),
          progress: mathCompletedIds.includes(lesson._id) ? 100 : 0
        }));
        setMathLessons(mathWithStatus);
        
        const mathCompleted = mathWithStatus.filter(l => l.completed).length;
        const mathTotal = mathWithStatus.length;
        setMathProgress({
          completed: mathCompleted,
          total: mathTotal,
          percentage: mathTotal > 0 ? Math.round((mathCompleted / mathTotal) * 100) : 0
        });

        // Process English
        const englishCompletedIds = englishProgressData.completedLessons?.map(l => typeof l === 'object' ? l._id : l) || [];
        const englishWithStatus = englishLessonsData.map(lesson => ({
          ...lesson,
          completed: englishCompletedIds.includes(lesson._id),
          progress: englishCompletedIds.includes(lesson._id) ? 100 : 0
        }));
        setEnglishLessons(englishWithStatus);
        
        const englishCompleted = englishWithStatus.filter(l => l.completed).length;
        const englishTotal = englishWithStatus.length;
        setEnglishProgress({
          completed: englishCompleted,
          total: englishTotal,
          percentage: englishTotal > 0 ? Math.round((englishCompleted / englishTotal) * 100) : 0
        });

        // Calculate combined stats
        const totalXP = (mathProgressData.xp || 0) + (englishProgressData.xp || 0);
        const totalCompleted = mathCompleted + englishCompleted;
        
        setStats({
          xp: totalXP,
          streak: Math.max(mathProgressData.streak || 0, englishProgressData.streak || 0),
          level: Math.floor(totalXP / 200) + 1, // Simple level calculation
          badges: Math.floor(totalCompleted / 5) // 1 badge per 5 lessons
        });
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSubjectClick = (subject) => {
    navigate(`/subjects?subject=${subject}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días";
    if (hour < 18) return "¡Buenas tardes";
    return "¡Buenas noches";
  };

  const levelProgress = (stats.xp % 200) / 200 * 100; // Progress to next level

  if (loading) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      {/* Decorative Clouds */}
      <div className={styles.cloud1}></div>
      <div className={styles.cloud2}></div>
      <div className={styles.cloud3}></div>

      <div className={styles.contentWrapper}>
        {/* Hero Banner */}
        <div className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <h1>{getGreeting()}, {user?.name || "Estudiante"}!</h1>
            <p>¿Listo para descubrir cosas asombrosas hoy?</p>
            <button
              className={styles.specialMissionBtn}
              onClick={() => navigate("/learn")}
            >
              🚀 Iniciar Misión Especial
            </button>
          </div>
          <div className={styles.heroAvatar}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" />
            ) : (
              "🤖"
            )}
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className={styles.levelCard}>
          <div className={styles.levelHeader}>
            <div className={styles.levelInfo}>
              <span className={styles.levelLabel}>Nivel {stats.level}</span>
              <span className={styles.xpText}>{stats.xp} XP</span>
            </div>
            <div className={styles.streakBadge}>
              🔥 {stats.streak} días
            </div>
          </div>
          <div className={styles.levelBarContainer}>
            <div
              className={styles.levelBarFill}
              style={{ width: `${levelProgress}%` }}
            >
              <span className={styles.levelBarText}>
                {Math.round(levelProgress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Notification Card */}
        <div className={styles.notificationCard}>
          <div className={styles.notificationIcon}>💬</div>
          <div className={styles.notificationText}>
            ¡Hola de nuevo! Hoy es un gran día para descubrir matemáticas galácticas o explorar el espacio. 🚀
          </div>
          <div className={styles.notificationAction}>
            Saludar 👋
          </div>
        </div>

        {/* Daily Mission */}
        <div className={styles.dailyMission}>
          <div className={styles.missionIcon}>💻</div>
          <div className={styles.missionContent}>
            <h3>Misión del día 🎯</h3>
            <p>¿Listo para el desafío de hoy? ¡Repasa vocabulario y suma racha!</p>
          </div>
          <button className={styles.acceptBtn}>ACEPTAR</button>
        </div>

        {/* Subjects Section */}
        <h2 className={styles.sectionTitle}>Tus Materias</h2>
        <div className={styles.subjectsGrid}>
          {/* Math Card */}
          <div
            className={`${styles.subjectCard} ${styles.math}`}
            onClick={() => handleSubjectClick("math")}
          >
            <div className={styles.subjectHeader}>
              <div className={styles.subjectIconBox}>🔢</div>
              <div className={styles.subjectInfo}>
                <h3>Matemáticas</h3>
                <div className={styles.subjectPercentage}>{mathProgress.percentage}%</div>
              </div>
            </div>
            <div className={styles.subjectProgressBar}>
              <div
                className={styles.subjectProgressFill}
                style={{ width: `${mathProgress.percentage}%` }}
              ></div>
            </div>
            <div className={styles.subjectDetails}>
              {mathProgress.completed} de {mathProgress.total} lecciones
            </div>
            <button className={styles.learnBtn}>
              ¡Aprender! →
            </button>
          </div>

          {/* English Card */}
          <div
            className={`${styles.subjectCard} ${styles.english}`}
            onClick={() => handleSubjectClick("english")}
          >
            <div className={styles.subjectHeader}>
              <div className={styles.subjectIconBox}>🌍</div>
              <div className={styles.subjectInfo}>
                <h3>Inglés</h3>
                <div className={styles.subjectPercentage}>{englishProgress.percentage}%</div>
              </div>
            </div>
            <div className={styles.subjectProgressBar}>
              <div
                className={styles.subjectProgressFill}
                style={{ width: `${englishProgress.percentage}%` }}
              ></div>
            </div>
            <div className={styles.subjectDetails}>
              {englishProgress.completed} de {englishProgress.total} lecciones
            </div>
            <button className={styles.learnBtn}>
              Practicar →
            </button>
          </div>
        </div>

        {/* Badges Section */}
        <div className={styles.badgesSection}>
          <div className={styles.badgesHeader}>
            <h2 className={styles.sectionTitle}>Tus Insignias</h2>
            <div
              className={styles.viewAll}
              onClick={() => navigate("/profile")}
            >
              Ver catálogo completo
            </div>
          </div>
          <div className={styles.badgesGrid}>
            {[...Array(Math.min(stats.badges, 2))].map((_, i) => (
              <div key={i} className={styles.badgeItem}>
                <div className={styles.badgeCheck}>✓</div>
                <span className={styles.badgeEmoji}>
                  {i === 0 ? "🏆" : "🌟"}
                </span>
              </div>
            ))}
            {[...Array(Math.max(3, 5 - stats.badges))].map((_, i) => (
              <div key={`locked-${i}`} className={`${styles.badgeItem} ${styles.locked}`}>
                <span className={styles.badgeEmoji}>❌</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goal Widget */}
        <div className={styles.weeklyGoal}>
          <h3>🎯 Meta de la semana</h3>
          <p>¡Completa 2 misiones más para abrir el cofre mágico!</p>
          <div className={styles.weeklyProgress}>
            <span>PROGRESO</span>
            <span>{Math.min(mathProgress.completed + englishProgress.completed, 5)}/5</span>
          </div>
          <div className={styles.weeklyBar}>
            <div
              className={styles.weeklyBarFill}
              style={{ width: `${Math.min((mathProgress.completed + englishProgress.completed) / 5 * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;