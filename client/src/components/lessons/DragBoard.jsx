import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./Lesson.module.css";
import { PLACE_SPRING } from "../ui/motion";

/**
 * DragBoard — kinesthetic exercise. Drag a token into the "cofre" (drop zone).
 * Tap fallback: tapping a tray token places it; tapping a placed token returns it.
 * `multiple=false` replaces the previous token. `placed` and `onChange` use token ids.
 * Under reduced motion tokens do not follow the pointer (no drag transform); tap and keyboard place them.
 */
export default function DragBoard({ tokens = [], multiple = false, placed = [], onChange, dropLabel = "Cofre" }) {
  const reduce = useReducedMotion();
  const dropRef = useRef(null);

  const placedIds = placed.map(String);
  const placedSet = new Set(placedIds);
  const trayTokens = tokens.filter((t) => !placedSet.has(t.id));
  const boxTokens = placedIds.map((id) => tokens.find((t) => t.id === id)).filter(Boolean);

  const layoutProps = (id) => (reduce ? {} : { layoutId: `board-token-${id}`, transition: PLACE_SPRING });

  const place = (id) => onChange(multiple ? [...placedIds, id] : [id]);
  const giveBack = (id) => onChange(placedIds.filter((x) => x !== id));

  const handleDragEnd = (id) => (_event, info) => {
    const zone = dropRef.current;
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    // info.point is in page coordinates; the rect is relative to the viewport.
    const x = info.point.x - window.scrollX;
    const y = info.point.y - window.scrollY;
    const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (inside) place(id);
  };

  const handleTrayKey = (id) => (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      place(id);
    }
  };

  return (
    <div className={styles.dragWrap}>
      <div className={styles.board}>
        <div ref={dropRef} className={styles.drop}>
          <span className={styles.dropLabel}>{dropLabel}</span>
          <div className={styles.dropTokens}>
            {boxTokens.map((t) => (
              <motion.button
                key={t.id}
                type="button"
                {...layoutProps(t.id)}
                className={styles.boardToken}
                aria-label={`Sacar ${t.label} del cofre`}
                onClick={() => giveBack(t.id)}
              >
                {t.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className={styles.tray}>
          {trayTokens.map((t) => (
            <motion.button
              key={t.id}
              type="button"
              {...layoutProps(t.id)}
              className={`${styles.boardToken} ${styles.trayToken}`}
              aria-label={`Mover ${t.label} al cofre`}
              drag={!reduce}
              dragSnapToOrigin
              dragElastic={0.2}
              whileDrag={reduce ? undefined : { scale: 1.05 }}
              onDragEnd={handleDragEnd(t.id)}
              onTap={() => place(t.id)}
              onKeyDown={handleTrayKey(t.id)}
            >
              {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      <p className={styles.helper}>Sin arrastrar: toca una ficha para moverla.</p>
    </div>
  );
}
