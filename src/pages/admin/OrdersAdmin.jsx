import { useState, useEffect } from "react";
import { getOrders, getOrderById, updateOrderStatus } from "../../api";
import StatusBadge from "../../components/ui/StatusBadge";
import Spinner from "../../components/ui/Spinner";
import "./AdminLayout.css";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function OrdersAdmin() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [detail,     setDetail]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getOrders()
      .then((d) => {
        if (Array.isArray(d)) return setOrders(d);
        if (Array.isArray(d?.$values)) return setOrders(d.$values);
        if (Array.isArray(d?.items))   return setOrders(d.items);
        if (Array.isArray(d?.data))    return setOrders(d.data);
        setOrders([]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (id) => {
    setSelected(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await getOrderById(id);
      setDetail(d);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      if (detail?.order?.id === id) setDetail((d) => ({ ...d, order: { ...d.order, status } }));
    } catch {
      alert("Не удалось обновить статус");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h1 className="admin-section__title">Заказы</h1>
        {!loading && <span className="admin-section__count">{orders.length} заказов</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 400px" : "1fr", gap: 24 }}>
        {/* Table */}
        <div>
          {loading ? (
            <div className="admin-loading"><Spinner /> Загрузка...</div>
          ) : orders.length === 0 ? (
            <div className="admin-empty">Заказов пока нет.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Номер</th>
                    <th>Покупатель</th>
                    <th>Телефон</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}
                      onClick={() => openDetail(o.id)}
                      style={{ cursor: "pointer", background: selected === o.id ? "var(--sage-pale)" : undefined }}>
                      <td style={{ color: "var(--sage)", fontWeight: 500 }}>{o.orderNumber}</td>
                      <td><strong>{o.fullName}</strong></td>
                      <td>{o.phone}</td>
                      <td>{Number(o.totalAmount).toLocaleString("ru-RU")} ₸</td>
                      <td style={{ color: "var(--mid-gray)", whiteSpace: "nowrap" }}>{formatDate(o.createdAt)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {updatingId === o.id ? (
                          <Spinner size={16} />
                        ) : (
                          <select className="status-select" value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="admin-table-wrap" style={{ alignSelf: "start", position: "sticky", top: 24 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 14 }}>Детали заказа</strong>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mid-gray)" }}>✕</button>
            </div>

            {detailLoading ? (
              <div className="admin-loading"><Spinner /> Загрузка...</div>
            ) : detail ? (
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, fontSize: 13 }}>
                  <div><span style={{ color: "var(--mid-gray)" }}>Номер: </span><strong>{detail.order.orderNumber}</strong></div>
                  {detail.order.email && <div><span style={{ color: "var(--mid-gray)" }}>Email: </span>{detail.order.email}</div>}
                  {detail.order.city && <div><span style={{ color: "var(--mid-gray)" }}>Город: </span>{detail.order.city}</div>}
                  {detail.order.addressLine && <div><span style={{ color: "var(--mid-gray)" }}>Адрес: </span>{detail.order.addressLine}</div>}
                  {detail.order.comment && <div><span style={{ color: "var(--mid-gray)" }}>Комментарий: </span>{detail.order.comment}</div>}
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", color: "var(--mid-gray)", fontWeight: 500, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Товар</th>
                      <th style={{ textAlign: "right", color: "var(--mid-gray)", fontWeight: 500, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                          {item.productName} × {item.quantity}
                        </td>
                        <td style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", textAlign: "right" }}>
                          {Number(item.totalPrice).toLocaleString("ru-RU")} ₸
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ padding: "10px 0", fontWeight: 600 }}>Итого</td>
                      <td style={{ padding: "10px 0", fontWeight: 600, textAlign: "right" }}>
                        {Number(detail.order.totalAmount).toLocaleString("ru-RU")} ₸
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="admin-empty">Не удалось загрузить детали.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
