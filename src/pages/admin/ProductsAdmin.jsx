import { useState, useEffect } from "react";
import { getProducts, getProductCategories } from "../../api";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { getProductName } from "../../utils/productImage";
import Spinner from "../../components/ui/Spinner";

const EMPTY = { name: "", slug: "", price: "", short_description: "", full_description: "", stock_qty: "", category_id: "" };

export default function ProductsAdmin() {
  const { getToken } = useAdminAuth();
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null); // null | { mode: "add"|"edit", data }
  const [saving,      setSaving]      = useState(false);
  const [form,        setForm]        = useState(EMPTY);
  const [search,      setSearch]      = useState("");
  const [deleteId,    setDeleteId]    = useState(null);

  useEffect(() => {
    Promise.all([getProducts(), getProductCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    getProductName(p).toLowerCase().includes(search.toLowerCase()) ||
    (p.short_description || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(EMPTY); setModal({ mode: "add" }); };
  const openEdit = (p) => {
    setForm({ name: p.name, slug: p.slug || "", price: p.price, short_description: p.short_description || "", full_description: p.full_description || "", stock_qty: p.stock_qty, category_id: p.category_id || "" });
    setModal({ mode: "edit", id: p.id });
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      short_description: form.short_description,
      full_description: form.full_description,
      stock_qty: Number(form.stock_qty) || 0,
      category_id: form.category_id ? Number(form.category_id) : null,
    };

    try {
      const token = getToken();
      const authHeader = token ? { "Authorization": `Bearer ${token}` } : {};

      if (modal.mode === "add") {
        const res = await fetch("http://localhost:8080/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setProducts(p => [created, ...p]);
        }
      } else {
        const res = await fetch(`http://localhost:8080/api/products/${modal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts(p => p.map(x => x.id === modal.id ? updated : x));
        }
      }
      setModal(null);
    } catch {
      alert("Ошибка сохранения. Проверьте подключение к серверу.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = getToken();
      await fetch(`http://localhost:8080/api/products/${id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      setProducts(p => p.filter(x => x.id !== id));
    } catch {
      alert("Ошибка удаления.");
    }
    setDeleteId(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Товары</h1>
        <button className="btn-primary" onClick={openAdd}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Добавить товар
        </button>
      </div>

      <div className="admin-search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          placeholder="Поиск по названию…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ padding: 60, display: "flex", justifyContent: "center" }}><Spinner size={36} /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Slug</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text-secondary)" }}>Нет товаров</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ color: "var(--text-secondary)" }}>#{p.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{getProductName(p)}</div>
                    {p.short_description && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{p.short_description.slice(0, 60)}…</div>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{Number(p.price).toLocaleString("ru-RU")} ₸</td>
                  <td>
                    <span className={`badge ${p.stock_qty > 0 ? "badge--blue" : "badge--red"}`}>
                      {p.stock_qty > 0 ? `${p.stock_qty} шт` : "Нет"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.slug || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-action-btn" onClick={() => openEdit(p)} title="Редактировать">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="admin-action-btn admin-action-btn--danger" onClick={() => setDeleteId(p.id)} title="Удалить">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit modal ── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{modal.mode === "add" ? "Добавить товар" : "Редактировать товар"}</h3>
              <button className="admin-modal__close" onClick={() => setModal(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="admin-modal__body">
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Название *</label>
                  <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Retatrutide" />
                </div>
                <div className="form-group">
                  <label>Slug</label>
                  <input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="retatrutide" />
                </div>
                <div className="form-group">
                  <label>Цена (₸) *</label>
                  <input required type="number" min="0" value={form.price} onChange={e => set("price", e.target.value)} placeholder="15000" />
                </div>
                <div className="form-group">
                  <label>Остаток</label>
                  <input type="number" min="0" value={form.stock_qty} onChange={e => set("stock_qty", e.target.value)} placeholder="10" />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Краткое описание</label>
                  <input value={form.short_description} onChange={e => set("short_description", e.target.value)} placeholder="Пептидный препарат…" />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Полное описание</label>
                  <textarea rows={4} value={form.full_description} onChange={e => set("full_description", e.target.value)} />
                </div>
                {categories.length > 0 && (
                  <div className="form-group">
                    <label>Категория</label>
                    <select value={form.category_id} onChange={e => set("category_id", e.target.value)}>
                      <option value="">— Без категории —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Отмена</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Сохраняем…" : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal admin-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>Подтвердите удаление</h3>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Вы уверены? Это действие нельзя отменить.
              </p>
            </div>
            <div className="admin-modal__footer">
              <button className="btn-ghost" onClick={() => setDeleteId(null)}>Отмена</button>
              <button className="btn-primary" style={{ background: "var(--red)" }} onClick={() => handleDelete(deleteId)}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
