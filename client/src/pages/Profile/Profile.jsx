import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import styles from "./Profile.module.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", avatar: null });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "" });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUser = { ...user, avatar: reader.result };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await apiRequest("/users/profile", "PUT", {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("¡Perfil guardado con éxito!");
    } catch (error) {
      alert("Error al guardar el perfil: " + error.message);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.new) return;
    try {
      await apiRequest("/users/profile", "PUT", {
        password: passwordForm.new,
      });
      alert("¡Contraseña actualizada!");
      setPasswordForm({ current: "", new: "" });
    } catch (error) {
      alert("Error al actualizar contraseña: " + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate("/home")}>
          ← Inicio
        </button>
        <h1 className={styles.title}>Mi Perfil</h1>
      </div>

      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarWrapper}>
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className={styles.avatarImage} />
            ) : (
              "👤"
            )}
          </div>
          <label className={styles.editAvatarBtn}>
            ✏️
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
          </label>
        </div>
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.formTitle}>Datos Personales</h2>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Nombre de Usuario</label>
          <input
            type="text"
            className={styles.input}
            value={user.name || ""}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            placeholder="¿Cómo te llamas?"
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Correo Electrónico</label>
          <input
            type="email"
            className={styles.input}
            value={user.email || ""}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="tu@email.com"
          />
        </div>

        <button className={styles.saveButton} onClick={handleSaveProfile}>
          Guardar Cambios
        </button>
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.formTitle}>Cambiar Contraseña</h2>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Nueva Contraseña</label>
          <input
            type="password"
            className={styles.input}
            value={passwordForm.new}
            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
            placeholder="Escribe tu nueva contraseña secreta"
          />
        </div>

        <button className={styles.saveButton} onClick={handlePasswordChange}>
          Actualizar Contraseña
        </button>
      </div>

      <button className={styles.logoutButton} onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Profile;