// Motion constants mirror DESIGN.md section 6. Keep in sync with the CSS tokens in index.css.

export const EASE_UI = [0.22, 1, 0.36, 1];
export const EASE_JOY = [0.34, 1.56, 0.64, 1];

export const DUR = {
  micro: 0.18,
  screen: 0.28,
  joy: 0.52,
};

export const STAGGER = 0.09;
export const CONFETTI_S = 2.4;

// Token snap for kinesthetic pieces that land in the drop zone (DESIGN.md section 6, "soft spring").
export const PLACE_SPRING = { type: "spring", stiffness: 400, damping: 30 };

/**
 * Screen entry. Under reduced motion only opacity changes (no transforms).
 * Usage: const { initial, animate, transition } = screenEnter(useReducedMotion());
 */
export function screenEnter(reduce) {
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: DUR.screen, ease: EASE_UI },
    };
  }
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DUR.screen, ease: EASE_UI },
  };
}
