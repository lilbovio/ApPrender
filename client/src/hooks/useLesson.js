import { useState } from "react";

export const useLesson = () => {
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);

  const fetchLessons = async (subject) => {
    try {
      const res = await fetch(`http://localhost:5000/api/lessons/${subject}`);
      const data = await res.json();
      setLessons(data);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    lessons,
    currentLesson,
    setCurrentLesson,
    fetchLessons,
  };
};