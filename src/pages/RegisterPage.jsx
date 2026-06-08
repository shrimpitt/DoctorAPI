import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "../context/UserAuthContext";
import "./AuthPages.css";

function extractErrorMessage(rawMessage, tServerError, tRegisterError) {
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
    return rawMessage || tRegisterError;
  }
}

export default function RegisterPage() {
  const { register } = useUserAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const { t }        = useTranslation();
  const from         = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
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
    if (!form.fullName.trim())           e.fullName = t("registerPage.fullNameError");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("registerPage.emailError");
    if (form.password.length < 6)        e.password = t("registerPage.passError");
    if (form.password !== form.confirm)  e.confirm  = t("registerPage.confirmError");
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Register error:", err.message);
      setApiError(extractErrorMessage(err.message, t("registerPage.serverError"), t("registerPage.registerError")));
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

        <h1 className="auth-title">{t("registerPage.title")}</h1>
        <p className="auth-subtitle">{t("registerPage.subtitle")}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__grid">
            <div className="form-group">
              <label>{t("registerPage.fullNameLabel")} *</label>
              <input
                type="text"
                placeholder={t("registerPage.fullNamePh")}
                value={form.fullName}
                onChange={e => set("fullName", e.target.value)}
                autoFocus
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>{t("registerPage.emailLabel")} *</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set("email", e.target.value)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>{t("registerPage.passLabel")} *</label>
              <input
                type="password"
                placeholder={t("registerPage.passPh")}
                value={form.password}
                onChange={e => set("password", e.target.value)}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>{t("registerPage.confirmLabel")} *</label>
              <input
                type="password"
                placeholder={t("registerPage.confirmPh")}
                value={form.confirm}
                onChange={e => set("confirm", e.target.value)}
              />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>
          </div>

          {apiError && <p className="auth-error">{apiError}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? t("registerPage.loading") : t("registerPage.submit")}
          </button>
        </form>

        <p className="auth-switch">
          {t("registerPage.hasAccount")}{" "}
          <Link to="/login" state={{ from: location.state?.from }}>
            {t("registerPage.loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
