import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AuthPages.css";

export default function AuthChoicePage() {
  const { t } = useTranslation();

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

        <h1 className="auth-title">{t("auth.choiceTitle")}</h1>
        <p className="auth-subtitle">{t("auth.choiceSubtitle")}</p>

        <div className="auth-choice-grid">
          <Link to="/login" className="auth-choice-card auth-choice-card--user">
            <div className="auth-choice-card__icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div className="auth-choice-card__title">{t("auth.loginAsUser")}</div>
              <div className="auth-choice-card__desc">{t("auth.choiceUserDesc")}</div>
            </div>
          </Link>

          <Link to="/admin" className="auth-choice-card auth-choice-card--admin">
            <div className="auth-choice-card__icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div className="auth-choice-card__title">{t("auth.loginAsAdmin")}</div>
              <div className="auth-choice-card__desc">{t("auth.choiceAdminDesc")}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
