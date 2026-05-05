import { useNavigate } from "react-router-dom";

const Learn = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>¿Qué quieres aprender hoy?</h2>

      <button onClick={() => navigate("/learn/math")}>
        Matemáticas
      </button>

      <button onClick={() => navigate("/learn/english")}>
        Inglés
      </button>
    </div>
  );
};

export default Learn;