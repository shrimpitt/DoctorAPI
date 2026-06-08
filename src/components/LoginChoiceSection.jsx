import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "../context/UserAuthContext";
import "./LoginChoiceSection.css";

export default function LoginChoiceSection() {
  const { isAuthenticated } = useUserAuth();
  const { t } = useTranslation();

  if (isAuthenticated) return null;

  return (
    <div className="login-choice">
      <div className="container login-choice__inner">
        <Link to="/login" className="login-choice__btn login-choice__btn--user">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          {t("auth.loginAsUser")}
        </Link>
        <Link to="/admin" className="login-choice__btn login-choice__btn--admin">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          {t("auth.loginAsAdmin")}
        </Link>
      </div>
    </div>
  );
}
