import { useState } from "react";
import styles from "./Login.module.css";

/**
 * RegisterForm — Formulario de registro para nuevos usuarios
 */
const RegisterForm = ({ onBack, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    grade: "1",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.grade) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Simular delay de red
      await new Promise((r) => setTimeout(r, 800));

      // Crear usuario mock SIN vakType (irá a VAK test)
      const mockUser = {
        _id: "demo-user-" + Date.now(),
        email: form.email,
        name: form.name,
        grade: form.grade,
        vakType: null, // Nuevos usuarios irán al VAK test
        xp: 0,
      };

      onSuccess(mockUser);
    } catch (err) {
      setError("Error al registrarse. Intenta de nuevo.");
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
          <h2 className={styles.formTitle}>Crear cuenta</h2>
          <p className={styles.formSubtitle}>¡Bienvenido a Chispa!</p>
        </div>
      </div>

      <div className={styles.formContent}>
        <form className={styles.formFields} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Nombre</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Tu nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={loading}
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Grado</label>
            <select
              className={styles.selectInput}
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              disabled={loading}
            >
              <option value="">Selecciona tu grado</option>
              <option value="1">1° Primaria</option>
              <option value="2">2° Primaria</option>
              <option value="3">3° Primaria</option>
              <option value="4">4° Primaria</option>
              <option value="5">5° Primaria</option>
              <option value="6">6° Primaria</option>
              <option value="1s">1° Secundaria</option>
              <option value="2s">2° Secundaria</option>
              <option value="3s">3° Secundaria</option>
            </select>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className={styles.footerText}>
          🎓 MODO DEMO — Próximo paso: descubriremos tu estilo de aprendizaje
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
