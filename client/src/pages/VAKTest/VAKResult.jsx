import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Chip, InlineError, Pilo, Screen } from "../../components/ui";
import { DUR, EASE_JOY, EASE_UI } from "../../components/ui/motion";
import { useAuth } from "../../context/AuthContext";
import { MODALITY_COPY, saveSecondary, scoreVAK } from "../../utils/vakUtils";
import styles from "./VAKTest.module.css";

/**
 * VAK result. Names only, never numeric scores.
 * Saves the dominant modality through AuthContext.saveVAKType and the secondary locally.
 */
export default function VAKResult({ answers }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { user, saveVAKType } = useAuth();

  const { dominant, secondary } = useMemo(() => scoreVAK(answers), [answers]);
  const dom = MODALITY_COPY[dominant];
  const sec = secondary ? MODALITY_COPY[secondary] : null;

  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const popMotion = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: DUR.joy, ease: EASE_UI },
      }
    : {
        initial: { opacity: 0, scale: 0.6 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: DUR.joy, ease: EASE_JOY },
      };

  const handleContinue = async () => {
    if (saving) return;
    setSaving(true);
    setFailed(false);

    const userId = user?._id;
    try {
      await saveVAKType(dominant);
    } catch (err) {
      console.error("Error guardando VAK:", err);
      setFailed(true);
      setShakeKey((k) => k + 1);
      setSaving(false);
      return;
    }

    saveSecondary(userId, secondary);
    navigate("/home", { replace: true });
  };

  return (
    <Screen size="survey">
      <section className={styles.result}>
        <motion.div className={styles.resultPilo} {...popMotion}>
          <Pilo size={88} label="Pilo" />
        </motion.div>

        <h1 className={styles.resultTitle}>Tu superpoder es {dom.name}</h1>
        <p className={styles.body}>{dom.how}</p>

        <div className={styles.chips}>
          <Chip tone="accent" icon={dom.icon}>
            {dom.name}
          </Chip>
          {sec ? (
            <Chip tone="neutral" icon={sec.icon}>
              {sec.name}
            </Chip>
          ) : null}
        </div>

        {sec ? (
          <>
            <p className={styles.body}>También te gusta {sec.likes}. Puedes usar las dos formas.</p>
            <p className={styles.accentBlock}>
              Aprendes {dom.gerund} y también {sec.gerund}. Vamos a usar las dos.
            </p>
          </>
        ) : (
          <p className={styles.accentBlock}>Vamos a preparar tu camino con lo que mejor te funciona.</p>
        )}

        {failed ? (
          <InlineError shakeKey={shakeKey}>Casi. No pudimos guardar tu superpoder. Prueba otra vez.</InlineError>
        ) : null}

        <Button fullWidth iconRight="arrow" disabled={saving} onClick={handleContinue}>
          {saving ? "Guardando…" : "Ir a mi camino"}
        </Button>
      </section>
    </Screen>
  );
}
