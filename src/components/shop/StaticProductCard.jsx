import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./ProductCard.css";
import "./StaticProductCard.css";

const WA_NUMBER = "87759125669";

function buildWaUrl(product) {
  const msg = `Здравствуйте! Хочу оформить предзаказ на ${product.name} (${product.volume}). Цена: ${Number(product.price).toLocaleString("ru-RU")} ₸.`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function StaticProductCard({ product }) {
  const { t } = useTranslation();
  const [imgErr,     setImgErr]     = useState(false);
  const [showModal,  setShowModal]  = useState(false);

  const price = Number(product.price).toLocaleString("ru-RU");

  return (
    <>
      <article className="pc">
        {/* Photo */}
        <button
          className="pc__img-wrap spc__img-btn"
          onClick={() => setShowModal(true)}
          aria-label={product.name}
        >
          <span className="pc__badge spc__badge">{product.category}</span>

          {imgErr ? (
            <div className="pc__img-placeholder spc__placeholder">
              <span className="spc__placeholder-name">{product.name}</span>
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className="pc__img"
              onError={() => setImgErr(true)}
            />
          )}

          <div className="pc__quick-view"><span>{t("shopPage.details")}</span></div>
        </button>

        {/* Body */}
        <div className="pc__body">
          <button className="pc__name spc__name-btn" onClick={() => setShowModal(true)}>
            {product.name}
          </button>

          <p className="pc__dosage-default">{t("shopPage.byPrescription")}</p>

          {product.shortDescription && (
            <p className="pc__desc">{product.shortDescription}</p>
          )}

          <div className="pc__price">{price} ₸</div>

          <div className="pc__volume">
            <label className="pc__volume-label">{t("shopPage.volume")}</label>
            <span className="spc__volume-chip">{product.volume}</span>
          </div>

          <div className="pc__actions">
            <button className="pc__btn-outline" onClick={() => setShowModal(true)}>
              {t("shopPage.details")}
            </button>
            <a
              href={buildWaUrl(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="pc__btn-dark spc__btn-preorder"
            >
              {t("shopPage.preorder")}
            </a>
          </div>
        </div>
      </article>

      {/* Modal */}
      {showModal && (
        <div className="spc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="spc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="spc-modal__close" onClick={() => setShowModal(false)} aria-label={t("shopPage.close")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <div className="spc-modal__img-wrap">
              {imgErr ? (
                <div className="spc-modal__img-placeholder">
                  <span>{product.name}</span>
                </div>
              ) : (
                <img
                  src={product.image}
                  alt={product.name}
                  className="spc-modal__img"
                  onError={() => setImgErr(true)}
                />
              )}
            </div>

            <div className="spc-modal__body">
              <div className="spc-modal__meta">
                <span className="spc-modal__category">{product.category}</span>
                <span className="spc-modal__volume">{product.volume}</span>
              </div>

              <h2 className="spc-modal__name">{product.name}</h2>
              <p className="spc-modal__price">{price} ₸</p>
              <p className="spc-modal__desc">{product.description}</p>

              <a
                href={buildWaUrl(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="spc-modal__wa-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t("shopPage.waPreorder")}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
