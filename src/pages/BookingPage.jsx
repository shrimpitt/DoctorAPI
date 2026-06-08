import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getConsultationTypes, getScheduleSlots, createAppointment } from "../api";
import Spinner from "../components/ui/Spinner";
import "./BookingPage.css";

// Doctor's WhatsApp: +8 775 912 56 69
const WA_NUMBER = "87759125669";

export default function BookingPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", comment: "",
    consultationTypeId: "", scheduleSlotId: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whatsAppUrl, setWhatsAppUrl] = useState("");

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

  // Builds a wa.me URL with booking details as plain text (no emoji — they corrupt in some clients).
  // WhatsApp bold: *text* — plain ASCII, works everywhere.
  const buildWhatsAppUrl = (formData, typeName, slotLabel) => {
    const lines = [`*${t("booking.waTitle")}*`, ""];
    if (formData.fullName) lines.push(`- ${t("booking.waName")}: ${formData.fullName}`);
    if (formData.phone)    lines.push(`- ${t("booking.waPhone")}: ${formData.phone}`);
    if (formData.email)    lines.push(`- ${t("booking.waEmail")}: ${formData.email}`);
    if (typeName)          lines.push(`- ${t("booking.waType")}: ${typeName}`);
    if (slotLabel)         lines.push(`- ${t("booking.waDateTime")}: ${slotLabel}`);
    if (formData.comment)  lines.push(`- ${t("booking.waComment")}: ${formData.comment}`);
    lines.push("", t("booking.waFooter"));
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const selectedType = types.find((tp) => String(tp.id) === form.consultationTypeId);
    const selectedSlot = slots.find((s) => String(s.id) === form.scheduleSlotId);
    const slotLabel = selectedSlot
      ? `${formatDate(selectedSlot.slotDate?.slice(0, 10))} в ${selectedSlot.startTime?.slice(0, 5)}`
      : "";
    const url = buildWhatsAppUrl(form, selectedType?.name, slotLabel);

    // Try to record in backend — 403/other errors are silently ignored;
    // WhatsApp is the primary notification channel.
    try {
      await createAppointment({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || null,
        comment: form.comment || null,
        consultationTypeId: Number(form.consultationTypeId),
        scheduleSlotId: Number(form.scheduleSlotId),
      });
    } catch {
      // intentionally ignored
    }

    setWhatsAppUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="booking-page">
      <div className="booking-page__topbar">
        <Link to="/" className="booking-page__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {t("bookingPage.backHome")}
        </Link>
      </div>

      <div className="container">
        <div className="section-header">
          <span className="section-tag">{t("bookingPage.tag")}</span>
          <h2>{t("bookingPage.title")}</h2>
          <p>{t("bookingPage.desc")}</p>
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
              <h3>{t("contacts.successTitle")}</h3>
              <p>{t("contacts.successDesc")}</p>


              {/* WhatsApp block — opens with full booking details */}
              {whatsAppUrl && (
                <div className="booking-whatsapp-block">
                  <div className="booking-whatsapp-block__text">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                    <span>{t("booking.waAutoOpened")}</span>
                  </div>
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="booking-whatsapp-btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                    {t("booking.waBtnText")}
                  </a>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                <button
                  className="btn-outline"
                  onClick={() => {
                    setSubmitted(false);
                    setWhatsAppUrl("");
                    setForm({ fullName: "", phone: "", email: "", comment: "", consultationTypeId: "", scheduleSlotId: "" });
                    setSelectedDate(null);
                  }}
                >
                  {t("bookingPage.submitAgain")}
                </button>
                <Link to="/" className="btn-primary">{t("bookingPage.backHome")}</Link>
              </div>
            </div>
          ) : (
            <form className="booking-form" onSubmit={handleSubmit}>
              {/* Step 1: Type */}
              <div className="booking-form__section">
                <h3 className="booking-form__step">{t("bookingPage.step1")}</h3>
                {typesLoading ? (
                  <div className="booking-form__loading"><Spinner /> {t("bookingPage.loadingTypes")}</div>
                ) : (
                  <div className="type-grid">
                    {types.map((ct) => (
                      <label key={ct.id} className={`type-card ${form.consultationTypeId === String(ct.id) ? "type-card--active" : ""}`}>
                        <input type="radio" name="consultationTypeId" value={ct.id} checked={form.consultationTypeId === String(ct.id)} onChange={handleChange} required />
                        <span className="type-card__name">{ct.name}</span>
                        {ct.durationMinutes && <span className="type-card__duration">{ct.durationMinutes} {t("bookingPage.minLabel")}</span>}
                        {ct.price && <span className="type-card__price">{Number(ct.price).toLocaleString("ru-RU")} ₸</span>}
                        {ct.description && <span className="type-card__desc">{ct.description}</span>}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Slot */}
              <div className="booking-form__section">
                <h3 className="booking-form__step">{t("bookingPage.step2")}</h3>
                {slotsLoading ? (
                  <div className="booking-form__loading"><Spinner /> {t("bookingPage.loadingSlots")}</div>
                ) : !form.consultationTypeId ? (
                  <p className="booking-form__hint">{t("bookingPage.selectTypeFirst")}</p>
                ) : dates.length === 0 ? (
                  <p className="booking-form__hint">{t("bookingPage.noSlots")}</p>
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
                <h3 className="booking-form__step">{t("bookingPage.step3")}</h3>
                <div className="booking-form__fields">
                  <div className="form-group">
                    <label>{t("bookingPage.nameLabel")} *</label>
                    <input name="fullName" type="text" placeholder={t("contacts.namePlaceholder")} value={form.fullName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>{t("bookingPage.phoneLabel")} *</label>
                    <input name="phone" type="tel" placeholder={t("contacts.phonePlaceholder")} value={form.phone} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>{t("bookingPage.emailLabel")}</label>
                    <input name="email" type="email" placeholder={t("contacts.emailPlaceholder")} value={form.email} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>{t("bookingPage.commentLabel")}</label>
                    <textarea name="comment" rows={3} placeholder={t("bookingPage.commentPlaceholder")} value={form.comment} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {error && <p className="contacts__error">{error}</p>}

              <button className="btn-primary booking-form__submit" type="submit"
                disabled={loading || !form.scheduleSlotId || !form.consultationTypeId}>
                {loading ? <Spinner size={18} color="white" /> : t("bookingPage.submitLabel")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
