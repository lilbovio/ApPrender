export const playSound = (src) => {
  const audio = new Audio(src);
  audio.play().catch(() => {});
};

export const correctSound = () => {
  playSound("/sounds/correct.mp3");
};

export const wrongSound = () => {
  playSound("/sounds/wrong.mp3");
};