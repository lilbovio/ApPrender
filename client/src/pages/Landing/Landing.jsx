import { Navigate } from "react-router-dom";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import {
  Button,
  Icon,
  Pilo,
  Logo,
  Cloud,
  Screen,
  DUR,
  EASE_UI,
  EASE_JOY,
  STAGGER,
} from "../../components/ui";
import styles from "./Landing.module.css";

// Each cloud: position class, width, resting opacity (design-review.html landing).
const CLOUDS = [
  { key: "c1", className: styles.c1, width: 120, opacity: 0.95 },
  { key: "c2", className: styles.c2, width: 86, opacity: 0.75 },
  { key: "c3", className: styles.c3, width: 68, opacity: 0.6 },
];

// Pointer parallax range in px (applied to the whole cloud layer).
const PARALLAX_PX = 8;

function LandingPage() {
  const reduce = useReducedMotion();

  // Parallax: raw pointer offset smoothed by a spring. Disabled under reduced motion.
  const rawX = useMotionValue(0);
  const cloudX = useSpring(rawX, { stiffness: 120, damping: 20 });

  function handlePointerMove(event) {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const normalized = event.clientX / rect.width - 0.5; // -0.5 .. 0.5
    rawX.set(normalized * PARALLAX_PX * 2);
  }

  function handlePointerLeave() {
    rawX.set(0);
  }

  // Mobile: sky band on top, copy below. >= 900 px: copy left, sky band right (Landing.module.css).
  return (
    <Screen bleed>
      <div className={styles.page}>
        <section
          className={styles.sky}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <motion.div className={styles.cloudLayer} style={reduce ? undefined : { x: cloudX }}>
            {CLOUDS.map((cloud, index) => (
              <motion.div
                key={cloud.key}
                className={`${styles.cloud} ${cloud.className}`}
                initial={reduce ? { opacity: 0 } : { x: -32, opacity: 0 }}
                animate={reduce ? { opacity: cloud.opacity } : { x: 0, opacity: cloud.opacity }}
                transition={{
                  duration: DUR.joy,
                  ease: EASE_UI,
                  delay: index * STAGGER,
                }}
              >
                <Cloud width={cloud.width} />
              </motion.div>
            ))}
          </motion.div>

          <Logo
            size="var(--landing-logo)"
            wordSize="var(--landing-word)"
            withWord
            className={styles.logo}
          />

          <motion.div
            className={styles.pilo}
            initial={reduce ? { opacity: 0 } : { x: -120, y: 24, rotate: -8, opacity: 1 }}
            animate={reduce ? { opacity: 1 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{
              duration: DUR.joy,
              ease: EASE_JOY,
              delay: DUR.micro,
            }}
          >
            <Pilo size={64} label="Pilo" />
          </motion.div>
        </section>

        <div className={styles.body}>
          <h1 className={styles.title}>Aprender es una aventura.</h1>
          <p className={styles.lead}>
            Matemáticas e inglés a tu manera: mira, escucha y construye. Pilo te acompaña en cada paso.
          </p>

          <div className={styles.actions}>
            <Button to="/register" fullWidth iconRight="arrow" className={styles.primaryCta}>
              Crear mi cuenta
            </Button>
            <Button variant="quiet" to="/login">
              Ya tengo cuenta
            </Button>
          </div>

          <p className={styles.privacy}>
            <Icon name="check" size={18} className={styles.privacyIcon} />
            <span>Sin datos personales. Solo diversión.</span>
          </p>
        </div>
      </div>
    </Screen>
  );
}

export default function Landing() {
  // Already signed in: skip the landing and go straight to the dashboard.
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/home" replace />;
  return <LandingPage />;
}
