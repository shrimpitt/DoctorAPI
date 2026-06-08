import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMyOrderById } from "../api";
import StatusBadge from "../components/ui/StatusBadge";
import Spinner from "../components/ui/Spinner";
import PaymentModal from "../components/payment/PaymentModal";
import "./OrderPage.css";

export default function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const load = () => {
    setLoading(true);
    getMyOrderById(id)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePaymentSuccess = () => { setShowPayment(false); load(); };

  if (loading) return <div className="page-center"><Spinner size={40} /></div>;
  if (error || !data) return (
    <div className="page-center">
      <p style={{ color: "var(--mid-gray)" }}>{t("orderPage.notFound")}</p>
      <Link to="/shop" className="btn-outline" style={{ marginTop: 16 }}>{t("orderPage.toShop")}</Link>
    </div>
  );

  const { order, items } = data;
  const isPaid = order.paymentStatus === "paid";

  return (
    <>
      {showPayment && (
        <PaymentModal
          orderId={order.id}
          totalAmount={order.totalAmount}
          orderNumber={order.orderNumber}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      <div className="order-page">
        <div className="booking-page__topbar">
          <Link to="/shop" className="booking-page__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {t("orderPage.toShop")}
          </Link>
        </div>

        <div className="container order-page__inner">
          <div className={`order-success-banner ${isPaid ? "order-success-banner--paid" : "order-success-banner--pending"}`}>
            <div className="order-success-banner__icon">
              {isPaid ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
            </div>
            <div className="order-success-banner__text">
              <h2>{isPaid ? t("orderPage.orderPaid") : t("orderPage.orderPlaced")}</h2>
              <p>{t("orderPage.orderNumber")} <strong>{order.orderNumber}</strong></p>
            </div>
            {!isPaid && (
              <button className="order-pay-btn" onClick={() => setShowPayment(true)}>
                {t("orderPage.payOrder")}
              </button>
            )}
          </div>

          <div className="order-card">
            <div className="order-card__header">
              <h3>{t("orderPage.orderDetails")}</h3>
              <div className="order-card__badges">
                <StatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} t={t} />
              </div>
            </div>

            <div className="order-card__meta">
              <div><span>{t("orderPage.nameLabel")}</span><strong>{order.fullName}</strong></div>
              <div><span>{t("orderPage.phoneLabel")}</span><strong>{order.phone}</strong></div>
              {order.email      && <div><span>{t("orderPage.emailLabel")}</span><strong>{order.email}</strong></div>}
              {order.city       && <div><span>{t("orderPage.cityLabel")}</span><strong>{order.city}</strong></div>}
              {order.addressLine && <div><span>{t("orderPage.addressLabel")}</span><strong>{order.addressLine}</strong></div>}
              {order.comment    && <div><span>{t("orderPage.commentLabel")}</span><strong>{order.comment}</strong></div>}
              {order.paymentMethod && (
                <div><span>{t("orderPage.paymentMethod")}</span><strong style={{ textTransform: "capitalize" }}>{order.paymentMethod.replace("_", " ")}</strong></div>
              )}
              {order.paidAt && (
                <div>
                  <span>{t("orderPage.paidAt")}</span>
                  <strong>{new Date(order.paidAt).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}</strong>
                </div>
              )}
            </div>

            <table className="order-table">
              <thead>
                <tr>
                  <th>{t("orderPage.colProduct")}</th>
                  <th>{t("orderPage.colPrice")}</th>
                  <th>{t("orderPage.colQty")}</th>
                  <th>{t("orderPage.colTotal")}</th>
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
                  <td colSpan={3}><strong>{t("orderPage.total")}</strong></td>
                  <td><strong>{Number(order.totalAmount).toLocaleString("ru-RU")} ₸</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="order-page__actions">
            {!isPaid && (
              <button className="btn-primary" onClick={() => setShowPayment(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: 6 }}>
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                {t("orderPage.pay")} — {Number(order.totalAmount).toLocaleString("ru-RU")} ₸
              </button>
            )}
            <Link to="/shop" className="btn-outline">{t("orderPage.continueShopping")}</Link>
          </div>
        </div>
      </div>
    </>
  );
}

function PaymentStatusBadge({ status, t }) {
  const map = {
    unpaid:     { key: "status.unpaid",     color: "#F59E0B", bg: "#FEF3C7" },
    pending:    { key: "status.waiting",    color: "#3B82F6", bg: "#EFF6FF" },
    processing: { key: "status.processing", color: "#8B5CF6", bg: "#EDE9FE" },
    paid:       { key: "status.paid",       color: "#10B981", bg: "#D1FAE5" },
    failed:     { key: "status.failed",     color: "#EF4444", bg: "#FEE2E2" },
    cancelled:  { key: "status.refunded",   color: "#6B7280", bg: "#F3F4F6" },
  };
  const cfg = map[status] || map.unpaid;
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`,
    }}>
      {t(cfg.key, { defaultValue: status })}
    </span>
  );
}
