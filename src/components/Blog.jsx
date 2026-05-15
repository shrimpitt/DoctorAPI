import { useTranslation } from "react-i18next";
import "./Blog.css";

export default function Blog() {
  const { t } = useTranslation();
  const posts = t("blog.posts", { returnObjects: true });

  return (
    <section className="blog" style={{ padding: "var(--section-padding)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">{t("blog.tag")}</span>
          <h2>{t("blog.title")}</h2>
          <p>{t("blog.desc")}</p>
        </div>

        <div className="blog__grid">
          {posts.map((post, idx) => (
            <article className="blog-card" key={idx}>
              <div className="blog-card__img-placeholder">
                <span>{post.tag}</span>
              </div>
              <div className="blog-card__body">
                <div className="blog-card__meta">
                  <span className="blog-card__tag">{post.tag}</span>
                  <span className="blog-card__date">{post.date} · {post.readTime} {t("blog.readTime")}</span>
                </div>
                <h3 className="blog-card__title">{post.title}</h3>
                <p className="blog-card__excerpt">{post.excerpt}</p>
                <button className="blog-card__link">
                  {t("blog.readMore")}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
