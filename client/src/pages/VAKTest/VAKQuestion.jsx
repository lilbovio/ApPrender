import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Chip, Icon, Pilo, ProgressPath } from "../../components/ui";
import { DUR, EASE_UI } from "../../components/ui/motion";
import styles from "./VAKTest.module.css";

// Delay after a tap so the 180ms selected state is visible before the page turns.
const ANSWER_DELAY_MS = 220;

/**
 * One VAK question. Never shows the modality names; only the concrete options.
 * On tap the option is marked selected, then onAnswer runs after ANSWER_DELAY_MS.
 * Further taps are ignored until that happens.
 */
export default function VAKQuestion({ question, index, total, selectedOptionId, onAnswer, onBack }) {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState(selectedOptionId);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const pick = (optionId) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setPicked(optionId);
    timerRef.current = setTimeout(() => onAnswer(optionId), ANSWER_DELAY_MS);
  };

  const label = `Pregunta ${index + 1} de ${total}`;
  const pressMotion = reduce || busy ? undefined : { scale: 0.97 };

  return (
    <div className={styles.questionWrap}>
      <div className={styles.topRow}>
        <div className={styles.topLeft}>
          {index > 0 ? (
            <Button variant="quiet" iconLeft="back" ariaLabel="Pregunta anterior" onClick={onBack} disabled={busy} />
          ) : null}
          <Chip tone="butter">{label}</Chip>
        </div>
        <Pilo size={48} className={styles.pilo} />
      </div>

      <ProgressPath total={total} current={index} label={label} />

      <h2 className={styles.prompt}>{question.prompt}</h2>
      <p className={styles.support}>Elige lo que te pase de verdad. Puedes decir «No lo sé».</p>

      <div className={styles.options}>
        {question.options.map((option) => {
          const isPicked = picked === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              disabled={busy}
              aria-pressed={isPicked}
              onClick={() => pick(option.id)}
              whileTap={pressMotion}
              transition={{ duration: DUR.micro, ease: EASE_UI }}
              className={[styles.option, isPicked && styles.optionSelected].filter(Boolean).join(" ")}
            >
              <span className={styles.tile}>
                <Icon name={option.icon} size={22} />
              </span>
              <span className={styles.optionText}>{option.text}</span>
            </motion.button>
          );
        })}
      </div>

      <div className={styles.unknown}>
        <Button variant="quiet" fullWidth disabled={busy} onClick={() => pick(question.unknownOption.id)}>
          No lo sé
        </Button>
      </div>
    </div>
  );
}
