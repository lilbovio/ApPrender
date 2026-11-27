import { useRef } from "react";
import styles from "./SegmentedControl.module.css";

/**
 * SegmentedControl — two or more mutually exclusive options as tabs.
 * Roving tabindex: only the selected tab is in the tab order.
 * Left/Right arrows select the neighbour and move focus to it.
 * idPrefix (optional) gives each tab the id `${idPrefix}-tab-${value}` and
 * aria-controls `${idPrefix}-panel` so a tabpanel can label itself.
 */
export default function SegmentedControl({ options, value, onChange, ariaLabel, idPrefix }) {
  const buttonRefs = useRef([]);

  const handleKeyDown = (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();

    const current = Math.max(
      options.findIndex((opt) => opt.value === value),
      0
    );
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = (current + step + options.length) % options.length;

    // The buttons are keyed and stable, so focus lands on the new tab immediately
    // and survives the parent's state change (no remount).
    buttonRefs.current[next]?.focus();
    onChange(options[next].value);
  };

  return (
    <div role="tablist" aria-label={ariaLabel} className={styles.track} onKeyDown={handleKeyDown}>
      {options.map((opt, index) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            id={idPrefix ? `${idPrefix}-tab-${opt.value}` : undefined}
            aria-controls={idPrefix ? `${idPrefix}-panel` : undefined}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={styles.option}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
