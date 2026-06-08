import { useState } from "react";

const MOOD_META = {
  excellent: { emoji: "😄", label: "Отличное" },
  good:      { emoji: "😊", label: "Хорошее" },
  normal:    { emoji: "😐", label: "Нормальное" },
  bad:       { emoji: "😔", label: "Плохое" },
  very_bad:  { emoji: "😢", label: "Очень плохое" },
};

const PAGE_SIZE = 8;

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d)
    ? iso
    : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

/* Determines which emoji to show on the timeline dot */
function dotEmoji(entry) {
  if (entry.mood && MOOD_META[entry.mood]) return MOOD_META[entry.mood].emoji;
  if (entry.systolicPressure != null) return "❤️";
  if (entry.sleepHours       != null) return "😴";
  if (entry.weightKg         != null) return "⚖️";
  return "📝";
}

export default function HealthDiaryList({ entries, onDelete, deleting }) {
  const [page,      setPage]      = useState(1);
  const [confirmId, setConfirmId] = useState(null);

  const sorted  = [...entries].sort((a,b) => new Date(b.entryDate)-new Date(a.entryDate));
  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < sorted.length;

  const handleDeleteClick = id => {
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  };

  if (sorted.length === 0) {
    return (
      <div className="hd-timeline-empty">
        <div className="hd-timeline-empty__icon">📓</div>
        <div className="hd-timeline-empty__title">Журнал пуст</div>
        <p className="hd-timeline-empty__sub">
          Добавьте первую запись, чтобы начать отслеживать своё здоровье
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hd-timeline">
        {visible.map((entry, idx) => {
          const mood = entry.mood ? MOOD_META[entry.mood] : null;

          return (
            <div className="hd-tentry" key={entry.id}
              style={{ animationDelay: `${idx * 0.05}s` }}>

              {/* Dot on the timeline line */}
              <div className="hd-tentry__dot">{dotEmoji(entry)}</div>

              {/* Entry card */}
              <div className="hd-tentry__card">

                {/* Header: date + mood badge */}
                <div className="hd-tentry__header">
                  <span className="hd-tentry__date">{formatDate(entry.entryDate)}</span>
                  {mood && (
                    <span className="hd-tentry__mood-badge">
                      {mood.emoji} {mood.label}
                    </span>
                  )}
                </div>

                {/* Metric pills */}
                {(entry.weightKg != null ||
                  entry.systolicPressure != null ||
                  entry.bloodSugar != null ||
                  entry.sleepHours != null ||
                  entry.tookMedication != null) && (
                  <div className="hd-tentry__metrics">
                    {entry.weightKg != null && (
                      <span className="hd-metric-pill">
                        <span>⚖️</span> {entry.weightKg} кг
                      </span>
                    )}
                    {entry.systolicPressure != null && (
                      <span className="hd-metric-pill">
                        <span>❤️</span> {entry.systolicPressure}/{entry.diastolicPressure ?? "—"} мм
                      </span>
                    )}
                    {entry.bloodSugar != null && (
                      <span className="hd-metric-pill">
                        <span>🩸</span> {entry.bloodSugar} ммоль/л
                      </span>
                    )}
                    {entry.sleepHours != null && (
                      <span className="hd-metric-pill">
                        <span>😴</span> {entry.sleepHours} ч
                      </span>
                    )}
                    {entry.tookMedication != null && (
                      <span className="hd-metric-pill"
                        style={entry.tookMedication
                          ? {background:"#DCFCE7", color:"#16A34A", border:"1px solid #BBF7D0"}
                          : {background:"#F3F4F6", color:"#6B7280"}}>
                        {entry.tookMedication ? "💊 Принял" : "💊 Не принял"}
                      </span>
                    )}
                  </div>
                )}

                {/* Symptoms */}
                {entry.symptoms && (
                  <div className="hd-tentry__symptoms">
                    <span className="hd-tentry__symptom-lbl">Симптомы:</span>
                    {entry.symptoms.split(",").map(s=>s.trim()).filter(Boolean).map((s,i) => (
                      <span key={i} className="hd-stag-sm">{s}</span>
                    ))}
                  </div>
                )}

                {/* Medication notes */}
                {entry.tookMedication && entry.medicationNotes && (
                  <div className="hd-tentry__medinfo">
                    💊 {entry.medicationNotes}
                  </div>
                )}

                {/* Comment */}
                {entry.comment && (
                  <p className="hd-tentry__comment">{entry.comment}</p>
                )}

                {/* Delete controls */}
                <div className="hd-tentry__footer">
                  {confirmId === entry.id ? (
                    <>
                      <span className="hd-tentry__del-confirm-text">Удалить запись?</span>
                      <button
                        className="hd-tentry__del-btn hd-tentry__del-btn--confirm"
                        onClick={() => handleDeleteClick(entry.id)}
                        disabled={deleting === entry.id}
                      >
                        {deleting === entry.id ? "…" : "Да, удалить"}
                      </button>
                      <button
                        className="hd-tentry__del-cancel"
                        onClick={() => setConfirmId(null)}
                      >
                        Нет
                      </button>
                    </>
                  ) : (
                    <button
                      className="hd-tentry__del-btn"
                      onClick={() => handleDeleteClick(entry.id)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="hd-load-more">
          <button className="hd-load-more__btn" onClick={() => setPage(p => p+1)}>
            Показать ещё ({sorted.length - visible.length})
          </button>
        </div>
      )}
    </>
  );
}
