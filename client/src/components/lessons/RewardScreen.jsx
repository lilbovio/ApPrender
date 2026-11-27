import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { cleanTitle } from "../../utils/lessonUtils";
import { recordLessonThisWeek } from "../../utils/weekUtils";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import InlineError from "../ui/InlineError";
import Pilo from "../ui/Pilo";
import { CONFETTI_S, DUR, EASE_JOY, EASE_UI, STAGGER } from "../ui/motion";
import styles from "./Lesson.module.css";

const CONFETTI_COUNT = 14;
const FALL_TO = 360;

/** Confetti runs once on mount, then unmounts. Never rendered under reduced motion. */
function Confetti() {
  const pieces = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const delay = i * STAGGER;
    return {
      i,
      left: `${5 + i * 6.4}%`,
      drift: ((i * 37) % 50) - 25,
      spin: 120 + ((i * 53) % 240),
      delay,
      // Every piece lands at CONFETTI_S, so the whole burst lasts 2.4 s.
      duration: CONFETTI_S - delay,
    };
  });

  return (
    <div className={styles.confettiLayer} aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.i}
          className={`${styles.confetti} ${styles[`tone${p.i % 6}`]}`}
          style={{ left: p.left }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 0 }}
          animate={{ y: FALL_TO, x: p.drift, rotate: p.spin, opacity: [0, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

/**
 * RewardScreen — what the child learned, one pastel block, one primary action.
 * Saves progress once on mount. A failed save shows a friendly retry; Continue stays usable.
 */
export default function RewardScreen({ lesson, firstTry = 0, total = 0, onContinue, onSeeBadges }) {
  const reduce = useReducedMotion();
  const { user } = useAuth();
  const userId = user?._id;
  const xp = lesson.xp || 50;
  const [saveState, setSaveState] = useState("saving"); // "saving" | "saved" | "error"
  const [streak, setStreak] = useState(0);
  const [errorKey, setErrorKey] = useState(0);
  const [showConfetti, setShowConfetti] = useState(!reduce);
  const requested = useRef(false);

  const save = useCallback(async () => {
    setSaveState("saving");
    try {
      const progress = await apiRequest(`/progress/${lesson.subject}/complete`, "POST", {
        lessonId: lesson._id,
        xpEarned: xp,
      });
      setStreak(Number(progress?.streak) || 0);
      recordLessonThisWeek(userId, lesson._id);
      setSaveState("saved");
    } catch {
      setSaveState("error");
      setErrorKey((k) => k + 1);
    }
  }, [lesson._id, lesson.subject, xp, userId]);

  // Ref guard: StrictMode runs effects twice in development, but the request goes out once.
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    save();
  }, [save]);

  useEffect(() => {
    if (reduce || !showConfetti) return undefined;
    const timer = setTimeout(() => setShowConfetti(false), CONFETTI_S * 1000 + 100);
    return () => clearTimeout(timer);
  }, [reduce, showConfetti]);

  const piloMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: DUR.joy, ease: EASE_UI } }
    : {
        initial: { opacity: 0, scale: 0.6 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: DUR.joy, ease: EASE_JOY },
      };

  return (
    <section className={styles.reward}>
      {showConfetti && !reduce && <Confetti />}

      <div className={styles.hero}>
        <div className={styles.sticker}>
          <Icon name="star" size={40} />
        </div>
        <motion.div className={styles.pilo} {...piloMotion}>
          <Pilo size={72} label="Pilo" />
        </motion.div>
      </div>

      <div className={styles.celebrate}>
        <p className={styles.micro}>Lo que aprendiste</p>
        <h1 className={styles.rewardTitle}>{cleanTitle(lesson.title)}</h1>
        <p className={styles.rewardMeta}>{`${firstTry} de ${total} a la primera · +${xp} XP`}</p>
      </div>

      <div className={styles.path} role="img" aria-label={`${firstTry} de ${total} a la primera`}>
        {Array.from({ length: total }, (_, i) => {
          if (i >= firstTry) {
            return (
              <span key={i} className={styles.starUnlit}>
                <Icon name="star" size={28} />
              </span>
            );
          }
          return (
            <motion.span
              key={i}
              className={styles.starLit}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DUR.micro, ease: EASE_UI, delay: reduce ? 0 : i * STAGGER }}
            >
              <Icon name="star" size={28} />
            </motion.span>
          );
        })}
      </div>

      {saveState === "saved" && streak > 0 && (
        <div className={styles.hairline}>
          <p>{`Tu racha sigue viva: ${streak} ${streak === 1 ? "día" : "días"}.`}</p>
        </div>
      )}

      {saveState === "error" && (
        <div className={styles.saveRow}>
          <InlineError shakeKey={errorKey}>Casi. No pudimos guardar tu progreso. Prueba otra vez.</InlineError>
          <Button variant="quiet" onClick={save}>
            Guardar otra vez
          </Button>
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="primary" fullWidth iconRight="arrow" onClick={onContinue}>
          Continuar mi camino
        </Button>
        <Button variant="quiet" onClick={onSeeBadges}>
          Ver mis logros
        </Button>
      </div>
    </section>
  );
}
