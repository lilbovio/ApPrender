import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import styles from "./Subjects.module.css";
import {
  Screen,
  Pilo,
  Chip,
  Button,
  InlineError,
  BottomNav,
  LessonRow,
  ProgressPath,
  SegmentedControl,
  DUR,
  EASE_UI,
} from "../../components/ui";
import useLearningData from "../../hooks/useLearningData";
import {
  SUBJECTS,
  cleanTitle,
  completedSet,
  idOf,
  lastSubject,
  rememberSubject,
} from "../../utils/lessonUtils";

const SUBJECT_OPTIONS = [
  { value: "math", label: "Matemáticas" },
  { value: "english", label: "Inglés" },
];

function resolveSubject(param) {
  return param === "math" || param === "english" ? param : lastSubject();
}

// Page-turn between subjects: the entering panel comes from the side it sits on.
// `custom` is the direction of the new subject (+1 english, -1 math).
const turn = {
  initial: (dir) => ({ opacity: 0, x: dir * 12 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -12 }),
};
const turnReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function Subjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const reduce = useReducedMotion();
  const { status, lessons, progress, reload } = useLearningData();

  const subject = resolveSubject(searchParams.get("subject"));
  const info = SUBJECTS[subject];
  const list = lessons[subject];
  const doneIds = completedSet(progress[subject]);
  const total = list.length;
  const ready = status === "ready";

  const rows = [];
  let nowAssigned = false;
  let doneCount = 0;
  for (const lesson of list) {
    const id = idOf(lesson._id);
    const to = `/learn/lesson/${lesson._id}`;
    const title = cleanTitle(lesson.title);
    if (doneIds.has(id)) {
      doneCount += 1;
      rows.push({ key: id, to, title, state: "done", icon: "check", meta: "Lista", lesson });
    } else if (!nowAssigned) {
      nowAssigned = true;
      rows.push({
        key: id,
        to,
        title,
        state: "now",
        icon: info.icon,
        meta: `Ahora · +${lesson.xp || 50} XP`,
        lesson,
      });
    } else {
      rows.push({
        key: id,
        title,
        state: "locked",
        icon: "lock",
        meta: "Termina la anterior para abrirla",
        lesson,
      });
    }
  }

  const nowRow = rows.find((row) => row.state === "now");
  const firstRow = rows[0];
  let cta = null;
  if (nowRow) {
    cta = {
      label: doneCount > 0 ? "Continuar lección" : "Empezar lección",
      to: nowRow.to,
    };
  } else if (firstRow) {
    cta = { label: "Repasar la primera lección", to: firstRow.to };
  }

  const handleSubjectChange = (next) => {
    setSearchParams({ subject: next }, { replace: true });
    rememberSubject(next);
  };

  const direction = subject === "english" ? 1 : -1;
  const variants = reduce ? turnReduced : turn;

  const panelBody = (() => {
    if (status === "loading") {
      return (
        <p className={styles.note} aria-busy="true">
          Preparando tus lecciones…
        </p>
      );
    }
    if (status === "error") {
      return (
        <div className={styles.errorWrap}>
          <InlineError>Casi. No pudimos cargar tus lecciones. Revisa tu conexión.</InlineError>
          <Button variant="quiet" onClick={reload}>
            Intentar otra vez
          </Button>
        </div>
      );
    }
    if (total === 0) {
      return <p className={styles.note}>Pronto habrá lecciones aquí.</p>;
    }
    return (
      <>
        <div className={styles.lessons}>
          {rows.map((row) => (
            <LessonRow
              key={row.key}
              to={row.to}
              icon={row.icon}
              title={row.title}
              meta={row.meta}
              state={row.state}
            />
          ))}
        </div>
        {cta && (
          <div className={styles.ctaWrap}>
            <Button fullWidth to={cta.to} className={styles.cta}>
              {cta.label}
            </Button>
          </div>
        )}
      </>
    );
  })();

  return (
    <>
      <Screen withNav>
        <header className={styles.hero}>
          <Pilo size={56} className={styles.pilo} />
          <p className={styles.micro}>Materias</p>
        </header>

        <div className={styles.tabs}>
          <SegmentedControl
            options={SUBJECT_OPTIONS}
            value={subject}
            onChange={handleSubjectChange}
            ariaLabel="Elegir materia"
            idPrefix="subj"
          />
        </div>

        <div
          role="tabpanel"
          id="subj-panel"
          aria-labelledby={`subj-tab-${subject}`}
          className={styles.panel}
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={subject}
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: DUR.screen, ease: EASE_UI }}
            >
              <Chip tone={info.tone} icon={info.icon}>
                {info.name}
              </Chip>
              <h1 className={styles.title}>{info.name}</h1>
              {ready && (
                <p className={styles.count}>
                  {`${total} ${total === 1 ? "lección" : "lecciones"} · ${doneCount} ${
                    doneCount === 1 ? "lista" : "listas"
                  }`}
                </p>
              )}
              {ready && total > 0 && (
                <ProgressPath
                  variant="stars"
                  total={total}
                  current={doneCount}
                  label={`${doneCount} de ${total} lecciones listas`}
                  className={styles.path}
                />
              )}
              <div className={styles.body}>{panelBody}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}
