import { useTranslation } from "react-i18next";
import "./About.css";

export default function About() {
  const { t } = useTranslation();
  const dirs = t("about.dirs", { returnObjects: true });

  return (
    <>
    {/* ── ABOUT: ACHIEVEMENTS + 3D CHART ── */}
    <section className="about">

      {/* LEFT */}
      <div className="about__left">

        <h2 className="about__title">
          {t("about.titleLine1")}<br />
          <em>{t("about.titleEm")}</em>
        </h2>

        {/* Info cards */}
        <div className="about__cards">
          <div className="about__card">
            <div className="about__card-top">
              <span className="about__card-num">{t("about.card1Num")}</span>
              <div className="about__card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            </div>
            <span className="about__card-label">{t("about.card1Label")}</span>
          </div>
          <div className="about__card">
            <div className="about__card-top">
              <span className="about__card-num">{t("about.card2Num")}</span>
              <div className="about__card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
            </div>
            <span className="about__card-label">{t("about.card2Label")}</span>
          </div>
        </div>

        {/* Direction tags */}
        <p className="about__dirs-label">{t("about.dirsLabel")}</p>
        <div className="about__dirs">
          {dirs.map((tag) => (
            <span className="about__dir-tag" key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      {/* RIGHT: animated circles */}
      <div className="about__right">
        <div className="about__circles-wrap">
          <div className="about__circles">
            <div className="about__circle about__circle--1">
              <span className="about__circle-num">3000+</span>
              <span className="about__circle-label">{t("about.circle1")}</span>
            </div>
            <div className="about__circle about__circle--2">
              <span className="about__circle-num">15+</span>
              <span className="about__circle-label">{t("about.circle2")}</span>
            </div>
            <div className="about__circle about__circle--3">
              <span className="about__circle-num">98%</span>
              <span className="about__circle-label">{t("about.circle3")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── STATS STRIP ── */}
    <div className="about-stats">
      <div className="about-stats__item">
        <span className="about-stats__num">15+</span>
        <span className="about-stats__label">{t("about.stat1")}</span>
      </div>
      <div className="about-stats__divider" />
      <div className="about-stats__item">
        <span className="about-stats__num">3000+</span>
        <span className="about-stats__label">{t("about.stat2")}</span>
      </div>
      <div className="about-stats__divider" />
      <div className="about-stats__item">
        <span className="about-stats__num">12+</span>
        <span className="about-stats__label">{t("about.stat3")}</span>
      </div>
      <div className="about-stats__divider" />
      <div className="about-stats__item">
        <span className="about-stats__num">98%</span>
        <span className="about-stats__label">{t("about.stat4")}</span>
      </div>
    </div>

    </>
  );
}
