import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Courses.css";

const courses = [
  {
    id: 1,
    tag: "Новый курс",
    title: "Гормоны и молодость",
    desc: "Авторский курс о том, как гормоны влияют на вес, энергию и скорость старения. Для врачей и осознанных пациентов.",
    duration: "6 недель",
    format: "Онлайн",
    price: "45 000 ₸",
  },
  {
    id: 2,
    tag: "Профессиональный",
    title: "Пептидная биорегуляция",
    desc: "Практический курс для врачей по применению пептидных препаратов. Теория, протоколы, разбор случаев.",
    duration: "8 недель",
    format: "Онлайн + вебинары",
    price: "120 000 ₸",
  },
  {
    id: 3,
    tag: "Мастер-класс",
    title: "Интегративная нутрициология",
    desc: "Связь питания, гормонов и энергии. Практические инструменты для оптимизации здоровья через нутритивный подход.",
    duration: "3 недели",
    format: "Онлайн",
    price: "28 000 ₸",
  },
];

export default function Courses() {
  const gridRef = useScrollReveal();

  return (
    <section className="courses" style={{ padding: "var(--section-padding)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Обучение</span>
          <h2>Курсы и программы</h2>
          <p>Авторские образовательные программы для пациентов и специалистов в области интегративной медицины.</p>
        </div>

        <div className="courses__grid" ref={gridRef}>
          {courses.map((c) => (
            <div className="course-card reveal-item" key={c.id}>
              <span className="course-card__tag">{c.tag}</span>
              <h3 className="course-card__title">{c.title}</h3>
              <p className="course-card__desc">{c.desc}</p>
              <div className="course-card__meta">
                <span>📅 {c.duration}</span>
                <span>💻 {c.format}</span>
              </div>
              <div className="course-card__footer">
                <span className="course-card__price">{c.price}</span>
                <button
                  className="btn-outline course-card__btn"
                  onClick={() => document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Подать заявку
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
