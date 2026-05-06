import { useState } from "react";
import styles from "./Login.module.css";

/**
 * LoginForm — Formulario de login para usuarios existentes
 */
const LoginForm = ({ onBack, onSuccess }) => {
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
      // Simular delay de red
      await new Promise((r) => setTimeout(r, 800));

      // Crear usuario mock
      const mockUser = {
        _id: "demo-user-123",
        email: form.email,
        name: form.email.split("@")[0],
        grade: "4to",
        vakType: "visual", // Usuarios existentes tienen VAK type
        xp: 1250,
      };

      onSuccess(mockUser);
    } catch (err) {
      setError("Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formTopbar}>
        <button className={styles.backButton} onClick={onBack}>
          ←
        </button>
        <div>
          <h2 className={styles.formTitle}>Iniciar sesión</h2>
          <p className={styles.formSubtitle}>Ingresa con tu cuenta</p>
        </div>
      </div>

      <div className={styles.formContent}>
        <form className={styles.formFields} onSubmit={handleSubmit}>
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

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Entrar"}
          </button>
        </form>

        <p className={styles.footerText}>
          🎓 MODO DEMO — Usa cualquier email y contraseña
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
