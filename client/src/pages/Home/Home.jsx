import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import {
  Screen,
  Pilo,
  Chip,
  DashStop,
  Button,
  InlineError,
  BottomNav,
  Icon,
  ProgressPath,
  DUR,
  EASE_UI,
  STAGGER,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import useLearningData from "../../hooks/useLearningData";
import { computeBadges } from "../../utils/badgeUtils";
import {
  SUBJECTS,
  cleanTitle,
  completedSet,
  greetingFor,
  lastSubject,
  levelFor,
  nextLesson,
  rememberSubject,
} from "../../utils/lessonUtils";
import { WEEKLY_GOAL, lessonsThisWeek } from "../../utils/weekUtils";

const SUBJECT_KEYS = ["math", "english"];
const STREAK_DAYS = 7;
// Star paths stop at 10 visual steps; larger subjects scale proportionally, the label stays exact.
const STAR_CAP = 10;
const SHELF_LIMIT = 3;

// Entry motion: opacity + 8 px rise (opacity only under reduced motion).
function reveal(reduce, delay) {
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { duration: DUR.screen, ease: EASE_UI, delay },
  };
}

function lessonWord(n) {
  return n === 1 ? "lección" : "lecciones";
}

/** Maps done/total onto the capped star path. */
function starSteps(done, total) {
  if (total > STAR_CAP) {
    return { total: STAR_CAP, current: Math.round((done / total) * STAR_CAP) };
  }
  return { total, current: done };
}

