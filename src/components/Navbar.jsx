import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/index.js";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";
import { useTheme } from "../context/ThemeContext";
import CartSidebar from "./shop/CartSidebar";
import SearchBar from "./SearchBar";
import "./Navbar.css";

// IDs map to nav.* translation keys
const sectionLinkIds = ["about", "services", "reviews"];

export default function Navbar({ activeSection, setActiveSection }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [cartOpen,  setCartOpen]  = useState(false);
  const { totalCount } = useCart();
  const { user, isAuthenticated, logout } = useUserAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate  = useNavigate();
  const isLanding = location.pathname === "/";
  const currentLang = i18n.language;

  const switchLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollNav = (id) => {
    if (isLanding) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      setActiveSection?.(id);
    } else {
      navigate(`/#${id}`);
    }
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  // First letter of fullName for avatar
  const avatarLetter = user?.fullName?.[0]?.toUpperCase() ?? "?";
  // First word of fullName for compact display
  const displayName  = user?.fullName?.split(" ")[0] ?? "";

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="container navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
            <div className="navbar__logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <span className="navbar__logo-name">Dr. Kadyrbekova</span>
              <span className="navbar__logo-sub">Эндокринолог · Интегративная медицина</span>
            </div>
          </Link>

          {/* Section links */}
          <ul className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}>
            {/* О докторе, Услуги — scroll to landing sections */}
            {sectionLinkIds.slice(0, 2).map((id) => (
              <li key={id}>
                <button
                  className={`navbar__link ${activeSection === id ? "navbar__link--active" : ""}`}
                  onClick={() => handleScrollNav(id)}
                >
                  {t(`nav.${id}`)}
                </button>
              </li>
            ))}

            {/* Курсы — navigates to the full courses page */}
            <li>
              <Link
                to="/courses"
                className="navbar__link"
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.courses")}
              </Link>
            </li>

            {/* Отзывы — scroll to landing section */}
            {sectionLinkIds.slice(2).map((id) => (
              <li key={id}>
                <button
                  className={`navbar__link ${activeSection === id ? "navbar__link--active" : ""}`}
                  onClick={() => handleScrollNav(id)}
                >
                  {t(`nav.${id}`)}
                </button>
              </li>
            ))}

            <li>
              <Link to="/shop" className="navbar__link" onClick={() => setMenuOpen(false)}>
                {t("nav.shop")}
              </Link>
            </li>
          </ul>

          {/* Right actions */}
          <div className="navbar__actions">
            <SearchBar />

            {/* Theme toggle — sun (dark mode) / moon (light mode) */}
            <button
              className="navbar__theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
              title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
            >
              {theme === "light" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1"  x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22"   x2="5.64"  y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1"  y1="12" x2="3"  y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
                  <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
                </svg>
              )}
            </button>

            {/* Cart */}
            <button
              className="navbar__cart"
              onClick={() => { setCartOpen(true); setMenuOpen(false); }}
              aria-label="Корзина"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
              </svg>
              {totalCount > 0 && <span className="navbar__cart-badge">{totalCount}</span>}
            </button>

            {/* Language switcher */}
            <div className="navbar__lang">
              <button
                className={`navbar__lang-btn ${currentLang === "ru" ? "navbar__lang-btn--active" : ""}`}
                onClick={() => switchLang("ru")}
              >
                RU
              </button>
              <button
                className={`navbar__lang-btn ${currentLang === "kk" ? "navbar__lang-btn--active" : ""}`}
                onClick={() => switchLang("kk")}
              >
                KZ
              </button>
            </div>

            {/* User auth area */}
            {isAuthenticated ? (
              <div className="navbar__user">
                {/* Link to profile page showing user's first name */}
                <Link to="/profile" className="navbar__user-name" onClick={() => setMenuOpen(false)}>
                  <div className="navbar__user-avatar">{avatarLetter}</div>
                  <span>{displayName}</span>
                </Link>
                <button className="navbar__logout" onClick={handleLogout} title={t("auth.logout")}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="navbar__auth-btns">
                <Link to="/login" className="btn-ghost navbar__btn-login" onClick={() => setMenuOpen(false)}>
                  {t("auth.login")}
                </Link>
                <Link to="/register" className="btn-primary navbar__cta" onClick={() => setMenuOpen(false)}>
                  {t("auth.register")}
                </Link>
              </div>
            )}

            <button
              className={`navbar__burger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Меню"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
