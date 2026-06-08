import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api";
import { recommendProducts } from "../utils/recommendationEngine";
import { getProductImage, getProductName } from "../utils/productImage";
import { getVolumes } from "../utils/volumes";
import "./AIRecommendationPage.css";

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function SparklesIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}
function CheckCircleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function AlertIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
      <path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  );
}
function ArrowRightIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
function ArrowLeftIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  );
}
function RefreshIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  );
}

// ── Step configuration ────────────────────────────────────────────────────────
const GOALS = [
  { id: "anti_aging",     label: "Антивозрастная защита",         emoji: "🧬" },
  { id: "energy",         label: "Повышение энергии",             emoji: "⚡" },
  { id: "immunity",       label: "Укрепление иммунитета",         emoji: "🛡️" },
  { id: "sleep",          label: "Улучшение качества сна",         emoji: "🌙" },
  { id: "hormones",       label: "Гормональный баланс",           emoji: "⚖️" },
  { id: "joints",         label: "Здоровье суставов",             emoji: "🦴" },
  { id: "skin",           label: "Состояние кожи",                emoji: "✨" },
  { id: "cardiovascular", label: "Сердечно-сосудистая система",   emoji: "❤️" },
];

const HEALTH_CONDITIONS = [
  { id: "fatigue",            label: "Хроническая усталость" },
  { id: "sleep_disorders",    label: "Нарушения сна" },
  { id: "hormonal_imbalance", label: "Гормональный дисбаланс" },
  { id: "weak_immunity",      label: "Сниженный иммунитет" },
  { id: "joint_pain",         label: "Боли в суставах" },
  { id: "skin_issues",        label: "Проблемы с кожей" },
  { id: "aging",              label: "Выраженные возрастные изменения" },
];

const CHRONIC_CONDITIONS = [
  { id: "cancer",     label: "Онкологическое заболевание" },
  { id: "autoimmune", label: "Аутоиммунное заболевание" },
];

const STEPS = [
  { id: "goals",       title: "Ваши цели",                subtitle: "Выберите один или несколько приоритетов" },
  { id: "demographics",title: "О вас",                    subtitle: "Демографические данные для точного подбора" },
  { id: "health",      title: "Состояние здоровья",        subtitle: "Выберите актуальные симптомы или состояния" },
  { id: "preferences", title: "Предпочтения",             subtitle: "Способ применения и дополнительные параметры" },
];

