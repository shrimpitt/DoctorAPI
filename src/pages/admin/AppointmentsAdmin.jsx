import { useState, useEffect } from "react";
import { getAppointments, updateAppointmentStatus } from "../../api";
import StatusBadge from "../../components/ui/StatusBadge";
import Spinner from "../../components/ui/Spinner";
import "./AdminLayout.css";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default function AppointmentsAdmin() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    getAppointments()
      .then((d) => {
        if (Array.isArray(d)) return setAppointments(d);
        if (Array.isArray(d?.$values)) return setAppointments(d.$values);
        if (Array.isArray(d?.items))   return setAppointments(d.items);
        if (Array.isArray(d?.data))    return setAppointments(d.data);
        setAppointments([]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
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
        <h1 className="admin-section__title">Записи на приём</h1>
        {!loading && <span className="admin-section__count">{appointments.length} записей</span>}
      </div>

      {loading ? (
        <div className="admin-loading"><Spinner /> Загрузка...</div>
      ) : appointments.length === 0 ? (
        <div className="admin-empty">Записей пока нет.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Слот ID</th>
                <th>Тип консультации</th>
                <th>Комментарий</th>
                <th>Дата заявки</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td style={{ color: "var(--mid-gray)" }}>#{a.id}</td>
                  <td><strong>{a.fullName}</strong></td>
                  <td><a href={`tel:${a.phone}`} style={{ color: "var(--sage)", textDecoration: "none" }}>{a.phone}</a></td>
                  <td>{a.email || "—"}</td>
                  <td>{a.scheduleSlotId ?? "—"}</td>
                  <td>{a.consultationTypeId ?? "—"}</td>
                  <td style={{ maxWidth: 200, color: "var(--mid-gray)" }}>
                    {a.comment ? (
                      <span title={a.comment}>
                        {a.comment.length > 40 ? a.comment.slice(0, 40) + "…" : a.comment}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ color: "var(--mid-gray)", whiteSpace: "nowrap" }}>{formatDate(a.createdAt)}</td>
                  <td>
                    {updatingId === a.id ? (
                      <Spinner size={16} />
                    ) : (
                      <select
                        className="status-select"
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
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
  );
}
