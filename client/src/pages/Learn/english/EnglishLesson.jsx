import { useEffect } from "react";
import { useLesson } from "../../../hooks/useLesson";

const EnglishLesson = () => {
  const { fetchLessons, lessons } = useLesson();

  useEffect(() => {
    fetchLessons("english");
  }, []);

  return (
    <div>
      <h2>Lecciones de Inglés</h2>

      {lessons.map((lesson, i) => (
        <div key={i}>
          <h4>{lesson.title}</h4>
        </div>
      ))}
    </div>
  );
};

export default EnglishLesson;