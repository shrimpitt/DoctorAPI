import { useState } from "react";

const MOOD_OPTIONS = [
  { value: "excellent", label: "Отличное" },
  { value: "good",      label: "Хорошее" },
  { value: "normal",    label: "Нормальное" },
  { value: "bad",       label: "Плохое" },
  { value: "very_bad",  label: "Очень плохое" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  entryDate:          todayIso(),
  weightKg:           "",
  systolicPressure:   "",
  diastolicPressure:  "",
  bloodSugar:         "",
  sleepHours:         "",
  symptoms:           "",
  mood:               "",
  tookMedication:     false,
  medicationNotes:    "",
  comment:            "",
};

export default function HealthDiaryEntryForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.entryDate) { setError("Дата записи обязательна"); return; }
    setError("");

    // Build payload — send only filled fields to avoid NaN/null for optional metrics
    const payload = {
      entryDate:      `${form.entryDate}T00:00:00Z`,
      tookMedication: form.tookMedication,
    };

    if (form.weightKg          !== "") payload.weightKg          = parseFloat(form.weightKg);
    if (form.systolicPressure  !== "") payload.systolicPressure  = parseInt(form.systolicPressure, 10);
    if (form.diastolicPressure !== "") payload.diastolicPressure = parseInt(form.diastolicPressure, 10);
    if (form.bloodSugar        !== "") payload.bloodSugar        = parseFloat(form.bloodSugar);
    if (form.sleepHours        !== "") payload.sleepHours        = parseFloat(form.sleepHours);
    if (form.symptoms.trim())          payload.symptoms          = form.symptoms.trim();
    if (form.mood)                     payload.mood              = form.mood;
    if (form.tookMedication && form.medicationNotes.trim())
                                       payload.medicationNotes   = form.medicationNotes.trim();
    if (form.comment.trim())           payload.comment           = form.comment.trim();

    onSubmit(payload);
  };

  return (
    <form className="hd-form" onSubmit={handleSubmit} noValidate>
      <div className="hd-form__grid">

        {/* Entry date — required */}
        <div className="form-group hd-form__full">
          <label>Дата записи *</label>
          <input
            type="date"
            value={form.entryDate}
            max={todayIso()}
            onChange={e => set("entryDate", e.target.value)}
            required
          />
        </div>

        {/* Weight */}
        <div className="form-group">
          <label>Вес, кг</label>
          <input
            type="number" step="0.1" min="20" max="300"
            placeholder="62.5"
            value={form.weightKg}
            onChange={e => set("weightKg", e.target.value)}
          />
        </div>

        {/* Sleep */}
        <div className="form-group">
          <label>Сон, часов</label>
          <input
            type="number" step="0.5" min="0" max="24"
            placeholder="7.5"
            value={form.sleepHours}
            onChange={e => set("sleepHours", e.target.value)}
          />
        </div>

        {/* Blood pressure — side by side */}
        <div className="form-group">
          <label>Давление систолическое</label>
          <input
            type="number" step="1" min="60" max="250"
            placeholder="120"
            value={form.systolicPressure}
            onChange={e => set("systolicPressure", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Давление диастолическое</label>
          <input
            type="number" step="1" min="40" max="150"
            placeholder="80"
            value={form.diastolicPressure}
            onChange={e => set("diastolicPressure", e.target.value)}
          />
        </div>

        {/* Blood sugar */}
        <div className="form-group">
          <label>Сахар крови, ммоль/л</label>
          <input
            type="number" step="0.1" min="1" max="30"
            placeholder="5.8"
            value={form.bloodSugar}
            onChange={e => set("bloodSugar", e.target.value)}
          />
        </div>

        {/* Mood */}
        <div className="form-group">
          <label>Самочувствие</label>
          <select value={form.mood} onChange={e => set("mood", e.target.value)}>
            <option value="">— выберите —</option>
            {MOOD_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Symptoms */}
        <div className="form-group hd-form__full">
          <label>Симптомы</label>
          <textarea
            rows={2}
            placeholder="усталость, головная боль, отёки..."
            value={form.symptoms}
            onChange={e => set("symptoms", e.target.value)}
          />
          <span className="form-hint">Перечислите через запятую</span>
        </div>

        {/* Medication checkbox */}
        <div className="form-group hd-form__full">
          <label className="hd-form__checkbox-label">
            <input
              type="checkbox"
              checked={form.tookMedication}
              onChange={e => set("tookMedication", e.target.checked)}
            />
            <span>Принимал(а) препараты сегодня</span>
          </label>
        </div>

        {/* Medication notes — shown only when checkbox is on */}
        {form.tookMedication && (
          <div className="form-group hd-form__full">
            <label>Заметки о препаратах</label>
            <textarea
              rows={2}
              placeholder="Название, дозировка, время приёма..."
              value={form.medicationNotes}
              onChange={e => set("medicationNotes", e.target.value)}
            />
          </div>
        )}

        {/* Free comment */}
        <div className="form-group hd-form__full">
          <label>Комментарий</label>
          <textarea
            rows={2}
            placeholder="Любые наблюдения о вашем состоянии..."
            value={form.comment}
            onChange={e => set("comment", e.target.value)}
          />
        </div>
      </div>

      {error && <p className="hd-form__error">{error}</p>}

      <div className="hd-form__actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Сохранение…" : "Сохранить запись"}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>
          Отмена
        </button>
      </div>
    </form>
  );
}
