import "./About.css";

const directionTags = [
  "Эндокринология",
  "Гормональный баланс",
  "Пептидная биорегуляция",
  "Антиэйджинг",
  "Интегративная медицина",
  "Женское здоровье",
  "Профилактика старения",
  "Нутрициология",
];

export default function About() {
  return (
    <>
    {/* ── ABOUT: ACHIEVEMENTS + 3D CHART ── */}
    <section className="about">

      {/* LEFT */}
      <div className="about__left">

        <h2 className="about__title">
          Сколько пациентов у доктора<br />
          <em>Кадырбековой?</em>
        </h2>

        {/* Info cards */}
        <div className="about__cards">
          <div className="about__card">
            <div className="about__card-top">
              <span className="about__card-num">15 000 ₸</span>
              <div className="about__card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            </div>
            <span className="about__card-label">Средняя стоимость консультации</span>
          </div>
          <div className="about__card">
            <div className="about__card-top">
              <span className="about__card-num">3 месяца</span>
              <div className="about__card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
            </div>
            <span className="about__card-label">Среднее сопровождение пациента</span>
          </div>
        </div>

        {/* Direction tags */}
        <p className="about__dirs-label">Направления работы:</p>
        <div className="about__dirs">
          {directionTags.map((tag) => (
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
              <span className="about__circle-label">пациентов</span>
            </div>
            <div className="about__circle about__circle--2">
              <span className="about__circle-num">15+</span>
              <span className="about__circle-label">лет практики</span>
            </div>
            <div className="about__circle about__circle--3">
              <span className="about__circle-num">98%</span>
              <span className="about__circle-label">довольных</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── STATS STRIP ── */}
    <div className="about-stats">
      <div className="about-stats__item">
        <span className="about-stats__num">15+</span>
        <span className="about-stats__label">лет практики</span>
      </div>
      <div className="about-stats__divider" />
      <div className="about-stats__item">
        <span className="about-stats__num">3000+</span>
        <span className="about-stats__label">пациентов</span>
      </div>
      <div className="about-stats__divider" />
      <div className="about-stats__item">
        <span className="about-stats__num">12+</span>
        <span className="about-stats__label">сертификатов</span>
      </div>
      <div className="about-stats__divider" />
      <div className="about-stats__item">
        <span className="about-stats__num">98%</span>
        <span className="about-stats__label">довольных пациентов</span>
      </div>
    </div>

    </>
  );
}
