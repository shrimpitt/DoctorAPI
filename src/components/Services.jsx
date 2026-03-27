import { useState } from "react";
import "./Services.css";

const services = [
  {
    id: "consult",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h3l3 3 3-3h4a2 2 0 002-2V9a2 2 0 00-2-2z"/>
      </svg>
    ),
    title: "Консультация",
    subtitle: "Онлайн / Офлайн",
    price: "от 15 000 ₸",
    duration: "60 мин",
    desc: "Первичный или повторный приём. Разбираем ваши анализы, симптомы и составляем план лечения.",
    list: ["Анализ анамнеза", "Расшифровка анализов", "Персональный план лечения", "Рекомендации по образу жизни"],
  },
  {
    id: "accompany",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Сопровождение",
    subtitle: "1–3 месяца",
    price: "от 80 000 ₸",
    duration: "Пакет",
    desc: "Полное ведение пациента с еженедельными встречами, корректировкой протоколов и поддержкой 24/7.",
    list: ["4 консультации в месяц", "Мессенджер-поддержка", "Корректировка протокола", "Контроль анализов"],
  },
  {
    id: "antiage",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      </svg>
    ),
    title: "Антивозрастные программы",
    subtitle: "Longevity",
    price: "Индивидуально",
    duration: "3–6 мес",
    desc: "Комплексные стратегии замедления биологического возраста: гормоны, нутрициология, пептиды.",
    list: ["Биологический возраст", "Гормональная оптимизация", "Нутритивный протокол", "Пептидная поддержка"],
  },
  {
    id: "peptides",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: "Пептидная биорегуляция",
    subtitle: "Новейшие методики",
    price: "от 25 000 ₸",
    duration: "Курс",
    desc: "Подбор и назначение пептидных препаратов для восстановления функций органов и систем.",
    list: ["Диагностика дефицитов", "Подбор пептидов", "Протокол приёма", "Мониторинг результатов"],
  },
];

export default function Services() {
  const [active, setActive] = useState(null);

  return (
    <section className="services" style={{ padding: "var(--section-padding)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Услуги</span>
          <h2>Как я могу помочь</h2>
          <p>Каждый пациент уникален. Выберите подходящий формат работы или запишитесь на первичную консультацию.</p>
        </div>

        <div className="services__grid">
          {services.map((s) => (
            <div
              key={s.id}
              className={`service-card ${active === s.id ? "service-card--active" : ""}`}
              onClick={() => setActive(active === s.id ? null : s.id)}
            >
              <div className="service-card__icon">{s.icon}</div>
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
                Записаться
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
