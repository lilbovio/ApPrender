import { useState, useEffect } from "react";

export const useProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("progress");
    if (saved) setProgress(Number(saved));
  }, []);

  const updateProgress = (value) => {
    const newProgress = progress + value;
    setProgress(newProgress);
    localStorage.setItem("progress", newProgress);
  };

  return { progress, updateProgress };
};