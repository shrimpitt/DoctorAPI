import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import Navbar from "../components/Navbar";
import Spinner from "../components/ui/Spinner";
import HealthDiaryEntryForm from "../components/HealthDiaryEntryForm";
import HealthDiaryList      from "../components/HealthDiaryList";
import {
  createDiaryEntry, getMyDiaryEntries, deleteDiaryEntry,
  getMyDiarySummary, getMyRecommendations, generateMyRecommendations,
} from "../api";
import DiaryRecommendationsSection from "../components/DiaryRecommendationsSection";
import { useUserAuth } from "../context/UserAuthContext";
import "./HealthDiaryPage.css";

const MIN_CHART_ENTRIES = 2;

function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? iso : `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}`;
}

function toChartBase(entries) {
  return [...entries].sort((a,b) => new Date(a.entryDate)-new Date(b.entryDate)).slice(-30);
}

function calcHealthScore(summary) {
  if (!summary || summary.totalEntries === 0) return 0;
  let s = 45;
  s += Math.min((summary.totalEntries || 0) * 3, 25);
  if (summary.averageSleepHours != null)
    s += summary.averageSleepHours >= 7 ? 15 : summary.averageSleepHours >= 5 ? 8 : 2;
  const taken = summary.medicationTakenCount ?? 0;
  const missed = summary.medicationMissedCount ?? 0;
  const tot = taken + missed;
  if (tot > 0) s += Math.round((taken / tot) * 15);
  return Math.min(Math.round(s), 100);
}

function getScoreLabel(score) {
  if (score >= 85) return "Отличное";
  if (score >= 65) return "Хорошее";
  if (score >= 45) return "Среднее";
  return "Требует внимания";
}

const MOOD_META = {
  excellent: { emoji: "😄", label: "Отличное" },
  good:      { emoji: "😊", label: "Хорошее" },
  normal:    { emoji: "😐", label: "Нормальное" },
  bad:       { emoji: "😔", label: "Плохое" },
  very_bad:  { emoji: "😢", label: "Очень плохое" },
};

/* ── Animated SVG health score ring ── */
function HealthScoreRing({ score }) {
  const R = 58;
  const C = 2 * Math.PI * R;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 350);
    return () => clearTimeout(t);
  }, [score]);

  const dash = C * (animated / 100);
  const gap  = C - dash;

  return (
    <div className={`hd-score-ring${score >= 75 ? " hd-score-ring--high" : ""}`}>
      <svg width="170" height="170" viewBox="0 0 170 170">
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Track ring */}
        <circle cx="85" cy="85" r={R} fill="none"
          stroke="rgba(255,255,255,0.18)" strokeWidth="10" />
        {/* Score arc */}
        <circle cx="85" cy="85" r={R} fill="none"
          stroke="url(#arcGrad)" strokeWidth="10"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          transform="rotate(-90 85 85)"
          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)", filter: "url(#arcGlow)" }}
        />
        {/* Score number */}
        <text x="85" y="80" textAnchor="middle"
          fill="white" fontSize="36" fontWeight="800" fontFamily="Inter, sans-serif">
          {score}
        </text>
        {/* Labels */}
        <text x="85" y="100" textAnchor="middle"
          fill="rgba(255,255,255,0.65)" fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="1">
          HEALTH SCORE
        </text>
        <text x="85" y="118" textAnchor="middle"
          fill="rgba(255,255,255,0.55)" fontSize="10" fontFamily="Inter, sans-serif">
          {getScoreLabel(score)}
        </text>
      </svg>
    </div>
  );
}

