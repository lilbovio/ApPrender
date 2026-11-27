import { useEffect, useRef } from "react";
import { useAnimationControls, useReducedMotion } from "framer-motion";
import { DUR, EASE_UI } from "./motion";

/**
 * useShake — returns animation controls that shake the element whenever `shakeKey` changes.
 * A shakeKey of 0 (or unchanged) never shakes. Under reduced motion nothing moves.
 */
export function useShake(shakeKey = 0) {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const last = useRef(0);

  useEffect(() => {
    if (last.current === shakeKey) return;
    last.current = shakeKey;
    if (reduce || !shakeKey) return;
    controls.start({
      x: [0, -6, 6, -4, 0],
      transition: { duration: DUR.micro, ease: EASE_UI },
    });
  }, [shakeKey, reduce, controls]);

  return controls;
}

export default useShake;
