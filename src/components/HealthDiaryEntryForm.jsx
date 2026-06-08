import { useState } from "react";

const MOOD_OPTIONS = [
  { value: "excellent", emoji: "😄", label: "Отличное" },
  { value: "good",      emoji: "😊", label: "Хорошее" },
  { value: "normal",    emoji: "😐", label: "Нормальное" },
  { value: "bad",       emoji: "😔", label: "Плохое" },
  { value: "very_bad",  emoji: "😢", label: "Очень плохое" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  entryDate:         todayIso(),
  weightKg:          "",
  systolicPressure:  "",
  diastolicPressure: "",
  bloodSugar:        "",
  sleepHours:        "",
  symptoms:          "",
  mood:              "",
  tookMedication:    false,
  medicationNotes:   "",
  comment:           "",
};

export default function HealthDiaryEntryForm({ onSubmit, onCancel, loading }) {
  const [form,  setForm]  = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.entryDate) { setError("Дата записи обязательна"); return; }
    setError("");

    const payload = {
      entryDate:      `${form.entryDate}T00:00:00Z`,
      tookMedication: form.tookMedication,
    };

    if (form.weightKg         !== "") payload.weightKg          = parseFloat(form.weightKg);
    if (form.systolicPressure !== "") payload.systolicPressure  = parseInt(form.systolicPressure, 10);
    if (form.diastolicPressure!== "") payload.diastolicPressure = parseInt(form.diastolicPressure, 10);
    if (form.bloodSugar       !== "") payload.bloodSugar        = parseFloat(form.bloodSugar);
    if (form.sleepHours       !== "") payload.sleepHours        = parseFloat(form.sleepHours);
    if (form.symptoms.trim())         payload.symptoms          = form.symptoms.trim();
    if (form.mood)                    payload.mood              = form.mood;
    if (form.tookMedication && form.medicationNotes.trim())
      payload.medicationNotes = form.medicationNotes.trim();
    if (form.comment.trim())          payload.comment           = form.comment.trim();

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* ── Section 1: Date ── */}
      <div className="hd-form-section-block">
        <p className="hd-form-section-label">📅 Дата записи</p>
        <div className="hd-field" style={{maxWidth: 240}}>
          <label>Дата *</label>
          <input
            type="date"
            value={form.entryDate}
            max={todayIso()}
            onChange={e => set("entryDate", e.target.value)}
            required
          />
        </div>
      </div>

      {/* ── Section 2: Vital signs ── */}
      <div className="hd-form-section-block">
        <p className="hd-form-section-label">💓 Витальные показатели</p>
        <div className="hd-form__grid">
          <div className="hd-field">
            <label>Вес, кг</label>
            <input
              type="number" step="0.1" min="20" max="300"
              placeholder="62.5"
              value={form.weightKg}
              onChange={e => set("weightKg", e.target.value)}
            />
          </div>

          <div className="hd-field">
            <label>Сахар крови, ммоль/л</label>
            <input
              type="number" step="0.1" min="1" max="30"
              placeholder="5.8"
              value={form.bloodSugar}
              onChange={e => set("bloodSugar", e.target.value)}
            />
          </div>

          <div className="hd-field">
            <label>Давление систолическое, мм рт.ст.</label>
            <input
              type="number" step="1" min="60" max="250"
              placeholder="120"
              value={form.systolicPressure}
              onChange={e => set("systolicPressure", e.target.value)}
            />
          </div>

          <div className="hd-field">
            <label>Давление диастолическое, мм рт.ст.</label>
            <input
              type="number" step="1" min="40" max="150"
              placeholder="80"
              value={form.diastolicPressure}
              onChange={e => set("diastolicPressure", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Lifestyle ── */}
      <div className="hd-form-section-block">
        <p className="hd-form-section-label">😴 Образ жизни</p>
        <div className="hd-field" style={{maxWidth: 240, marginBottom: 20}}>
          <label>Сон, часов</label>
          <input
            type="number" step="0.5" min="0" max="24"
            placeholder="7.5"
            value={form.sleepHours}
            onChange={e => set("sleepHours", e.target.value)}
          />
        </div>

        <div className="hd-field">
          <label>Самочувствие</label>
          <div className="hd-form-mood">
            {MOOD_OPTIONS.map(opt => (
              <div
                key={opt.value}
                className={`hd-form-mood__item${form.mood === opt.value ? " hd-form-mood__item--selected" : ""}`}
                onClick={() => set("mood", form.mood === opt.value ? "" : opt.value)}
              >
                <span className="hd-form-mood__emoji">{opt.emoji}</span>
                <span className="hd-form-mood__label">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 4: Medications ── */}
      <div className="hd-form-section-block">
        <p className="hd-form-section-label">💊 Медикаменты</p>
        <label className="hd-form__medcheck">
          <input
            type="checkbox"
            checked={form.tookMedication}
            onChange={e => set("tookMedication", e.target.checked)}
          />
          <span className="hd-form__medcheck-text">Принимал(а) препараты сегодня</span>
        </label>

        {form.tookMedication && (
          <div className="hd-field" style={{marginTop: 14}}>
            <label>Заметки о препаратах</label>
            <textarea
              rows={2}
              placeholder="Название, дозировка, время приёма…"
              value={form.medicationNotes}
              onChange={e => set("medicationNotes", e.target.value)}
            />
          </div>
        )}
      </div>

      {/* ── Section 5: Notes ── */}
      <div className="hd-form-section-block">
        <p className="hd-form-section-label">💬 Симптомы и заметки</p>
        <div className="hd-form__grid">
          <div className="hd-field hd-form__full">
            <label>Симптомы</label>
            <textarea
              rows={2}
              placeholder="усталость, головная боль, отёки…"
              value={form.symptoms}
              onChange={e => set("symptoms", e.target.value)}
            />
            <span className="hd-field__hint">Перечислите через запятую</span>
          </div>

          <div className="hd-field hd-form__full">
            <label>Комментарий</label>
            <textarea
              rows={2}
              placeholder="Любые наблюдения о вашем состоянии…"
              value={form.comment}
              onChange={e => set("comment", e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <p className="hd-form__error">{error}</p>}

      <div className="hd-form__actions">
        <button type="submit" className="hd-btn-submit" disabled={loading}>
          {loading ? "Сохранение…" : "💾 Сохранить запись"}
        </button>
        <button type="button" className="hd-btn-cancel" onClick={onCancel} disabled={loading}>
          Отмена
        </button>
      </div>
    </form>
  );
}
