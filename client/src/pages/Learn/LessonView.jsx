import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { readSecondary } from "../../utils/vakUtils";
import { SUBJECTS, VAK_CONTENT_KEY, cleanTitle, rememberSubject } from "../../utils/lessonUtils";
import {
  emptyResponse,
  hasResponse,
  hintFor,
  isCorrect,
  normalizeExercise,
  praiseFor,
  revealFor,
  stripEmoji,
} from "../../utils/exerciseUtils";
import { Button, Chip, Icon, InlineError, Pilo, ProgressPath, Screen, SegmentedControl } from "../../components/ui";
import { useShake } from "../../components/ui/useShake";
import { DUR, EASE_UI } from "../../components/ui/motion";
import QuizQuestion from "../../components/lessons/QuizQuestion";
import RewardScreen from "../../components/lessons/RewardScreen";
import styles from "./LessonView.module.css";

/**
 * Second-wrong reveal. Same look as InlineError, but role="status" so the
 * answer is announced politely instead of as an alert.
 */
function RevealBlock({ text, shakeKey }) {
  const controls = useShake(shakeKey);
  return (
    <motion.div role="status" className={styles.revealBlock} animate={controls}>
      <p className={styles.blockTitle}>{text}</p>
    </motion.div>
  );
}

const MODALITY_ORDER = ["visual", "auditory", "kinesthetic"];
const MODALITY_LABEL = { visual: "Mirar", auditory: "Escuchar", kinesthetic: "Hacer" };
const MODALITY_ICON = { visual: "eye", auditory: "ear", kinesthetic: "hand" };

/** Keeps only modalities whose content has at least one recognised exercise. */
function buildModalities(lesson) {
  const result = {};
  for (const modality of MODALITY_ORDER) {
    const content = lesson?.content?.[modality];
    const exercises = Array.isArray(content?.exercises)
      ? content.exercises.map(normalizeExercise).filter(Boolean)
      : [];
    if (exercises.length > 0) {
      result[modality] = {
        title: stripEmoji(content.title) || MODALITY_LABEL[modality],
        description: stripEmoji(content.description),
        exercises,
      };
    }
  }
  return result;
}

