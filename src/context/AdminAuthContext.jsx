import { createContext, useContext, useState } from "react";

const AdminAuthContext = createContext(null);

const STORAGE_KEY  = "admin_authed";
const TOKEN_KEY    = "admin_token";

export function AdminAuthProvider({ children }) {
  // Check BOTH the flag AND that a token actually exists in localStorage.
  // If the flag is set but the token is missing (expired / manually cleared),
  // treat the session as logged-out so the login screen appears.
  const [isAuthed, setIsAuthed] = useState(
    () =>
      localStorage.getItem(STORAGE_KEY) === "1" &&
      !!localStorage.getItem(TOKEN_KEY)
  );

  const login = async (email, password) => {
    try {
      // Use Vite proxy path (/api/...) instead of a hardcoded port.
      // This keeps the port config in one place (vite.config.js).
      const res = await fetch("/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      // Backend may return camelCase (token) or PascalCase (Token) — handle both.
      const token = data.token ?? data.Token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(STORAGE_KEY, "1");
        setIsAuthed(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setIsAuthed(false);
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  return (
    <AdminAuthContext.Provider value={{ isAuthed, login, logout, getToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
