import { useState } from "react";
import VAKResult from "./VAKResult";
import styles from "./VAKTest.module.css";

const questions = [
  { 
    id: 1,
    q: "Cuando estás aprendiendo algo nuevo, prefieres...", 
    options: [
      { text: "Ver imágenes, diagramas o leer sobre ello", type: "visual", icon: "👀" },
      { text: "Que alguien me lo explique o escuchar un audio", type: "auditivo", icon: "👂" },
      { text: "Hacerlo yo mismo, usar mis manos o moverme", type: "kinestesico", icon: "🖐️" }
    ]
  },
  { 
    id: 2,
    q: "Para recordar un número de teléfono, usualmente...", 
    options: [
      { text: "Me imagino los números en mi cabeza", type: "visual", icon: "👀" },
      { text: "Lo repito en voz alta varias veces", type: "auditivo", icon: "👂" },
      { text: "Hago el movimiento de teclearlo con mis dedos", type: "kinestesico", icon: "🖐️" }
    ]
  },
  { 
    id: 3,
    q: "¿Qué haces en tu tiempo libre?", 
    options: [
      { text: "Dibujar, leer o ver videos", type: "visual", icon: "👀" },
      { text: "Escuchar música o platicar con amigos", type: "auditivo", icon: "👂" },
      { text: "Jugar deportes, correr o construir cosas", type: "kinestesico", icon: "🖐️" }
    ]
  },
];

const VAKTest = () => {
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (type) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (newAnswers.length === questions.length) {
      setFinished(true);
    }
  };

  if (finished) return <VAKResult answers={answers} />;

  const currentQuestion = questions[answers.length];
  const progress = (answers.length / questions.length) * 100;

  return (
    <div className={styles.testContainer}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.card}>
        <h2 className={styles.questionTitle}>{currentQuestion.q}</h2>

        <div className={styles.optionsList}>
          {currentQuestion.options.map((opt, i) => (
            <button
              key={i}
              className={styles.optionButton}
              onClick={() => handleAnswer(opt.type)}
            >
              <span className={styles.optionIcon}>{opt.icon}</span>
              <span className={styles.optionText}>{opt.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VAKTest;