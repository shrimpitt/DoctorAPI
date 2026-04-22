import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getCurrentUser } from "../api";

const UserAuthContext = createContext(null);

const TOKEN_KEY = "user_token";
const USER_KEY  = "user_data";

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });

  // On mount: clear stale state if token is missing
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  /**
   * Login with email + password via backend API.
   * Stores JWT in localStorage["user_token"].
   * Throws on error so the calling page can display the message.
   */
  const login = async (email, password) => {
    const data = await loginUser(email, password);

    const token = data.token || data.accessToken;
    if (!token) throw new Error("Сервер не вернул токен");

    localStorage.setItem(TOKEN_KEY, token);

    const userData = {
      id:       data.id       ?? data.userId ?? null,
      email:    data.email    ?? email,
      fullName: data.fullName ?? data.name   ?? "",
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  /**
   * Register a new user via backend API.
   * Expects data: { fullName, email, password }
   * Automatically logs in if the server returns a token.
   */
  const register = async (formData) => {
    const data = await registerUser(formData);

    const token = data.token || data.accessToken;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }

    const userData = {
      id:       data.id       ?? data.userId      ?? null,
      email:    data.email    ?? formData.email,
      fullName: data.fullName ?? data.name         ?? formData.fullName,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  /** Clear all user session data */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const isAuthenticated = !!user && !!localStorage.getItem(TOKEN_KEY);

  return (
    <UserAuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used inside UserAuthProvider");
  return ctx;
}
