import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "../context/UserAuthContext";
import "./Hero.css";

const featureIcons = [
  <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>,
];

const statNums = ["15+", "3000+", "12+"];
const statKeys = ["stat1", "stat2", "stat3"];

export default function Hero() {
  const { t } = useTranslation();
  // Use UserAuthContext — never AdminAuthContext here
  const { isAuthenticated, user } = useUserAuth();

  // First word of full name for the greeting
  const firstName = user?.fullName?.split(" ")[0];

  const ringText = t("hero.ringText");

  return (
    <section className="hero">
      {/* Left content */}
      <div className="hero__left">
        <div className="hero__left-inner">
          {/* Badge */}
          <div className="hero__badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {t("hero.badge")}
          </div>

          {/* Title — personalised if user is logged in */}
          {isAuthenticated && firstName ? (
            <h1 className="hero__title">
              {t("hero.greeting")},{" "}
              <em>{firstName}</em>!<br />
              {t("hero.titleUser1")}<br />{t("hero.titleUser2")}
            </h1>
          ) : (
            <h1 className="hero__title">
              <span className="hero__title-line1">
                {t("hero.titleMain1")}
                <div className="hero__rotating-badge" aria-hidden="true">
                  <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
                    <defs>
                      <path id="badge-circle" d="M 65,65 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0"/>
                    </defs>
                    <text className="hero__badge-ring-text">
                      <textPath href="#badge-circle" startOffset="0%">{ringText}</textPath>
                    </text>
                  </svg>
                  <div className="hero__badge-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5B4FCF" strokeWidth="1.8">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9 12 11 14 15 10" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
              </span>
              <em>{t("hero.titleMain2")}</em>
            </h1>
          )}

          {/* Feature cards */}
          <div className="hero__features">
            {featureIcons.map((icon, i) => (
              <div className="hero__feature" key={i}>
                <div className="hero__feature-icon">{icon}</div>
                <span>{t(`hero.feature${i + 1}`)}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link to="/booking" className="hero__cta">
            {t("hero.cta")}
          </Link>

          {/* Stats */}
          <div className="hero__stats">
            {statNums.map((num, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="hero__stats-divider" />}
                <div className="hero__stat">
                  <span className="hero__stat-num">{num}</span>
                  <span className="hero__stat-label">{t(`hero.${statKeys[i]}`)}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Right photo panel */}
      <div className="hero__right">
        <svg className="hero__branches" viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M380 0 C360 80, 300 120, 280 200 C260 280, 310 320, 290 420 C270 520, 200 540, 220 640 C240 740, 300 760, 280 800" stroke="#9090a0" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M280 200 C320 180, 360 160, 380 140" stroke="#9090a0" strokeWidth="1" strokeLinecap="round"/>
          <path d="M280 200 C240 220, 210 260, 200 300" stroke="#9090a0" strokeWidth="1" strokeLinecap="round"/>
          <path d="M290 420 C330 400, 360 380, 375 350" stroke="#9090a0" strokeWidth="1" strokeLinecap="round"/>
          <path d="M290 420 C250 445, 220 470, 210 510" stroke="#9090a0" strokeWidth="1" strokeLinecap="round"/>
          <path d="M220 640 C260 620, 300 600, 320 570" stroke="#9090a0" strokeWidth="1" strokeLinecap="round"/>
          <path d="M220 640 C190 660, 170 690, 175 730" stroke="#9090a0" strokeWidth="1" strokeLinecap="round"/>
          <path d="M340 60 C355 40, 370 20, 390 10" stroke="#9090a0" strokeWidth="0.8" strokeLinecap="round"/>
          <path d="M340 60 C320 75, 295 80, 275 90" stroke="#9090a0" strokeWidth="0.8" strokeLinecap="round"/>
          <path d="M210 510 C185 525, 160 540, 155 570" stroke="#9090a0" strokeWidth="0.8" strokeLinecap="round"/>
          <path d="M210 510 C230 535, 245 555, 240 580" stroke="#9090a0" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>

        <div className="hero__ring">
          <svg viewBox="0 0 300 300" className="hero__ring-svg">
            <defs>
              <path id="circle-path" d="M 150,150 m -110,0 a 110,110 0 1,1 220,0 a 110,110 0 1,1 -220,0"/>
            </defs>
            <text className="hero__ring-text">
              <textPath href="#circle-path" startOffset="0%">{ringText}</textPath>
            </text>
          </svg>
        </div>

        <img
          src="/images/doctor.png"
          alt="Доктор Кадырбекова"
          className="hero__photo"
        />
      </div>
    </section>
  );
}
