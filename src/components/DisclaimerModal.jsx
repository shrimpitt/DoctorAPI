import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./DisclaimerModal.css";

export default function DisclaimerModal() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleAccept = () => {
    setVisible(false);
  };

  return (
    <div className="disc-overlay" role="dialog" aria-modal="true" aria-labelledby="disc-title">
      <div className="disc-modal">
        {/* Warning icon */}
        <div className="disc-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            width="32" height="32">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <h1 id="disc-title" className="disc-title">{t("disclaimer.title")}</h1>

        <div className="disc-body">
          <p className="disc-line disc-line--bold">{t("disclaimer.line1")}</p>
          <p className="disc-line">{t("disclaimer.line2")}</p>
          <p className="disc-line">{t("disclaimer.line3")}</p>
        </div>

        <button className="disc-accept" onClick={handleAccept}>
          {t("disclaimer.accept")}
        </button>

        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="disc-privacy-link"
        >
          {t("disclaimer.privacy")}
        </a>
      </div>
    </div>
  );
}
