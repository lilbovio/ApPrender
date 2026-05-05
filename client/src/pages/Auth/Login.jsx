import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      // MODO DEMO: Simular login exitoso sin backend
      // En producción, esto llamaría a useAuth().login(email, password)
      const mockUser = {
        _id: "demo-user-123",
        email: form.email,
        name: form.email.split("@")[0],
        grade: "4to",
        vakType: null,
        xp: 0,
      };

      // Guardar en localStorage (simular JWT)
      localStorage.setItem("token", "demo-token-xyz");
      localStorage.setItem("user", JSON.stringify(mockUser));

      // Pequeño delay para simular request
      await new Promise((r) => setTimeout(r, 800));

      navigate("/home");
    } catch (err) {
      setError("Error al iniciar sesión. Intenta de nuevo.");
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

            <div className={styles.demoHint}>
              <strong>MODO DEMO</strong> — Usa cualquier email y contraseña para explorar
            </div>
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