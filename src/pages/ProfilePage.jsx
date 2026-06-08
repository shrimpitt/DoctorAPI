import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "../context/UserAuthContext";
import { getMyAppointments, getMyOrders } from "../api";
import Navbar from "../components/Navbar";
import Spinner from "../components/ui/Spinner";
import DeliveryMap from "../components/DeliveryMap";
import "./ProfilePage.css";

const STATUS_CLASS = {
  pending:    "badge--gray",
  confirmed:  "badge--blue",
  cancelled:  "badge--red",
  completed:  "badge--blue",
  new:        "badge--gray",
  processing: "badge--blue",
  shipped:    "badge--blue",
  delivered:  "badge--blue",
};

export default function ProfilePage() {
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const TABS = [t("profile.tabProfile"), t("profile.tabAppointments"), t("profile.tabOrders")];

  const [tab, setTab] = useState(0);
  const [appointments,   setAppointments]   = useState([]);
  const [orders,         setOrders]         = useState([]);
  const [trackingOrder,  setTrackingOrder]  = useState(null);
  const [loadingA, setLoadingA]         = useState(false);
  const [loadingO, setLoadingO]         = useState(false);

  useEffect(() => {
    if (tab === 1 && appointments.length === 0) {
      setLoadingA(true);
      getMyAppointments()
        .then(d => setAppointments(Array.isArray(d) ? d : d?.$values ?? d?.items ?? d?.data ?? []))
        .catch(() => setAppointments([]))
        .finally(() => setLoadingA(false));
    }
    if (tab === 2 && orders.length === 0) {
      setLoadingO(true);
      getMyOrders()
        .then(d => setOrders(Array.isArray(d) ? d : d?.$values ?? d?.items ?? d?.data ?? []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingO(false));
    }
  }, [tab]);

  const handleLogout = () => { logout(); navigate("/auth"); };

  const roleLabel = () => {
    const r = (user?.role ?? "").toLowerCase();
    if (r === "admin" || r === "administrator") return t("profile.roleAdmin");
    return t("profile.roleClient");
  };

  const statusLabel = (s) => t(`status.${s}`, { defaultValue: s });

  return (
    <>
    <div className="profile-page">
      <Navbar />

      <div className="profile-page__inner container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            <span>{user?.fullName?.[0]?.toUpperCase() || "?"}</span>
          </div>
          <h2 className="profile-sidebar__name">{user?.fullName}</h2>
          <p className="profile-sidebar__email">{user?.email}</p>
          <span className="badge badge--blue profile-sidebar__role">{roleLabel()}</span>

          <nav className="profile-nav">
            {TABS.map((label, i) => (
              <button
                key={i}
                className={`profile-nav__btn ${tab === i ? "active" : ""}`}
                onClick={() => setTab(i)}
              >
                {label}
              </button>
            ))}
            <Link to="/health-diary" className="profile-nav__btn profile-nav__btn--diary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              {t("profile.diaryLink")}
            </Link>
          </nav>

          <button className="profile-sidebar__logout" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t("profile.logout")}
          </button>
        </aside>

        {/* Main */}
        <div className="profile-main">
          {/* Profile tab */}
          {tab === 0 && (
            <div className="profile-section">
              <div className="profile-section__header">
                <h3>{t("profile.personalData")}</h3>
              </div>

              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-item__label">{t("profile.nameLabel")}</span>
                  <span className="profile-info-item__value">{user?.fullName || "—"}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-item__label">{t("profile.emailLabel")}</span>
                  <span className="profile-info-item__value">{user?.email || "—"}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-item__label">{t("profile.phoneLabel")}</span>
                  <span className="profile-info-item__value">{user?.phone || t("profile.phoneNotSet")}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-item__label">{t("profile.roleLabel")}</span>
                  <span className="profile-info-item__value">{roleLabel()}</span>
                </div>
              </div>

              <div className="profile-quick-links">
                <Link to="/shop" className="profile-quick-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  <span>{t("profile.shopLink")}</span>
                </Link>
                <Link to="/booking" className="profile-quick-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{t("profile.bookingLink")}</span>
                </Link>
                <Link to="/health-diary" className="profile-quick-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span>{t("profile.diaryLink")}</span>
                </Link>
              </div>
            </div>
          )}

          {/* Appointments tab */}
          {tab === 1 && (
            <div className="profile-section">
              <div className="profile-section__header">
                <h3>{t("profile.tabAppointments")}</h3>
                <Link to="/booking" className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }}>
                  {t("profile.newAppointment")}
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
                  <p>{t("profile.emptyAppointments")}</p>
                  <Link to="/booking" className="btn-outline" style={{ fontSize: 13 }}>
                    {t("profile.bookAppointment")}
                  </Link>
                </div>
              ) : (
                <div className="profile-list">
                  {appointments.map(a => (
                    <div className="profile-list-item" key={a.id}>
                      <div className="profile-list-item__main">
                        <span className="profile-list-item__title">{a.fullName || a.full_name}</span>
                        <span className="profile-list-item__sub">
                          {a.slotDate?.slice(0, 10) || "—"} · {a.startTime?.slice(0, 5) || ""}
                        </span>
                      </div>
                      <span className={`badge ${STATUS_CLASS[a.status] || "badge--gray"}`}>
                        {statusLabel(a.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders tab */}
          {tab === 2 && (
            <div className="profile-section">
              <div className="profile-section__header">
                <h3>{t("profile.tabOrders")}</h3>
                <Link to="/shop" className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }}>
                  {t("profile.toShop")}
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
                  <p>{t("profile.emptyOrders")}</p>
                  <Link to="/shop" className="btn-outline" style={{ fontSize: 13 }}>
                    {t("profile.goToShop")}
                  </Link>
                </div>
              ) : (
                <div className="profile-list">
                  {orders.map(o => (
                    <div className="profile-list-item profile-list-item--order" key={o.id}>
                      <div className="profile-list-item__main">
                        <span className="profile-list-item__title">{t("profile.orderNum")}{o.id}</span>
                        <span className="profile-list-item__sub">
                          {o.createdAt?.slice(0, 10) || o.created_at?.slice(0, 10) || "—"} ·{" "}
                          {Number(o.total || o.totalAmount || 0).toLocaleString("ru-RU")} ₸
                        </span>
                      </div>
                      <div className="profile-list-item__right">
                        <span className={`badge ${STATUS_CLASS[o.status] || "badge--gray"}`}>
                          {statusLabel(o.status)}
                        </span>
                        <button
                          className="profile-track-btn"
                          onClick={() => setTrackingOrder(o)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            width="13" height="13">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4l3 3"/>
                          </svg>
                          {t("delivery.trackBtn")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      {trackingOrder && (
        <DeliveryMap
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}
    </>
  );
}
