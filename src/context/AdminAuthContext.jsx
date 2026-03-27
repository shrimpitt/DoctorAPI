import { createContext, useContext, useState } from "react";

const AdminAuthContext = createContext(null);

const STORAGE_KEY  = "admin_authed";
const TOKEN_KEY    = "admin_token";
export function AdminAuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "1"
  );

  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:8080/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
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
