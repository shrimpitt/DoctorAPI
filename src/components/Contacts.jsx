import { useState, useEffect } from "react";
import { createAppointment, getScheduleSlots, getConsultationTypes } from "../api";
import "./Contacts.css";

const WHATSAPP_NUMBER = "77001234567"; // TODO: replace with real number

export default function Contacts() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    comment: "",
    consultationTypeId: "",
    scheduleSlotId: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    getConsultationTypes()
      .then((data) => setConsultationTypes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setTypesLoading(false));

    getScheduleSlots()
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setSlotsLoading(false));
  }, []);

  // Фильтрация слотов по выбранному типу консультации
  const filteredSlots = form.consultationTypeId
    ? slots.filter(
        (s) =>
          s.consultationTypeId === null ||
          s.consultationTypeId === Number(form.consultationTypeId)
      )
    : slots;

  // Группировка по дате
  const slotsByDate = filteredSlots.reduce((acc, slot) => {
    const d = slot.slotDate?.slice(0, 10) ?? "";
    if (!acc[d]) acc[d] = [];
    acc[d].push(slot);
    return acc;
  }, {});
  const dates = Object.keys(slotsByDate).sort();

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" });
  };

  // startTime приходит как "HH:MM:SS"
  const formatTime = (slot) => (slot.startTime ?? "").slice(0, 5);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Сброс слота при смене типа консультации
      if (name === "consultationTypeId") {
        next.scheduleSlotId = "";
        setSelectedDate(null);
      }
      return next;
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setForm((prev) => ({ ...prev, scheduleSlotId: "" }));
  };

  const handleSlotSelect = (id) => {
    setForm((prev) => ({ ...prev, scheduleSlotId: String(id) }));
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
    } catch (err) {
      setError("Не удалось записаться. Попробуйте ещё раз или напишите в WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Здравствуйте! Хочу записаться на консультацию.")}`;

  return (
    <section className="contacts" style={{ padding: "var(--section-padding)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Контакты</span>
          <h2>Запишитесь на консультацию</h2>
          <p>Оставьте заявку и я свяжусь с вами в течение 24 часов для подтверждения времени.</p>
        </div>

        <div className="contacts__inner">
          {/* LEFT: Form */}
          <div className="contacts__form-wrap">
            {submitted ? (
              <div className="contacts__success">
                <div className="contacts__success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3>Заявка отправлена!</h3>
                <p>Свяжусь с вами в ближайшее время для подтверждения записи.</p>
                <button className="btn-outline" onClick={() => { setSubmitted(false); setError(""); }}>
                  Отправить ещё
                </button>
              </div>
            ) : (
              <form className="contacts__form" onSubmit={handleSubmit}>

                {/* Имя */}
                <div className="form-group">
                  <label htmlFor="fullName">Ваше имя *</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Айгерим Иванова"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Телефон */}
                <div className="form-group">
                  <label htmlFor="phone">Телефон *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Тип консультации */}
                <div className="form-group">
                  <label htmlFor="consultationTypeId">Тип консультации *</label>
                  {typesLoading ? (
                    <div className="slots-loading">
                      <span className="contacts__spinner" style={{ borderTopColor: "var(--sage)", borderColor: "var(--border)" }} />
                      <span>Загрузка...</span>
                    </div>
                  ) : (
                    <select
                      id="consultationTypeId"
                      name="consultationTypeId"
                      value={form.consultationTypeId}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="">Выберите тип консультации</option>
                      {consultationTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}{t.price ? ` — ${Number(t.price).toLocaleString("ru-RU")} ₸` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Выбор слота */}
                <div className="form-group">
                  <label>Дата и время *</label>
                  {slotsLoading ? (
                    <div className="slots-loading">
                      <span className="contacts__spinner" style={{ borderTopColor: "var(--sage)", borderColor: "var(--border)" }} />
                      <span>Загрузка доступных слотов...</span>
                    </div>
                  ) : !form.consultationTypeId ? (
                    <p className="slots-empty">Сначала выберите тип консультации.</p>
                  ) : dates.length === 0 ? (
                    <p className="slots-empty">Нет доступных слотов. Напишите в WhatsApp.</p>
                  ) : (
                    <>
                      <div className="slots-dates">
                        {dates.map((d) => (
                          <button
                            key={d}
                            type="button"
                            className={`slot-date-btn ${selectedDate === d ? "slot-date-btn--active" : ""}`}
                            onClick={() => handleDateSelect(d)}
                          >
                            {formatDate(d)}
                          </button>
                        ))}
                      </div>
                      {selectedDate && slotsByDate[selectedDate] && (
                        <div className="slots-grid">
                          {slotsByDate[selectedDate].map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              className={`slot-btn ${form.scheduleSlotId === String(slot.id) ? "slot-btn--active" : ""}`}
                              onClick={() => handleSlotSelect(slot.id)}
                            >
                              {formatTime(slot)}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Комментарий */}
                <div className="form-group">
                  <label htmlFor="comment">С чем хотите разобраться?</label>
                  <textarea
                    id="comment"
                    name="comment"
                    placeholder="Опишите кратко свой запрос или симптомы..."
                    rows={4}
                    value={form.comment}
                    onChange={handleChange}
                  />
                </div>

                {error && <p className="contacts__error">{error}</p>}

                <button
                  className="btn-primary contacts__submit"
                  type="submit"
                  disabled={loading || !form.scheduleSlotId || !form.consultationTypeId}
                >
                  {loading ? (
                    <span className="contacts__spinner" />
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Отправить заявку
                    </>
                  )}
                </button>

                <p className="contacts__privacy">
                  Нажимая кнопку, вы соглашаетесь с <a href="#">политикой конфиденциальности</a>.
                  Данные используются только для записи.
                </p>
              </form>
            )}
          </div>

          {/* RIGHT: Info */}
          <div className="contacts__info">
            <div className="contacts__info-block">
              <h3 className="contacts__info-title">Или напишите напрямую</h3>
              <a className="contacts__wa-btn" href={waLink} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Написать в WhatsApp
              </a>
            </div>

            <div className="contacts__details">
              <div className="contacts__detail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <p className="contacts__detail-label">Адрес</p>
                  <p className="contacts__detail-value">Алматы, ул. Абая 1, офис 301</p>
                </div>
              </div>
              <div className="contacts__detail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <div>
                  <p className="contacts__detail-label">Режим работы</p>
                  <p className="contacts__detail-value">Пн–Пт: 10:00–19:00</p>
                </div>
              </div>
              <div className="contacts__detail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.5 6.78a19.79 19.79 0 01-3.07-8.67A2 2 0 013.41 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 7.91a16 16 0 006.29 6.29l.91-.91a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                <div>
                  <p className="contacts__detail-label">Телефон</p>
                  <p className="contacts__detail-value">+7 700 123 45 67</p>
                </div>
              </div>
            </div>

            <div className="contacts__social">
              <a href="https://www.instagram.com/doctor_kadyrbekova/" target="_blank" rel="noopener noreferrer" className="contacts__social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
                Instagram
              </a>
              <a href="#" className="contacts__social-link" aria-label="Telegram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 5L2 12.5l7 1M21 5l-2.5 14L9 13.5M21 5L9 13.5m0 0V19l3.5-3"/>
                </svg>
                Telegram
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp floating button */}
      <a className="whatsapp-float" href={waLink} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </section>
  );
}
