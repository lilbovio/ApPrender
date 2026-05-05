import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

/**
 * AuthContext
 * Maneja: login, register, logout, usuario actual, token JWT.
 * El token se guarda en localStorage para persistir la sesión.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { _id, name, email, username, avatar, grade, vakType, ... }
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // cargando el usuario inicial
  const [error, setError] = useState(null);

  // Al montar, si hay token, cargar datos del usuario
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Token inválido o expirado
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    setError(null);
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const register = useCallback(async (name, email, password, grade) => {
    setError(null);
    const res = await api.post("/auth/register", { name, email, password, grade });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  // Actualizar datos del usuario localmente (ej. tras editar perfil)
  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  // Guardar tipo VAK tras el test inicial
  const saveVAKType = useCallback(async (vakType) => {
    const res = await api.patch(
      "/auth/vak",
      { vakType },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setUser((prev) => ({ ...prev, vakType }));
    return res.data;
  }, [token]);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    hasVAKType: !!user?.vakType,
    login,
    register,
    logout,
    updateUser,
    saveVAKType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook de uso
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

export default AuthContext;