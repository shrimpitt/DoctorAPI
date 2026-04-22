import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import "./AuthPages.css";

export default function RegisterPage() {
  const { register } = useUserAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  // Return to the page the user originally wanted (passed through /login state)
  const from         = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirm: "",
  });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
    setApiError("");
  };

  // Client-side validation
  const validate = () => {
    const e = {};
    if (!form.fullName.trim())
      e.fullName = "Введите ваше имя";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Введите корректный email";
    if (form.password.length < 6)
      e.password = "Пароль — минимум 6 символов";
    if (form.password !== form.confirm)
      e.confirm = "Пароли не совпадают";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email:    form.email,
        password: form.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message.includes("409") || err.message.includes("400")
        ? "Пользователь с таким email уже существует"
        : "Ошибка регистрации. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
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
          <div className="auth-form__grid">
            <div className="form-group">
              <label>Имя и фамилия *</label>
              <input
                type="text"
                placeholder="Иван Иванов"
                value={form.fullName}
                onChange={e => set("fullName", e.target.value)}
                autoFocus
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set("email", e.target.value)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Пароль *</label>
              <input
                type="password"
                placeholder="Минимум 6 символов"
                value={form.password}
                onChange={e => set("password", e.target.value)}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Подтверждение пароля *</label>
              <input
                type="password"
                placeholder="Повторите пароль"
                value={form.confirm}
                onChange={e => set("confirm", e.target.value)}
              />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>
          </div>

          {apiError && <p className="auth-error">{apiError}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Регистрируем…" : "Зарегистрироваться"}
          </button>
        </form>

        <p className="auth-switch">
          Уже есть аккаунт?{" "}
          <Link to="/login" state={{ from: location.state?.from }}>Войти</Link>
        </p>
      </div>
    </div>
  );
}
