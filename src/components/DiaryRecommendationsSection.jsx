import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductById } from "../api";
import { useCart } from "../context/CartContext";
import Spinner from "./ui/Spinner";
import "./DiaryRecommendationsSection.css";

// Normalise plain array OR { $values: [] } wrapper
function toArr(data) {
  if (Array.isArray(data))           return data;
  if (Array.isArray(data?.$values))  return data.$values;
  return [];
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  );
}
function DiaryIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

// ── Single recommendation card ────────────────────────────────────────────────
function RecCard({ rec, isAdmin }) {
  const cart = useCart();
  const [adding, setAdding]   = useState(false);
  const [added,  setAdded]    = useState(false);
  const [addErr, setAddErr]   = useState(false);

  const handleAddToCart = async () => {
    if (adding || added) return;
    setAdding(true);
    setAddErr(false);
    try {
      const product = await getProductById(rec.productId);
      cart.addItem(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      setAddErr(true);
      setTimeout(() => setAddErr(false), 2500);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="drs__card">
      {/* Number badge */}
      <div className="drs__card-badge">
        <SparkleIcon />
      </div>

      <div className="drs__card-body">
        {/* Product name */}
        <h4 className="drs__card-name">{rec.productName}</h4>

        {/* Reasoning — the key insight from the backend */}
        <p className="drs__card-reasoning">{rec.reasoning}</p>

        {/* "Based on diary" chip */}
        <div className="drs__card-source">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          На основе дневника здоровья
        </div>

        {/* Actions */}
        <div className="drs__card-actions">
          <Link
            to={`/shop/${rec.productId}`}
            className="drs__btn drs__btn--outline"
          >
            Подробнее
          </Link>

          {!isAdmin && (
            <button
              className={`drs__btn drs__btn--cart${added ? " drs__btn--added" : ""}${addErr ? " drs__btn--err" : ""}`}
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? (
                <Spinner size={14} color="white" />
              ) : added ? (
                <><CheckIcon /> Добавлено</>
              ) : addErr ? (
                "Ошибка"
              ) : (
                <><CartIcon /> В корзину</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
/**
 * Props:
 *   recs          — raw API response (array or $values-wrapped)
 *   loading       — initial load in progress
 *   error         — error message string | null
 *   generating    — POST in progress (patient only)
 *   onGenerate    — fn to call POST /recommend-products (patient only)
 *   isAdmin       — boolean, hides cart buttons & generate button
 *   diaryEmpty    — boolean, show "fill diary first" hint
 */
export default function DiaryRecommendationsSection({
  recs,
  loading,
  error,
  generating,
  onGenerate,
  isAdmin = false,
  diaryEmpty = false,
}) {
  const list = toArr(recs);

  return (
    <section className="drs">
      {/* Header */}
      <div className="drs__header">
        <div className="drs__header-left">
          <div className="drs__header-icon"><SparkleIcon /></div>
          <div>
            <h3 className="drs__title">Рекомендации на основе дневника здоровья</h3>
            <p className="drs__subtitle">
              Персональный подбор пептидов по данным вашего дневника
            </p>
          </div>
        </div>

        {!isAdmin && onGenerate && (
          <button
            className="drs__generate-btn"
            onClick={onGenerate}
            disabled={generating}
          >
            {generating ? (
              <><Spinner size={15} color="white" /> Анализирую…</>
            ) : (
              <><RefreshIcon /> Подобрать рекомендации</>
            )}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="drs__body">
        {/* Loading skeleton */}
        {loading && (
          <div className="drs__state">
            <Spinner size={36} />
            <p>Загружаем рекомендации…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="drs__state drs__state--error">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {/* Diary empty — prompt to fill it first */}
        {!loading && !error && diaryEmpty && list.length === 0 && (
          <div className="drs__state drs__state--empty-diary">
            <div className="drs__empty-icon"><DiaryIcon /></div>
            <h4>Заполните дневник здоровья</h4>
            <p>
              Рекомендации формируются на основе ваших показателей:
              веса, давления, сахара в крови, сна и симптомов.
              Добавьте хотя бы одну запись, чтобы получить персональный подбор пептидов.
            </p>
            <Link to="/health-diary" className="drs__diary-link">
              Перейти к дневнику
            </Link>
          </div>
        )}

        {/* Empty recommendations — diary has entries but no recs yet */}
        {!loading && !error && !diaryEmpty && list.length === 0 && (
          <div className="drs__state drs__state--empty">
            <div className="drs__empty-icon"><SparkleIcon /></div>
            <h4>Рекомендации ещё не сформированы</h4>
            {!isAdmin && (
              <p>
                Нажмите «Подобрать рекомендации» — система проанализирует данные
                вашего дневника и предложит подходящие пептидные препараты.
              </p>
            )}
            {isAdmin && (
              <p>Пациент ещё не запрашивал рекомендации.</p>
            )}
          </div>
        )}

        {/* Cards */}
        {!loading && !error && list.length > 0 && (
          <>
            <div className="drs__disclaimer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
                <path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
              Носит информационный характер. Перед применением — консультация врача.
            </div>

            <div className="drs__grid">
              {list.map((rec) => (
                <RecCard
                  key={rec.productId}
                  rec={rec}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
