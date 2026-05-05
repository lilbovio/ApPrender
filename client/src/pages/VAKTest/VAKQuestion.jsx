const VAKQuestion = ({ question, onAnswer }) => {
  return (
    <div>
      <p>{question.q}</p>

      <button onClick={() => onAnswer("visual")}>Ver</button>
      <button onClick={() => onAnswer("auditivo")}>Escuchar</button>
      <button onClick={() => onAnswer("kinestesico")}>Hacer</button>
    </div>
  );
};

export default VAKQuestion;