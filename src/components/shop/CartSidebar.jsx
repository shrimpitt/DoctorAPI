import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./CartSidebar.css";

export default function CartSidebar({ open, onClose }) {
  const { items, totalAmount, updateQty, removeItem } = useCart();
  const navigate = useNavigate();

  const goToCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {open && <div className="cart-overlay" onClick={onClose} />}
      <aside className={`cart-sidebar ${open ? "cart-sidebar--open" : ""}`}>
        <div className="cart-sidebar__header">
          <h3>Корзина {items.length > 0 && `(${items.length})`}</h3>
          <button className="cart-sidebar__close" onClick={onClose} aria-label="Закрыть">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-sidebar__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--light-gray)" strokeWidth="1.2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
            </svg>
            <p>Корзина пуста</p>
          </div>
        ) : (
          <>
            <ul className="cart-sidebar__list">
              {items.map((item) => (
                <li key={item.productId} className="cart-item">
                  <div className="cart-item__info">
                    <span className="cart-item__name">{item.name}</span>
                    <span className="cart-item__price">
                      {Number(item.price).toLocaleString("ru-RU")} ₸
                    </span>
                  </div>
                  <div className="cart-item__controls">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                    <button className="cart-item__remove" onClick={() => removeItem(item.productId)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-sidebar__footer">
              <div className="cart-sidebar__total">
                <span>Итого</span>
                <strong>{Number(totalAmount).toLocaleString("ru-RU")} ₸</strong>
              </div>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={goToCheckout}>
                Оформить заказ
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
