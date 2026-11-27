import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { DUR, EASE_UI } from "./motion";
import styles from "./DashStop.module.css";

const MotionLink = motion.create(Link);

/**
 * DashStop — one step of "Tu camino de hoy". Renders a Link row, or a non-interactive
 * div when `busy` (loading skeleton, no destination).
 * primary: the screen's single pastel block (--accent-soft, no border).
 */
export default function DashStop({
  to,
  title,
  meta,
  number,
  icon,
  primary = false,
  busy = false,
  onClick,
  className,
}) {
  const reduce = useReducedMotion();

  const classes = [styles.stop, primary && styles.primary, className].filter(Boolean).join(" ");

  const content = (
    <>
      <span className={styles.num} aria-hidden="true">
        {number}
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
      </span>
      {icon && <Icon name={icon} size={24} className={styles.icon} />}
    </>
  );

  if (busy || !to) {
    return (
      <div className={classes} aria-busy={busy || undefined}>
        {content}
      </div>
    );
  }

  return (
    <MotionLink
      to={to}
      onClick={onClick}
      className={classes}
      transition={{ duration: DUR.micro, ease: EASE_UI }}
      {...(reduce ? {} : { whileTap: { scale: 0.97 } })}
    >
      {content}
    </MotionLink>
  );
}
