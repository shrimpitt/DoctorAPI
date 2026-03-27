import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts, getProductCategories } from "../api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/shop/ProductCard";
import CartSidebar from "../components/shop/CartSidebar";
import Spinner from "../components/ui/Spinner";
import "./ShopPage.css";

export default function ShopPage() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartOpen,   setCartOpen]   = useState(false);
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

  const filtered = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  return (
    <div className="shop-page">
      <header className="shop-header">
        <div className="container shop-header__inner">
          <Link to="/" className="booking-page__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            На главную
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

      <div className="container" style={{ padding: "60px 40px" }}>
        <div className="section-header">
          <span className="section-tag">Магазин</span>
          <h2>Рекомендуемые продукты</h2>
          <p>Препараты и нутрицевтики, которые я использую в практике.</p>
        </div>

        {loading ? (
          <div className="shop-page__loading"><Spinner size={36} /> Загрузка товаров...</div>
        ) : (
          <>
            {categories.length > 0 && (
              <div className="category-filter">
                <button
                  className={`category-btn ${!activeCategory ? "category-btn--active" : ""}`}
                  onClick={() => setActiveCategory(null)}>
                  Все
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

            {filtered.length === 0 ? (
              <div className="shop-page__empty">
                <p>Товары не найдены.</p>
              </div>
            ) : (
              <div className="product-grid">
                {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </>
        )}
      </div>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
