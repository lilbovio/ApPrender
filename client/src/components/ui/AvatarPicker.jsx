import { useRef } from "react";
import Icon from "./Icon";
import Pilo from "./Pilo";
import styles from "./AvatarPicker.module.css";

/**
 * Avatar options. Pilo is drawn; book and star are stroke icons.
 * Pilo appears once per screen, so the picker is the only place that renders it in Register.
 */
export const AVATARS = [
  { value: "pilo", label: "Pilo", render: <Pilo size={40} /> },
  { value: "book", label: "Libro", icon: "book" },
  { value: "star", label: "Estrella", icon: "star" },
];

const PHOTO_PREFIX = "data:image/";

export function isPhotoAvatar(value) {
  return typeof value === "string" && value.startsWith(PHOTO_PREFIX);
}

/**
 * AvatarMark — renders the avatar for a stored `avatar` value.
 * A data:image URL renders as a photo circle; stroke ids render as icons; unknown values fall back to Pilo.
 */
export function AvatarMark({ value, size = 40 }) {
  if (isPhotoAvatar(value)) {
    return (
      <img
        src={value}
        alt=""
        className={styles.photo}
        style={{ width: size, height: size }}
      />
    );
  }
  if (value === "book" || value === "star") {
    return <Icon name={value} size={size} />;
  }
  return <Pilo size={size} />;
}

/**
 * AvatarPicker — radio group of avatars. Left/Right arrows move the selection.
 * Pass `photo` (a data URL) to add a fourth option, "Mi foto", that selects the photo.
 */
export default function AvatarPicker({ value, onChange, label, photo }) {
  const buttonRefs = useRef([]);

  const options = photo
    ? [...AVATARS, { value: photo, label: "Mi foto", key: "photo", photo: true }]
    : AVATARS;

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  // With no match, the first option stays reachable by Tab.
  const tabStopIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const handleKeyDown = (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();

    const current = Math.max(selectedIndex, 0);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = (current + step + options.length) % options.length;

    onChange(options[next].value);
    buttonRefs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className={styles.group} onKeyDown={handleKeyDown}>
      {options.map((opt, index) => {
        const selected = opt.value === value;
        const className = [styles.option, selected && styles.selected].filter(Boolean).join(" ");
        return (
          <button
            key={opt.key ?? opt.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt.label}
            tabIndex={index === tabStopIndex ? 0 : -1}
            className={className}
            onClick={() => onChange(opt.value)}
          >
            {opt.photo ? (
              <img src={opt.value} alt="" className={styles.thumb} />
            ) : (
              (opt.render ?? <Icon name={opt.icon} size={34} />)
            )}
          </button>
        );
      })}
    </div>
  );
}
