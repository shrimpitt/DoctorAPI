import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../api";
import StatusBadge from "../components/ui/StatusBadge";
import Spinner from "../components/ui/Spinner";
import "./OrderPage.css";

export default function OrderPage() {
  const { id } = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    getOrderById(id)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-center"><Spinner size={40} /></div>;
  if (error || !data) return (
    <div className="page-center">
      <p style={{ color: "var(--mid-gray)" }}>Заказ не найден.</p>
      <Link to="/shop" className="btn-outline" style={{ marginTop: 16 }}>В магазин</Link>
    </div>
  );

  const { order, items } = data;

  return (
    <div className="order-page">
      <div className="booking-page__topbar">
        <Link to="/shop" className="booking-page__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          В магазин
        </Link>
      </div>

      <div className="container order-page__inner">
        <div className="order-success-banner">
          <div className="order-success-banner__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <h2>Заказ оформлен!</h2>
            <p>Номер заказа: <strong>{order.orderNumber}</strong></p>
          </div>
        </div>

        <div className="order-card">
          <div className="order-card__header">
            <h3>Детали заказа</h3>
            <StatusBadge status={order.status} />
          </div>

          <div className="order-card__meta">
            <div><span>Имя</span><strong>{order.fullName}</strong></div>
            <div><span>Телефон</span><strong>{order.phone}</strong></div>
            {order.email && <div><span>Email</span><strong>{order.email}</strong></div>}
            {order.city && <div><span>Город</span><strong>{order.city}</strong></div>}
            {order.addressLine && <div><span>Адрес</span><strong>{order.addressLine}</strong></div>}
            {order.comment && <div><span>Комментарий</span><strong>{order.comment}</strong></div>}
          </div>

          <table className="order-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Цена</th>
                <th>Кол-во</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>{Number(item.unitPrice).toLocaleString("ru-RU")} ₸</td>
                  <td>{item.quantity}</td>
                  <td>{Number(item.totalPrice).toLocaleString("ru-RU")} ₸</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}><strong>Итого</strong></td>
                <td><strong>{Number(order.totalAmount).toLocaleString("ru-RU")} ₸</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link to="/shop" className="btn-outline">Продолжить покупки</Link>
        </div>
      </div>
    </div>
  );
}
