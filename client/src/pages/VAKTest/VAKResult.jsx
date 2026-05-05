const VAKResult = ({ answers }) => {
  const count = {
    visual: 0,
    auditivo: 0,
    kinestesico: 0,
  };

  answers.forEach((a) => count[a]++);

  const result = Object.keys(count).reduce((a, b) =>
    count[a] > count[b] ? a : b
  );

  localStorage.setItem("vak", result);

  return (
    <div>
      <h2>Tu estilo de aprendizaje es:</h2>
      <h1>{result.toUpperCase()}</h1>
    </div>
  );
};

export default VAKResult;