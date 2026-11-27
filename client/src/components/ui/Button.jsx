import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { DUR, EASE_UI } from "./motion";
import styles from "./Button.module.css";

const MotionLink = motion.create(Link);

/**
 * Button — the single action primitive.
 * variant: "primary" (grape CTA, one per screen) | "quiet" (text action) | "soft" (pastel-free secondary).
 * Pass `to` for router links, `href` for external links, otherwise renders a <button>.
 */
export default function Button({
  variant = "primary",
  to,
  href,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  children,
  className,
  ariaLabel,
}) {
  const reduce = useReducedMotion();

  const classes = [
    styles.btn,
    styles[variant],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Scale only when motion is allowed; no translate on hover.
  const motionProps = {
    transition: { duration: DUR.micro, ease: EASE_UI },
    ...(reduce || disabled
      ? {}
      : { whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 } }),
  };

  const content = (
    <>
      {iconLeft && <Icon name={iconLeft} size={20} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={20} />}
    </>
  );

  if (to) {
    return (
      <MotionLink to={to} className={classes} aria-label={ariaLabel} {...motionProps}>
        {content}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a href={href} className={classes} aria-label={ariaLabel} {...motionProps}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={ariaLabel}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
