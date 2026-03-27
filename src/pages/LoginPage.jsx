import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || "/";

  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate(result.user.role === "admin" ? "/admin" : from, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span>Dr. Kadyrbekova</span>
        </Link>

        <h1 className="auth-title">Войти в аккаунт</h1>
        <p className="auth-subtitle">Добро пожаловать обратно</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => set("password", e.target.value)}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Входим…" : "Войти"}
          </button>
        </form>

        <p className="auth-switch">
          Нет аккаунта?{" "}
          <Link to="/register">Зарегистрироваться</Link>
        </p>

        <div className="auth-hint">
          <strong>Демо-данные:</strong><br />
          Клиент: зарегистрируйтесь сами<br />
          Администратор: admin@clinic.kz / admin123
        </div>
      </div>
    </div>
  );
}
