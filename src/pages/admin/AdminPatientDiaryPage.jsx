import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import Spinner from "../../components/ui/Spinner";
import {
  getAdminUserDiary,
  getAdminUserDiarySummary,
  generateAiSummary,
  getAiSummaries,
} from "../../api";
import "./AdminLayout.css";
import "./AdminPatientDiaryPage.css";

const MOOD_LABEL = {
  excellent: "Отличное",
  good:      "Хорошее",
  normal:    "Нормальное",
  bad:       "Плохое",
  very_bad:  "Очень плохое",
};

function fmt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? iso :
    `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Format ISO for AI summary timestamp
function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Normalise any API array wrapper shape
function toArray(data) {
  if (Array.isArray(data))          return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.items))   return data.items;
  if (Array.isArray(data?.data))    return data.data;
  return [];
}

// ── Summary stats card — handles camelCase and PascalCase ─
function SummaryCard({ summary }) {
  if (!summary) return null;

  // Support both camelCase (ASP.NET Core default) and PascalCase
  const s = summary;
  const totalEntries        = s.totalEntries        ?? s.TotalEntries        ?? "—";
  const averageWeightKg     = s.averageWeightKg     ?? s.AverageWeightKg     ?? null;
  const averageBloodSugar   = s.averageBloodSugar   ?? s.AverageBloodSugar   ?? null;
  const averageSleepHours   = s.averageSleepHours   ?? s.AverageSleepHours   ?? null;
  const medicationTaken     = s.medicationTakenCount  ?? s.MedicationTakenCount  ?? "—";
  const medicationMissed    = s.medicationMissedCount ?? s.MedicationMissedCount ?? "—";
  const commonSymptoms      = s.commonSymptoms ?? s.CommonSymptoms ?? [];

  const stats = [
    { label: "Всего записей",        value: totalEntries },
    { label: "Средний вес",          value: averageWeightKg   != null ? `${Number(averageWeightKg).toFixed(1)} кг`       : "—" },
    { label: "Средний сахар",        value: averageBloodSugar != null ? `${Number(averageBloodSugar).toFixed(1)} ммоль/л` : "—" },
    { label: "Средний сон",          value: averageSleepHours != null ? `${Number(averageSleepHours).toFixed(1)} ч`       : "—" },
    { label: "Препараты приняты",    value: medicationTaken },
    { label: "Препараты пропущены",  value: medicationMissed },
  ];

  return (
    <div className="apd-summary-grid">
      {stats.map(s => (
        <div className="apd-stat" key={s.label}>
          <span className="apd-stat__value">{s.value}</span>
          <span className="apd-stat__label">{s.label}</span>
        </div>
      ))}
      {commonSymptoms?.length > 0 && (
        <div className="apd-stat apd-stat--wide">
          <span className="apd-stat__label">Частые симптомы</span>
          <div className="apd-tags">
            {commonSymptoms.map((sym, i) => (
              <span key={i} className="apd-tag">{sym}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Charts (all entries, no 30-limit — full history for medical view) ──
function DiaryCharts({ entries }) {
  // Normalise field names before charting (support camelCase + PascalCase)
  const norm = entries.map(e => ({
    entryDate:         e.entryDate         ?? e.EntryDate,
    weightKg:          e.weightKg          ?? e.WeightKg,
    bloodSugar:        e.bloodSugar        ?? e.BloodSugar,
    sleepHours:        e.sleepHours        ?? e.SleepHours,
    systolicPressure:  e.systolicPressure  ?? e.SystolicPressure,
    diastolicPressure: e.diastolicPressure ?? e.DiastolicPressure,
  }));
  const sorted = [...norm].sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));

  const weightData = sorted.filter(e => e.weightKg     != null).map(e => ({ date: shortDate(e.entryDate), value: e.weightKg }));
  const sugarData  = sorted.filter(e => e.bloodSugar   != null).map(e => ({ date: shortDate(e.entryDate), value: e.bloodSugar }));
  const sleepData  = sorted.filter(e => e.sleepHours   != null).map(e => ({ date: shortDate(e.entryDate), value: e.sleepHours }));
  const bpData     = sorted
    .filter(e => e.systolicPressure != null || e.diastolicPressure != null)
    .map(e => ({ date: shortDate(e.entryDate), sys: e.systolicPressure, dia: e.diastolicPressure }));

  const hasEnough = arr => arr.length >= 2;
  const axisProps = { tick: { fontSize: 11, fill: "var(--mid-gray)" }, stroke: "var(--border)" };
  const chartProps = { margin: { top: 8, right: 16, left: 0, bottom: 0 } };
  const ttStyle   = { fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" };

  if (!hasEnough(weightData) && !hasEnough(sugarData) && !hasEnough(sleepData) && !hasEnough(bpData)) {
    return <p className="apd-chart-hint">Графики появятся при наличии минимум 2 записей по каждому показателю.</p>;
  }

  return (
    <div className="apd-charts">
      {hasEnough(weightData) && (
        <div className="apd-chart-wrap">
          <span className="apd-chart-wrap__title">Вес, кг</span>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} domain={["auto", "auto"]} />
              <Tooltip contentStyle={ttStyle} formatter={v => [`${v} кг`, "Вес"]} />
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} name="Вес" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasEnough(sugarData) && (
        <div className="apd-chart-wrap">
          <span className="apd-chart-wrap__title">Сахар крови, ммоль/л</span>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={sugarData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} domain={["auto", "auto"]} />
              <Tooltip contentStyle={ttStyle} formatter={v => [`${v} ммоль/л`, "Сахар"]} />
              <Line type="monotone" dataKey="value" stroke="var(--green)" strokeWidth={2} dot={{ r: 2 }} name="Сахар" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasEnough(sleepData) && (
        <div className="apd-chart-wrap">
          <span className="apd-chart-wrap__title">Сон, часов</span>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={sleepData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 12]} />
              <Tooltip contentStyle={ttStyle} formatter={v => [`${v} ч`, "Сон"]} />
              <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2 }} name="Сон" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasEnough(bpData) && (
        <div className="apd-chart-wrap">
          <span className="apd-chart-wrap__title">Давление, мм рт.ст.</span>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={bpData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} domain={["auto", "auto"]} />
              <Tooltip contentStyle={ttStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="sys" stroke="var(--red)"     strokeWidth={2} dot={{ r: 2 }} name="Систолическое" />
              <Line type="monotone" dataKey="dia" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} name="Диастолическое" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function AdminPatientDiaryPage() {
  const { userId }   = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();

  // Patient name passed via navigate state; fallback to ID
  const patientName  = location.state?.patientName ?? `Пациент #${userId}`;

  const [entries,        setEntries]        = useState([]);
  const [summary,        setSummary]        = useState(null);
  const [aiSummaries,    setAiSummaries]    = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingAi,      setLoadingAi]      = useState(true);
  const [generating,     setGenerating]     = useState(false);
  const [genError,       setGenError]       = useState("");
  const [toast,          setToast]          = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const loadAiSummaries = useCallback(async () => {
    setLoadingAi(true);
    try {
      const data = await getAiSummaries(userId);
      setAiSummaries(toArray(data).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch { setAiSummaries([]); }
    finally  { setLoadingAi(false); }
  }, [userId]);

  useEffect(() => {
    (async () => {
      setLoadingEntries(true);
      try {
        const data = await getAdminUserDiary(userId);
        setEntries(toArray(data).sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate)));
      } catch { setEntries([]); }
      finally  { setLoadingEntries(false); }
    })();

    (async () => {
      setLoadingSummary(true);
      try   { setSummary(await getAdminUserDiarySummary(userId)); }
      catch { setSummary(null); }
      finally { setLoadingSummary(false); }
    })();

    loadAiSummaries();
  }, [userId, loadAiSummaries]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError("");
    try {
      await generateAiSummary(userId);
      showToast("Сводка готова");
      await loadAiSummaries();
    } catch (err) {
      // Show the actual backend error text so admin can diagnose
      let msg = err.message || "";
      try { const parsed = JSON.parse(msg); msg = parsed.message ?? parsed.title ?? msg; } catch {}
      setGenError(msg || "Не удалось сгенерировать сводку — проверьте консоль.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="admin-section apd-page">
      {/* Toast */}
      {toast && <div className="apd-toast">{toast}</div>}

      {/* Header */}
      <div className="apd-header">
        <div className="apd-header__left">
          <button className="apd-back-btn" onClick={() => navigate("/admin/patients")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Назад к пациентам
          </button>
          <h1 className="admin-section__title" style={{ marginBottom: 0 }}>
            Дневник здоровья пациента
          </h1>
          <p className="apd-header__name">{patientName}</p>
        </div>

        {/* Generate AI button */}
        <button
          className="btn-primary apd-ai-btn"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <Spinner size={16} color="white" />
              Анализирую данные пациента…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Сгенерировать AI-сводку
            </>
          )}
        </button>
      </div>

      {genError && <p className="apd-gen-error">{genError}</p>}

      {/* AI disclaimer */}
      <div className="apd-disclaimer">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        AI-аналитика носит <strong>вспомогательный характер</strong> и не является медицинским заключением.
        Все решения по диагностике и назначению лечения принимает врач.
      </div>

      {/* Stats */}
      <div className="apd-card">
        <h3 className="apd-card__title">Статистика</h3>
        {loadingSummary ? (
          <div className="apd-loading"><Spinner size={24} /></div>
        ) : summary ? (
          <SummaryCard summary={summary} />
        ) : (
          <p className="apd-empty-text">Статистика недоступна.</p>
        )}
      </div>

      {/* AI Summaries */}
      <div className="apd-card">
        <h3 className="apd-card__title">AI-сводки пациента</h3>
        {loadingAi ? (
          <div className="apd-loading"><Spinner size={24} /></div>
        ) : aiSummaries.length === 0 ? (
          <p className="apd-empty-text">
            AI-сводок пока нет. Нажмите кнопку выше чтобы сгенерировать первую.
          </p>
        ) : (
          <div className="apd-ai-list">
            {aiSummaries.map((s, i) => (
              <div className="apd-ai-card" key={s.id ?? i}>
                <div className="apd-ai-card__meta">
                  <span className="apd-ai-card__date">{fmtDateTime(s.createdAt)}</span>
                  <span className="apd-ai-card__badge">
                    Генерация на основе LLM-модели (демо-режим)
                  </span>
                </div>
                <p className="apd-ai-card__text">
                  {s.summary ?? s.text ?? s.content ?? "Текст сводки недоступен."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="apd-card">
        <h3 className="apd-card__title">Графики динамики</h3>
        <p className="apd-card__sub">Все записи пациента</p>
        {loadingEntries ? (
          <div className="apd-loading"><Spinner size={24} /></div>
        ) : entries.length < 2 ? (
          <p className="apd-chart-hint">Недостаточно данных для построения графиков (нужно минимум 2 записи).</p>
        ) : (
          <DiaryCharts entries={entries} />
        )}
      </div>

      {/* Entries table */}
      <div className="apd-card">
        <h3 className="apd-card__title">
          Записи дневника
          {!loadingEntries && entries.length > 0 && (
            <span className="apd-count-badge">{entries.length}</span>
          )}
        </h3>
        {loadingEntries ? (
          <div className="apd-loading"><Spinner size={24} /></div>
        ) : entries.length === 0 ? (
          <p className="apd-empty-text">Записей в дневнике нет.</p>
        ) : (
          <div className="admin-table-wrap apd-table-wrap">
            <table className="admin-table apd-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Вес, кг</th>
                  <th>Давление</th>
                  <th>Сахар</th>
                  <th>Сон, ч</th>
                  <th>Самочувствие</th>
                  <th>Препараты</th>
                  <th>Симптомы</th>
                  <th>Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => {
                  // Support both camelCase and PascalCase field names
                  const entryDate        = e.entryDate        ?? e.EntryDate;
                  const weightKg         = e.weightKg         ?? e.WeightKg;
                  const systolicPressure = e.systolicPressure ?? e.SystolicPressure;
                  const diastolicPressure= e.diastolicPressure?? e.DiastolicPressure;
                  const bloodSugar       = e.bloodSugar       ?? e.BloodSugar;
                  const sleepHours       = e.sleepHours       ?? e.SleepHours;
                  const mood             = e.mood             ?? e.Mood;
                  const tookMedication   = e.tookMedication   ?? e.TookMedication;
                  const symptoms         = e.symptoms         ?? e.Symptoms ?? "";
                  const comment          = e.comment          ?? e.Comment  ?? "";

                  return (
                  <tr key={e.id ?? e.Id ?? i}>
                    <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>{fmt(entryDate)}</td>
                    <td>{weightKg          != null ? weightKg          : "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {(systolicPressure != null || diastolicPressure != null)
                        ? `${systolicPressure ?? "?"} / ${diastolicPressure ?? "?"}`
                        : "—"}
                    </td>
                    <td>{bloodSugar        != null ? bloodSugar        : "—"}</td>
                    <td>{sleepHours        != null ? sleepHours        : "—"}</td>
                    <td>{mood ? (MOOD_LABEL[mood] ?? mood) : "—"}</td>
                    <td>
                      {tookMedication != null ? (
                        <span style={{ color: tookMedication ? "var(--green)" : "var(--mid-gray)" }}>
                          {tookMedication ? "Да" : "Нет"}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ maxWidth: 160, color: "var(--mid-gray)" }}>
                      {symptoms ? (symptoms.length > 40 ? symptoms.slice(0, 40) + "…" : symptoms) : "—"}
                    </td>
                    <td style={{ maxWidth: 200, color: "var(--mid-gray)" }}>
                      {comment  ? (comment.length  > 50 ? comment.slice(0, 50)   + "…" : comment)  : "—"}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
