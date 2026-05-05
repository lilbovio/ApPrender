import { useNavigate } from "react-router-dom";

const SubjectSelector = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Selecciona una materia</h2>

      <button onClick={() => navigate("/learn/math")}>
        Matemáticas
      </button>

      <button onClick={() => navigate("/learn/english")}>
        Inglés
      </button>
    </div>
  );
};

export default SubjectSelector;