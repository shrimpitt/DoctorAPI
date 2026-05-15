import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./Services.css";

const serviceIcons = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h3l3 3 3-3h4a2 2 0 002-2V9a2 2 0 00-2-2z"/>
  </svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>,
];

export default function Services() {
  const { t } = useTranslation();
  const [active, setActive] = useState(null);

  const services = t("services.s", { returnObjects: true });

  return (
    <section className="services" style={{ padding: "var(--section-padding)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">{t("services.tag")}</span>
          <h2>{t("services.title")}</h2>
          <p>{t("services.desc")}</p>
        </div>

        <div className="services__grid">
          {services.map((s, idx) => (
            <div
              key={idx}
              className={`service-card ${active === idx ? "service-card--active" : ""}`}
              onClick={() => setActive(active === idx ? null : idx)}
            >
              <div className="service-card__icon">{serviceIcons[idx]}</div>
              <div className="service-card__header">
                <div>
                  <h3 className="service-card__title">{s.title}</h3>
                  <p className="service-card__subtitle">{s.subtitle}</p>
                </div>
                <div className="service-card__meta">
                  <span className="service-card__price">{s.price}</span>
                  <span className="service-card__duration">{s.duration}</span>
                </div>
              </div>
              <p className="service-card__desc">{s.desc}</p>
              <ul className="service-card__list">
                {s.list.map((item) => (
                  <li key={item}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                className="btn-primary service-card__btn"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t("services.enroll")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
