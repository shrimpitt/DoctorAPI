import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getConsultationTypes, getScheduleSlots, createAppointment } from "../api";
import Spinner from "../components/ui/Spinner";
import "./BookingPage.css";

export default function BookingPage() {
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", comment: "",
    consultationTypeId: "", scheduleSlotId: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [types, setTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    getConsultationTypes()
      .then((d) => setTypes(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setTypesLoading(false));
    getScheduleSlots()
      .then((d) => setSlots(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setSlotsLoading(false));
  }, []);

  const filteredSlots = form.consultationTypeId
    ? slots.filter((s) => s.consultationTypeId === null || s.consultationTypeId === Number(form.consultationTypeId))
    : slots;

  const slotsByDate = filteredSlots.reduce((acc, s) => {
    const d = s.slotDate?.slice(0, 10) ?? "";
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});
  const dates = Object.keys(slotsByDate).sort();

  const formatDate = (str) => {
    const d = new Date(str);
    return isNaN(d) ? str : d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "consultationTypeId") { next.scheduleSlotId = ""; setSelectedDate(null); }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createAppointment({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || null,
        comment: form.comment || null,
        consultationTypeId: Number(form.consultationTypeId),
        scheduleSlotId: Number(form.scheduleSlotId),
      });
      setSubmitted(true);
    } catch {
      setError("Не удалось создать запись. Попробуйте ещё раз или свяжитесь через WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-page__topbar">
        <Link to="/" className="booking-page__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          На главную
        </Link>
      </div>

      <div className="container">
        <div className="section-header">
          <span className="section-tag">Запись</span>
          <h2>Онлайн-запись на консультацию</h2>
          <p>Выберите удобное время и заполните форму. Подтверждение придёт в течение 24 часов.</p>
        </div>

        <div className="booking-page__wrap">
          {submitted ? (
            <div className="booking-success">
              <div className="booking-success__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3>Заявка отправлена!</h3>
              <p>Свяжусь с вами в ближайшее время для подтверждения записи.</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <button className="btn-outline" onClick={() => { setSubmitted(false); setForm({ fullName: "", phone: "", email: "", comment: "", consultationTypeId: "", scheduleSlotId: "" }); setSelectedDate(null); }}>
                  Записаться ещё раз
                </button>
                <Link to="/" className="btn-primary">На главную</Link>
              </div>
            </div>
          ) : (
            <form className="booking-form" onSubmit={handleSubmit}>
              {/* Step 1: Type */}
              <div className="booking-form__section">
                <h3 className="booking-form__step">1. Тип консультации</h3>
                {typesLoading ? (
                  <div className="booking-form__loading"><Spinner /> Загрузка...</div>
                ) : (
                  <div className="type-grid">
                    {types.map((t) => (
                      <label key={t.id} className={`type-card ${form.consultationTypeId === String(t.id) ? "type-card--active" : ""}`}>
                        <input type="radio" name="consultationTypeId" value={t.id} checked={form.consultationTypeId === String(t.id)} onChange={handleChange} required />
                        <span className="type-card__name">{t.name}</span>
                        {t.durationMinutes && <span className="type-card__duration">{t.durationMinutes} мин</span>}
                        {t.price && <span className="type-card__price">{Number(t.price).toLocaleString("ru-RU")} ₸</span>}
                        {t.description && <span className="type-card__desc">{t.description}</span>}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Slot */}
              <div className="booking-form__section">
                <h3 className="booking-form__step">2. Дата и время</h3>
                {slotsLoading ? (
                  <div className="booking-form__loading"><Spinner /> Загрузка слотов...</div>
                ) : !form.consultationTypeId ? (
                  <p className="booking-form__hint">Сначала выберите тип консультации.</p>
                ) : dates.length === 0 ? (
                  <p className="booking-form__hint">Нет доступных слотов. Напишите напрямую в WhatsApp.</p>
                ) : (
                  <>
                    <div className="date-tabs">
                      {dates.map((d) => (
                        <button key={d} type="button"
                          className={`date-tab ${selectedDate === d ? "date-tab--active" : ""}`}
                          onClick={() => { setSelectedDate(d); setForm((p) => ({ ...p, scheduleSlotId: "" })); }}>
                          {formatDate(d)}
                        </button>
                      ))}
                    </div>
                    {selectedDate && (
                      <div className="time-grid">
                        {slotsByDate[selectedDate].map((slot) => (
                          <button key={slot.id} type="button"
                            className={`time-btn ${form.scheduleSlotId === String(slot.id) ? "time-btn--active" : ""}`}
                            onClick={() => setForm((p) => ({ ...p, scheduleSlotId: String(slot.id) }))}>
                            {slot.startTime?.slice(0, 5)}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Step 3: Personal info */}
              <div className="booking-form__section">
                <h3 className="booking-form__step">3. Ваши данные</h3>
                <div className="booking-form__fields">
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
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Комментарий</label>
                    <textarea name="comment" rows={3} placeholder="Опишите запрос или симптомы..." value={form.comment} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {error && <p className="contacts__error">{error}</p>}

              <button className="btn-primary booking-form__submit" type="submit"
                disabled={loading || !form.scheduleSlotId || !form.consultationTypeId}>
                {loading ? <Spinner size={18} color="white" /> : "Записаться"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
