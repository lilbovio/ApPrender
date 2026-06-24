import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import Layout from "../../components/layout/Layout";
import { apiRequest } from "../../services/api";

/**
 * Badge definitions matching server-side
 */
const ACHIEVEMENT_BADGES = [
  {
    id: 1,
    name: "Primera Victoria",
    description: "¡Has completado tu primera lección!",
    icon: "🌟",
    criteria: { type: "lessons_completed", value: 1 }
  },
  {
    id: 2,
    name: "Racha Ardiente",
    description: "¡3 días seguidos aprendiendo!",
    icon: "🔥",
    criteria: { type: "streak", value: 3 }
  },
  {
    id: 3,
    name: "Maestro Matemático",
    description: "¡Dominaste todas las lecciones de matemáticas!",
    icon: "🎯",
    criteria: { type: "subject_completed", value: 5, subject: "math" }
  },
  {
    id: 4,
    name: "Explorador de Inglés",
    description: "¡Completaste todas las lecciones de inglés!",
    icon: "🌍",
    criteria: { type: "subject_completed", value: 5, subject: "english" }
  },
  {
    id: 5,
    name: "Súper Estudiante",
    description: "¡Completaste TODAS las lecciones!",
    icon: "🏆",
    criteria: { type: "all_lessons_completed", value: 10 }
  }
];

/**
 * Calculate which badges the user has earned
 */
const calculateEarnedBadges = (totalCompleted, mathCompleted, englishCompleted, mathStreak, englishStreak) => {
  const maxStreak = Math.max(mathStreak, englishStreak);
  
  return ACHIEVEMENT_BADGES.filter(badge => {
    const { criteria } = badge;
    
    switch (criteria.type) {
      case "lessons_completed":
        return totalCompleted >= criteria.value;
      
      case "streak":
        return maxStreak >= criteria.value;
      
      case "subject_completed":
        if (criteria.subject === "math") {
          return mathCompleted >= criteria.value;
        } else if (criteria.subject === "english") {
          return englishCompleted >= criteria.value;
        }
        return false;
      
      case "all_lessons_completed":
        return totalCompleted >= criteria.value;
      
      default:
        return false;
    }
  });
};

/**
 * Home — Dashboard principal con diseño gamificado
 */
const Home = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [mathProgress, setMathProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [englishProgress, setEnglishProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [stats, setStats] = useState({ xp: 0, streak: 0, level: 1, badges: 0 });
  const [loading, setLoading] = useState(true);
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
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
        const mathCompleted = mathLessonsData.filter(lesson => mathCompletedIds.includes(lesson._id)).length;
        const mathTotal = mathLessonsData.length;
        setMathProgress({
          completed: mathCompleted,
          total: mathTotal,
          percentage: mathTotal > 0 ? Math.round((mathCompleted / mathTotal) * 100) : 0
        });

        // Process English
        const englishCompletedIds = englishProgressData.completedLessons?.map(l => typeof l === 'object' ? l._id : l) || [];
        const englishCompleted = englishLessonsData.filter(lesson => englishCompletedIds.includes(lesson._id)).length;
        const englishTotal = englishLessonsData.length;
        setEnglishProgress({
          completed: englishCompleted,
          total: englishTotal,
          percentage: englishTotal > 0 ? Math.round((englishCompleted / englishTotal) * 100) : 0
        });

        // Calculate combined stats
        const totalXP = (mathProgressData.xp || 0) + (englishProgressData.xp || 0);
        const totalCompleted = mathCompleted + englishCompleted;
        const totalLessons = 10; // 5 Math + 5 English
        
        // NEW: Level based on lesson completion (1 level per 2 lessons)
        const currentLevel = Math.floor(totalCompleted / 2) + 1; // Levels 1-6
        
        // Calculate badges earned
        const badges = calculateEarnedBadges(totalCompleted, mathCompleted, englishCompleted, mathProgressData.streak, englishProgressData.streak);
        
        setStats({
          xp: totalXP,
          streak: Math.max(mathProgressData.streak || 0, englishProgressData.streak || 0),
          level: currentLevel,
          badges: badges.length,
          totalLessons,
          totalCompleted,
          level: Math.floor(totalXP / 200) + 1, // Simple level calculation
          badges: Math.floor(totalCompleted / 5), // 1 badge per 5 lessons
          mathCompleted,
          englishCompleted
        });
        
        setEarnedBadges(badges);
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

  // NEW: Level progress based on lessons completed (not XP)
  const totalLessons = 10; // 5 Math + 5 English
  const totalCompleted = mathProgress.completed + englishProgress.completed;
  const lessonsInCurrentLevel = totalCompleted % 2; // 2 lessons per level
  const levelProgress = (lessonsInCurrentLevel / 2) * 100; // Progress to next level (0-100%)
  const nextLevelAt = (Math.floor(totalCompleted / 2) + 1) * 2; // Next level milestone

  if (loading) {
    return (
      <Layout user={user} stats={stats}>
        <div className={styles.loading}>Cargando...</div>
      </Layout>
    );
  }

  return (
    <Layout user={user} stats={stats}>
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
              <span className={styles.xpText}>
                {totalCompleted} / {totalLessons} lecciones
              </span>
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
                {totalCompleted < totalLessons
                  ? `${nextLevelAt - totalCompleted} lecciones para nivel ${stats.level + 1}`
                  : "¡Nivel máximo!"}
              </span>
            </div>
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
            {ACHIEVEMENT_BADGES.map((badge) => {
              const isUnlocked = earnedBadges.some(b => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`${styles.badgeItem} ${!isUnlocked ? styles.locked : ''}`}
                  title={isUnlocked ? badge.description : "🔒 Bloqueado"}
                >
                  {isUnlocked && <div className={styles.badgeCheck}>✓</div>}
                  <span className={styles.badgeEmoji}>
                    {isUnlocked ? badge.icon : "❌"}
                  </span>
                  <div className={styles.badgeName}>
                    {isUnlocked ? badge.name : "???"}
                  </div>
                </div>
              );
            })}
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
    </Layout>
  );
};

export default Home;