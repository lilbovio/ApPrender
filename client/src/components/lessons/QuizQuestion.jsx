import AudioPrompt from "./AudioPrompt";
import DragBoard from "./DragBoard";
import VisualPrompt, { DialogueLines } from "./VisualPrompt";
import { stripEmoji } from "../../utils/exerciseUtils";
import styles from "./Lesson.module.css";

/**
 * QuizQuestion — renders one normalised exercise (see utils/exerciseUtils.js).
 * Choice: visual shows a picture, auditory shows a listen control, kinesthetic is a drag board.
 * Sum: drag board with several tokens. Order: tap sentences into sequence.
 * `response` is the option value for choice, and an array of index strings for sum and order.
 */
export default function QuizQuestion({ exercise, modality, subject, response, onResponse, locked = false }) {
  const lang = subject === "english" ? "en-US" : "es-ES";
  const lockedClass = locked ? styles.locked : undefined;

  const heading = <h2 className={styles.question}>{stripEmoji(exercise.question)}</h2>;
  const promptText = stripEmoji(exercise.prompt);
  const prompt = promptText ? <p className={styles.prompt}>{promptText}</p> : null;

  if (exercise.kind === "choice") {
    const options = exercise.options;

    if (modality === "kinesthetic") {
      const placedIndex = options.findIndex((o) => String(o) === String(response ?? ""));
      return (
        <section className={styles.stack}>
          {heading}
          {prompt}
          <div className={lockedClass}>
            <DragBoard
              multiple={false}
              dropLabel="Cofre"
              tokens={options.map((o, i) => ({ id: String(i), label: stripEmoji(o) }))}
              placed={response !== null && response !== undefined && placedIndex >= 0 ? [String(placedIndex)] : []}
              onChange={(ids) => onResponse(ids.length > 0 ? options[Number(ids[ids.length - 1])] : null)}
            />
          </div>
        </section>
      );
    }

    return (
      <section className={styles.stack}>
        {heading}
        {modality === "visual" ? (
          <VisualPrompt exercise={exercise} subject={subject} />
        ) : (
          <>
            <AudioPrompt
              text={stripEmoji(exercise.audioText || exercise.question)}
              lang={lang}
              phonetic={stripEmoji(exercise.phonetic)}
            />
            <DialogueLines lines={exercise.dialogue} />
          </>
        )}
        {prompt}

        <div
          role="radiogroup"
          aria-label="Respuestas"
          className={styles.answers}
          style={{ "--answer-count": options.length }}
        >
          {options.map((option, i) => {
            const selected = response !== null && response !== undefined && String(response) === String(option);
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={locked}
                className={selected ? `${styles.answer} ${styles.answerSelected}` : styles.answer}
                onClick={() => onResponse(option)}
              >
                {stripEmoji(option)}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (exercise.kind === "sum") {
    const ids = Array.isArray(response) ? response.map(String) : [];
    const currentSum = ids.reduce((acc, id) => acc + Number(exercise.items[Number(id)]), 0);
    return (
      <section className={styles.stack}>
        {heading}
        <div className={lockedClass}>
          <DragBoard
            multiple
            dropLabel={`Cofre · suma ${currentSum}`}
            tokens={exercise.items.map((v, i) => ({ id: String(i), label: String(v) }))}
            placed={ids}
            onChange={onResponse}
          />
        </div>
      </section>
    );
  }

  if (exercise.kind === "order") {
    const ids = Array.isArray(response) ? response.map(String) : [];
    const sentences = exercise.sentences;
    const available = sentences.map((_, i) => String(i)).filter((id) => !ids.includes(id));

    return (
      <section className={styles.stack}>
        {heading}
        <div className={styles.orderLists}>
          <div className={styles.orderCol}>
            <p className={styles.listLabel}>Frases</p>
            <ul className={styles.plainList}>
              {available.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    className={styles.sentence}
                    disabled={locked}
                    onClick={() => onResponse([...ids, id])}
                  >
                    {stripEmoji(sentences[Number(id)])}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.orderCol}>
            <p className={styles.listLabel}>Tu conversación</p>
            <ol className={styles.plainList}>
              {ids.map((id, n) => (
                <li key={id}>
                  <button
                    type="button"
                    className={`${styles.sentence} ${styles.sentencePlaced}`}
                    disabled={locked}
                    onClick={() => onResponse(ids.filter((x) => x !== id))}
                  >
                    <span className={styles.sentenceNumber}>{n + 1}</span>
                    <span>{stripEmoji(sentences[Number(id)])}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
