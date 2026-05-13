import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../api";
import Spinner from "../../components/ui/Spinner";
import "./AdminLayout.css";

// Normalise a user record — .NET may return PascalCase or camelCase
function normaliseUser(u) {
  return {
    id:       u.id       ?? u.Id       ?? null,
    fullName: u.fullName ?? u.FullName ?? u.name ?? u.Name ?? "",
    email:    u.email    ?? u.Email    ?? "",
    phone:    u.phone    ?? u.Phone    ?? "",
    role:     u.role     ?? u.Role     ?? "User",
  };
}

export default function AdminPatientsPage() {
  const navigate = useNavigate();

  const [patients,    setPatients]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    getAllUsers()
      .then(list => setPatients(list.map(normaliseUser)))
      .catch(err  => setError(err.message || "Не удалось загрузить список пользователей."))
      .finally(()  => setLoading(false));
  }, []);

  const filtered = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)    ||
      p.phone.toLowerCase().includes(q);
  });

  const openDiary = (p) => {
    navigate(`/admin/patients/${p.id}/diary`, {
      state: { patientName: p.fullName || p.email, patientEmail: p.email },
    });
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h1 className="admin-section__title">Пациенты</h1>
        {!loading && !error && (
          <span className="admin-section__count">{filtered.length} пользователей</span>
        )}
      </div>

      {error && (
        <div className="admin-source-note admin-source-note--error">{error}</div>
      )}

      {!loading && !error && patients.length > 0 && (
        <div className="admin-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Поиск по имени, email, телефону..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="admin-loading"><Spinner /> Загрузка пациентов...</div>
      ) : error ? null : filtered.length === 0 ? (
        <div className="admin-empty">
          {searchQuery
            ? "Ничего не найдено по запросу."
            : "Пациенты пока не зарегистрированы."}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Дневник</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id ?? p.email ?? idx}>
                  <td style={{ color: "var(--mid-gray)", fontSize: 12 }}>{p.id ?? "—"}</td>
                  <td>
                    <strong>{p.fullName || p.email || "—"}</strong>
                  </td>
                  <td>{p.email || "—"}</td>
                  <td>{p.phone || "—"}</td>
                  <td>
                    <span className="slot-badge slot-badge--free" style={{ fontSize: 11 }}>
                      {p.role}
                    </span>
                  </td>
                  <td>
                    {p.id != null ? (
                      <button
                        className="admin-action-btn"
                        title="Открыть дневник здоровья пациента"
                        onClick={() => openDiary(p)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                      </button>
                    ) : (
                      <span style={{ color: "var(--mid-gray)", fontSize: 11 }}>нет ID</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