// ── Score bar helper ──────────────────────────────────────────────────────────
function ScoreBar({ value, color = "var(--primary)" }) {
  return (
    <div className="air__score-bar-track">
      <div className="air__score-bar-fill" style={{ width: `${Math.round(value * 100)}%`, background: color }} />
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCard({ rank, entry }) {
  const { product, score, reasons, goalMatch, healthMatch, popularity } = entry;
  const volumes = getVolumes(product);
  const price = volumes[0]?.price ?? product.price;
  const imgSrc = getProductImage(product);
  const displayName = getProductName(product);

  return (
    <div className={`air__result-card${rank === 1 ? " air__result-card--top" : ""}`}>
      {rank === 1 && <div className="air__result-best-badge">Лучший выбор</div>}
      <div className="air__result-rank">#{rank}</div>

      <div className="air__result-inner">
        {/* Image */}
        <div className="air__result-img-wrap">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} className="air__result-img" />
          ) : (
            <div className="air__result-img-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C8D0DC" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="air__result-info">
          <div className="air__result-name">{displayName}</div>
          <div className="air__result-price">
            {Number(price).toLocaleString("ru-RU")} ₸
            <span className="air__result-price-unit"> / {volumes[0]?.label ?? "—"}</span>
          </div>

          {/* Score breakdown */}
          <div className="air__score-breakdown">
            <div className="air__score-row">
              <span className="air__score-label">Соответствие целям</span>
              <ScoreBar value={goalMatch} color="var(--primary)" />
              <span className="air__score-pct">{Math.round(goalMatch * 100)}%</span>
            </div>
            <div className="air__score-row">
              <span className="air__score-label">Профиль здоровья</span>
              <ScoreBar value={healthMatch} color="#7B61FF" />
              <span className="air__score-pct">{Math.round(healthMatch * 100)}%</span>
            </div>
            <div className="air__score-row">
              <span className="air__score-label">Популярность</span>
              <ScoreBar value={popularity} color="#F59E0B" />
              <span className="air__score-pct">{Math.round(popularity * 100)}%</span>
            </div>
            <div className="air__score-total">
              Итоговый балл: <strong>{score.toFixed(2)}</strong>
            </div>
          </div>

          {/* Reasons */}
          <ul className="air__result-reasons">
            {reasons.map((r, i) => (
              <li key={i}>
                <CheckCircleIcon size={14} />
                {r}
              </li>
            ))}
          </ul>

          <div className="air__result-actions">
            <Link to={`/shop/${product.id}`} className="air__btn-outline">
              Подробнее
            </Link>
            <Link to={`/shop/${product.id}`} className="air__btn-primary">
              В магазин <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AIRecommendationPage() {
  const [step, setStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Form state
  const [goals, setGoals] = useState([]);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [isBreastfeeding, setIsBreastfeeding] = useState(false);
  const [healthConditions, setHealthConditions] = useState([]);
  const [chronicConditions, setChronicConditions] = useState([]);
  const [adminRoute, setAdminRoute] = useState("any");

  // Load products once
  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  function toggleGoal(id) {
    setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  }
  function toggleHealth(id) {
    setHealthConditions((prev) => prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]);
  }
  function toggleChronic(id) {
    setChronicConditions((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  }

  function handleNext() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else handleSubmit();
  }
  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }
  function handleReset() {
    setStep(0);
    setResults(null);
    setGoals([]);
    setAge("");
    setSex("");
    setIsPregnant(false);
    setIsBreastfeeding(false);
    setHealthConditions([]);
    setChronicConditions([]);
    setAdminRoute("any");
  }

  function handleSubmit() {
    setLoading(true);
    const userProfile = {
      goals,
      age: age ? Number(age) : null,
      sex,
      isPregnant,
      isBreastfeeding,
      healthConditions,
      chronicConditions,
      adminRoute,
    };
    // Simulate brief processing delay for UX
    setTimeout(() => {
      const recs = recommendProducts(userProfile, products, 3);
      setResults(recs);
      setLoading(false);
    }, 900);
  }

  const canAdvance = step === 0 ? goals.length > 0 : true;

  if (loading) {
    return (
      <div className="air">
        <div className="air__loading">
          <div className="air__loading-spinner" />
          <div className="air__loading-text">Анализируем ваш профиль…</div>
          <div className="air__loading-sub">Подбираем оптимальные пептиды из каталога</div>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="air">
        <div className="container">
          {/* Results header */}
          <div className="air__results-header">
            <div className="air__hero-icon"><SparklesIcon size={28} /></div>
            <h1 className="air__results-title">Персональные рекомендации</h1>
            <p className="air__results-sub">
              На основе вашего профиля выбраны {results.length} наиболее подходящих препарата
            </p>
          </div>

          {/* Mandatory disclaimer */}
          <div className="air__disclaimer">
            <AlertIcon size={20} />
            <div>
              <strong>Важно:</strong> данные рекомендации носят исключительно информационный характер
              и не являются медицинским назначением. Перед применением любого препарата обязательно
              проконсультируйтесь с врачом.
            </div>
          </div>

          {/* Result cards */}
          <div className="air__results-list">
            {results.map((entry, i) => (
              <ResultCard key={entry.product.id} rank={i + 1} entry={entry} />
            ))}
            {results.length === 0 && (
              <div className="air__no-results">
                <AlertIcon size={32} />
                <p>По вашим параметрам не найдено подходящих препаратов. Обратитесь к врачу для индивидуальной консультации.</p>
              </div>
            )}
          </div>

          {/* Algorithm explanation — for diploma */}
          <section className="air__algo">
            <h2 className="air__algo-title">
              <SparklesIcon size={18} /> Как работает алгоритм
            </h2>
            <p className="air__algo-desc">
              Система использует гибридный подход: правило-ориентированная фильтрация безопасности
              + контентная оценка совместимости.
            </p>

            <div className="air__algo-formula">
              <span className="air__algo-formula-label">Формула оценки:</span>
              <code className="air__algo-formula-code">
                Score = 0.5 × GoalMatch + 0.3 × HealthProfileMatch + 0.2 × Popularity
              </code>
            </div>

            <table className="air__algo-table">
              <thead>
                <tr>
                  <th>Компонент</th>
                  <th>Вес</th>
                  <th>Описание</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>GoalMatch</strong></td>
                  <td>50%</td>
                  <td>Доля целевых тегов пользователя, покрытых тегами препарата</td>
                </tr>
                <tr>
                  <td><strong>HealthProfileMatch</strong></td>
                  <td>30%</td>
                  <td>Доля тегов, соответствующих выбранным симптомам и состояниям</td>
                </tr>
                <tr>
                  <td><strong>Popularity</strong></td>
                  <td>20%</td>
                  <td>Клинический рейтинг препарата (0–1), экспертно заданный</td>
                </tr>
              </tbody>
            </table>

            <p className="air__algo-step">
              <strong>Шаг 1 — Фильтрация безопасности:</strong> препараты с противопоказаниями
              (беременность, аутоиммунные заболевания, онкология) исключаются до расчёта оценок.
            </p>
            <p className="air__algo-step">
              <strong>Шаг 2 — Оценка:</strong> для каждого оставшегося препарата вычисляется Score
              по формуле выше.
            </p>
            <p className="air__algo-step">
              <strong>Шаг 3 — Ранжирование:</strong> препараты сортируются по убыванию Score,
              отображаются топ-3.
            </p>
          </section>

          <div className="air__reset-wrap">
            <button className="air__btn-reset" onClick={handleReset}>
              <RefreshIcon size={16} /> Начать заново
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Questionnaire ─────────────────────────────────────────────────────────
  return (
    <div className="air">
      <div className="container">
        {/* Hero */}
        <div className="air__hero">
          <div className="air__hero-icon"><SparklesIcon size={32} /></div>
          <h1 className="air__hero-title">AI-консультант по пептидам</h1>
          <p className="air__hero-sub">
            Ответьте на 4 вопроса — система подберёт препараты из реального каталога,
            подходящие именно вам
          </p>
        </div>

        {/* Progress bar */}
        <div className="air__progress">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`air__progress-step${i <= step ? " air__progress-step--done" : ""}${i === step ? " air__progress-step--active" : ""}`}>
              <div className="air__progress-dot">{i < step ? <CheckCircleIcon size={14} /> : i + 1}</div>
              <span className="air__progress-label">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step card */}
        <div className="air__card">
          <div className="air__card-header">
            <div className="air__step-num">Шаг {step + 1} из {STEPS.length}</div>
            <h2 className="air__card-title">{STEPS[step].title}</h2>
            <p className="air__card-sub">{STEPS[step].subtitle}</p>
          </div>

          {/* Step 0 — Goals */}
          {step === 0 && (
            <div className="air__goals-grid">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  className={`air__goal-btn${goals.includes(g.id) ? " air__goal-btn--selected" : ""}`}
                  onClick={() => toggleGoal(g.id)}
                  type="button"
                >
                  <span className="air__goal-emoji">{g.emoji}</span>
                  <span className="air__goal-label">{g.label}</span>
                  {goals.includes(g.id) && <span className="air__goal-check"><CheckCircleIcon size={16} /></span>}
                </button>
              ))}
            </div>
          )}

          {/* Step 1 — Demographics */}
          {step === 1 && (
            <div className="air__demo-grid">
              <div className="air__field">
                <label className="air__field-label">Возраст</label>
                <input
                  type="number"
                  className="air__field-input"
                  placeholder="Например, 45"
                  min="18" max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div className="air__field">
                <label className="air__field-label">Пол</label>
                <div className="air__sex-btns">
                  {[{ id: "female", label: "Женский" }, { id: "male", label: "Мужской" }, { id: "", label: "Не указывать" }].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`air__sex-btn${sex === s.id ? " air__sex-btn--active" : ""}`}
                      onClick={() => setSex(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {sex === "female" && (
                <div className="air__field air__field--full">
                  <label className="air__field-label">Дополнительно</label>
                  <div className="air__checkboxes">
                    <label className="air__checkbox-label">
                      <input type="checkbox" checked={isPregnant} onChange={(e) => setIsPregnant(e.target.checked)} />
                      Беременность
                    </label>
                    <label className="air__checkbox-label">
                      <input type="checkbox" checked={isBreastfeeding} onChange={(e) => setIsBreastfeeding(e.target.checked)} />
                      Грудное вскармливание
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Health conditions */}
          {step === 2 && (
            <div className="air__health-wrap">
              <div className="air__health-section-title">Текущие симптомы / состояния</div>
              <div className="air__health-grid">
                {HEALTH_CONDITIONS.map((h) => (
                  <label key={h.id} className={`air__health-item${healthConditions.includes(h.id) ? " air__health-item--selected" : ""}`}>
                    <input
                      type="checkbox"
                      checked={healthConditions.includes(h.id)}
                      onChange={() => toggleHealth(h.id)}
                      className="air__health-checkbox"
                    />
                    {h.label}
                    {healthConditions.includes(h.id) && <span className="air__health-check"><CheckCircleIcon size={14} /></span>}
                  </label>
                ))}
              </div>

              <div className="air__health-section-title air__health-section-title--warn">
                <AlertIcon size={16} /> Хронические заболевания (влияют на противопоказания)
              </div>
              <div className="air__health-grid">
                {CHRONIC_CONDITIONS.map((c) => (
                  <label key={c.id} className={`air__health-item air__health-item--warn${chronicConditions.includes(c.id) ? " air__health-item--selected" : ""}`}>
                    <input
                      type="checkbox"
                      checked={chronicConditions.includes(c.id)}
                      onChange={() => toggleChronic(c.id)}
                      className="air__health-checkbox"
                    />
                    {c.label}
                    {chronicConditions.includes(c.id) && <span className="air__health-check"><CheckCircleIcon size={14} /></span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Preferences */}
          {step === 3 && (
            <div className="air__pref-wrap">
              <div className="air__field">
                <label className="air__field-label">Предпочтительный способ введения</label>
                <div className="air__pref-btns">
                  {[
                    { id: "any",        label: "Любой" },
                    { id: "injection",  label: "Инъекции" },
                    { id: "nasal",      label: "Интраназально" },
                    { id: "oral",       label: "Перорально" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`air__pref-btn${adminRoute === p.id ? " air__pref-btn--active" : ""}`}
                      onClick={() => setAdminRoute(p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="air__summary">
                <div className="air__summary-title">Ваш профиль:</div>
                <ul className="air__summary-list">
                  <li><strong>Цели:</strong> {goals.length > 0 ? goals.map((g) => GOALS.find((x) => x.id === g)?.label).join(", ") : "не выбраны"}</li>
                  <li><strong>Возраст:</strong> {age || "не указан"}</li>
                  <li><strong>Пол:</strong> {sex === "female" ? "Женский" : sex === "male" ? "Мужской" : "Не указан"}</li>
                  {isPregnant && <li>⚠ Беременность — ряд препаратов будет исключён</li>}
                  {isBreastfeeding && <li>⚠ Грудное вскармливание — ряд препаратов будет исключён</li>}
                  <li><strong>Симптомы:</strong> {healthConditions.length > 0 ? healthConditions.map((h) => HEALTH_CONDITIONS.find((x) => x.id === h)?.label).join(", ") : "не выбраны"}</li>
                  {chronicConditions.length > 0 && <li><strong>Хронические:</strong> {chronicConditions.map((c) => CHRONIC_CONDITIONS.find((x) => x.id === c)?.label).join(", ")}</li>}
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="air__nav">
            {step > 0 && (
              <button className="air__btn-back" onClick={handleBack} type="button">
                <ArrowLeftIcon size={16} /> Назад
              </button>
            )}
            <button
              className="air__btn-next"
              onClick={handleNext}
              disabled={!canAdvance}
              type="button"
            >
              {step === STEPS.length - 1 ? (
                <><SparklesIcon size={16} /> Подобрать препараты</>
              ) : (
                <>Далее <ArrowRightIcon size={16} /></>
              )}
            </button>
          </div>
        </div>

        {/* Info note */}
        <div className="air__info-note">
          <AlertIcon size={16} />
          Подбор носит информационный характер. Результаты не заменяют консультацию врача.
        </div>
      </div>
    </div>
  );
}
