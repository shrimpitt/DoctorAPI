import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "./Reviews.css";

/* ── Rectangular photo at the top of the card ── */
function CardPhoto({ index }) {
  const [err, setErr] = useState(false);
  const src = `/images/reviews/review-${index + 1}.jpg`;

  if (err) {
    return (
      <div className="rv-card__photo rv-card__photo--empty" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
          width="36" height="36" opacity="0.35">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    );
  }

  return (
    <img
      key={src}
      className="rv-card__photo"
      src={src}
      alt=""
      aria-hidden="true"
      onError={() => setErr(true)}
    />
  );
}

/* ── Generic anonymous avatar (privacy) ── */
function GenericAvatar() {
  return (
    <div className="rv-avatar rv-avatar--generic" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12 11a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 1.79-8 4v1h16v-1c0-2.21-3.58-4-8-4z"/>
      </svg>
    </div>
  );
}

/* ── Position class mapping for 6 cards ──
   rel 0 → center   rel 1 → right    rel 2 → far-right
   rel 3 → back     rel 4 → far-left  rel 5 → left       */
const POS = ["center", "right", "far-right", "back", "far-left", "left"];

export default function Reviews() {
  const { t } = useTranslation();
  const reviews = t("reviews.list", { returnObjects: true });
  const total   = reviews.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  const next = useCallback(() => setActive((a) => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive((a) => (a - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4200);
    return () => clearInterval(id);
  }, [paused, next]);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 44) dx < 0 ? next() : prev();
    touchX.current = null;
  };

  const posOf = (idx) => POS[((idx - active) % total + total) % total];

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-section__bg-orb reviews-section__bg-orb--1" />
      <div className="reviews-section__bg-orb reviews-section__bg-orb--2" />

      <div className="container reviews-section__header">
        <span className="section-tag rv-section-tag">{t("reviews.tag")}</span>
        <h2 className="rv-section-title">{t("reviews.title")}</h2>
        <p className="rv-section-desc">{t("reviews.desc")}</p>
      </div>

      <div
        className="carousel-outer"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button className="carousel-nav carousel-nav--prev" onClick={prev} aria-label="Previous review">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button className="carousel-nav carousel-nav--next" onClick={next} aria-label="Next review">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        <div className="carousel-track">
          {reviews.map((r, idx) => {
            const pos = posOf(idx);
            const isClickable = pos === "left" || pos === "right";
            return (
              <div
                key={idx}
                className={`rv-card rv-card--${pos}`}
                onClick={() => isClickable && setActive(idx)}
                aria-hidden={pos !== "center"}
              >
                <CardPhoto index={idx} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="carousel-dots" role="tablist">
        {reviews.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            className={`carousel-dot ${i === active ? "carousel-dot--active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Review ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
