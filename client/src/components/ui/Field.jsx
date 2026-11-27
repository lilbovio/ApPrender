import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useShake } from "./useShake";
import styles from "./Field.module.css";

/**
 * Field — labelled text input. Errors are linked through aria-describedby and do not
 * announce on their own (no role="alert"), so validation is not read twice.
 * `shakeKey` changes shake the error text (used for the first invalid field only).
 * Forwards its ref to the <input> so the parent can move focus.
 */
const Field = forwardRef(function Field(
  {
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    autoComplete,
    error,
    disabled = false,
    inputMode,
    shakeKey = 0,
  },
  ref
) {
  const errorId = `${id}-error`;
  const errorControls = useShake(shakeKey);
  const inputClass = [styles.input, error && styles.invalid].filter(Boolean).join(" ");

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        disabled={disabled}
        className={inputClass}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <motion.p id={errorId} className={styles.error} animate={errorControls}>
          {error}
        </motion.p>
      )}
    </div>
  );
});

export default Field;
