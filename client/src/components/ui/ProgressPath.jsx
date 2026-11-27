import Icon from "./Icon";
import styles from "./ProgressPath.module.css";

/**
 * ProgressPath — a path of steps that lights up as the child advances.
 * `current` is the number of lit steps. Color change only; no transforms.
 */
export default function ProgressPath({ total, current = 0, label, variant = "dots", className }) {
  const lit = Math.min(Math.max(current, 0), total);
  const steps = Array.from({ length: total }, (_, i) => i < lit);

  return (
    <div
      className={[styles.path, className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={lit}
      aria-label={label}
    >
      {steps.map((isLit, i) => {
        if (variant === "stars") {
          return (
            <span key={i} className={isLit ? styles.starLit : styles.starUnlit}>
              <Icon name="star" size={16} />
            </span>
          );
        }
        return <span key={i} className={isLit ? styles.dotLit : styles.dot} />;
      })}
    </div>
  );
}
