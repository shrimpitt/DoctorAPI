import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../api";
import { useCart } from "../context/CartContext";
import { getVolumes } from "../utils/volumes";
import { getProductImage, getProductName } from "../utils/productImage";
import CartSidebar from "../components/shop/CartSidebar";
import Spinner from "../components/ui/Spinner";
import "./ProductPage.css";

const TABS = ["Описание", "Технические характеристики", "Условия хранения", "Калькулятор дозировок"];

function DosageCalculator({ basePrice }) {
  const [weight,  setWeight]  = useState("");
  const [dose,    setDose]    = useState("");
  const [conc,    setConc]    = useState("1"); // mg/ml
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

  // Thumbnails — main image only for now (backend has single image)
  const thumbs = imgSrc ? [imgSrc] : [];

  return (
    <div className="pp">
      {/* Header — same as ShopPage */}
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

          {/* Thumbnails */}
          {thumbs.length > 0 && (
            <div className="pp__thumbs">
              {thumbs.map((src, i) => (
                <button key={i} className="pp__thumb pp__thumb--active">
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}

          {/* Water note */}
          <div className="pp__water-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A5C" strokeWidth="1.8">
              <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
            </svg>
            <span>Бактерицидная вода для разведения пептида идёт в комплекте</span>
          </div>
        </div>

        {/* ── RIGHT: info ── */}
        <div className="pp__info">
          {product.sku && <p className="pp__sku">Арт. {product.sku}</p>}

          <h1 className="pp__name">{displayName}</h1>

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

          {/* Stock / CTA */}
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

          {/* Meta */}
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
          {activeTab === 0 && (
            <div className="pp__tab-body">
              {product.full_description ? (
                <p>{product.full_description}</p>
              ) : (
                <p style={{ color: "#7A8899" }}>Описание не указано.</p>
              )}
            </div>
          )}

          {activeTab === 1 && (
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

          {activeTab === 2 && (
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

          {activeTab === 3 && (
            <DosageCalculator basePrice={currentVol.price} />
          )}
        </div>
      </div>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
