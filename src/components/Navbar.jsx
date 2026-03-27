import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartSidebar from "./shop/CartSidebar";
import SearchBar from "./SearchBar";
import "./Navbar.css";

const sectionLinks = [
  { id: "about",    label: "О докторе" },
  { id: "services", label: "Услуги" },
  { id: "courses",  label: "Курсы" },
  { id: "reviews",  label: "Отзывы" },
];

export default function Navbar({ activeSection, setActiveSection }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [cartOpen,  setCartOpen]  = useState(false);
  const { totalCount } = useCart();
  const { user, isAuthed, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const isLanding = location.pathname === "/";

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

  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); };

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

          {/* Links */}
          <ul className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}>
            {sectionLinks.map((link) => (
              <li key={link.id}>
                <button
                  className={`navbar__link ${activeSection === link.id ? "navbar__link--active" : ""}`}
                  onClick={() => handleScrollNav(link.id)}
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <Link to="/shop" className="navbar__link" onClick={() => setMenuOpen(false)}>
                Магазин
              </Link>
            </li>
          </ul>

          {/* Right actions */}
          <div className="navbar__actions">
            <SearchBar />

            {/* Cart */}
            <button className="navbar__cart" onClick={() => { setCartOpen(true); setMenuOpen(false); }} aria-label="Корзина">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
              </svg>
              {totalCount > 0 && <span className="navbar__cart-badge">{totalCount}</span>}
            </button>

            {/* Auth */}
            {isAuthed ? (
              <div className="navbar__user">
                {isAdmin ? (
                  <Link to="/admin" className="navbar__link navbar__link--admin" onClick={() => setMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Панель
                  </Link>
                ) : (
                  <Link to="/profile" className="navbar__user-name" onClick={() => setMenuOpen(false)}>
                    <div className="navbar__user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                    <span>{user?.name?.split(" ")[0]}</span>
                  </Link>
                )}
                <button className="navbar__logout" onClick={handleLogout} title="Выйти">
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
                  Войти
                </Link>
                <Link to="/register" className="btn-primary navbar__cta" onClick={() => setMenuOpen(false)}>
                  Записаться
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
