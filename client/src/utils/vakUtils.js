export const calculateVAK = (answers) => {
  const count = {
    visual: 0,
    auditivo: 0,
    kinestesico: 0,
  };

  answers.forEach((a) => count[a]++);

  return Object.keys(count).reduce((a, b) =>
    count[a] > count[b] ? a : b
  );
};