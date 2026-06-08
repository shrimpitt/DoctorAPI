import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProducts, getProductCategories } from "../api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/shop/ProductCard";
import StaticProductCard from "../components/shop/StaticProductCard";
import CartSidebar from "../components/shop/CartSidebar";
import Spinner from "../components/ui/Spinner";
import { staticProducts } from "../data/staticProducts";
import "./ShopPage.css";

export default function ShopPage() {
  const { t } = useTranslation();
  const [products,       setProducts]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartOpen,       setCartOpen]       = useState(false);
  const { totalCount } = useCart();

  useEffect(() => {
    Promise.all([getProducts(), getProductCategories()])
      .then(([p, c]) => {
        setProducts(Array.isArray(p) ? p : []);
        setCategories(Array.isArray(c) ? c : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredApi = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  const hasAnyProducts = filteredApi.length > 0 || staticProducts.length > 0;

  return (
    <div className="shop-page">
      <header className="shop-header">
        <div className="container shop-header__inner">
          <Link to="/" className="booking-page__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {t("shopPage.backHome")}
          </Link>
          <button className="cart-toggle" onClick={() => setCartOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
            </svg>
            {t("shopPage.cart")}
            {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
          </button>
        </div>
      </header>

      <div className="container" style={{ padding: "60px 40px" }}>
        <div className="section-header">
          <span className="section-tag">{t("shopPage.tag")}</span>
          <h2>{t("shopPage.title")}</h2>
          <p>{t("shopPage.desc")}</p>
        </div>

        {loading ? (
          <div className="shop-page__loading"><Spinner size={36} /> {t("shopPage.loading")}</div>
        ) : (
          <>
            {categories.length > 0 && (
              <div className="category-filter">
                <button
                  className={`category-btn ${!activeCategory ? "category-btn--active" : ""}`}
                  onClick={() => setActiveCategory(null)}>
                  {t("shopPage.all")}
                </button>
                {categories.map((c) => (
                  <button key={c.id}
                    className={`category-btn ${activeCategory === c.id ? "category-btn--active" : ""}`}
                    onClick={() => setActiveCategory(c.id)}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {!hasAnyProducts ? (
              <div className="shop-page__empty">
                <p>{t("shopPage.noProducts")}</p>
              </div>
            ) : (
              <div className="product-grid">
                {/* Товары из API */}
                {filteredApi.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
                {/* Статичные товары — всегда видны */}
                {staticProducts.map((p) => (
                  <StaticProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
