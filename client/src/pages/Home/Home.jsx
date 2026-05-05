import { useProgress } from "../../hooks/useProgress";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { progress } = useProgress();
  const navigate = useNavigate();

  return (
    <div className="home">
      <h2>Tu progreso de hoy</h2>
      <p>{progress}% completado</p>

      <button onClick={() => navigate("/learn")}>
        Continuar aprendiendo
      </button>
    </div>
  );
};

export default Home;