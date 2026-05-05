import { useLesson } from "../../hooks/useLesson";

const LessonView = () => {
  const { currentLesson } = useLesson();

  if (!currentLesson) return <p>No hay lección seleccionada</p>;

  return (
    <div>
      <h2>{currentLesson.title}</h2>
      <p>{currentLesson.content}</p>
    </div>
  );
};

export default LessonView;