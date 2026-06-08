import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createOrder } from "../api";
import { useCart } from "../context/CartContext";
import Spinner from "../components/ui/Spinner";
import PaymentModal from "../components/payment/PaymentModal";
import { KZ_CITY_NAMES } from "../data/kzCities";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { items, totalAmount, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", phone: "", email: "",
    city: "", addressLine: "", deliveryComment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [pendingOrder, setPendingOrder] = useState(null);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const orderData = {
        fullName:        form.fullName,
        phone:           form.phone,
        email:           form.email           || null,
        city:            form.city            || null,
        addressLine:     form.addressLine     || null,
        deliveryComment: form.deliveryComment || null,
        items: items.map((i) => ({
          productId: parseInt(i.productId, 10),
          quantity:  Number(i.quantity),
        })),
      };
      const res = await createOrder(orderData);
      clear();
      setPendingOrder({
        orderId:     res.orderId,
        totalAmount: res.totalAmount,
        orderNumber: res.orderNumber,
      });
    } catch {
      setError(t("checkoutPage.error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId) => navigate(`/order/${orderId}`);
  const handlePaymentClose   = () => navigate(`/order/${pendingOrder.orderId}`);

  if (items.length === 0 && !pendingOrder) return (
    <div className="page-center">
      <p style={{ color: "var(--mid-gray)" }}>{t("checkoutPage.cartEmpty")}</p>
      <Link to="/shop" className="btn-primary" style={{ marginTop: 16 }}>{t("checkoutPage.toShop")}</Link>
    </div>
  );

  return (
    <>
      {pendingOrder && (
        <PaymentModal
          orderId={pendingOrder.orderId}
          totalAmount={pendingOrder.totalAmount}
          orderNumber={pendingOrder.orderNumber}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}

      <div className="checkout-page">
        <div className="booking-page__topbar">
          <Link to="/shop" className="booking-page__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {t("checkoutPage.backToShop")}
          </Link>
        </div>

        <div className="container checkout-page__inner">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2 className="checkout-form__title">{t("checkoutPage.title")}</h2>

            {/* ── Контактные данные ── */}
            <div className="form-group">
              <label>{t("checkoutPage.nameLabel")} *</label>
              <input name="fullName" type="text" placeholder={t("checkoutPage.namePh")}
                value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>{t("checkoutPage.phoneLabel")} *</label>
              <input name="phone" type="tel" placeholder={t("checkoutPage.phonePh")}
                value={form.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>{t("checkoutPage.emailLabel")}</label>
              <input name="email" type="email" placeholder={t("checkoutPage.emailPh")}
                value={form.email} onChange={handleChange} />
            </div>

            {/* ── Адрес доставки ── */}
            <div className="checkout-section-label">{t("checkoutPage.deliverySection")}</div>

            <div className="form-group">
              <label>{t("checkoutPage.cityLabel")} *</label>
              <select name="city" value={form.city} onChange={handleChange}
                required className="form-select">
                <option value="">{t("checkoutPage.cityPh")}</option>
                {KZ_CITY_NAMES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t("checkoutPage.addressLabel")} *</label>
              <input name="addressLine" type="text" placeholder={t("checkoutPage.addressPh")}
                value={form.addressLine} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>{t("checkoutPage.deliveryCommentLabel")}</label>
              <textarea name="deliveryComment" rows={2}
                placeholder={t("checkoutPage.deliveryCommentPh")}
                value={form.deliveryComment} onChange={handleChange} />
            </div>

            {error && <p className="contacts__error">{error}</p>}

            <button className="btn-primary checkout-form__submit" type="submit" disabled={loading}>
              {loading
                ? <Spinner size={18} color="white" />
                : `${t("checkoutPage.submit")} — ${Number(totalAmount).toLocaleString("ru-RU")} ₸`}
            </button>
          </form>

          <aside className="checkout-summary">
            <h3 className="checkout-summary__title">{t("checkoutPage.orderSummary")}</h3>
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
              <span>{t("checkoutPage.total")}</span>
              <strong>{Number(totalAmount).toLocaleString("ru-RU")} ₸</strong>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
