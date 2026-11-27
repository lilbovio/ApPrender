import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

/**
 * AuthContext — the single auth store.
 * Persists "token" and "user" (server user without token) in localStorage.
 * Initial state is read synchronously so protected screens never flash empty.
 */

const TOKEN_KEY = "token";
const USER_KEY = "user";
const VAK_SECONDARY_KEY = "apprender.vakSecondary";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USER_KEY));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function persist(user, token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);

  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function writeUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest("/auth/login", "POST", { email, password });
    const { token: newToken, ...nextUser } = data;
    persist(nextUser, newToken);
    setToken(newToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async ({ name, email, password, avatar }) => {
    const data = await apiRequest("/auth/register", "POST", { name, email, password });
    const { token: newToken, ...nextUser } = data;

    // Persist and set state in one synchronous block, before any further request.
    // apiRequest reads the Bearer token from localStorage, so the token must be stored first.
    persist(nextUser, newToken);
    setToken(newToken);
    setUser(nextUser);

    if (!avatar) return nextUser;

    // The avatar merge only adds to the user that already exists.
    let finalUser;
    try {
      const updated = await apiRequest("/users/profile", "PUT", { avatar });
      const { token: _ignored, ...rest } = updated ?? {};
      finalUser = { ...nextUser, ...rest };
    } catch {
      // Avatar is cosmetic: keep it locally instead of failing the registration.
      finalUser = { ...nextUser, avatar };
    }
    persist(finalUser, newToken);
    setUser(finalUser);
    return finalUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(VAK_SECONDARY_KEY);
    localStorage.removeItem("apprender.week");
    setToken(null);
    setUser(null);
  }, []);

  // Sign-out to the landing (DESIGN.md §7): clear auth storage, then do a full navigation.
  // React state is left alone on purpose, so no re-render lets the route guard redirect to /login
  // before the page unloads; the fresh page boots with empty storage.
  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(VAK_SECONDARY_KEY);
    localStorage.removeItem("apprender.week");
    window.location.replace("/");
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...(prev ?? {}), ...updates };
      writeUser(next);
      return next;
    });
  }, []);

  const saveVAKType = useCallback(async (vakType) => {
    const response = await apiRequest("/vak", "PUT", { vakType });
    setUser((prev) => {
      const next = { ...(prev ?? {}), vakType };
      writeUser(next);
      return next;
    });
    return response;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      hasVAKType: !!user?.vakType,
      login,
      register,
      logout,
      signOut,
      updateUser,
      saveVAKType,
    }),
    [user, token, login, register, logout, signOut, updateUser, saveVAKType]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

export default AuthContext;
