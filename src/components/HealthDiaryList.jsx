import { useState } from "react";

const MOOD_LABEL = {
  excellent: "Отличное",
  good:      "Хорошее",
  normal:    "Нормальное",
  bad:       "Плохое",
  very_bad:  "Очень плохое",
};

const PAGE_SIZE = 10;

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d)
    ? iso
    : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export default function HealthDiaryList({ entries, onDelete, deleting }) {
  const [page,      setPage]      = useState(1);
  const [confirmId, setConfirmId] = useState(null);

  const sorted  = [...entries].sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < sorted.length;

  const handleDeleteClick = (id) => {
    // Two-click confirmation: first click sets confirmId, second triggers delete
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  };

  if (sorted.length === 0) {
    return (
      <div className="hd-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--light-gray)" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <p>Записей пока нет. Добавьте первую!</p>
      </div>
    );
  }

  return (
    <div className="hd-list">
      {visible.map(entry => (
        <div className="hd-card" key={entry.id}>
          <div className="hd-card__header">
            <span className="hd-card__date">{formatDate(entry.entryDate)}</span>

            <div className="hd-card__actions">
              {confirmId === entry.id ? (
                <>
                  <span className="hd-card__confirm-text">Удалить запись?</span>
                  <button
                    className="hd-card__btn hd-card__btn--danger"
                    onClick={() => handleDeleteClick(entry.id)}
                    disabled={deleting === entry.id}
                  >
                    {deleting === entry.id ? "…" : "Да, удалить"}
                  </button>
                  <button
                    className="hd-card__btn"
                    onClick={() => setConfirmId(null)}
                  >
                    Нет
                  </button>
                </>
              ) : (
                <button
                  className="hd-card__btn hd-card__btn--ghost"
                  onClick={() => handleDeleteClick(entry.id)}
                >
                  Удалить
                </button>
              )}
            </div>
          </div>

          {/* Metrics grid */}
          <div className="hd-card__metrics">
            {entry.weightKg != null && (
              <div className="hd-metric">
                <span className="hd-metric__label">Вес</span>
                <span className="hd-metric__value">{entry.weightKg} кг</span>
              </div>
            )}
            {(entry.systolicPressure != null || entry.diastolicPressure != null) && (
              <div className="hd-metric">
                <span className="hd-metric__label">Давление</span>
                <span className="hd-metric__value">
                  {entry.systolicPressure ?? "—"}/{entry.diastolicPressure ?? "—"} мм рт.ст.
                </span>
              </div>
            )}
            {entry.bloodSugar != null && (
              <div className="hd-metric">
                <span className="hd-metric__label">Сахар</span>
                <span className="hd-metric__value">{entry.bloodSugar} ммоль/л</span>
              </div>
            )}
            {entry.sleepHours != null && (
              <div className="hd-metric">
                <span className="hd-metric__label">Сон</span>
                <span className="hd-metric__value">{entry.sleepHours} ч</span>
              </div>
            )}
            {entry.mood && (
              <div className="hd-metric">
                <span className="hd-metric__label">Самочувствие</span>
                <span className="hd-metric__value">{MOOD_LABEL[entry.mood] ?? entry.mood}</span>
              </div>
            )}
            {entry.tookMedication != null && (
              <div className="hd-metric">
                <span className="hd-metric__label">Препараты</span>
                <span className={`hd-metric__value ${entry.tookMedication ? "hd-metric__value--yes" : "hd-metric__value--no"}`}>
                  {entry.tookMedication ? "Принял(а)" : "Не принимал(а)"}
                </span>
              </div>
            )}
          </div>

          {/* Symptom tags */}
          {entry.symptoms && (
            <div className="hd-card__symptoms">
              <span className="hd-card__symptoms-label">Симптомы:</span>
              {entry.symptoms
                .split(",")
                .map(s => s.trim())
                .filter(Boolean)
                .map((s, i) => (
                  <span key={i} className="hd-tag">{s}</span>
                ))}
            </div>
          )}

          {/* Medication notes */}
          {entry.tookMedication && entry.medicationNotes && (
            <p className="hd-card__med-notes">
              <strong>Препараты:</strong> {entry.medicationNotes}
            </p>
          )}

          {/* Free comment */}
          {entry.comment && (
            <p className="hd-card__comment">{entry.comment}</p>
          )}
        </div>
      ))}

      {hasMore && (
        <button
          className="btn-ghost hd-list__more"
          onClick={() => setPage(p => p + 1)}
        >
          Показать ещё ({sorted.length - visible.length})
        </button>
      )}
    </div>
  );
}