/* ── Charts section ── */
function ChartsSection({ entries }) {
  const base = toChartBase(entries);

  const weightData = base.filter(e => e.weightKg    != null).map(e => ({ date: shortDate(e.entryDate), value: e.weightKg }));
  const sugarData  = base.filter(e => e.bloodSugar  != null).map(e => ({ date: shortDate(e.entryDate), value: e.bloodSugar }));
  const sleepData  = base.filter(e => e.sleepHours  != null).map(e => ({ date: shortDate(e.entryDate), value: e.sleepHours }));
  const bpData     = base
    .filter(e => e.systolicPressure != null || e.diastolicPressure != null)
    .map(e => ({ date: shortDate(e.entryDate), sys: e.systolicPressure, dia: e.diastolicPressure }));

  const has = arr => arr.length >= MIN_CHART_ENTRIES;
  const anyChart = has(weightData) || has(sugarData) || has(sleepData) || has(bpData);

  const cp = { margin: { top: 8, right: 16, left: 0, bottom: 0 } };
  const axis = { tick: { fontSize: 11, fill: "#9CA3AF" }, stroke: "#F3F4F6" };
  const ttStyle = { fontSize: 12, borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", background: "#fff" };

  if (!anyChart) {
    return (
      <div className="hd-charts-section">
        <div className="hd-sec-header">
          <div className="hd-sec-title">
            <div className="hd-sec-title-icon" style={{background:"#F5F3FF"}}>📈</div>
            Аналитика здоровья
          </div>
        </div>
        <div className="hd-charts-hint">
          <div className="hd-charts-hint__icon">📊</div>
          <div className="hd-charts-hint__title">Пока недостаточно данных</div>
          <p>Добавьте ещё {MIN_CHART_ENTRIES - 1} записи с показателями, чтобы увидеть графики</p>
        </div>
      </div>
    );
  }

  const lineCharts = [
    { key:"weight", data: weightData, stroke:"#06D6A0", label:"⚖️ Вес",   unit:"кг" },
    { key:"sugar",  data: sugarData,  stroke:"#FFD166", label:"🩸 Сахар", unit:"ммоль/л" },
    { key:"sleep",  data: sleepData,  stroke:"#8B5CF6", label:"😴 Сон",   unit:"ч" },
  ].filter(c => has(c.data));

  return (
    <div className="hd-charts-section">
      <div className="hd-sec-header">
        <div className="hd-sec-title">
          <div className="hd-sec-title-icon" style={{background:"#F5F3FF"}}>📈</div>
          Аналитика здоровья
          <span className="hd-sec-badge">Последние 30 записей</span>
        </div>
      </div>

      <div className="hd-charts-grid">
        {lineCharts.map(c => (
          <div className="hd-chart-card" key={c.key}>
            <div className="hd-chart-card__label">
              <span className="hd-chart-card__dot" style={{background:c.stroke}}/>
              {c.label}
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={c.data} {...cp}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                <XAxis dataKey="date" {...axis}/>
                <YAxis {...axis} domain={["auto","auto"]}/>
                <Tooltip contentStyle={ttStyle}
                  formatter={v => [`${v} ${c.unit}`, c.label.replace(/[^\w\s]/g,"").trim()]}/>
                <Line type="monotone" dataKey="value" stroke={c.stroke} strokeWidth={2.5}
                  dot={{r:4, fill:c.stroke, stroke:"white", strokeWidth:2}}
                  activeDot={{r:6, fill:c.stroke}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}

        {has(bpData) && (
          <div className="hd-chart-card">
            <div className="hd-chart-card__label">
              <span className="hd-chart-card__dot" style={{background:"#EF476F"}}/>
              💓 Артериальное давление
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={bpData} {...cp}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                <XAxis dataKey="date" {...axis}/>
                <YAxis {...axis} domain={["auto","auto"]}/>
                <Tooltip contentStyle={ttStyle}/>
                <Legend wrapperStyle={{fontSize:11, color:"#9CA3AF"}}/>
                <Line type="monotone" dataKey="sys" stroke="#EF476F" strokeWidth={2.5}
                  dot={{r:4, fill:"#EF476F", stroke:"white", strokeWidth:2}} name="Систолическое"/>
                <Line type="monotone" dataKey="dia" stroke="#5B4FCF" strokeWidth={2.5}
                  dot={{r:4, fill:"#5B4FCF", stroke:"white", strokeWidth:2}} name="Диастолическое"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN PAGE
══════════════════════════════════ */
export default function HealthDiaryPage() {
  const { t } = useTranslation();
  const { user } = useUserAuth();

  const [entries,        setEntries]        = useState([]);
  const [summary,        setSummary]        = useState(null);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [submitting,     setSubmitting]     = useState(false);
  const [deleting,       setDeleting]       = useState(null);
  const [showForm,       setShowForm]       = useState(false);
  const [toast,          setToast]          = useState("");

  const [recs,           setRecs]           = useState(null);
  const [recsLoading,    setRecsLoading]    = useState(true);
  const [recsError,      setRecsError]      = useState(null);
  const [recsGenerating, setRecsGenerating] = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const loadEntries = useCallback(async () => {
    setLoadingEntries(true);
    try {
      const data = await getMyDiaryEntries();
      setEntries(
        Array.isArray(data)          ? data :
        Array.isArray(data?.$values) ? data.$values :
        Array.isArray(data?.items)   ? data.items : []
      );
    } catch { setEntries([]); }
    finally { setLoadingEntries(false); }
  }, []);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try { setSummary(await getMyDiarySummary()); }
    catch { setSummary(null); }
    finally { setLoadingSummary(false); }
  }, []);

  const loadRecs = useCallback(async () => {
    setRecsLoading(true); setRecsError(null);
    try { setRecs(await getMyRecommendations()); }
    catch { setRecsError("Не удалось загрузить рекомендации."); }
    finally { setRecsLoading(false); }
  }, []);

  useEffect(() => { loadEntries(); loadSummary(); loadRecs(); }, [loadEntries, loadSummary, loadRecs]);

  const handleGenerate = async () => {
    setRecsGenerating(true); setRecsError(null);
    try { setRecs(await generateMyRecommendations()); showToast("✨ Рекомендации обновлены"); }
    catch { setRecsError("Не удалось сформировать рекомендации. Добавьте хотя бы одну запись."); }
    finally { setRecsGenerating(false); }
  };

  const handleSubmit = async payload => {
    setSubmitting(true);
    try {
      await createDiaryEntry(payload);
      setShowForm(false);
      showToast("✅ Запись добавлена");
      await loadEntries();
      await loadSummary();
    } catch (err) {
      console.error("Failed to create diary entry:", err);
      const msg = String(err.message ?? "");
      if (msg.includes("403") || msg.includes("401") ||
          msg.toLowerCase().includes("forbidden") ||
          msg.toLowerCase().includes("unauthorized")) {
        showToast("❌ Ошибка авторизации — войдите в аккаунт заново");
      } else {
        showToast("❌ Не удалось сохранить запись: " + (msg || "неизвестная ошибка"));
      }
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    setDeleting(id);
    try {
      await deleteDiaryEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      showToast("🗑 Запись удалена");
      loadSummary();
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  /* Derived values */
  const score      = calcHealthScore(summary);
  const firstName  = user?.fullName?.split(" ")[0] || "Пациент";
  const sorted     = [...entries].sort((a,b) => new Date(b.entryDate)-new Date(a.entryDate));
  const latestEntry = sorted[0] ?? null;

  const medAdherence = summary &&
    (summary.medicationTakenCount + summary.medicationMissedCount) > 0
      ? Math.round((summary.medicationTakenCount /
          (summary.medicationTakenCount + summary.medicationMissedCount)) * 100)
      : null;

  /* Symptom frequency map */
  const symptomFreq = {};
  entries.forEach(e => {
    if (e.symptoms)
      e.symptoms.split(",").map(s=>s.trim()).filter(Boolean)
        .forEach(s => { symptomFreq[s] = (symptomFreq[s] || 0) + 1; });
  });
  const topSymptoms = Object.entries(symptomFreq).sort((a,b)=>b[1]-a[1]).slice(0,8);

  /* Weekly streak (last 7 days) */
  const _today = new Date(); _today.setHours(0,0,0,0);
  const entryDateSet = new Set(entries.map(e => e.entryDate?.slice(0,10)));
  const _wd = ['вс','пн','вт','ср','чт','пт','сб'];
  const streakData = Array.from({length:7}, (_,i) => {
    const d = new Date(_today); d.setDate(_today.getDate() - 6 + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { iso, day: _wd[d.getDay()], active: entryDateSet.has(iso) };
  });

  /* Latest BP from entries */
  const latestBPEntry = entries
    .filter(e => e.systolicPressure != null)
    .sort((a,b) => new Date(b.entryDate)-new Date(a.entryDate))[0] ?? null;

  return (
    <div className="hd-page">
      <Navbar />
      {toast && <div className="hd-toast">{toast}</div>}

      {/* ══ HERO ══ */}
      <section className="hd-hero">
        <div className="hd-hero__orb hd-hero__orb--1"/>
        <div className="hd-hero__orb hd-hero__orb--2"/>
        <div className="hd-hero__orb hd-hero__orb--3"/>

        <div className="hd-hero__inner">
          <div className="hd-hero__content">
            <div className="hd-hero__badge">
              <span className="hd-hero__badge-dot"/>
              Персональный дневник здоровья
            </div>
            <p className="hd-hero__greeting">Добро пожаловать,</p>
            <h1 className="hd-hero__title">
              <span className="hd-hero__title-name">{firstName}</span> 👋
            </h1>
            <p className="hd-hero__sub">
              Отслеживайте своё здоровье каждый день. Умные аналитика и персональные рекомендации помогут вам чувствовать себя лучше.
            </p>
            <div className="hd-hero__actions">
              <button className="hd-hero__btn-primary" onClick={() => setShowForm(v => !v)}>
                {showForm ? "✕ Скрыть форму" : "+ Добавить запись"}
              </button>
            </div>
          </div>

          <div className="hd-score-wrap">
            <HealthScoreRing score={loadingSummary ? 0 : score} />
            {!loadingSummary && summary && (
              <div className="hd-score-stats">
                <div className="hd-score-stat">
                  <span className="hd-score-stat__val">{summary.totalEntries ?? 0}</span>
                  <span className="hd-score-stat__lbl">Записей</span>
                </div>
                <div className="hd-score-divider"/>
                <div className="hd-score-stat">
                  <span className="hd-score-stat__val">
                    {medAdherence != null ? `${medAdherence}%` : "—"}
                  </span>
                  <span className="hd-score-stat__lbl">Адгеренция</span>
                </div>
                <div className="hd-score-divider"/>
                <div className="hd-score-stat">
                  <span className="hd-score-stat__val">
                    {summary.averageSleepHours != null
                      ? `${summary.averageSleepHours.toFixed(1)}ч`
                      : "—"}
                  </span>
                  <span className="hd-score-stat__lbl">Ср. сон</span>
                </div>
              </div>
            )}
            <div className="hd-week-strip">
              {streakData.map(d => (
                <div key={d.iso} className={`hd-week-day${d.active ? " hd-week-day--active" : ""}`}>
                  <div className="hd-week-dot"/>
                  <span className="hd-week-label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MAIN CONTENT ══ */}
      <div className="hd-main">

        {/* Quick stats */}
        <div className="hd-stats-row">
          <div className="hd-qstat">
            <div className="hd-qstat__icon-wrap" style={{background:"#EEF0FF"}}>📓</div>
            <div>
              <div className="hd-qstat__val">{loadingSummary ? "—" : (summary?.totalEntries ?? 0)}</div>
              <div className="hd-qstat__lbl">Всего записей</div>
              {(summary?.totalEntries ?? 0) > 0 &&
                <div className="hd-qstat__trend hd-qstat__trend--up">↑ Ведёте регулярно</div>}
            </div>
          </div>

          <div className="hd-qstat">
            <div className="hd-qstat__icon-wrap" style={{background:"#F0FDF9"}}>⚖️</div>
            <div>
              <div className="hd-qstat__val">
                {loadingSummary ? "—" : summary?.averageWeightKg != null
                  ? summary.averageWeightKg.toFixed(1) : "—"}
              </div>
              <div className="hd-qstat__lbl">Средний вес, кг</div>
            </div>
          </div>

          <div className="hd-qstat">
            <div className="hd-qstat__icon-wrap" style={{background:"#F5F3FF"}}>😴</div>
            <div>
              <div className="hd-qstat__val">
                {loadingSummary ? "—" : summary?.averageSleepHours != null
                  ? summary.averageSleepHours.toFixed(1) : "—"}
              </div>
              <div className="hd-qstat__lbl">Ср. часов сна</div>
              {summary?.averageSleepHours != null && (
                <div className={`hd-qstat__trend ${summary.averageSleepHours >= 7
                  ? "hd-qstat__trend--up" : "hd-qstat__trend--down"}`}>
                  {summary.averageSleepHours >= 7 ? "↑ Норма" : "↓ Недосыпание"}
                </div>
              )}
            </div>
          </div>

          <div className="hd-qstat">
            <div className="hd-qstat__icon-wrap" style={{background:"#FFF0F4"}}>💊</div>
            <div>
              <div className="hd-qstat__val">
                {loadingSummary ? "—" : medAdherence != null ? `${medAdherence}%` : "—"}
              </div>
              <div className="hd-qstat__lbl">Приём препаратов</div>
              {medAdherence != null && (
                <div className={`hd-qstat__trend ${medAdherence >= 80
                  ? "hd-qstat__trend--up" : "hd-qstat__trend--down"}`}>
                  {medAdherence >= 80 ? "↑ Высокая" : "↓ Низкая"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="hd-disclaimer-new">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
            <path d="M12 9v4"/><path d="M12 17h.01"/>
          </svg>
          <p>
            Дневник здоровья носит информационный характер и не заменяет консультацию врача.
            При ухудшении самочувствия — обратитесь к специалисту.
          </p>
        </div>

        {/* Entry form */}
        {showForm && (
          <div className="hd-form-panel">
            <div className="hd-form-card">
              <div className="hd-form-card__title">
                <div className="hd-form-card__title-icon">📝</div>
                Новая запись в дневник
              </div>
              <HealthDiaryEntryForm
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                loading={submitting}
              />
            </div>
          </div>
        )}

        {/* Health metrics */}
        {!loadingSummary && summary && summary.totalEntries > 0 && (
          <div className="hd-metrics-section">
            <div className="hd-sec-header">
              <div className="hd-sec-title">
                <div className="hd-sec-title-icon" style={{background:"#FFF0F4"}}>💓</div>
                Ключевые показатели
                <span className="hd-sec-badge">Средние значения</span>
              </div>
            </div>
            <div className="hd-metrics-grid">
              {latestBPEntry && (
                <div className="hd-mcard hd-mcard--bp">
                  <div className="hd-mcard__icon">❤️</div>
                  <div className="hd-mcard__label">Артериальное давление</div>
                  <div className="hd-mcard__value">
                    {latestBPEntry.systolicPressure}
                    <span className="hd-mcard__unit">/{latestBPEntry.diastolicPressure ?? "—"} мм</span>
                  </div>
                  <div className="hd-mcard__sub">последнее значение</div>
                  <div className="hd-mcard__bar-wrap">
                    <div className="hd-mcard__bar"
                      style={{width:`${Math.min((latestBPEntry.systolicPressure/180)*100,100)}%`}}/>
                  </div>
                </div>
              )}

              {summary.averageBloodSugar != null && (
                <div className="hd-mcard hd-mcard--sugar">
                  <div className="hd-mcard__icon">🩸</div>
                  <div className="hd-mcard__label">Сахар крови</div>
                  <div className="hd-mcard__value">
                    {summary.averageBloodSugar.toFixed(1)}
                    <span className="hd-mcard__unit"> ммоль/л</span>
                  </div>
                  <div className="hd-mcard__sub">среднее значение</div>
                  <div className="hd-mcard__bar-wrap">
                    <div className="hd-mcard__bar"
                      style={{width:`${Math.min((summary.averageBloodSugar/12)*100,100)}%`}}/>
                  </div>
                </div>
              )}

              {summary.averageWeightKg != null && (
                <div className="hd-mcard hd-mcard--weight">
                  <div className="hd-mcard__icon">⚖️</div>
                  <div className="hd-mcard__label">Масса тела</div>
                  <div className="hd-mcard__value">
                    {summary.averageWeightKg.toFixed(1)}
                    <span className="hd-mcard__unit"> кг</span>
                  </div>
                  <div className="hd-mcard__sub">среднее значение</div>
                  <div className="hd-mcard__bar-wrap">
                    <div className="hd-mcard__bar"
                      style={{width:`${Math.min((summary.averageWeightKg/150)*100,100)}%`}}/>
                  </div>
                </div>
              )}

              {summary.averageSleepHours != null && (
                <div className="hd-mcard hd-mcard--sleep">
                  <div className="hd-mcard__icon">🌙</div>
                  <div className="hd-mcard__label">Продолжительность сна</div>
                  <div className="hd-mcard__value">
                    {summary.averageSleepHours.toFixed(1)}
                    <span className="hd-mcard__unit"> ч/ночь</span>
                  </div>
                  <div className="hd-mcard__sub">
                    {summary.averageSleepHours >= 7 ? "✓ В норме (7–9 ч)" : "Ниже рекомендуемой нормы"}
                  </div>
                  <div className="hd-mcard__bar-wrap">
                    <div className="hd-mcard__bar"
                      style={{width:`${Math.min((summary.averageSleepHours/9)*100,100)}%`}}/>
                  </div>
                </div>
              )}

              <div className="hd-mcard hd-mcard--med">
                <div className="hd-mcard__icon">💊</div>
                <div className="hd-mcard__label">Препараты</div>
                <div className="hd-mcard__value">
                  {summary.medicationTakenCount ?? 0}
                  <span className="hd-mcard__unit"> дней принимал</span>
                </div>
                <div className="hd-mcard__sub">
                  {summary.medicationMissedCount ?? 0} дней пропустил
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mood section */}
        {latestEntry?.mood && (
          <div className="hd-mood-section">
            <div className="hd-sec-header">
              <div className="hd-sec-title">
                <div className="hd-sec-title-icon" style={{background:"#FFFBEB"}}>😊</div>
                Самочувствие
              </div>
            </div>
            <div className="hd-mood-card">
              <div className="hd-mood-grid">
                {Object.entries(MOOD_META).map(([key, meta]) => (
                  <div key={key}
                    className={`hd-mood-item${latestEntry.mood === key ? " hd-mood-item--active" : ""}`}>
                    <span className="hd-mood-emoji">{meta.emoji}</span>
                    <span className="hd-mood-label">{meta.label}</span>
                  </div>
                ))}
              </div>
              <div className="hd-mood-current">
                <span className="hd-mood-current__emoji">
                  {MOOD_META[latestEntry.mood]?.emoji}
                </span>
                <div>
                  <div className="hd-mood-current__label">Последняя запись</div>
                  <div className="hd-mood-current__val">
                    {MOOD_META[latestEntry.mood]?.label ?? latestEntry.mood}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Symptom cloud */}
        {topSymptoms.length > 0 && (
          <div className="hd-symptoms-section">
            <div className="hd-sec-header">
              <div className="hd-sec-title">
                <div className="hd-sec-title-icon" style={{background:"#FFF0F4"}}>🔍</div>
                Отслеживаемые симптомы
                <span className="hd-sec-badge">{topSymptoms.length} симптомов</span>
              </div>
            </div>
            <div className="hd-symptoms-card">
              <div className="hd-symptom-cloud">
                {topSymptoms.map(([s, count], i) => {
                  const maxC = topSymptoms[0]?.[1] ?? 1;
                  const scale = count / maxC;
                  return (
                    <div key={s} className={`hd-stag hd-stag--${i % 5}`}
                      style={{fontSize:`${(0.72 + scale * 0.38).toFixed(2)}rem`}}>
                      {s}
                      <span className="hd-stag__count">{count}×</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {!loadingEntries && entries.length >= MIN_CHART_ENTRIES && (
          <ChartsSection entries={entries} />
        )}

        {/* Journal timeline */}
        <div className="hd-timeline-section">
          <div className="hd-sec-header">
            <div className="hd-sec-title">
              <div className="hd-sec-title-icon" style={{background:"#EEF0FF"}}>📖</div>
              Журнал здоровья
              {!loadingEntries && entries.length > 0 && (
                <span className="hd-sec-badge">
                  {entries.length} {entries.length === 1 ? "запись" : entries.length < 5 ? "записи" : "записей"}
                </span>
              )}
            </div>
          </div>
          {loadingEntries ? (
            <div className="hd-loading-wrap"><Spinner size={32}/></div>
          ) : (
            <HealthDiaryList entries={entries} onDelete={handleDelete} deleting={deleting}/>
          )}
        </div>

        {/* AI Recommendations */}
        <div style={{marginBottom:"32px"}}>
          <DiaryRecommendationsSection
            recs={recs} loading={recsLoading} error={recsError}
            generating={recsGenerating} onGenerate={handleGenerate}
            isAdmin={false} diaryEmpty={!loadingEntries && entries.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
