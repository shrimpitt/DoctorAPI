import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../api";
import { useCart } from "../context/CartContext";
import { getVolumes } from "../utils/volumes";
import { getProductImage, getProductName } from "../utils/productImage";
import { getDosageInfo } from "../data/dosageInfo";
import CartSidebar from "../components/shop/CartSidebar";
import Spinner from "../components/ui/Spinner";
import "./ProductPage.css";

const TABS = ["Описание", "Применение", "Технические характеристики", "Условия хранения", "Калькулятор дозировок"];

// Inline icon renderer — syringe, pill, or droplet
function DosageIcon({ type = "syringe", size = 22 }) {
  const p = {
    width: size, height: size,
    viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: "2",
    strokeLinecap: "round", strokeLinejoin: "round",
  };
  if (type === "pill") return (
    <svg {...p}>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
      <path d="m8.5 8.5 7 7"/>
    </svg>
  );
  if (type === "droplet") return (
    <svg {...p}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
    </svg>
  );
  return (
    <svg {...p}>
      <path d="m18 2 4 4"/>
      <path d="m17 7 3-3"/>
      <path d="M14 4 3 15l3 3L17 7l-3-3z"/>
      <path d="m3 15 1.5 1.5"/>
      <path d="m2.5 21.5 3-3"/>
      <path d="m11 11-5 5"/>
    </svg>
  );
}

