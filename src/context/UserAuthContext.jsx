import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getCurrentUser } from "../api";

const UserAuthContext = createContext(null);

const TOKEN_KEY = "user_token";

/**
 * Normalise the login/register response into a consistent user object.
 * Handles both flat and nested shapes:
 *   Flat:   { Token, UserId, FullName, Email, Role }
 *   Nested: { Token, User: { Id, FullName, Email, Phone, Role } }
 * ASP.NET Core serialises to camelCase by default, so also handles lowercase keys.
 */
function parseAuthResponse(data) {
  const token = data.Token || data.token;

  // Prefer nested User object if present, otherwise use the root object
  const src = data.User || data.user || data;

  const user = {
    id:       src.Id       ?? src.id       ?? data.UserId ?? data.userId ?? null,
    fullName: src.FullName ?? src.fullName ?? "",
    email:    src.Email    ?? src.email    ?? "",
    phone:    src.Phone    ?? src.phone    ?? "",
    role:     src.Role     ?? src.role     ?? "User",
  };

  return { token, user };
}

export function UserAuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  // loading=true while we verify the stored token on mount
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    // Token exists — restore user data from the backend
    getCurrentUser()
      .then(data => {
        setUser({
          id:       data.id       ?? data.Id       ?? null,
          fullName: data.fullName ?? data.FullName ?? "",
          email:    data.email    ?? data.Email    ?? "",
          phone:    data.phone    ?? data.Phone    ?? "",
          role:     data.role     ?? data.Role     ?? "User",
        });
      })
      .catch(() => {
        // Token expired or invalid — drop it silently
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Login with email + password.
   * POST /api/Users/login → UserAuthResponseDto
   * Throws on error so the calling page can display the message.
   */
  const login = async (email, password) => {
    const data = await loginUser(email, password);
    const { token, user: userData } = parseAuthResponse(data);
    if (!token) throw new Error("Сервер не вернул токен");
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
    return userData;
  };

  /**
   * Register a new user.
   * POST /api/Users/register → UserAuthResponseDto
   */
  const register = async (formData) => {
    const data = await registerUser(formData);
    const { token, user: userData } = parseAuthResponse(data);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
    return userData;
  };

  /**
   * Clear user session.
   * Removes ONLY user_token — never touches admin_token.
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const isAuthenticated = !!user && !!localStorage.getItem(TOKEN_KEY);

  return (
    <UserAuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used inside UserAuthProvider");
  return ctx;
}
