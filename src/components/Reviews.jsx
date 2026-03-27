import "./Reviews.css";

const reviews = [
  { id: 1, name: "Айгерим К.", age: "42 года", result: "Нормализация щитовидной железы", text: "Обратилась к доктору с постоянной усталостью и лишним весом. За 3 месяца сопровождения ушло 8 кг, вернулась энергия. Впервые за годы чувствую себя живой.", stars: 5 },
  { id: 2, name: "Марина Т.", age: "38 лет", result: "Гормональный баланс", text: "Прошла курс по антивозрастным стратегиям. Доктор объясняет всё очень понятно, без запугивания и лишних назначений. Рекомендую всем женщинам 35+.", stars: 5 },
  { id: 3, name: "Светлана Р.", age: "51 год", result: "Менопауза под контролем", text: "Долго боялась гормональной терапии. Доктор разобрала все мои страхи с аргументами и анализами. Сейчас живу без приливов и плохого настроения.", stars: 5 },
  { id: 4, name: "Динара М.", age: "34 года", result: "Исчезла тревожность", text: "Думала, что моя тревожность — это характер. Оказалось — нехватка нескольких микроэлементов и дисбаланс кортизола. Через месяц забыла что это такое.", stars: 5 },
];

export default function Reviews() {
  return (
    <section className="reviews" style={{ padding: "var(--section-padding)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Отзывы</span>
          <h2>Результаты пациентов</h2>
          <p>Реальные истории людей, которые изменили качество своей жизни через работу с гормонами.</p>
        </div>

        <div className="reviews__grid">
          {reviews.map((r) => (
            <div className="review-card" key={r.id}>
              <div className="review-card__stars">
                {"★".repeat(r.stars)}
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