function UsageTab({ productId }) {
  const info = getDosageInfo(productId);

  if (!info) {
    return (
      <div className="pp__usage">
        <p className="pp__usage-no-data">
          Применение согласно индивидуальному назначению врача.
        </p>
        <div className="pp__usage-disclaimer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>
            <strong>Применять только по назначению врача.</strong>{" "}
            Информация представлена для ознакомления. Не является медицинской рекомендацией.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pp__usage">
      {/* Icon + title */}
      <div className="pp__usage-header">
        <div className="pp__usage-icon">
          <DosageIcon type={info.icon} size={24} />
        </div>
        <div>
          <p className="pp__usage-header-title">Описание и применение</p>
          <p className="pp__usage-header-sub">Данные носят справочный характер</p>
        </div>
      </div>

      {/* Key pills: dosage / course / admin */}
      <div className="pp__usage-pills">
        <div className="pp__usage-pill">
          <span className="pp__usage-pill-label">Дозировка</span>
          <span className="pp__usage-pill-value">{info.dosage}</span>
        </div>
        <div className="pp__usage-pill">
          <span className="pp__usage-pill-label">Курс</span>
          <span className="pp__usage-pill-value">{info.course}</span>
        </div>
        <div className="pp__usage-pill">
          <span className="pp__usage-pill-label">Способ применения</span>
          <span className="pp__usage-pill-value">{info.admin}</span>
        </div>
      </div>

      {/* Indications */}
      {info.indications && (
        <div className="pp__usage-section">
          <p className="pp__usage-section-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Показания
          </p>
          <p className="pp__usage-section-text">{info.indications}</p>
        </div>
      )}

      {/* Contraindications */}
      {info.contraindications && (
        <div className="pp__usage-section">
          <p className="pp__usage-section-title pp__usage-section-title--warn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Противопоказания
          </p>
          <p className="pp__usage-section-text">{info.contraindications}</p>
        </div>
      )}

      {/* Mandatory medical disclaimer */}
      <div className="pp__usage-disclaimer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>
          <strong>Применять только по назначению врача.</strong>{" "}
          Информация представлена исключительно в ознакомительных целях и не является медицинской рекомендацией или заменой профессиональной консультации специалиста.
        </p>
      </div>
    </div>
  );
}

function DosageCalculator({ basePrice }) {
  const [weight,  setWeight]  = useState("");
  const [dose,    setDose]    = useState("");
  const [conc,    setConc]    = useState("1");
  const result = weight && dose
    ? { totalMcg: (weight * dose).toFixed(1), volumeMl: ((weight * dose) / (conc * 1000)).toFixed(3) }
    : null;

  return (
    <div className="pp__calc">
      <p className="pp__calc-note">
        Введите параметры для расчёта индивидуальной дозировки.
      </p>
      <div className="pp__calc-grid">
        <div className="pp__calc-field">
          <label>Масса тела (кг)</label>
          <input type="number" min="1" max="300" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div className="pp__calc-field">
          <label>Доза (мкг/кг)</label>
          <input type="number" min="0.1" step="0.1" placeholder="1.0" value={dose} onChange={(e) => setDose(e.target.value)} />
        </div>
        <div className="pp__calc-field">
          <label>Концентрация (мг/мл)</label>
          <input type="number" min="0.1" step="0.1" placeholder="1" value={conc} onChange={(e) => setConc(e.target.value)} />
        </div>
      </div>
      {result && (
        <div className="pp__calc-result">
          <div className="pp__calc-row">
            <span>Суммарная доза</span>
            <strong>{result.totalMcg} мкг</strong>
          </div>
          <div className="pp__calc-row">
            <span>Объём для введения</span>
            <strong>{result.volumeMl} мл</strong>
          </div>
        </div>
      )}
      <p className="pp__calc-disclaimer">
        Расчёт носит справочный характер. Дозировку назначает лечащий врач.
      </p>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [added,    setAdded]    = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [volIdx,   setVolIdx]   = useState(0);
  const [fading,   setFading]   = useState(false);

  const changeVolume = (idx) => {
    setFading(true);
    setTimeout(() => { setVolIdx(idx); setFading(false); }, 180);
  };
  const [qty,      setQty]      = useState(1);
  const { addItem, totalCount } = useCart();

  useEffect(() => {
    setLoading(true);
    setVolIdx(0);
    setQty(1);
    setAdded(false);
    getProductById(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-center"><Spinner size={40} /></div>;
  if (notFound || !product) return (
    <div className="page-center">
      <p style={{ color: "#7A8899" }}>Товар не найден.</p>
      <Link to="/shop" className="pp__back-btn" style={{ marginTop: 16 }}>← В магазин</Link>
    </div>
  );

  const volumes     = getVolumes(product);
  const currentVol  = volumes[volIdx];
  const imgSrc      = getProductImage(product, currentVol.label);
  const displayName = getProductName(product);
  const totalPrice  = currentVol.price * qty;
  const inStock     = product.stock_qty > 0;
  const dosageInfo  = getDosageInfo(product.id);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        ...product,
        price: currentVol.price,
        name: `${product.name} ${currentVol.label}`,
        id: `${product.id}-${volIdx}`,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const thumbs = imgSrc ? [imgSrc] : [];

  return (
    <div className="pp">
      <header className="shop-header">
        <div className="container shop-header__inner">
          <Link to="/shop" className="booking-page__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Назад в магазин
          </Link>
          <button className="cart-toggle" onClick={() => setCartOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
            </svg>
            Корзина
            {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
          </button>
        </div>
      </header>

      <div className="container pp__inner">

        {/* ── LEFT: gallery ── */}
        <div className="pp__gallery">
          <div className="pp__main-img-wrap">
            <span className="pp__gallery-badge">Вода в комплекте</span>

            {/* Medical icon badge — top-right */}
            <span className="pp__med-icon" aria-hidden="true">
              <DosageIcon type={dosageInfo?.icon ?? "syringe"} size={18} />
            </span>

            {imgSrc ? (
              <img src={imgSrc} alt={product.name} className={`pp__main-img${fading ? " switching" : ""}`} />
            ) : (
              <div className="pp__img-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#C8D0DC" strokeWidth="0.8">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
          </div>

          {thumbs.length > 0 && (
            <div className="pp__thumbs">
              {thumbs.map((src, i) => (
                <button key={i} className="pp__thumb pp__thumb--active">
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="pp__water-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
              <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
            </svg>
            <span>Бактерицидная вода для разведения пептида идёт в комплекте</span>
          </div>
        </div>

        {/* ── RIGHT: info ── */}
        <div className="pp__info">
          {product.sku && <p className="pp__sku">Арт. {product.sku}</p>}

          <h1 className="pp__name">{displayName}</h1>

          {/* Inline dosage summary on product page */}
          {dosageInfo && (
            <div className="pp__dosage-summary">
              <span className="pp__dosage-summary-chip">
                <DosageIcon type={dosageInfo.icon} size={13} />
                {dosageInfo.dosage}
              </span>
              <span className="pp__dosage-summary-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Курс: {dosageInfo.course}
              </span>
              <span className="pp__dosage-summary-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                {dosageInfo.admin}
              </span>
            </div>
          )}

          {product.short_description && (
            <p className="pp__short">{product.short_description}</p>
          )}

          <div className="pp__price">
            {Number(totalPrice).toLocaleString("ru-RU")} ₸
            {qty > 1 && (
              <span className="pp__price-unit">
                {Number(currentVol.price).toLocaleString("ru-RU")} ₸ / шт
              </span>
            )}
          </div>

          {/* Volume selector */}
          <div className="pp__field-row">
            <label className="pp__field-label">Объём</label>
            <select
              className="pp__select"
              value={volIdx}
              onChange={(e) => changeVolume(Number(e.target.value))}
            >
              {volumes.map((v, i) => (
                <option key={v.label} value={i}>
                  {v.label} — {Number(v.price).toLocaleString("ru-RU")} ₸
                </option>
              ))}
            </select>
          </div>

          {/* Quantity counter */}
          <div className="pp__field-row">
            <label className="pp__field-label">Количество</label>
            <div className="pp__qty">
              <button className="pp__qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="pp__qty-val">{qty}</span>
              <button className="pp__qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          {inStock ? (
            <>
              <button className="pp__add-btn" onClick={handleAdd}>
                {added ? "Добавлено ✓" : "Добавить в корзину"}
              </button>
            </>
          ) : (
            <div className="pp__oos">
              <span className="pp__oos-text">Ожидаем поставку</span>
              <button className="pp__preorder-btn">Оформить предзаказ</button>
            </div>
          )}

          <div className="pp__meta">
            {product.stock_qty > 0 && (
              <span className="pp__in-stock">✓ В наличии</span>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="container pp__tabs-wrap">
        <div className="pp__tabs">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`pp__tab ${activeTab === i ? "pp__tab--active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="pp__tab-content">
          {/* Описание */}
          {activeTab === 0 && (
            <div className="pp__tab-body">
              {product.full_description ? (
                <p>{product.full_description}</p>
              ) : (
                <p style={{ color: "#7A8899" }}>Описание не указано.</p>
              )}
            </div>
          )}

          {/* Применение */}
          {activeTab === 1 && <UsageTab productId={product.id} />}

          {/* Технические характеристики */}
          {activeTab === 2 && (
            <div className="pp__tab-body">
              <table className="pp__specs-table">
                <tbody>
                  {product.sku && <tr><td>Артикул</td><td>{product.sku}</td></tr>}
                  <tr><td>Объём</td><td>{volumes[volIdx].label}</td></tr>
                  <tr><td>Форма выпуска</td><td>Лиофилизат для инъекций</td></tr>
                  <tr><td>Производитель</td><td>—</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Условия хранения */}
          {activeTab === 3 && (
            <div className="pp__tab-body">
              <ul className="pp__storage-list">
                <li>Хранить при температуре от +2°C до +8°C (в холодильнике)</li>
                <li>Не замораживать</li>
                <li>Хранить в недоступном для детей месте</li>
                <li>После вскрытия использовать в течение 30 дней</li>
                <li>Беречь от прямых солнечных лучей</li>
              </ul>
            </div>
          )}

          {/* Калькулятор дозировок */}
          {activeTab === 4 && (
            <DosageCalculator basePrice={currentVol.price} />
          )}
        </div>
      </div>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
