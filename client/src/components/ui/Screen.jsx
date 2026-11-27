import { motion, useReducedMotion } from "framer-motion";
import { screenEnter } from "./motion";
import styles from "./Screen.module.css";

const SIZE_CLASS = {
  survey: styles.survey,
  lesson: styles.lesson,
  auth: styles.auth,
};

/**
 * Screen — page wrapper with the shared entry motion and the responsive content shell.
 * Content width comes from --content-max (DESIGN.md section 14): 480 px on mobile, wider per breakpoint.
 * size: "app" (default, --content-max) | "survey" (720 px cap) | "lesson" (900 px cap) | "auth" (460 px, 960 px at >= 900 px).
 * withNav: mobile bottom nav padding below 900 px; left rail padding at >= 900 px.
 * bleed: remove inner padding and width limits so story blocks can run edge to edge.
 */
export default function Screen({ children, withNav = false, bleed = false, size = "app", className }) {
  const reduce = useReducedMotion();
  const { initial, animate, transition } = screenEnter(reduce);

  const outerClasses = [styles.screen, SIZE_CLASS[size], withNav && styles.withNav, className]
    .filter(Boolean)
    .join(" ");
  const innerClasses = [styles.inner, bleed && styles.bleed].filter(Boolean).join(" ");

  return (
    <motion.main className={outerClasses} initial={initial} animate={animate} transition={transition}>
      <div className={innerClasses}>{children}</div>
    </motion.main>
  );
}
