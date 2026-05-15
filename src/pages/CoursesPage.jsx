import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CourseIcon from '../components/CourseIcon';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { COURSES } from '../data/courses';
import './CoursesPage.css';

export default function CoursesPage() {
  const gridRef = useScrollReveal();

  return (
    <>
      <Navbar />

      <div className="courses-page">
        {/* Page hero */}
        <div className="courses-page__hero">
          <div className="container">
            <span className="section-tag">Обучение</span>
            <h1>Курсы</h1>
            <p>Углублённые программы по интегративной эндокринологии и anti-aging медицине</p>
          </div>
        </div>

        {/* Course cards grid */}
        <div className="courses-page__body">
          <div className="container">
            <div className="courses-page__grid" ref={gridRef}>
              {COURSES.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="cp-card reveal-item"
                >
                  <div className="cp-card__icon">
                    <CourseIcon name={course.icon} size={32} />
                  </div>

                  <h2 className="cp-card__title">{course.title}</h2>
                  <p className="cp-card__desc">{course.shortDescription}</p>

                  <div className="cp-card__meta">
                    <span>{course.duration}</span>
                    <span>{course.lessons} занятий</span>
                    <span>{course.format}</span>
                  </div>

                  <span className="cp-card__cta">Подробнее →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
