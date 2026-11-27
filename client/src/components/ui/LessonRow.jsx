import { Link } from "react-router-dom";
import Icon from "./Icon";
import styles from "./LessonRow.module.css";

const TRAILING_ICON = { done: "check", now: "arrow", open: "arrow", locked: "lock" };

/**
 * LessonRow — one line in a lesson or badge list (DESIGN.md sections 4, 5, 12).
 * With `to` and not locked, the row is a router link. Otherwise it is a plain block.
 * Locked rows are not dimmed (contrast); the lock icon and meta text carry the state.
 */
export default function LessonRow({ to, icon, title, meta, state = "open" }) {
  const locked = state === "locked";
  const linked = Boolean(to) && !locked;
  const classes = [styles.row, state === "now" && styles.now].filter(Boolean).join(" ");

  const content = (
    <>
      <span className={styles.tile}>
        <Icon name={icon} size={24} />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>{meta}</span>
      </span>
      <Icon name={TRAILING_ICON[state] ?? "arrow"} size={20} className={styles.trailing} />
    </>
  );

  if (linked) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <div className={classes} aria-disabled={locked ? "true" : undefined}>
      {content}
    </div>
  );
}
