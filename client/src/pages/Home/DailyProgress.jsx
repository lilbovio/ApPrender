import { useProgress } from "../../hooks/useProgress";

const DailyProgress = () => {
  const { progress } = useProgress();

  return (
    <div>
      <h3>Progreso diario</h3>
      <div style={{ width: "100%", background: "#eee" }}>
        <div
          style={{
            width: `${progress}%`,
            background: "green",
            height: "20px",
          }}
        />
      </div>
      <p>{progress}% completado</p>
    </div>
  );
};

export default DailyProgress;