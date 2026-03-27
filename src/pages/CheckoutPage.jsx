import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../api";
import { useCart } from "../context/CartContext";
import Spinner from "../components/ui/Spinner";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { items, totalAmount, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", phone: "", email: "",
    city: "", addressLine: "", comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const orderData = {
        FullName:    form.fullName,
        Phone:       form.phone,
        Email:       form.email       || null,
        City:        form.city        || null,
        AddressLine: form.addressLine || null,
        Comment:     form.comment     || null,
        Items: items.map((i) => ({
          ProductId: i.productId,
          Quantity:  i.quantity,
        })),
      };
      console.log("POST /api/orders →", orderData);
      const res = await createOrder(orderData);
      clear();
      navigate(`/order/${res.orderId}`);
    } catch {
      setError("Не удалось оформить заказ. Пожалуйста, попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return (
    <div className="page-center">
      <p style={{ color: "var(--mid-gray)" }}>Корзина пуста.</p>
      <Link to="/shop" className="btn-primary" style={{ marginTop: 16 }}>В магазин</Link>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="booking-page__topbar">
        <Link to="/shop" className="booking-page__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Назад в магазин
        </Link>
      </div>

      <div className="container checkout-page__inner">
        {/* Form */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2 className="checkout-form__title">Оформление заказа</h2>

          <div className="form-group">
            <label>Имя *</label>
            <input name="fullName" type="text" placeholder="Айгерим Иванова" value={form.fullName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Телефон *</label>
            <input name="phone" type="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="example@mail.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Город</label>
            <input name="city" type="text" placeholder="Алматы" value={form.city} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Адрес доставки</label>
            <input name="addressLine" type="text" placeholder="ул. Абая 1, кв. 5" value={form.addressLine} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Комментарий к заказу</label>
            <textarea name="comment" rows={3} placeholder="Любые пожелания..." value={form.comment} onChange={handleChange} />
          </div>

          {error && <p className="contacts__error">{error}</p>}

          <button className="btn-primary checkout-form__submit" type="submit" disabled={loading}>
            {loading ? <Spinner size={18} color="white" /> : `Оформить заказ — ${Number(totalAmount).toLocaleString("ru-RU")} ₸`}
          </button>
        </form>

        {/* Summary */}
        <aside className="checkout-summary">
          <h3 className="checkout-summary__title">Ваш заказ</h3>
          <ul className="checkout-summary__list">
            {items.map((item) => (
              <li key={item.productId} className="checkout-summary__item">
                <span className="checkout-summary__name">{item.name} × {item.quantity}</span>
                <span className="checkout-summary__price">
                  {Number(item.price * item.quantity).toLocaleString("ru-RU")} ₸
                </span>
              </li>
            ))}
          </ul>
          <div className="checkout-summary__total">
            <span>Итого</span>
            <strong>{Number(totalAmount).toLocaleString("ru-RU")} ₸</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
