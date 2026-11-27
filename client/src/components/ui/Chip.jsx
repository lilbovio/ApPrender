import Icon from "./Icon";
import styles from "./Chip.module.css";

const TONES = ["neutral", "math", "english", "butter", "mint", "rose", "accent"];

/**
 * Chip — small pill label. Text is always --ink; the tone ink only colors the icon.
 */
export default function Chip({ tone = "neutral", icon, children, className }) {
  const safeTone = TONES.includes(tone) ? tone : "neutral";
  const classes = [styles.chip, styles[safeTone], className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      {icon && <Icon name={icon} size={16} className={styles.icon} />}
      <span>{children}</span>
    </span>
  );
}
