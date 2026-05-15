import { useState, useEffect } from 'react';
import { createAppointment, getScheduleSlots } from '../api';
import { useUserAuth } from '../context/UserAuthContext';
import Spinner from './ui/Spinner';
import './CourseEnrollmentModal.css';

// Course enrollment modal — wraps the existing appointment API.
// Courses don't have schedule slots, so we fetch the first available slot
// as a workaround. If none exist, we try scheduleSlotId: null.
// Either way, the raw backend error is logged to the console for debugging.
export default function CourseEnrollmentModal({ open, onClose, course }) {
  const { user, isAuthenticated } = useUserAuth();

  const [form, setForm] = useState({ fullName: '', phone: '', email: '', comment: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill with logged-in user's data whenever modal opens
  useEffect(() => {
    if (open && isAuthenticated && user) {
      setForm((f) => ({
        ...f,
        fullName: user.fullName ?? f.fullName,
        email:    user.email    ?? f.email,
        phone:    user.phone    ?? f.phone,
      }));
    }
  }, [open, isAuthenticated, user]);

  // Clear error + success state when modal is hidden
  useEffect(() => {
    if (!open) {
      setError('');
      setSubmitted(false);
    }
  }, [open]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Try to get an available slot — courses have no slots of their own,
    // but the appointments endpoint currently requires a scheduleSlotId.
    // Strategy (b/c): fetch slots → use first → fall back to null.
    let slotId = null;
    try {
      const slots = await getScheduleSlots();
      const list  = Array.isArray(slots) ? slots : [];
      if (list.length > 0) slotId = list[0].id;
    } catch {
      // Slots endpoint unreachable — will attempt with null
    }

    const commentText =
      `Запись на курс: ${course.title}.` +
      (form.comment ? ` ${form.comment}` : '');

    try {
      await createAppointment({
        fullName:            form.fullName,
        phone:               form.phone,
        email:               form.email || null,
        comment:             commentText,
        consultationTypeId:  course.consultationTypeId,
        scheduleSlotId:      slotId,
      });
      setSubmitted(true);
    } catch (err) {
      // Log the raw backend error so it can be forwarded to the backend developer
      console.error('[CourseEnrollment] Backend error:', err.message);

      if (!slotId) {
        setError(
          'Нет доступных слотов расписания. Напишите нам в WhatsApp — ' +
          'мы запишем вас вручную в ближайшее время.',
        );
      } else {
        setError(
          'Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами через WhatsApp.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Dimmed backdrop */}
      <div className="enroll-overlay" onClick={onClose} />

      <div className="enroll-modal" role="dialog" aria-modal="true" aria-label={`Запись на курс: ${course.title}`}>

        {/* Header */}
        <div className="enroll-modal__header">
          <h2 className="enroll-modal__title">
            Запись на курс
            <span className="enroll-modal__course-name">{course.title}</span>
          </h2>
          <button
            className="enroll-modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div className="enroll-modal__success">
            <div className="enroll-modal__success-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3>Заявка принята!</h3>
            <p>Мы свяжемся с вами в течение 24 часов для подтверждения записи на курс.</p>
            <button className="btn-primary" onClick={onClose} style={{ marginTop: 8 }}>
              Закрыть
            </button>
          </div>
        ) : (
          /* ── Enrollment form ── */
          <form className="enroll-modal__form" onSubmit={handleSubmit}>

            {/* Free course badge */}
            <div className="enroll-modal__free-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Курс бесплатный — только запись
            </div>

            <div className="form-group">
              <label>ФИО *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="Иванова Айгерим Бекова"
                required
              />
            </div>

            <div className="form-group">
              <label>Телефон *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+7 (___) ___-__-__"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="example@mail.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Комментарий / вопросы</label>
              <textarea
                rows={3}
                value={form.comment}
                onChange={(e) => set('comment', e.target.value)}
                placeholder="Есть ли у вас вопросы или пожелания к курсу?"
              />
            </div>

            {error && (
              <div className="enroll-modal__error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8"  x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              className="btn-primary enroll-modal__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? <Spinner size={18} color="white" /> : 'Отправить заявку'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
