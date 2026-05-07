import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Login.module.css";
import ChispappLogo from "../../assets/ChispappICON.png";

/**
 * Login — Pantalla de inicio de sesión
 * MODO DEMO: Acepta cualquier email + password para navegar sin backend
 * El token se guarda en localStorage para simular sesión
 */
const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const user = await login(form.email, form.password);

      if (user.vakType === null) {
        navigate("/vak");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          {/* Header con logo */}
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              <img src={ChispappLogo} alt="Chispa Logo" className={styles.logo} />
            </div>
            <h1 className={styles.title}>Chispa</h1>
            <p className={styles.subtitle}>Tu plataforma de aprendizaje adaptativo</p>
          </div>

          {/* Formulario */}
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Correo electrónico</label>
              <input
                className={styles.input}
                type="email"
                placeholder="usuario@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Contraseña</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "14px",
                  color: "var(--error)",
                }}
              >
                {error}
              </div>
            )}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={loading}
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Cargando..." : "Entrar"}
            </button>
          </form>

          {/* Footer */}
          <p className={styles.footerText}>
            ¿No tienes cuenta?{" "}
            <span
              className={styles.registerLink}
              onClick={() => navigate("/register")}
            >
              Regístrate aquí
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;