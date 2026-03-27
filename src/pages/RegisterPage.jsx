import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
    role: "client", adminCode: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())            e.name     = "Введите имя";
    if (!form.email.includes("@"))    e.email    = "Некорректный email";
    if (form.password.length < 6)     e.password = "Минимум 6 символов";
    if (form.password !== form.confirm) e.confirm = "Пароли не совпадают";
    if (form.role === "admin" && !form.adminCode.trim())
                                       e.adminCode = "Введите код доступа";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = register({
      name: form.name, email: form.email, phone: form.phone,
      password: form.password, role: form.role, adminCode: form.adminCode,
    });
    setLoading(false);
    if (result.error) { setErrors({ general: result.error }); return; }
    navigate(result.user.role === "admin" ? "/admin" : "/", { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <Link to="/" className="auth-logo">
          <div className="auth-logo__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span>Dr. Kadyrbekova</span>
        </Link>

        <h1 className="auth-title">Создать аккаунт</h1>
        <p className="auth-subtitle">Заполните данные для регистрации</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role toggle */}
          <div className="auth-role-toggle">
            <button
              type="button"
              className={`auth-role-btn ${form.role === "client" ? "active" : ""}`}
              onClick={() => set("role", "client")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Клиент
            </button>
            <button
              type="button"
              className={`auth-role-btn ${form.role === "admin" ? "active" : ""}`}
              onClick={() => set("role", "admin")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Администратор
            </button>
          </div>

          <div className="auth-form__grid">
            <div className="form-group">
              <label>Имя *</label>
              <input
                type="text" placeholder="Ваше имя"
                value={form.name} onChange={e => set("name", e.target.value)} autoFocus
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email" placeholder="you@example.com"
                value={form.email} onChange={e => set("email", e.target.value)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Телефон</label>
              <input
                type="tel" placeholder="+7 777 000 00 00"
                value={form.phone} onChange={e => set("phone", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Пароль *</label>
              <input
                type="password" placeholder="Минимум 6 символов"
                value={form.password} onChange={e => set("password", e.target.value)}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Подтверждение пароля *</label>
              <input
                type="password" placeholder="Повторите пароль"
                value={form.confirm} onChange={e => set("confirm", e.target.value)}
              />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>

            {form.role === "admin" && (
              <div className="form-group">
                <label>Код доступа *</label>
                <input
                  type="password" placeholder="Секретный код администратора"
                  value={form.adminCode} onChange={e => set("adminCode", e.target.value)}
                />
                {errors.adminCode && <span className="field-error">{errors.adminCode}</span>}
              </div>
            )}
          </div>

          {errors.general && <p className="auth-error">{errors.general}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Регистрируем…" : "Зарегистрироваться"}
          </button>
        </form>

        <p className="auth-switch">
          Уже есть аккаунт?{" "}
          <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
