import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const ADMIN_CODE = "ADMIN2024";
const STORE_KEY  = "clinic_users";
const USER_KEY   = "clinic_user";

/* Pre-seed a default admin so /admin works immediately */
function seedAdmin() {
  const users = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  if (!users.find(u => u.email === "admin@clinic.kz")) {
    users.push({
      id: 1,
      name: "Администратор",
      email: "admin@clinic.kz",
      phone: "",
      password: "admin123",
      role: "admin",
    });
    localStorage.setItem(STORE_KEY, JSON.stringify(users));
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });

  useEffect(() => { seedAdmin(); }, []);

  /* ── register ── */
  const register = ({ name, email, phone, password, role, adminCode }) => {
    if (role === "admin" && adminCode !== ADMIN_CODE) {
      return { error: "Неверный код доступа администратора" };
    }
    const users = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    if (users.find(u => u.email === email)) {
      return { error: "Пользователь с таким email уже существует" };
    }
    const newUser = {
      id: Date.now(),
      name,
      email,
      phone: phone || "",
      password,
      role: role || "client",
    };
    users.push(newUser);
    localStorage.setItem(STORE_KEY, JSON.stringify(users));
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    return { user: safeUser };
  };

  /* ── login ── */
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { error: "Неверный email или пароль" };
    const { password: _, ...safeUser } = found;
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    return { user: safeUser };
  };

  /* ── logout ── */
  const logout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  /* ── update profile ── */
  const updateProfile = (updates) => {
    const users = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(STORE_KEY, JSON.stringify(users));
    const { password: _, ...safeUser } = users[idx];
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthed:  !!user,
      isAdmin:   user?.role === "admin",
      isClient:  user?.role === "client",
      register,
      login,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
