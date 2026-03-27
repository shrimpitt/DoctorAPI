import { useState, useEffect, useCallback } from "react";
import { getScheduleSlots, getConsultationTypes } from "../../api";
import { useAdminAuth } from "../../context/AdminAuthContext";
import Spinner from "../../components/ui/Spinner";
import "./AdminLayout.css";

const EMPTY_FORM = {
  slotDate: "",
  startTime: "",
  endTime: "",
  consultationTypeId: "",
};

export default function SlotsAdmin() {
  const { getToken } = useAdminAuth();
  const [slots,   setSlots]   = useState([]);
  const [types,   setTypes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [formErr, setFormErr] = useState("");

  const loadSlots = useCallback(() => {
    setLoading(true);
    getScheduleSlots()
      .then((d) => setSlots(Array.isArray(d) ? d : []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSlots();
    getConsultationTypes()
      .then((d) => setTypes(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [loadSlots]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("ru-RU", {
      weekday: "short", day: "numeric", month: "long", year: "numeric",
    });
  };

  const grouped = slots.reduce((acc, s) => {
    const d = s.slotDate?.slice(0, 10) ?? "—";
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.slotDate || !form.startTime || !form.endTime) {
      setFormErr("Заполните дату, время начала и конца");
      return;
    }
    if (form.startTime >= form.endTime) {
      setFormErr("Время начала должно быть раньше времени конца");
      return;
    }
    setSaving(true);
    setFormErr("");
    try {
      // Конвертируем дату: "2026-03-29" → "2026-03-29T00:00:00Z"
      const slotDate = form.slotDate + "T00:00:00Z";

      // Конвертируем время в формат "HH:MM:SS"
      const startTime = form.startTime.split(":").length === 2 ? form.startTime + ":00" : form.startTime;
      const endTime   = form.endTime.split(":").length === 2   ? form.endTime   + ":00" : form.endTime;

      // consultationTypeId: пусто или "Любой" → 1
      let consultationTypeId = form.consultationTypeId ? Number(form.consultationTypeId) : 1;
      if (!consultationTypeId || isNaN(consultationTypeId)) consultationTypeId = 1;

      const body = {
        consultationTypeId,
        slotDate,
        slots: [{ startTime, endTime }],
      };

      const token = getToken();

      console.log("POST /api/doctor-schedule-slots/bulk →", body);

      const response = await fetch("http://localhost:8080/api/doctor-schedule-slots/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Ошибка ответа:", response.status, text);
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const created = await response.json();
      console.log("Слот создан:", created);

      setForm(EMPTY_FORM);
      setShowForm(false);
      loadSlots();
    } catch (err) {
      console.error("Ошибка создания слота:", err);
      setFormErr(`Ошибка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-section">
      {/* Header */}
      <div className="admin-section__header">
        <h1 className="admin-section__title">Расписание</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!loading && (
            <span className="admin-section__count">{slots.length} слотов</span>
          )}
          <button
            className="btn-outline"
            style={{ padding: "7px 14px", fontSize: 13 }}
            onClick={loadSlots}
            disabled={loading}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Обновить
          </button>
          <button
            className="btn-primary"
            style={{ padding: "7px 16px", fontSize: 13 }}
            onClick={() => { setShowForm((v) => !v); setFormErr(""); setForm(EMPTY_FORM); }}
          >
            {showForm ? "Отмена" : "+ Добавить слот"}
          </button>
        </div>
      </div>

      {/* Add slot form */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>Новый слот расписания</h3>
              <button className="admin-modal__close" onClick={() => setShowForm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__form">
              <div className="admin-modal__grid">
                <div className="form-group">
                  <label>Дата *</label>
                  <input
                    type="date"
                    name="slotDate"
                    value={form.slotDate}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Тип консультации</label>
                  <select name="consultationTypeId" value={form.consultationTypeId} onChange={handleChange}>
                    <option value="">Любой</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Время начала *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Время конца *</label>
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {formErr && (
                <p style={{ color: "var(--red)", fontSize: 13, margin: "0 0 12px" }}>{formErr}</p>
              )}

              <div className="admin-modal__actions">
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <><Spinner size={14} /> Сохранение...</> : "Создать слот"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="admin-loading"><Spinner /> Загрузка...</div>
      ) : slots.length === 0 ? (
        <div className="admin-empty">Слотов нет. Добавьте первый.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {dates.map((date) => (
            <div key={date} className="admin-table-wrap">
              <div style={{
                padding: "12px 20px",
                background: "var(--cream)",
                borderBottom: "1px solid var(--border)",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--charcoal)",
              }}>
                {formatDate(date)}
                <span style={{ marginLeft: 10, fontWeight: 400, color: "var(--mid-gray)" }}>
                  {grouped[date].length} слот{grouped[date].length !== 1 ? "а" : ""}
                </span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Дата</th>
                    <th>Начало</th>
                    <th>Конец</th>
                    <th>Тип консультации</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[date].map((s) => {
                    const typeName = types.find((t) => t.id === s.consultationTypeId)?.name;
                    return (
                      <tr key={s.id}>
                        <td style={{ color: "var(--mid-gray)", fontSize: 12 }}>#{s.id}</td>
                        <td style={{ fontSize: 13 }}>
                          {s.slotDate?.slice(0, 10).split("-").reverse().join(".")}
                        </td>
                        <td><strong>{s.startTime?.slice(0, 5)}</strong></td>
                        <td style={{ color: "var(--mid-gray)" }}>{s.endTime?.slice(0, 5)}</td>
                        <td>{typeName ?? (s.consultationTypeId ? `Тип #${s.consultationTypeId}` : "—")}</td>
                        <td>
                          <span className={`slot-badge slot-badge--${s.isAvailable ? "free" : "busy"}`}>
                            {s.isAvailable ? "Свободен" : "Занят"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
