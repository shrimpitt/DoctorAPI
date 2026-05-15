import { useTranslation } from "react-i18next";
import "./Reviews.css";

export default function Reviews() {
  const { t } = useTranslation();
  const reviews = t("reviews.list", { returnObjects: true });

  return (
    <section className="reviews" style={{ padding: "var(--section-padding)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">{t("reviews.tag")}</span>
          <h2>{t("reviews.title")}</h2>
          <p>{t("reviews.desc")}</p>
        </div>

        <div className="reviews__grid">
          {reviews.map((r, idx) => (
            <div className="review-card" key={idx}>
              <div className="review-card__stars">
                {"★".repeat(5)}
              </div>
              <p className="review-card__text">"{r.text}"</p>
              <div className="review-card__footer">
                <div className="review-card__avatar">{r.name[0]}</div>
                <div>
                  <p className="review-card__name">{r.name}, {r.age}</p>
                  <p className="review-card__result">✓ {r.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
