import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import styles from "./VAKTest.module.css";

const VAKResult = ({ answers }) => {
  const navigate = useNavigate();
  
  const count = {
    visual: 0,
    auditivo: 0,
    kinestesico: 0,
  };

  answers.forEach((a) => count[a]++);

  const result = Object.keys(count).reduce((a, b) =>
    count[a] > count[b] ? a : b
  );

  // Update user in backend and local storage
  const handleContinue = async () => {
    try {
      await apiRequest('/vak', 'PUT', { vakType: result });
      
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        user.vakType = result;
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/home");
    } catch (err) {
      console.error("Error guardando VAK:", err);
      alert("Hubo un error al guardar tu estilo de aprendizaje. Intenta de nuevo.");
    }
  };

  const getEmoji = (type) => {
    if (type === "visual") return "👀";
    if (type === "auditivo") return "👂";
    return "🖐️";
  };

  return (
    <div className={styles.resultContainer}>
      <div className={styles.card}>
        <div className={styles.iconLarge}>{getEmoji(result)}</div>
        <h2 className={styles.resultTitle}>¡Tu estilo es {result}!</h2>
        <p className={styles.resultDesc}>
          Personalizaremos tus lecciones para que aprendas de la forma más divertida y fácil para ti.
        </p>
        <button className={styles.continueButton} onClick={handleContinue}>
          ¡Empezar a aprender! 🚀
        </button>
      </div>
    </div>
  );
};

export default VAKResult;