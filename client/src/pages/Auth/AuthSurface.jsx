import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  AvatarPicker,
  Button,
  Field,
  InlineError,
  Logo,
  Pilo,
  Screen,
  SegmentedControl,
} from "../../components/ui";
import styles from "./AuthSurface.module.css";

const MODE_OPTIONS = [
  { value: "register", label: "Soy nuevo" },
  { value: "login", label: "Ya tengo cuenta" },
];

const COPY = {
  register: {
    title: "Empecemos tu aventura",
    support: "Solo pedimos lo necesario para guardar tu progreso.",
    submit: "Crear mi cuenta",
    loading: "Creando tu cuenta…",
  },
  login: {
    title: "Qué bueno verte otra vez",
    support: "Entra con el correo de tu adulto.",
    submit: "Entrar",
    loading: "Entrando…",
  },
};

// Desktop-only notes (>= 900 px). Copy is product literal; the last note varies by mode.
const NOTES = [
  {
    title: "Por qué pedimos tan poco",
    body: "Usamos un apodo y el correo de tu adulto. Nada más.",
  },
  {
    title: "Si algo falta",
    body: "Te mostramos una pista amable para seguir, sin sustos.",
  },
  {
    title: "Qué pasa después",
    register: "Primero, 12 preguntas rápidas para conocer tu superpoder. Luego, tu camino.",
    login: "Vas directo a tu camino de hoy.",
  },
];

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function serverErrorMessage(err) {
  const message = String(err?.message ?? "").toLowerCase();
  if (message.includes("already exists")) {
    return "Ese correo ya tiene una cuenta. Prueba en «Ya tengo cuenta».";
  }
  if (message.includes("invalid email or password")) {
    return "Casi. Revisa el correo y la contraseña.";
  }
  return "No pudimos conectar. Prueba otra vez en un momento.";
}

/**
 * AuthSurface — one surface for both modes: "register" (Soy nuevo) and "login" (Ya tengo cuenta).
 * Mounted on /register and /login as the same element type, so switching modes keeps
 * the component state (typed nickname, email and password survive the switch).
 */
export default function AuthSurface({ mode }) {
  const isRegister = mode === "register";
  const copy = COPY[mode];

  const navigate = useNavigate();
  const { isAuthenticated, hasVAKType, login, register } = useAuth();

  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("pilo");

  const [fieldErrors, setFieldErrors] = useState({});
  const [summary, setSummary] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [shakeField, setShakeField] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const nickRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Errors belong to the mode that produced them.
  useEffect(() => {
    setFieldErrors({});
    setSummary("");
    setShakeField(null);
  }, [mode]);

  if (isAuthenticated) {
    return <Navigate replace to={hasVAKType ? "/home" : "/vak"} />;
  }

  const clearFieldError = (key) => {
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const validate = () => {
    const errors = {};
    if (isRegister && !nick.trim()) {
      errors.nick = "Casi. Escribe cómo te llamamos.";
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = "Casi. Escribe el correo de tu adulto para continuar.";
    }
    if (isRegister && password.length < 8) {
      errors.password = "Casi. La contraseña necesita 8 letras o más.";
    } else if (!isRegister && !password) {
      errors.password = "Casi. Escribe tu contraseña.";
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const errors = validate();
    const firstKey = ["nick", "email", "password"].find((key) => errors[key]);
    if (firstKey) {
      // Field errors only: no summary block, so nothing is announced twice.
      setFieldErrors(errors);
      setSummary("");
      setShakeField(firstKey);
      setShakeKey((key) => key + 1);
      const refs = { nick: nickRef, email: emailRef, password: passwordRef };
      refs[firstKey].current?.focus();
      return;
    }

    setFieldErrors({});
    setSummary("");
    setShakeField(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({
          name: nick.trim(),
          email: email.trim(),
          password,
          avatar,
        });
        navigate("/vak", { replace: true });
      } else {
        const user = await login(email.trim(), password);
        navigate(user.vakType ? "/home" : "/vak", { replace: true });
      }
    } catch (err) {
      // Server errors are the only ones shown in the summary block.
      setSummary(serverErrorMessage(err));
      setShakeKey((key) => key + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModeChange = (nextMode) => {
    navigate(nextMode === "register" ? "/register" : "/login", { replace: true });
  };

  // Shake only the first invalid field, so one failure produces one shake.
  const shakeFor = (key) => (shakeField === key ? shakeKey : 0);

  return (
    <Screen size="auth">
      <div className={styles.layout}>
        <div className={styles.main}>
          <header className={styles.header}>
            <Button variant="quiet" to="/" iconLeft="back" ariaLabel="Volver al inicio" />
            <Logo size={40} withWord />
          </header>

          <h1 className={styles.title}>{copy.title}</h1>
          <p className={styles.support}>{copy.support}</p>

          <div className={styles.modes}>
            <SegmentedControl
              ariaLabel="Modo de acceso"
              idPrefix="auth"
              options={MODE_OPTIONS}
              value={mode}
              onChange={handleModeChange}
            />
          </div>

          <section
            className={styles.card}
            role="tabpanel"
            id="auth-panel"
            aria-labelledby={`auth-tab-${mode}`}
          >
            {!isRegister && (
              <div className={styles.cardHead}>
                <Pilo size={56} />
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              {isRegister && (
                <Field
                  ref={nickRef}
                  id="nick"
                  label="¿Cómo te llamamos?"
                  value={nick}
                  onChange={(e) => {
                    setNick(e.target.value);
                    clearFieldError("nick");
                  }}
                  placeholder="Ana"
                  autoComplete="nickname"
                  error={fieldErrors.nick}
                  shakeKey={shakeFor("nick")}
                  disabled={submitting}
                />
              )}

              <Field
                ref={emailRef}
                id="email"
                label="Correo de tu adulto"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                placeholder="adulto@ejemplo.com"
                autoComplete="email"
                error={fieldErrors.email}
                shakeKey={shakeFor("email")}
                disabled={submitting}
              />

              <Field
                ref={passwordRef}
                id="password"
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                placeholder={isRegister ? "8 letras o más" : "Tu contraseña"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                error={fieldErrors.password}
                shakeKey={shakeFor("password")}
                disabled={submitting}
              />

              {isRegister && (
                <div className={styles.avatarBlock}>
                  <p className={styles.micro}>Elige tu compañero</p>
                  <AvatarPicker label="Elige tu compañero" value={avatar} onChange={setAvatar} />
                </div>
              )}

              {summary && <InlineError shakeKey={shakeKey}>{summary}</InlineError>}

              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? copy.loading : copy.submit}
              </Button>
            </form>
          </section>
        </div>

        <aside className={styles.notes} aria-label="Antes de empezar">
          {NOTES.map((note) => (
            <div key={note.title} className={styles.note}>
              <h2 className={styles.noteTitle}>{note.title}</h2>
              <p className={styles.noteBody}>{note.body ?? (isRegister ? note.register : note.login)}</p>
            </div>
          ))}
        </aside>
      </div>
    </Screen>
  );
}
