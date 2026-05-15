import { useNavigate, Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { COURSES } from "../data/courses";
import "./Courses.css";

export default function Courses() {
  const gridRef  = useScrollReveal();
  const navigate = useNavigate();

  return (
    <section className="courses" style={{ padding: "var(--section-padding)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Обучение</span>
          <h2>Курсы и программы</h2>
          <p>Авторские образовательные программы по интегративной эндокринологии и anti-aging медицине.</p>
        </div>

        <div className="courses__grid" ref={gridRef}>
          {COURSES.map((c) => (
            <div className="course-card reveal-item" key={c.id}>
              <span className="course-card__tag">Бесплатно</span>
              <h3 className="course-card__title">{c.title}</h3>
              <p className="course-card__desc">{c.shortDescription}</p>
              <div className="course-card__meta">
                <span>📅 {c.duration}</span>
                <span>💻 {c.format}</span>
              </div>
              <div className="course-card__footer">
                <span className="course-card__price">{c.lessons} занятий</span>
                <button
                  className="btn-outline course-card__btn"
                  onClick={() => navigate(`/courses/${c.id}`)}
                >
                  Записаться на курс
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Link to full courses catalogue */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link to="/courses" className="btn-outline">
            Все курсы →
          </Link>
        </div>
      </div>
    </section>
  );
}
