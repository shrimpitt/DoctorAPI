import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./PrivacyPolicyPage.css";

const SECTIONS = [
  "s1", "s2", "s3", "s4", "s5", "s6", "s7",
];

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="pp-page">
      <div className="pp-topbar">
        <Link to="/" className="pp-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            width="16" height="16">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {t("privacy.backBtn")}
        </Link>
      </div>

      <div className="pp-container">
        <header className="pp-header">
          <div className="pp-logo">
            <div className="pp-logo__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                width="20" height="20">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="pp-logo__name">Dr. Kadyrbekova</span>
          </div>
          <h1 className="pp-title">{t("privacy.title")}</h1>
          <p className="pp-date">{t("privacy.date")}</p>
        </header>

        <div className="pp-content">
          {SECTIONS.map((key) => (
            <section className="pp-section" key={key}>
              <h2 className="pp-section__title">{t(`privacy.${key}title`)}</h2>
              <p className="pp-section__text">{t(`privacy.${key}text`)}</p>
            </section>
          ))}
        </div>

        <footer className="pp-footer">
          <Link to="/" className="btn-primary pp-footer__btn">
            {t("privacy.backBtn")}
          </Link>
        </footer>
      </div>
    </div>
  );
}
