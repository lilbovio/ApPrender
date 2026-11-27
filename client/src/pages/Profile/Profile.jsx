import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./Profile.module.css";
import {
  Screen,
  Chip,
  Button,
  Field,
  AvatarPicker,
  AvatarMark,
  InlineError,
  BottomNav,
  LessonRow,
} from "../../components/ui";
import { isPhotoAvatar } from "../../components/ui/AvatarPicker";
import { useShake } from "../../components/ui/useShake";
import { useAuth } from "../../context/AuthContext";
import useLearningData from "../../hooks/useLearningData";
import { apiRequest } from "../../services/api";
import { MODALITY_COPY, readSecondary } from "../../utils/vakUtils";
import { computeBadges } from "../../utils/badgeUtils";
import { levelFor } from "../../utils/lessonUtils";
import { compressImageToDataUrl } from "../../utils/imageUtils";

const NAME_EMPTY_COPY = "Casi. Escribe cómo te llamamos.";
const EMAIL_COPY = "Casi. Escribe el correo de tu adulto para continuar.";
const PASSWORD_SHORT_COPY = "Casi. La contraseña necesita 8 letras o más.";
const REPEAT_COPY = "Casi. Las dos contraseñas no son iguales.";
const PHOTO_BIG_COPY = "Casi. Esa foto es muy grande. Prueba con otra.";
const PHOTO_TYPE_COPY = "Casi. Elige una imagen (JPG o PNG).";
const DUPLICATE_EMAIL_COPY = "Ese correo ya tiene una cuenta. Usa otro correo.";
const SAVE_ERROR_COPY = "Casi. No pudimos guardar. Prueba otra vez.";
const SAVED_COPY = "Listo. Guardamos tus cambios.";
const SAVED_PASSWORD_COPY = "Listo. Guardamos tus cambios y tu nueva contraseña.";
const PHOTO_STAGED_COPY = "Foto lista: se guardará con tus cambios.";
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const DUPLICATE_PATTERN = /E11000|duplicate/i;
const SAVED_HIDE_MS = 4000;
const FIELD_ORDER = ["name", "email", "password", "repeat"];