// Page-turn between modalities and between exercises. Only opacity under reduced motion.
const pageVariants = (reduce) => ({
  enter: (dir) => (reduce ? { opacity: 0 } : { opacity: 0, x: 12 * dir }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => (reduce ? { opacity: 0 } : { opacity: 0, x: -12 * dir }),
});

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"

  const [stage, setStage] = useState("intro"); // "intro" | "quiz" | "reward"
  const [chosen, setChosen] = useState(null);
  const [direction, setDirection] = useState(1);

  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong" | "reveal"
  const [shakeKey, setShakeKey] = useState(0);
  const [firstTry, setFirstTry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiRequest(`/lessons/lesson/${lessonId}`)
      .then((data) => {
        if (cancelled) return;
        setLesson(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  useEffect(() => {
    if (lesson?.subject) rememberSubject(lesson.subject);
  }, [lesson?.subject]);

  const modalities = useMemo(() => (lesson ? buildModalities(lesson) : {}), [lesson]);
  const availableKeys = MODALITY_ORDER.filter((m) => modalities[m]);

  // Default: the child's VAK profile, then the secondary modality, then the first available one.
  const primary = VAK_CONTENT_KEY[user?.vakType];
  const secondary = VAK_CONTENT_KEY[readSecondary(user?._id)];
  let defaultModality = availableKeys[0] || null;
  if (primary && modalities[primary]) defaultModality = primary;
  else if (secondary && modalities[secondary]) defaultModality = secondary;

  const activeModality = chosen && modalities[chosen] ? chosen : defaultModality;
  const exercises = activeModality ? modalities[activeModality].exercises : [];
  const total = exercises.length;
  const current = exercises[index];

  const chooseModality = (next) => {
    const from = MODALITY_ORDER.indexOf(activeModality);
    const to = MODALITY_ORDER.indexOf(next);
    setDirection(to >= from ? 1 : -1);
    setChosen(next);
  };

  const startQuiz = () => {
    setDirection(1);
    setIndex(0);
    setResponse(emptyResponse(exercises[0]));
    setAttempts(0);
    setFeedback(null);
    setFirstTry(0);
    setStage("quiz");
  };

  const showQuestion = (nextIndex) => {
    setIndex(nextIndex);
    setResponse(emptyResponse(exercises[nextIndex]));
    setAttempts(0);
    setFeedback(null);
  };

  const handleCheck = () => {
    if (!current || feedback === "correct" || feedback === "reveal") return;
    if (isCorrect(current, response)) {
      if (attempts === 0) setFirstTry((n) => n + 1);
      setFeedback("correct");
      return;
    }
    setShakeKey((k) => k + 1);
    if (attempts === 0) {
      setAttempts(1);
      setFeedback("wrong");
    } else {
      setFeedback("reveal");
    }
  };

  const handleNext = () => {
    if (index + 1 < total) {
      setDirection(1);
      showQuestion(index + 1);
    } else {
      setStage("reward");
    }
  };

  const isDone = feedback === "correct" || feedback === "reveal";
  const isLast = index + 1 >= total;

  const pageVariantsFor = pageVariants(reduce);
  const pageTransition = { duration: DUR.screen, ease: EASE_UI };

  if (status === "loading") {
    return (
      <Screen size="lesson" className={styles.page}>
        <p className={styles.status}>Preparando tu lección…</p>
      </Screen>
    );
  }

  if (status === "error" || !defaultModality) {
    return (
      <Screen size="lesson" className={styles.page}>
        <div className={styles.stack}>
          <InlineError>Casi. No pudimos abrir esta lección.</InlineError>
          <Button fullWidth to="/subjects">
            Volver a mis materias
          </Button>
        </div>
      </Screen>
    );
  }

  const subject = SUBJECTS[lesson.subject];

  if (stage === "reward") {
    return (
      <Screen size="lesson" className={styles.page}>
        <RewardScreen
          lesson={lesson}
          firstTry={firstTry}
          total={total}
          onContinue={() => navigate("/home")}
          onSeeBadges={() => navigate("/profile#logros")}
        />
      </Screen>
    );
  }

  if (stage === "quiz") {
    return (
      <Screen size="lesson" className={styles.page}>
        <Pilo size={48} className={styles.pilo} />

        <div className={`${styles.topRow} ${styles.topRowQuiz}`}>
          <Button variant="quiet" iconLeft="back" ariaLabel="Salir de la lección" onClick={() => setStage("intro")} />
          <div className={styles.quizMeta}>
            <Chip tone="neutral" icon={MODALITY_ICON[activeModality]}>
              {MODALITY_LABEL[activeModality]}
            </Chip>
            <span className={styles.counter}>{`${index + 1} / ${total}`}</span>
          </div>
        </div>

        <ProgressPath total={total} current={index} label={`Pregunta ${index + 1} de ${total}`} />

        <div className={styles.quizBody}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={pageVariantsFor}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
            >
              <QuizQuestion
                exercise={current}
                modality={activeModality}
                subject={lesson.subject}
                response={response}
                onResponse={setResponse}
                locked={isDone}
              />
            </motion.div>
          </AnimatePresence>

          <div className={styles.feedback}>
            {feedback === "correct" && (
              <div className={styles.okBlock} role="status">
                <p className={styles.blockTitle}>
                  <Icon name="check" size={20} />
                  Muy bien.
                </p>
                {current.kind === "choice" && <p>{`La respuesta es ${stripEmoji(current.answer)}.`}</p>}
                <p>{praiseFor(activeModality)}</p>
              </div>
            )}
            {feedback === "wrong" && (
              <InlineError shakeKey={shakeKey}>
                <p className={styles.blockTitle}>Casi. Prueba otra vez.</p>
                <p>{hintFor(current, activeModality)}</p>
              </InlineError>
            )}
            {feedback === "reveal" && <RevealBlock shakeKey={shakeKey} text={`Casi. ${revealFor(current)}`} />}
          </div>

          <Button
            fullWidth
            disabled={!isDone && !hasResponse(current, response)}
            onClick={isDone ? handleNext : handleCheck}
            iconRight={isDone ? "arrow" : undefined}
          >
            {isDone ? (isLast ? "Ver mi recompensa" : "Siguiente pregunta") : "Comprobar"}
          </Button>
        </div>
      </Screen>
    );
  }

  // Intro: choose how to learn, then start.
  const defaultLabel = MODALITY_LABEL[defaultModality];
  const panelKey = activeModality;

  return (
    <Screen size="lesson" className={styles.page}>
      <Pilo size={56} className={styles.pilo} />

      <div className={`${styles.topRow} ${styles.topRowIntro}`}>
        <Button variant="quiet" iconLeft="back" ariaLabel="Volver a mis materias" to={`/subjects?subject=${lesson.subject}`} />
      </div>

      <div className={styles.stack}>
        {subject && (
          <div>
            <Chip tone={subject.tone} icon={subject.icon}>
              {subject.name}
            </Chip>
          </div>
        )}

        <h1 className={styles.title}>{cleanTitle(lesson.title)}</h1>
        {stripEmoji(lesson.description) && <p className={styles.description}>{stripEmoji(lesson.description)}</p>}

        <p className={styles.micro}>Cómo quieres aprender</p>

        <SegmentedControl
          idPrefix="mod"
          ariaLabel="Forma de aprender"
          value={activeModality}
          onChange={chooseModality}
          options={availableKeys.map((m) => ({ value: m, label: MODALITY_LABEL[m] }))}
        />

        {activeModality === defaultModality && (
          <p className={styles.hint}>{`Elegimos «${defaultLabel}» por tu superpoder.`}</p>
        )}

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={panelKey}
            id="mod-panel"
            role="tabpanel"
            aria-labelledby={`mod-tab-${panelKey}`}
            className={styles.panel}
            custom={direction}
            variants={pageVariantsFor}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
          >
            <h2 className={styles.panelTitle}>{modalities[panelKey].title}</h2>
            {modalities[panelKey].description && (
              <p className={styles.panelBody}>{modalities[panelKey].description}</p>
            )}
          </motion.div>
        </AnimatePresence>

        <Button fullWidth onClick={startQuiz}>
          Empezar
        </Button>
      </div>
    </Screen>
  );
}
