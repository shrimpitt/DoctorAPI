import "./ProgramSection.css";

const programs = [
  {
    title: "Гормоны и молодость",
    desc: "Как гормональный баланс управляет вашей энергией, весом и молодостью. Практические инструменты диагностики и коррекции.",
  },
  {
    title: "Пептидная биорегуляция",
    desc: "Научный подход к восстановлению клеточных функций. Современные биорегуляторные пептиды и протоколы применения.",
  },
  {
    title: "Интегративная нутрициология",
    desc: "Питание как точный инструмент коррекции здоровья — от дефицитов микроэлементов до протоколов долголетия.",
  },
  {
    title: "Антивозрастные стратегии",
    desc: "Комплексный протокол замедления биологического старения. Гормоны, пептиды, образ жизни и превентивная медицина.",
  },
  {
    title: "Женское здоровье 35+",
    desc: "Программа для женщин в период перименопаузы: гормональный баланс, либидо, вес, настроение и качество сна.",
  },
  {
    title: "Детокс и восстановление",
    desc: "Мягкое физиологическое очищение организма и восстановление энергетических ресурсов без жёстких ограничений.",
  },
];

const icons = [
  /* Зеркало / молодость */
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4">
    <circle cx="12" cy="8" r="5"/><path d="M12 13v8M8 21h8"/>
  </svg>,
  /* ДНК / молекула */
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4">
    <path d="M6 3c0 4 12 4 12 8S6 15 6 19M18 3c0 4-12 4-12 8s12 4 12 8"/>
  </svg>,
  /* Яблоко / питание */
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4">
    <path d="M12 2a4 4 0 0 1 4 4v1H8V6a4 4 0 0 1 4-4zM8 7h8v9a4 4 0 0 1-8 0V7z"/>
  </svg>,
  /* Щит / защита */
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>,
  /* Сердце / женское */
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>,
  /* Капля / детокс */
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>,
];

export default function ProgramSection() {
  return (
    <section className="programs">
      <div className="container">
        <div className="programs__header">
          <span className="programs__tag">Образование</span>
          <h2 className="programs__title">Обучающие программы доктора</h2>
          <p className="programs__subtitle">
            Авторские курсы для тех, кто хочет разобраться в своём здоровье<br />
            и начать жить осознанно и полноценно
          </p>
        </div>

        <div className="programs__grid">
          {programs.map((p, i) => (
            <div key={i} className="program-card">
              <div className="program-card__img">
                {icons[i]}
                <span className="program-card__num">0{i + 1}</span>
              </div>
              <div className="program-card__body">
                <h3 className="program-card__title">{p.title}</h3>
                <p className="program-card__desc">{p.desc}</p>
                <button className="btn-primary program-card__btn">
                  Записаться на курс
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
