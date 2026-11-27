import { Fragment } from "react";
import Icon from "../ui/Icon";
import PictureArt from "./PictureArt";
import { parseCountGroups, pictureArt, pictureWord, stripEmoji } from "../../utils/exerciseUtils";
import styles from "./Lesson.module.css";

/** Dialogue lines as a plain list. Emoji are removed from every line. */
export function DialogueLines({ lines }) {
  if (!Array.isArray(lines) || lines.length === 0) return null;
  return (
    <ul className={styles.dialogue}>
      {lines.map((line, i) => (
        <li key={i}>{stripEmoji(line)}</li>
      ))}
    </ul>
  );
}

/**
 * VisualPrompt — the picture side of a visual exercise.
 * Countable objects become rows of tokens; a picture emoji becomes a word card;
 * colours become a swatch; anything else is described in a hairline block.
 */
export default function VisualPrompt({ exercise, subject }) {
  const groups = parseCountGroups(exercise.image);
  const word = pictureWord(exercise.image);
  const imageText = stripEmoji(exercise.image);
  const isEnglish = subject === "english";
  const iconName = isEnglish ? "star" : "apple";
  const toneClass = isEnglish ? styles.english : styles.math;

  return (
    <div className={styles.visual}>
      {groups.length > 0 && (
        <div className={styles.groups}>
          {groups.map((group, gi) => (
            <Fragment key={`${group.label}-${gi}`}>
              {gi > 0 && (
                <span className={styles.plus} aria-hidden="true">
                  +
                </span>
              )}
              <div className={styles.group}>
                <div className={styles.tokenRow} role="img" aria-label={`${group.count} ${group.label}`}>
                  {Array.from({ length: group.count }, (_, k) => (
                    <span key={k} className={`${styles.countToken} ${toneClass}`}>
                      <Icon name={iconName} size={20} />
                    </span>
                  ))}
                </div>
                <span className={styles.groupLabel}>{stripEmoji(group.label)}</span>
              </div>
            </Fragment>
          ))}
        </div>
      )}

      {groups.length === 0 && word && (
        <div className={styles.pictureCard} role="img" aria-label={`Imagen: ${word}`}>
          <PictureArt name={pictureArt(exercise.image)} size={72} className={styles.pictureArt} />
          <span className={styles.pictureWord}>{word}</span>
        </div>
      )}

      {groups.length === 0 && !word && exercise.colorSample && (
        <div
          className={styles.swatch}
          role="img"
          aria-label="Muestra de color"
          style={{ background: exercise.colorSample }}
        />
      )}

      {groups.length === 0 && !word && !exercise.colorSample && imageText && (
        <div className={styles.imageBlock}>
          <Icon name="eye" size={24} />
          <span>{`Imagina: ${imageText}`}</span>
        </div>
      )}

      <DialogueLines lines={exercise.dialogue} />
    </div>
  );
}
