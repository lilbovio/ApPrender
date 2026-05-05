export const getGradeLevel = (age) => {
  if (age <= 6) return 1;
  if (age <= 7) return 2;
  if (age <= 8) return 3;
  if (age <= 9) return 4;
  if (age <= 10) return 5;
  return 6;
};

export const getDifficulty = (grade) => {
  if (grade <= 2) return "easy";
  if (grade <= 4) return "medium";
  return "hard";
};