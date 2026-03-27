import { useState, useEffect } from "react";
import "./SearchSection.css";

const searchTags = [
  "Как восстановить гормональный баланс",
  "Пептиды для молодости",
  "Усталость и гормоны",
  "Лишний вес и эндокринология",
  "Антивозрастные стратегии",
  "Профилактика старения",
  "Гормональный дисбаланс симптомы",
  "Пептидная биорегуляция",
];

function PhoneSearch() {
  const [tagIdx, setTagIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const current = searchTags[tagIdx];
    let timer;
    if (phase === "typing") {
      if (displayed.length < current.length) {
        timer = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 65);
      } else {
        timer = setTimeout(() => setPhase("erasing"), 2500);
      }
    } else {
      if (displayed.length > 0) {
        timer = setTimeout(() => setDisplayed((d) => d.slice(0, -1)), 28);
      } else {
        timer = setTimeout(() => {
          setTagIdx((i) => (i + 1) % searchTags.length);
          setPhase("typing");
        }, 400);
      }
    }
    return () => clearTimeout(timer);
  }, [displayed, phase, tagIdx]);

  const showResults =
    displayed.length === searchTags[tagIdx].length ||
    (phase === "erasing" && displayed.length > 2);

  return (
    <>
      {/* Status bar */}
      <div className="ss-phone__status">
        <span className="ss-phone__time">20:30</span>
        <div className="ss-phone__status-icons">
          {/* Signal */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="#1A1A2E">
            <rect x="0"  y="8"  width="3" height="4" rx="0.5"/>
            <rect x="4"  y="5"  width="3" height="7" rx="0.5"/>
            <rect x="8"  y="2"  width="3" height="10" rx="0.5"/>
            <rect x="12" y="0"  width="3" height="12" rx="0.5" opacity="0.3"/>
          </svg>
          {/* WiFi */}
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 4 C3.5 1.5 10.5 1.5 13 4" opacity="0.35"/>
            <path d="M3 6.5 C4.5 5 9.5 5 11 6.5"/>
            <path d="M5 9 C5.8 8.2 8.2 8.2 9 9"/>
            <circle cx="7" cy="10.5" r="0.8" fill="#1A1A2E" stroke="none"/>
          </svg>
          {/* Battery */}
          <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
            <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="#1A1A2E" strokeWidth="1"/>
            <rect x="2" y="2" width="14" height="8" rx="1.5" fill="#1A1A2E"/>
            <path d="M19.5 4v4" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Google navbar */}
      <div className="ss-phone__nav">
        <div className="ss-phone__nav-left">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round">
            <line x1="0" y1="2" x2="16" y2="2"/>
            <line x1="0" y1="6" x2="16" y2="6"/>
            <line x1="0" y1="10" x2="16" y2="10"/>
          </svg>
        </div>
        <div className="ss-phone__nav-tabs">
          <span className="ss-phone__tab ss-phone__tab--active">ВСЕ</span>
          <span className="ss-phone__tab">КАРТИНКИ</span>
        </div>
        <div className="ss-phone__nav-right">
          <span className="ss-phone__signin">Войти</span>
        </div>
      </div>

      {/* Google logo */}
      <div className="ss-phone__logo">
        <span style={{ color: "#4285F4" }}>G</span>
        <span style={{ color: "#EA4335" }}>o</span>
        <span style={{ color: "#FBBC05" }}>o</span>
        <span style={{ color: "#4285F4" }}>g</span>
        <span style={{ color: "#34A853" }}>l</span>
        <span style={{ color: "#EA4335" }}>e</span>
      </div>

      {/* Search bar */}
      <div className="ss-phone__search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2.5" className="ss-phone__search-icon">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span className="ss-phone__typed">{displayed}</span>
        <span className="ss-phone__cursor" />
      </div>

      {/* Search results */}
      <div className={`ss-phone__results${showResults ? " ss-phone__results--visible" : ""}`}>
        <div className="ss-phone__result">
          <span className="ss-phone__result-url">kadyrbekova.md</span>
          <span className="ss-phone__result-title">Д-р Кадырбекова — эндокринолог</span>
          <span className="ss-phone__result-snippet">Персональная консультация. Гормональный баланс, антивозрастные стратегии.</span>
        </div>
        <div className="ss-phone__result">
          <span className="ss-phone__result-url">kadyrbekova.md › blog</span>
          <span className="ss-phone__result-title">Статьи о гормональном здоровье</span>
          <span className="ss-phone__result-snippet">Актуальные материалы по эндокринологии и пептидной биорегуляции.</span>
        </div>
        <div className="ss-phone__result">
          <span className="ss-phone__result-url">kadyrbekova.md › services</span>
          <span className="ss-phone__result-title">Услуги и программы лечения</span>
          <span className="ss-phone__result-snippet">Индивидуальные программы восстановления гормонального баланса.</span>
        </div>
      </div>
    </>
  );
}

export default function SearchSection() {
  return (
    <section className="ss">
      <div className="container">
        <div className="ss__card">

          {/* LEFT */}
          <div className="ss__left">
            <h2 className="ss__title">
              Найдите ответы на<br />
              <em>свои вопросы</em>
            </h2>
            <div className="ss__tags">
              {searchTags.map((tag, i) => (
                <span className="ss__tag" key={i}>{tag}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — iPhone */}
          <div className="ss__right">
            <div className="ss-phone">
              {/* Side buttons */}
              <div className="ss-phone__btn ss-phone__btn--power" />
              <div className="ss-phone__btn ss-phone__btn--vol-up" />
              <div className="ss-phone__btn ss-phone__btn--vol-down" />

              {/* Screen */}
              <div className="ss-phone__screen">
                <div className="ss-phone__island" />
                <div className="ss-phone__content">
                  <PhoneSearch />
                </div>
                <div className="ss-phone__home-bar" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
