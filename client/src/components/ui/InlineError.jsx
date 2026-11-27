import { motion } from "framer-motion";
import { useShake } from "./useShake";
import styles from "./InlineError.module.css";

/**
 * InlineError — friendly, non-alarming error block announced with role="alert".
 * Use for server or form-level errors only; field errors belong on their Field.
 * Shakes when `shakeKey` changes (skipped under reduced motion).
 */
export default function InlineError({ children, shakeKey = 0 }) {
  const controls = useShake(shakeKey);

  return (
    <motion.div role="alert" className={styles.block} animate={controls}>
      {children}
    </motion.div>
  );
}
