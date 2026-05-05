import { useState } from "react";
import VAKQuestion from "./VAKQuestion";
import VAKResult from "./VAKResult";

const questions = [
  { q: "¿Prefieres ver imágenes o escuchar explicaciones?", type: "visual" },
  { q: "¿Aprendes mejor escuchando?", type: "auditivo" },
  { q: "¿Te gusta aprender haciendo cosas?", type: "kinestesico" },
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

  return (
    <div>
      <h2>Descubre cómo aprendes</h2>

      <VAKQuestion
        question={questions[answers.length]}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default VAKTest;