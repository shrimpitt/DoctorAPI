import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../api";

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
   * POST /api/Users/login
   * Response shape: { token, userId, fullName, email, role }
   */
  const login = async (email, password) => {
    const data = await loginUser(email, password);

    if (!data.token) throw new Error("Сервер не вернул токен");

    localStorage.setItem(TOKEN_KEY, data.token);

    const userData = {
      id:       data.userId,   // UserAuthResponseDto.UserId
      email:    data.email,
      fullName: data.fullName,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  /**
   * Register a new user via backend API.
   * POST /api/Users/register
   * Body:     { fullName, email, password }
   * Response: { token, userId, fullName, email, role }
   */
  const register = async (formData) => {
    const data = await registerUser(formData);

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }

    const userData = {
      id:       data.userId,
      email:    data.email,
      fullName: data.fullName,
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
