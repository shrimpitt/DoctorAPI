import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "../pages/CoursesPage.css";

const IG_URL = "https://www.instagram.com/doctor_kadyrbekova/";
const YT_URL = "https://www.youtube.com/watch?v=Yn7VyqHm1eE";

const IgIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YtIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
    <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
);

/**
 * showHero — показывать ли заголовок «Доктор в соцсетях» (true на /courses, false на лендинге)
 */
export default function MediaSection({ showHero = false }) {
  const { t } = useTranslation();
  const igRef = useRef(null);
  const ytRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("media-section--visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    if (igRef.current) observer.observe(igRef.current);
    if (ytRef.current) observer.observe(ytRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="media-content">
      {showHero && (
        <div className="media-hero">
          <div className="container">
            <span className="section-tag">{t("media.tag")}</span>
            <h1 className="media-hero__title">{t("media.heroTitle")}</h1>
            <p className="media-hero__desc">{t("media.heroDesc")}</p>
          </div>
        </div>
      )}

      {/* ── Instagram / iPhone ── */}
      <section className="media-section" ref={igRef}>
        <div className="container media-section__inner media-section__inner--ig">
          <div className="media-device-wrap media-device-wrap--phone">
            <div className="device-iphone">
              <div className="device-iphone__btn-power" />
              <div className="device-iphone__btn-vol1" />
              <div className="device-iphone__btn-vol2" />
              <div className="device-iphone__screen">
                <div className="device-iphone__island" />
                <div className="device-iphone__scroll">
                  <img src="/images/media/instagram.jpg" alt="Instagram доктора" className="device-iphone__img" draggable="false" />
                  <img src="/images/media/instagram.jpg" alt="" aria-hidden="true" className="device-iphone__img" draggable="false" />
                </div>
              </div>
            </div>
          </div>

          <div className="media-text">
            <span className="media-platform-badge media-platform-badge--ig">
              <IgIcon /> Instagram
            </span>
            <h2 className="media-text__title">{t("media.igTitle")}</h2>
            <p className="media-text__handle">{t("media.igHandle")}</p>
            <p className="media-text__desc">{t("media.igDesc")}</p>
            <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="media-btn media-btn--ig">
              <IgIcon />
              {t("media.igBtn")}
            </a>
          </div>
        </div>
      </section>

      <div className="media-divider" />

      {/* ── YouTube / iPad ── */}
      <section className="media-section" ref={ytRef}>
        <div className="container media-section__inner media-section__inner--yt">
          <div className="media-text">
            <span className="media-platform-badge media-platform-badge--yt">
              <YtIcon /> YouTube
            </span>
            <h2 className="media-text__title">{t("media.ytTitle")}</h2>
            <p className="media-text__desc">{t("media.ytDesc")}</p>
            <a href={YT_URL} target="_blank" rel="noopener noreferrer" className="media-btn media-btn--yt">
              <YtIcon />
              {t("media.ytBtn")}
            </a>
          </div>

          <div className="media-device-wrap media-device-wrap--ipad">
            <div className="device-ipad">
              <div className="device-ipad__camera" />
              <div className="device-ipad__screen">
                <div className="device-ipad__videos">
                  {[1, 2, 3].map((n) => (
                    <a key={n} href={YT_URL} target="_blank" rel="noopener noreferrer" className="yt-thumb" aria-label={`Video ${n}`}>
                      <img src={`/images/media/youtube-${n}.png`} alt={`YouTube видео ${n}`} draggable="false" />
                      <div className="yt-thumb__overlay">
                        <div className="yt-thumb__play">
                          <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