export default function Home() {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const { status, lessons, progress, totals, reload } = useLearningData();

  const name = user?.name || "explorador";
  const preferred = lastSubject();
  const ready = status === "ready";

  // Continue with the last subject; fall back to the other one if it has no pending lesson.
  let next = null;
  let completedCount = 0;
  if (ready) {
    completedCount = SUBJECT_KEYS.reduce(
      (sum, key) => sum + (progress[key]?.completedLessons?.length || 0),
      0
    );
    const order = [preferred, preferred === "math" ? "english" : "math"];
    for (const key of order) {
      const lesson = nextLesson(lessons[key], progress[key]);
      if (lesson) {
        next = { subject: key, lesson };
        break;
      }
    }
  }

  const streakDays = Math.min(totals.streak, STREAK_DAYS);
  const streakLabel = `${streakDays} de ${STREAK_DAYS} días`;

  const earned = ready
    ? computeBadges({ lessons, progress, totals })
        .filter((badge) => badge.earned)
        .slice(0, SHELF_LIMIT)
    : [];

  const weekCount = ready ? lessonsThisWeek(user?._id) : 0;
  const weekShown = Math.min(weekCount, WEEKLY_GOAL);
  const weekLabel = `${weekShown} de ${WEEKLY_GOAL} lecciones esta semana`;

  const primaryStop = (() => {
    if (status === "loading") {
      return (
        <DashStop
          busy
          primary
          number={1}
          title="Preparando tu camino…"
        />
      );
    }
    if (status === "error") {
      return (
        <div className={styles.errorWrap}>
          <InlineError>Casi. No pudimos cargar tu camino. Revisa tu conexión.</InlineError>
          <Button variant="quiet" onClick={reload}>
            Intentar otra vez
          </Button>
        </div>
      );
    }
    if (next) {
      // DESIGN.md §7: a child who has not finished anything yet gets a first action, not "continue".
      const isFirst = completedCount === 0;
      return (
        <DashStop
          to={`/learn/lesson/${next.lesson._id}`}
          primary
          number={1}
          icon="arrow"
          title={isFirst ? "Empieza tu primera lección" : "Continuar donde lo dejé"}
          meta={`${cleanTitle(next.lesson.title)} · ${SUBJECTS[next.subject].name}`}
          onClick={() => rememberSubject(next.subject)}
        />
      );
    }
    if (completedCount === 0) {
      // No lessons available and nothing completed: never celebrate completion (DESIGN.md §7).
      return (
        <DashStop
          to="/subjects"
          primary
          number={1}
          icon="arrow"
          title="Elige tu primera lección"
          meta="Mira qué hay en Matemáticas e Inglés"
        />
      );
    }
    return (
      <DashStop
        to="/subjects"
        primary
        number={1}
        icon="arrow"
        title="Repasar una lección"
        meta="Ya terminaste todo. ¡Qué bien!"
      />
    );
  })();

  return (
    <>
      <Screen withNav>
        <header className={styles.hero}>
          <Pilo size={56} className={styles.pilo} />
          <p className={styles.micro}>Mi espacio</p>
          <h1 className={styles.title}>{`¡${greetingFor()}, ${name}!`}</h1>
        </header>

        <div className={styles.chips} aria-hidden={!ready || undefined}>
          {ready && (
            <>
              {totals.streak > 0 ? (
                <Chip tone="butter" icon="star">
                  {`${totals.streak} ${totals.streak === 1 ? "día" : "días"} de racha`}
                </Chip>
              ) : (
                <Chip>Hoy empieza tu racha</Chip>
              )}
              <Chip tone="mint">{`${totals.xp} XP`}</Chip>
              <Chip tone="accent" icon="medal">
                {`Nivel ${levelFor(totals.xp)}`}
              </Chip>
            </>
          )}
        </div>

        {ready && (
          <div className={styles.streak}>
            <p className={styles.micro}>Tu racha</p>
            <ProgressPath
              variant="stars"
              total={STREAK_DAYS}
              current={streakDays}
              label={streakLabel}
              className={styles.streakPath}
            />
            {totals.streak === 0 && (
              <p className={styles.support}>Aprende hoy y enciende la primera estrella.</p>
            )}
          </div>
        )}

        <div className={styles.path}>
          <section className={styles.section} aria-labelledby="camino-hoy">
            <p className={styles.micro} id="camino-hoy">
              Tu camino de hoy
            </p>
            <motion.div className={styles.stopWrap} {...reveal(reduce, 0)}>
              {primaryStop}
            </motion.div>
          </section>

          <div className={styles.doors}>
            {SUBJECT_KEYS.map((key, index) => {
              const subject = SUBJECTS[key];
              const total = lessons[key].length;
              const done = Math.min(completedSet(progress[key]).size, total);
              const doneText = `${done} de ${total} ${lessonWord(total)}`;
              const steps = starSteps(done, total);
              return (
                <motion.div key={key} {...reveal(reduce, STAGGER * (index + 1))}>
                  <Link
                    to={`/subjects?subject=${key}`}
                    className={styles.door}
                    onClick={() => rememberSubject(key)}
                  >
                    <Icon
                      name={subject.icon}
                      size={34}
                      className={key === "math" ? styles.iconMath : styles.iconEnglish}
                    />
                    <span className={styles.doorName}>{subject.name}</span>
                    {ready && total > 0 && (
                      // Decorative: the visible count below already names the link (no double read).
                      <div aria-hidden="true">
                        <ProgressPath
                          variant="stars"
                          total={steps.total}
                          current={steps.current}
                          label={doneText}
                          className={styles.doorPath}
                        />
                      </div>
                    )}
                    {ready && <span className={styles.support}>{doneText}</span>}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {ready && (
          <div className={styles.lower}>
            <section className={styles.panel} aria-labelledby="trofeos">
              <h2 id="trofeos" className={styles.shelfTitle}>
                Mis trofeos
              </h2>
              {earned.length > 0 ? (
                <ul className={styles.trophies}>
                  {earned.map((badge) => (
                    <li key={badge.id} className={styles.trophy}>
                      <span className={styles.tile}>
                        <Icon name={badge.icon} size={24} />
                      </span>
                      <span className={styles.trophyName}>{badge.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.support}>Termina una lección para ganar tu primera insignia.</p>
              )}
              <Link to="/profile#logros" className={styles.viewAll}>
                Ver todas
              </Link>
            </section>

            {weekCount > 0 && (
              <section className={styles.panel} aria-labelledby="meta-semana">
                <p className={styles.micro} id="meta-semana">
                  Meta de la semana
                </p>
                <ProgressPath
                  variant="dots"
                  total={WEEKLY_GOAL}
                  current={weekShown}
                  label={weekLabel}
                  className={styles.weekPath}
                />
                {/* Visual caption only; the progressbar above carries the same text for screen readers. */}
                <p className={styles.support} aria-hidden="true">
                  {weekLabel}
                </p>
              </section>
            )}
          </div>
        )}
      </Screen>
      <BottomNav />
    </>
  );
}
