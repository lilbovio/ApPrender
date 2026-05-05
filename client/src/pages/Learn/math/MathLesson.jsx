import { useEffect } from "react";
import { useLesson } from "../../../hooks/useLesson";

const MathLesson = () => {
  const { fetchLessons, lessons } = useLesson();

  useEffect(() => {
    fetchLessons("math");
  }, []);

  return (
    <div>
      <h2>Lecciones de Matemáticas</h2>

      {lessons.map((lesson, i) => (
        <div key={i}>
          <h4>{lesson.title}</h4>
        </div>
      ))}
    </div>
  );
};

export default MathLesson;