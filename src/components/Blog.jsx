import "./Blog.css";

const posts = [
  { id: 1, tag: "Гормоны", title: "Почему вы устаёте даже после сна: гормональные причины", date: "8 марта 2025", readTime: "5 мин", excerpt: "Хроническая усталость — один из первых сигналов гормонального дисбаланса. Разберём, какие именно гормоны отвечают за уровень энергии и как их проверить." },
  { id: 2, tag: "Антиэйджинг", title: "5 анализов, которые должна сдать каждая женщина после 35", date: "22 февраля 2025", readTime: "7 мин", excerpt: "После 35 лет тело начинает давать сигналы об изменениях. Эти базовые анализы помогут вам узнать реальное состояние здоровья до появления симптомов." },
  { id: 3, tag: "Питание", title: "Инсулинорезистентность: как её распознать и что делать", date: "10 февраля 2025", readTime: "6 мин", excerpt: "Инсулинорезистентность есть у каждой третьей женщины — и большинство об этом не знает. Рассказываю о признаках, диагностике и стратегии коррекции." },
];

export default function Blog() {
  return (
    <section className="blog" style={{ padding: "var(--section-padding)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Блог</span>
          <h2>Полезные статьи</h2>
          <p>Доказательная информация о здоровье, гормонах и антивозрастных стратегиях — без мифов и маркетинга.</p>
        </div>

        <div className="blog__grid">
          {posts.map((post) => (
            <article className="blog-card" key={post.id}>
              <div className="blog-card__img-placeholder">
                <span>{post.tag}</span>
              </div>
              <div className="blog-card__body">
                <div className="blog-card__meta">
                  <span className="blog-card__tag">{post.tag}</span>
                  <span className="blog-card__date">{post.date} · {post.readTime} чтения</span>
                </div>
                <h3 className="blog-card__title">{post.title}</h3>
                <p className="blog-card__excerpt">{post.excerpt}</p>
                <button className="blog-card__link">
                  Читать статью
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
