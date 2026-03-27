import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAppointments, getOrders } from "../api";
import Navbar from "../components/Navbar";
import Spinner from "../components/ui/Spinner";
import "./ProfilePage.css";

const TABS = ["Профиль", "Мои записи", "Мои заказы"];

const STATUS_LABEL = {
  pending:   "Ожидает",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
  completed: "Завершена",
  new:       "Новый",
  processing:"В обработке",
  shipped:   "Отправлен",
  delivered: "Доставлен",
};
const STATUS_CLASS = {
  pending: "badge--gray", confirmed: "badge--blue",
  cancelled: "badge--red",  completed: "badge--blue",
  new: "badge--gray", processing: "badge--blue",
  shipped: "badge--blue", delivered: "badge--blue",
};

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingO, setLoadingO] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || "", phone: user?.phone || "" });

  useEffect(() => {
    if (tab === 1 && appointments.length === 0) {
      setLoadingA(true);
      getAppointments()
        .then(setAppointments)
        .catch(() => setAppointments([]))
        .finally(() => setLoadingA(false));
    }
    if (tab === 2 && orders.length === 0) {
      setLoadingO(true);
      getOrders()
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoadingO(false));
    }
  }, [tab]);

  const handleLogout = () => { logout(); navigate("/"); };

  const handleSaveProfile = () => {
    updateProfile(editForm);
    setEditMode(false);
  };

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-page__inner container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            <span>{user?.name?.[0]?.toUpperCase() || "?"}</span>
          </div>
          <h2 className="profile-sidebar__name">{user?.name}</h2>
          <p className="profile-sidebar__email">{user?.email}</p>
          <span className="badge badge--blue profile-sidebar__role">
            {user?.role === "admin" ? "Администратор" : "Клиент"}
          </span>

          <nav className="profile-nav">
            {TABS.map((t, i) => (
              <button
                key={t}
                className={`profile-nav__btn ${tab === i ? "active" : ""}`}
                onClick={() => setTab(i)}
              >
                {t}
              </button>
            ))}
          </nav>

          <button className="profile-sidebar__logout" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Выйти
          </button>
        </aside>

        {/* Main */}
        <div className="profile-main">
          {/* ─ Profile tab ─ */}
          {tab === 0 && (
            <div className="profile-section">
              <div className="profile-section__header">
                <h3>Личные данные</h3>
                {!editMode && (
                  <button className="btn-ghost" onClick={() => setEditMode(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Редактировать
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="profile-edit-form">
                  <div className="form-group">
                    <label>Имя</label>
                    <input
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Телефон</label>
                    <input
                      value={editForm.phone}
                      onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="profile-edit-actions">
                    <button className="btn-primary" onClick={handleSaveProfile}>Сохранить</button>
                    <button className="btn-ghost" onClick={() => setEditMode(false)}>Отмена</button>
                  </div>
                </div>
              ) : (
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <span className="profile-info-item__label">Имя</span>
                    <span className="profile-info-item__value">{user?.name || "—"}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-item__label">Email</span>
                    <span className="profile-info-item__value">{user?.email || "—"}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-item__label">Телефон</span>
                    <span className="profile-info-item__value">{user?.phone || "Не указан"}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-item__label">Роль</span>
                    <span className="profile-info-item__value">
                      {user?.role === "admin" ? "Администратор" : "Клиент"}
                    </span>
                  </div>
                </div>
              )}

              <div className="profile-quick-links">
                <Link to="/shop" className="profile-quick-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  <span>Магазин</span>
                </Link>
                <Link to="/booking" className="profile-quick-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Записаться</span>
                </Link>
              </div>
            </div>
          )}

          {/* ─ Appointments tab ─ */}
          {tab === 1 && (
            <div className="profile-section">
              <div className="profile-section__header">
                <h3>Мои записи</h3>
                <Link to="/booking" className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }}>
                  + Новая запись
                </Link>
              </div>
              {loadingA ? (
                <div className="profile-empty"><Spinner size={32} /></div>
              ) : appointments.length === 0 ? (
                <div className="profile-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <p>Записей пока нет</p>
                  <Link to="/booking" className="btn-outline" style={{ fontSize: 13 }}>Записаться на приём</Link>
                </div>
              ) : (
                <div className="profile-list">
                  {appointments.map(a => (
                    <div className="profile-list-item" key={a.id}>
                      <div className="profile-list-item__main">
                        <span className="profile-list-item__title">{a.fullName || a.full_name}</span>
                        <span className="profile-list-item__sub">
                          {a.slotDate?.slice(0,10) || "—"} · {a.startTime?.slice(0,5) || ""}
                        </span>
                      </div>
                      <span className={`badge ${STATUS_CLASS[a.status] || "badge--gray"}`}>
                        {STATUS_LABEL[a.status] || a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─ Orders tab ─ */}
          {tab === 2 && (
            <div className="profile-section">
              <div className="profile-section__header">
                <h3>Мои заказы</h3>
                <Link to="/shop" className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }}>
                  В магазин
                </Link>
              </div>
              {loadingO ? (
                <div className="profile-empty"><Spinner size={32} /></div>
              ) : orders.length === 0 ? (
                <div className="profile-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
                  </svg>
                  <p>Заказов пока нет</p>
                  <Link to="/shop" className="btn-outline" style={{ fontSize: 13 }}>Перейти в магазин</Link>
                </div>
              ) : (
                <div className="profile-list">
                  {orders.map(o => (
                    <div className="profile-list-item" key={o.id}>
                      <div className="profile-list-item__main">
                        <span className="profile-list-item__title">Заказ #{o.id}</span>
                        <span className="profile-list-item__sub">
                          {o.createdAt?.slice(0,10) || o.created_at?.slice(0,10) || "—"} ·{" "}
                          {Number(o.total || o.totalAmount || 0).toLocaleString("ru-RU")} ₸
                        </span>
                      </div>
                      <span className={`badge ${STATUS_CLASS[o.status] || "badge--gray"}`}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
