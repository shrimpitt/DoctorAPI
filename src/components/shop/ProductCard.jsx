import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getVolumes } from "../../utils/volumes";
import { getProductImage, getProductName } from "../../utils/productImage";
import { getDosageInfo } from "../../data/dosageInfo";
import "./ProductCard.css";

// Inline SVG icons — no external icon library needed
function DosageIcon({ type = "syringe", size = 14 }) {
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
  // default: syringe
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

export default function ProductCard({ product }) {
  const volumes = getVolumes(product);
  const [volIdx, setVolIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const imgRef = useRef(null);
  const { addItem } = useCart();

  const dosage = getDosageInfo(product.id);

  const changeVolume = (idx) => {
    setFading(true);
    setTimeout(() => {
      setVolIdx(idx);
      setFading(false);
    }, 180);
  };

  const currentVol = volumes[volIdx];
  const inStock = product.stock_qty > 0;
  const imgSrc = getProductImage(product, currentVol.label);
  const displayName = getProductName(product);

  const handleAddToCart = () => {
    addItem({
      ...product,
      price: currentVol.price,
      name: `${displayName} ${currentVol.label}`,
      id: `${product.id}-${volIdx}`,
    });
  };

  return (
    <article className="pc">
      {/* Photo */}
      <Link to={`/shop/${product.id}`} className="pc__img-wrap">
        <span className="pc__badge">Вода в комплекте</span>

        {/* Medical icon badge — top-right corner */}
        <span className="pc__med-icon" aria-hidden="true">
          <DosageIcon type={dosage?.icon ?? "syringe"} size={14} />
        </span>

        {imgSrc ? (
          <img ref={imgRef} src={imgSrc} alt={product.name} className={`pc__img${fading ? " switching" : ""}`} />
        ) : (
          <div className="pc__img-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C8D0DC" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        <div className="pc__quick-view"><span>Подробнее</span></div>
      </Link>

      {/* Body */}
      <div className="pc__body">
        <Link to={`/shop/${product.id}`} className="pc__name">
          {displayName}
        </Link>

        {/* Dosage mini strip */}
        {dosage ? (
          <div className="pc__dosage">
            <span className="pc__dosage-chip">
              <DosageIcon type={dosage.icon} size={11} />
              {dosage.dosage}
            </span>
            <span className="pc__dosage-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {dosage.course}
            </span>
            <span className="pc__dosage-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              {dosage.admin}
            </span>
          </div>
        ) : (
          <p className="pc__dosage-default">Применение по назначению врача</p>
        )}

        {product.short_description && (
          <p className="pc__desc">{product.short_description}</p>
        )}

        <div className="pc__price">
          {Number(currentVol.price).toLocaleString("ru-RU")} ₸
        </div>

        {/* Volume selector */}
        <div className="pc__volume">
          <label className="pc__volume-label">Объём</label>
          <select
            className="pc__select"
            value={volIdx}
            onChange={(e) => changeVolume(Number(e.target.value))}
          >
            {volumes.map((v, i) => (
              <option key={v.label} value={i}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        {inStock ? (
          <div className="pc__actions">
            <Link to={`/shop/${product.id}`} className="pc__btn-outline">
              Подробнее...
            </Link>
            <button className="pc__btn-dark" onClick={handleAddToCart}>
              В корзину
            </button>
          </div>
        ) : (
          <div className="pc__actions pc__actions--oos">
            <span className="pc__oos-text">Ожидаем поставку</span>
            <Link to={`/shop/${product.id}`} className="pc__btn-preorder">
              Предзаказ
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
