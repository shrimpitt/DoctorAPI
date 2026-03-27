import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getConsultationTypes } from "../api";
import { getProductName } from "../utils/productImage";
import { useDebounce } from "../hooks/useDebounce";
import "./SearchBar.css";

export default function SearchBar() {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [all,     setAll]     = useState(null); // cached data
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef(null);
  const wrapRef  = useRef(null);
  const navigate = useNavigate();

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Fetch all data once when search opens */
  useEffect(() => {
    if (open && !all) {
      setLoading(true);
      Promise.all([
        getProducts().catch(() => []),
        getConsultationTypes().catch(() => []),
      ]).then(([products, services]) => {
        setAll({ products, services });
        setLoading(false);
      });
    }
  }, [open]);

  /* Filter on debounced query */
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    if (!all) return;

    const q = debouncedQuery.toLowerCase();
    const prodHits = (all.products || [])
      .filter(p => {
        const name = getProductName(p).toLowerCase();
        return name.includes(q) || (p.short_description || "").toLowerCase().includes(q);
      })
      .slice(0, 4)
      .map(p => ({ type: "product", id: p.id, label: getProductName(p), sub: p.short_description || "Пептид", href: `/shop/${p.id}` }));

    const svcHits = (all.services || [])
      .filter(s => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q))
      .slice(0, 3)
      .map(s => ({ type: "service", id: s.id, label: s.name, sub: "Услуга", href: `/booking` }));

    setResults([...prodHits, ...svcHits]);
  }, [debouncedQuery, all]);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (href) => {
    setOpen(false);
    setQuery("");
    navigate(href);
  };

  const handleKey = (e) => {
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
  };

  return (
    <div className={`search-bar ${open ? "search-bar--open" : ""}`} ref={wrapRef}>
      {open ? (
        <div className="search-bar__field">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-bar__icon">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск товаров, услуг…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            className="search-bar__input"
          />
          <button className="search-bar__close" onClick={() => { setOpen(false); setQuery(""); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {open && (query.length >= 2 || loading) && (
            <div className="search-bar__dropdown">
              {loading && <div className="search-bar__hint">Загружаем…</div>}
              {!loading && results.length === 0 && query.length >= 2 && (
                <div className="search-bar__hint">Ничего не найдено по запросу «{query}»</div>
              )}
              {results.map(r => (
                <button key={`${r.type}-${r.id}`} className="search-bar__result" onClick={() => handleSelect(r.href)}>
                  <span className={`search-bar__result-icon search-bar__result-icon--${r.type}`}>
                    {r.type === "product" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    )}
                  </span>
                  <span className="search-bar__result-text">
                    <span className="search-bar__result-label">{r.label}</span>
                    <span className="search-bar__result-sub">{r.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button className="search-bar__toggle" onClick={handleOpen} aria-label="Поиск">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      )}
    </div>
  );
}
