import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button, Pilo, ProgressPath, Screen } from "../../components/ui";
import { DUR, EASE_UI } from "../../components/ui/motion";
import { VAK_BANK } from "../../data/vakBank";
import VAKQuestion from "./VAKQuestion";
import VAKResult from "./VAKResult";
import styles from "./VAKTest.module.css";

const TOTAL = VAK_BANK.length;

// Page turn between questions. Reduced motion keeps only the opacity change.
function pageTurn(reduce) {
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: DUR.screen, ease: EASE_UI },
    };
  }
  return {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -12 },
    transition: { duration: DUR.screen, ease: EASE_UI },
  };
}

/**
 * VAK survey. Stages: intro -> question (index 0..11) -> result.
 * answers: array of { questionId, optionId }. Re-answering replaces the entry.
 */
export default function VAKTest() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const question = VAK_BANK[index];
  const selectedOptionId = answers.find((a) => a.questionId === question?.id)?.optionId ?? null;

  const handleAnswer = (optionId) => {
    const next = [...answers.filter((a) => a.questionId !== question.id), { questionId: question.id, optionId }];
    setAnswers(next);

    if (index >= TOTAL - 1) {
      setStage("result");
    } else {
      setIndex(index + 1);
    }
  };

  const handleBack = () => {
    if (index > 0) setIndex(index - 1);
  };

  if (stage === "result") {
    return <VAKResult answers={answers} />;
  }

  if (stage === "question") {
    const turn = pageTurn(reduce);
    return (
      <Screen size="survey">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={question.id}
            initial={turn.initial}
            animate={turn.animate}
            exit={turn.exit}
            transition={turn.transition}
          >
            <VAKQuestion
              question={question}
              index={index}
              total={TOTAL}
              selectedOptionId={selectedOptionId}
              onAnswer={handleAnswer}
              onBack={handleBack}
            />
          </motion.div>
        </AnimatePresence>
      </Screen>
    );
  }

  return (
    <Screen size="survey">
      <section className={styles.intro}>
        <Pilo size={72} label="Pilo" />
        <h1 className={styles.introTitle}>Vamos a descubrir cómo aprendes mejor</h1>
        <p className={styles.body}>Son 12 preguntas rápidas, unos 2 minutos. ¡No hay respuestas incorrectas!</p>
        <ProgressPath total={TOTAL} current={0} label="0 de 12" />
        <Button
          fullWidth
          onClick={() => {
            setIndex(0);
            setStage("question");
          }}
        >
          Empezar aventura
        </Button>
      </section>
    </Screen>
  );
}
