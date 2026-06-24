import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import styles from "./Learn.module.css";

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchLessonAndUser = async () => {
      setLoading(true);
      try {
        // Fetch lesson data
        const lessonData = await apiRequest(`/lessons/lesson/${lessonId}`);
        setLesson(lessonData);

        // Fetch user data to get VAK type
        const userData = await apiRequest('/users/profile');
        setUser(userData);
      } catch (err) {
        console.error("Error fetching lesson:", err);
        setError("No se pudo cargar la lección");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndUser();
  }, [lessonId]);

  const handleAnswerSelect = (exerciseId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [exerciseId]: answer
    }));
  };

  const handleSubmit = async () => {
    setShowResults(true);
    
    // Calculate score
    const vakContent = getVAKContent();
    const exercises = vakContent?.exercises || [];
    let correctCount = 0;
    
    exercises.forEach((exercise, index) => {
      if (userAnswers[index] === exercise.correctAnswer) {
        correctCount++;
      }
    });

    const score = exercises.length > 0 ? (correctCount / exercises.length) * 100 : 0;

    // Submit progress to backend
    try {
      await apiRequest('/progress/update', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: lesson._id,
          subject: lesson.subject,
          score: score,
          completed: score >= 70 // Consider completed if score >= 70%
        })
      });
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentExerciseIndex(0);
  };

  const handleBackToLessons = () => {
    navigate('/learn');
  };

  const getVAKContent = () => {
    if (!lesson || !user) return null;
    
    const vakType = user.vakType || 'visual';
    return lesson.content[vakType] || lesson.content.visual;
  };

  if (loading) {
    return (
      <div className={styles.learnContainer}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Cargando lección...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className={styles.learnContainer}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--error)' }}>{error || "Lección no encontrada"}</p>
          <button onClick={handleBackToLessons} className={styles.backButton}>
            Volver a Lecciones
          </button>
        </div>
      </div>
    );
  }

  const vakContent = getVAKContent();
  const exercises = vakContent?.exercises || [];

  return (
    <div className={styles.lessonViewContainer}>
      {/* Header */}
      <div className={styles.lessonHeader}>
        <button onClick={handleBackToLessons} className={styles.backButton}>
          ← Volver
        </button>
        <div className={styles.lessonHeaderInfo}>
          <span className={styles.lessonIcon}>{lesson.icon}</span>
          <div>
            <h1 className={styles.lessonTitle}>{lesson.title}</h1>
            <p className={styles.lessonDescription}>{lesson.description}</p>
          </div>
        </div>
        <div className={styles.lessonMeta}>
          <span className={styles.xpBadge}>+{lesson.xp} XP</span>
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.lessonContent}>
        {vakContent?.explanation && (
          <div className={styles.explanationSection}>
            <h2 className={styles.sectionTitle}>📖 Explicación</h2>
            <div className={styles.explanationText}>
              {vakContent.explanation}
            </div>
          </div>
        )}

        {/* Exercises Section */}
        {exercises.length > 0 && (
          <div className={styles.exercisesSection}>
            <h2 className={styles.sectionTitle}>✏️ Ejercicios</h2>
            
            {exercises.map((exercise, index) => (
              <div key={index} className={styles.exerciseCard}>
                <div className={styles.exerciseHeader}>
                  <span className={styles.exerciseNumber}>Ejercicio {index + 1}</span>
                  {showResults && (
                    <span className={
                      userAnswers[index] === exercise.correctAnswer 
                        ? styles.correctBadge 
                        : styles.incorrectBadge
                    }>
                      {userAnswers[index] === exercise.correctAnswer ? '✓ Correcto' : '✗ Incorrecto'}
                    </span>
                  )}
                </div>
                
                <p className={styles.exerciseQuestion}>{exercise.question}</p>
                
                <div className={styles.optionsGrid}>
                  {exercise.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      className={`${styles.optionButton} ${
                        userAnswers[index] === option ? styles.selected : ''
                      } ${
                        showResults && option === exercise.correctAnswer 
                          ? styles.correctOption 
                          : ''
                      } ${
                        showResults && userAnswers[index] === option && option !== exercise.correctAnswer
                          ? styles.incorrectOption
                          : ''
                      }`}
                      onClick={() => !showResults && handleAnswerSelect(index, option)}
                      disabled={showResults}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {showResults && exercise.explanation && (
                  <div className={styles.exerciseExplanation}>
                    <strong>💡 Explicación:</strong> {exercise.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {!showResults ? (
            <button 
              onClick={handleSubmit} 
              className={styles.submitButton}
              disabled={Object.keys(userAnswers).length !== exercises.length}
            >
              Enviar Respuestas
            </button>
          ) : (
            <div className={styles.resultsActions}>
              <button onClick={handleRetry} className={styles.retryButton}>
                🔄 Intentar de Nuevo
              </button>
              <button onClick={handleBackToLessons} className={styles.continueButton}>
                ✓ Continuar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;

// Made with Bob