export default function Profile() {
  const { user, updateUser, signOut } = useAuth();
  const location = useLocation();
  const reduce = useReducedMotion();
  const { status, lessons, progress, totals, reload } = useLearningData();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatar, setAvatar] = useState(user?.avatar || "pilo");
  const [photo, setPhoto] = useState(null); // staged upload, not saved yet
  const [photoError, setPhotoError] = useState(null);
  const [photoErrorKey, setPhotoErrorKey] = useState(0);
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState({ field: null, key: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveErrorKey, setSaveErrorKey] = useState(0);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const repeatRef = useRef(null);
  const logrosRef = useRef(null);
  const photoErrorControls = useShake(photoErrorKey);

  const fieldRefs = { name: nameRef, email: emailRef, password: passwordRef, repeat: repeatRef };

  // Jump to the badges when arriving via #logros (BottomNav "Logros").
  useEffect(() => {
    if (location.hash !== "#logros") return;
    const heading = logrosRef.current;
    if (!heading) return;
    heading.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    heading.focus({ preventScroll: true });
  }, [location.hash, reduce]);

  // The "Listo" block is transient.
  useEffect(() => {
    if (!saved) return undefined;
    const timer = setTimeout(() => setSaved(null), SAVED_HIDE_MS);
    return () => clearTimeout(timer);
  }, [saved]);

  if (!user) return null;

  const storedAvatar = user.avatar || "pilo";
  const storedPhoto = isPhotoAvatar(storedAvatar) ? storedAvatar : null;
  const currentPhoto = photo ?? storedPhoto;
  const photoStaged = photo !== null && avatar === photo;
  const secondary = readSecondary(user._id);
  const vakCopy = user.vakType ? MODALITY_COPY[user.vakType] : null;
  const secondaryCopy = secondary ? MODALITY_COPY[secondary] : null;
  const level = levelFor(totals.xp);
  const badges = computeBadges({ lessons, progress, totals });

  // Only the changed fields go into the request body.
  const buildBody = () => {
    const body = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName !== (user.name ?? "")) body.name = trimmedName;
    if (trimmedEmail !== (user.email ?? "")) body.email = trimmedEmail;
    if (avatar !== storedAvatar) body.avatar = avatar;
    if (password !== "") body.password = password;
    return body;
  };

  const canSave = !saving && Object.keys(buildBody()).length > 0;

  const validate = () => {
    const next = {};
    if (name.trim() === "") next.name = NAME_EMPTY_COPY;
    if (!EMAIL_PATTERN.test(email.trim())) next.email = EMAIL_COPY;
    if (password !== "" && password.length < 8) next.password = PASSWORD_SHORT_COPY;
    if (passwordRepeat !== password) next.repeat = REPEAT_COPY;
    return next;
  };

  const shakeFor = (field) => (shake.field === field ? shake.key : 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const nextErrors = validate();
    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
    setErrors(nextErrors);
    setSaved(null);
    setSaveError(null);
    if (firstInvalid) {
      setShake((prev) => ({ field: firstInvalid, key: prev.key + 1 }));
      fieldRefs[firstInvalid].current?.focus();
      return;
    }

    const body = buildBody();
    if (Object.keys(body).length === 0) return;

    setSaving(true);
    try {
      const response = await apiRequest("/users/profile", "PUT", body);
      updateUser(response);
      setPassword("");
      setPasswordRepeat("");
      setErrors({});
      setPhoto(null);
      setPhotoError(null);
      setSaved(body.password ? SAVED_PASSWORD_COPY : SAVED_COPY);
    } catch (error) {
      const duplicate = DUPLICATE_PATTERN.test(error?.message ?? "");
      setSaveError(duplicate ? DUPLICATE_EMAIL_COPY : SAVE_ERROR_COPY);
      setSaveErrorKey((key) => key + 1);
    } finally {
      setSaving(false);
    }
  };

  // Full navigation to the landing; see AuthContext.signOut (DESIGN.md §7).
  const handleLogout = () => {
    signOut();
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
    setErrors((prev) => ({ ...prev, name: undefined }));
    setSaved(null);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setErrors((prev) => ({ ...prev, email: undefined }));
    setSaved(null);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setErrors((prev) => ({ ...prev, password: undefined, repeat: undefined }));
    setSaved(null);
  };

  const handleRepeatChange = (event) => {
    setPasswordRepeat(event.target.value);
    setErrors((prev) => ({ ...prev, repeat: undefined }));
    setSaved(null);
  };

  const handleAvatarChange = (value) => {
    setAvatar(value);
    setSaved(null);
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    try {
      const { dataUrl } = await compressImageToDataUrl(file);
      setPhoto(dataUrl);
      setAvatar(dataUrl);
      setPhotoError(null);
      setSaved(null);
    } catch (error) {
      setPhotoError(error?.code === "TOO_BIG" ? PHOTO_BIG_COPY : PHOTO_TYPE_COPY);
      setPhotoErrorKey((key) => key + 1);
    }
  };

  return (
    <>
      <Screen withNav>
        {/*
          Two columns at 900 px and up: identity and badges left, progress and settings right.
          Below 900 px both columns are display: contents and the children are ordered with CSS:
          identity, stats, badges, settings.
        */}
        <div className={styles.columns}>
          <div className={styles.left}>
            {/* Pilo is never decorative here: a Pilo inside AvatarMark or AvatarPicker is user-chosen content. */}
            <header className={styles.hero}>
              <div className={styles.avatarCircle}>
                <AvatarMark value={storedAvatar} size={isPhotoAvatar(storedAvatar) ? 72 : 40} />
              </div>
              <div className={styles.heroText}>
                <h1 className={styles.title}>{user.name}</h1>
                {status === "ready" && <p className={styles.level}>{`Nivel ${level}`}</p>}
              </div>
            </header>

            {vakCopy && (
              <div className={styles.superpower}>
                <Chip tone="accent" icon={vakCopy.icon}>
                  {`Tu superpoder: ${vakCopy.name}`}
                </Chip>
                {secondaryCopy && <Chip tone="neutral">{`También: ${secondaryCopy.name}`}</Chip>}
                <Button variant="quiet" to="/vak">
                  Repetir la encuesta
                </Button>
              </div>
            )}

            <section id="logros" className={`${styles.section} ${styles.badges}`} aria-labelledby="logros-title">
              <h2 id="logros-title" ref={logrosRef} tabIndex={-1} className={styles.h2}>
                Mis insignias
              </h2>
              {status === "loading" && (
                <p className={styles.note} aria-busy="true">
                  Preparando tus insignias…
                </p>
              )}
              {status === "error" && (
                <div className={styles.errorWrap}>
                  <InlineError>Casi. No pudimos cargar tus insignias. Revisa tu conexión.</InlineError>
                  <Button variant="quiet" onClick={reload}>
                    Intentar otra vez
                  </Button>
                </div>
              )}
              {status === "ready" && (
                <div>
                  {badges.map((badge) => (
                    <LessonRow
                      key={badge.id}
                      icon={badge.earned ? badge.icon : "lock"}
                      title={badge.title}
                      meta={badge.earned ? badge.earnedMeta : badge.lockedMeta}
                      state={badge.earned ? "done" : "locked"}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className={styles.right}>
            {status === "ready" && (
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{totals.xp}</span>
                  <span className={styles.statLabel}>XP total</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{totals.streak}</span>
                  <span className={styles.statLabel}>
                    {`${totals.streak === 1 ? "Día" : "Días"} de racha`}
                  </span>
                </div>
              </div>
            )}

            <section className={`${styles.section} ${styles.settings}`} aria-labelledby="cuenta-title">
              <h2 id="cuenta-title" className={styles.h2}>
                Mi cuenta
              </h2>
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <Field
                  id="profile-nick"
                  label="¿Cómo te llamamos?"
                  value={name}
                  onChange={handleNameChange}
                  autoComplete="nickname"
                  error={errors.name}
                  shakeKey={shakeFor("name")}
                  ref={nameRef}
                />

                <Field
                  id="profile-email"
                  type="email"
                  label="Correo de tu adulto"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                  inputMode="email"
                  error={errors.email}
                  shakeKey={shakeFor("email")}
                  ref={emailRef}
                />

                <div className={styles.avatarBlock}>
                  <p className={styles.microLabel}>Elige tu compañero</p>
                  <AvatarPicker
                    value={avatar}
                    onChange={handleAvatarChange}
                    label="Elige tu compañero"
                    photo={currentPhoto}
                  />

                  <div className={styles.photoRow}>
                    <input
                      id="profile-photo"
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={handlePhotoChange}
                      aria-invalid={photoError ? "true" : undefined}
                      aria-describedby={photoError ? "profile-photo-error" : undefined}
                    />
                    <label htmlFor="profile-photo" className={styles.uploadLabel}>
                      {currentPhoto ? "Cambiar la foto" : "Subir una foto"}
                    </label>
                    <p className={styles.photoHint} aria-live="polite">
                      {photoStaged ? PHOTO_STAGED_COPY : ""}
                    </p>
                    {photoError && (
                      <motion.p
                        id="profile-photo-error"
                        className={styles.fieldError}
                        animate={photoErrorControls}
                      >
                        {photoError}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className={styles.passwordBlock} role="group" aria-labelledby="password-title">
                  <h3 id="password-title" className={styles.h3}>
                    Cambiar contraseña
                  </h3>
                  <Field
                    id="profile-password"
                    type="password"
                    label="Nueva contraseña"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="8 letras o más"
                    autoComplete="new-password"
                    error={errors.password}
                    shakeKey={shakeFor("password")}
                    ref={passwordRef}
                  />
                  <Field
                    id="profile-password-repeat"
                    type="password"
                    label="Repite la contraseña"
                    value={passwordRepeat}
                    onChange={handleRepeatChange}
                    autoComplete="new-password"
                    error={errors.repeat}
                    shakeKey={shakeFor("repeat")}
                    ref={repeatRef}
                  />
                </div>

                {saveError && <InlineError shakeKey={saveErrorKey}>{saveError}</InlineError>}
                {saved && (
                  <p role="status" className={styles.saved}>
                    {saved}
                  </p>
                )}

                <Button type="submit" fullWidth disabled={!canSave} className={styles.save}>
                  {saving ? "Guardando…" : "Guardar cambios"}
                </Button>
              </form>

              <Button variant="quiet" iconLeft="logout" onClick={handleLogout} className={styles.logout}>
                Cerrar sesión
              </Button>
            </section>
          </div>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}
