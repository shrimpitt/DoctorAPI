import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./AdminLayout.css";

const NAV = [
  { to: "/admin/appointments", label: "Записи", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )},
  { to: "/admin/orders", label: "Заказы", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
    </svg>
  )},
  { to: "/admin/products", label: "Товары", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )},
  { to: "/admin/slots", label: "Расписание", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )},
];

function AdminLoginScreen() {
  const { login } = useAdminAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await login(email, password);
    if (!ok) setError("Неверный email или пароль");
    setLoading(false);
  };

  return (
    <div className="admin-login">
      <form className="admin-login__form" onSubmit={handleSubmit}>
        <div className="admin-login__logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h2>Панель управления</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
          Войдите как администратор
        </p>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required placeholder="admin@doctor.com" />
        </div>
        <div className="form-group">
          <label>Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
        </div>
        {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}
        <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLayout() {
  const { isAuthed, logout } = useAdminAuth();

  if (!isAuthed) return <AdminLoginScreen />;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <div className="admin-sidebar__logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span>Admin Panel</span>
        </div>
        <nav className="admin-sidebar__nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link--active" : ""}`}>
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <NavLink to="/" className="admin-nav-link" style={{ fontSize: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            На сайт
          </NavLink>
          <button className="admin-logout" onClick={logout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Выйти
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
