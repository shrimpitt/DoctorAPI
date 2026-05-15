import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CourseIcon from '../components/CourseIcon';
import CourseEnrollmentModal from '../components/CourseEnrollmentModal';
import { COURSES } from '../data/courses';
import './CourseDetailPage.css';

export default function CourseDetailPage() {
  const { id } = useParams();
  const course = COURSES.find((c) => c.id === id);
  const [modalOpen, setModalOpen] = useState(false);

  // Show 404-style message if course ID not found in static data
  if (!course) {
    return (
      <>
        <Navbar />
        <div className="cdp-notfound container">
          <h2>Курс не найден</h2>
          <Link to="/courses" className="btn-primary">← Все курсы</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="cdp">
        <div className="container">

          {/* Breadcrumb navigation */}
          <nav className="cdp__breadcrumb" aria-label="Навигация">
            <Link to="/">Главная</Link>
            <span>›</span>
            <Link to="/courses">Курсы</Link>
            <span>›</span>
            <span>{course.title}</span>
          </nav>

          <div className="cdp__layout">

            {/* ── Main content ── */}
            <main className="cdp__main">

              {/* Hero: icon + title + tagline */}
              <div className="cdp__hero">
                <div className="cdp__icon">
                  <CourseIcon name={course.icon} size={44} />
                </div>
                <h1 className="cdp__title">{course.title}</h1>
                <p className="cdp__short">{course.shortDescription}</p>
              </div>

              {/* Quick-info bar */}
              <div className="cdp__meta">
                <div className="cdp__meta-item">
                  <span className="cdp__meta-label">Длительность</span>
                  <span className="cdp__meta-value">{course.duration}</span>
                </div>
                <div className="cdp__meta-item">
                  <span className="cdp__meta-label">Занятий</span>
                  <span className="cdp__meta-value">{course.lessons}</span>
                </div>
                <div className="cdp__meta-item">
                  <span className="cdp__meta-label">Формат</span>
                  <span className="cdp__meta-value">{course.format}</span>
                </div>
                <div className="cdp__meta-item">
                  <span className="cdp__meta-label">Стоимость</span>
                  <span className="cdp__meta-value cdp__meta-free">Бесплатно</span>
                </div>
              </div>

              {/* For who */}
              <div className="cdp__section">
                <h2>Для кого этот курс</h2>
                <p className="cdp__for-who">{course.forWho}</p>
              </div>

              {/* Course programme — topic list with numbered badges */}
              <div className="cdp__section">
                <h2>Программа курса</h2>
                <ul className="cdp__topics">
                  {course.topics.map((topic, i) => (
                    <li key={i} className="cdp__topic">
                      <span className="cdp__topic-num" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full description paragraphs */}
              <div className="cdp__section">
                <h2>О курсе</h2>
                {course.fullDescription.map((para, i) => (
                  <p key={i} className="cdp__para">{para}</p>
                ))}
              </div>

              {/* Bottom CTA — visible on mobile after scrolling past sidebar */}
              <button
                className="btn-primary cdp__cta-btn"
                onClick={() => setModalOpen(true)}
              >
                Записаться на курс
              </button>
            </main>

            {/* ── Sticky sidebar ── */}
            <aside className="cdp__sidebar">
              <div className="cdp__sidebar-card">
                <div className="cdp__sidebar-icon">
                  <CourseIcon name={course.icon} size={32} />
                </div>

                <div className="cdp__sidebar-title">{course.title}</div>

                <div className="cdp__sidebar-meta">
                  <span>{course.duration} · {course.lessons} занятий</span>
                  <span>{course.format}</span>
                </div>

                <div className="cdp__sidebar-free">Бесплатно</div>

                <button
                  className="btn-primary cdp__sidebar-btn"
                  onClick={() => setModalOpen(true)}
                >
                  Записаться на курс
                </button>

                <Link to="/courses" className="cdp__sidebar-back">
                  ← Все курсы
                </Link>
              </div>
            </aside>

          </div>
        </div>
      </div>

      <CourseEnrollmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        course={course}
      />
    </>
  );
}
