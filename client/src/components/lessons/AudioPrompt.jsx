import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import { DUR, EASE_UI, STAGGER } from "../ui/motion";
import styles from "./Lesson.module.css";

const BARS = [18, 32, 52, 28, 60, 36, 22];

function speechAvailable() {
  return (
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance === "function"
  );
}

/**
 * AudioPrompt — listen-to-the-text control for auditory exercises.
 * Never plays on its own. The wave moves only while speech is running.
 */
export default function AudioPrompt({ text, lang = "es-ES", phonetic }) {
  const reduce = useReducedMotion();
  const supported = speechAvailable();
  const [speaking, setSpeaking] = useState(false);
  const [played, setPlayed] = useState(false);

  // Stop any speech when the question changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (speechAvailable()) window.speechSynthesis.cancel();
    };
  }, []);

  const speak = () => {
    if (!speechAvailable()) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
    setPlayed(true);
  };

  const animateWave = speaking && !reduce;

  return (
    <div className={styles.audio}>
      {supported ? (
        <>
          <button type="button" className={styles.playButton} onClick={speak} aria-label="Escuchar">
            <Icon name="play" size={34} />
          </button>

          {reduce && (
            <p className={styles.phonetic} aria-live="polite">
              {speaking ? "Escuchando…" : ""}
            </p>
          )}

          {!reduce && (
            <div className={styles.wave} aria-hidden="true">
              {BARS.map((height, i) => (
                <motion.span
                  key={i}
                  className={styles.bar}
                  style={{ height }}
                  animate={animateWave ? { scaleY: [0.55, 1.08] } : { scaleY: 1 }}
                  transition={
                    animateWave
                      ? { duration: DUR.joy, repeat: Infinity, repeatType: "reverse", delay: i * STAGGER, ease: EASE_UI }
                      : { duration: DUR.micro, ease: EASE_UI }
                  }
                />
              ))}
            </div>
          )}

          {played && (
            <Button variant="quiet" iconLeft="replay" onClick={speak}>
              Escuchar otra vez
            </Button>
          )}
        </>
      ) : (
        <blockquote className={styles.quote}>{`Lee en voz alta: «${text}»`}</blockquote>
      )}

      {phonetic && <p className={styles.phonetic}>{phonetic}</p>}
    </div>
  );
}
