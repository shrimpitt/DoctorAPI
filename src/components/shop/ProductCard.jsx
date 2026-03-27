import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getVolumes } from "../../utils/volumes";
import { getProductImage, getProductName } from "../../utils/productImage";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const volumes = getVolumes(product);
  const [volIdx, setVolIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const imgRef = useRef(null);
  const { addItem } = useCart();

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
      // keep id stable per variant so same base product+volume = same cart line
      id: `${product.id}-${volIdx}`,
    });
  };

  return (
    <article className="pc">
      {/* Photo */}
      <Link to={`/shop/${product.id}`} className="pc__img-wrap">
        <span className="pc__badge">Вода в комплекте</span>
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
