import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "../context/UserAuthContext";
import "./AuthPages.css";

function extractErrorMessage(rawMessage, tServerError, tLoginError) {
  if (!rawMessage || rawMessage === "Failed to fetch" || rawMessage.startsWith("NetworkError")) {
    return tServerError;
  }
  try {
    const parsed = JSON.parse(rawMessage);
    if (parsed.errors) {
      const first = Object.values(parsed.errors).flat()[0];
      if (first) return first;
    }
    return parsed.message || parsed.title || rawMessage;
  } catch {
    return rawMessage || tLoginError;
  }
}

export default function LoginPage() {
  const { login }  = useUserAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { t }      = useTranslation();
  const from       = location.state?.from?.pathname || "/";

  const [form, setForm]         = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = t("loginPage.emailError");
    if (form.password.length < 6)
      e.password = t("loginPage.passError");
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err.message);
      setApiError(extractErrorMessage(err.message, t("loginPage.serverError"), t("loginPage.loginError")));
    } finally {
      setLoading(false);
    }
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

        <h1 className="auth-title">{t("loginPage.title")}</h1>
        <p className="auth-subtitle">{t("loginPage.subtitle")}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t("loginPage.emailLabel")}</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              required
              autoFocus
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>{t("loginPage.passLabel")}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => set("password", e.target.value)}
              required
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {apiError && <p className="auth-error">{apiError}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? t("loginPage.loading") : t("loginPage.submit")}
          </button>
        </form>

        <p className="auth-switch">
          {t("loginPage.noAccount")}{" "}
          <Link to="/register" state={{ from: location.state?.from }}>
            {t("loginPage.registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
