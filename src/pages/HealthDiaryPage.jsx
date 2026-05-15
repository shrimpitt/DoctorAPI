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
  createDiaryEntry,
  getMyDiaryEntries,
  deleteDiaryEntry,
  getMyDiarySummary,
} from "../api";
import "./HealthDiaryPage.css";

// Minimum entries required before charts are rendered
const MIN_CHART_ENTRIES = 2;

// Format ISO date string to short "ДД.ММ" for chart x-axis ticks
function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? iso : `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Prepare chart data sorted chronologically, limited to last 30 entries
function toChartBase(entries) {
  return [...entries]
    .sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate))
    .slice(-30);
}

function SummaryCard({ summary, loading }) {
  const { t } = useTranslation();

  if (loading) return <div className="hd-summary hd-summary--loading"><Spinner size={28} /></div>;
  if (!summary || summary.totalEntries === 0) {
    return (
      <div className="hd-summary hd-summary--empty">
        <p>{t("diary.emptyStats")}</p>
      </div>
    );
  }

  const stats = [
    { labelKey: "diary.statTotal",    value: summary.totalEntries },
    { labelKey: "diary.statWeight",   value: summary.averageWeightKg   != null ? `${summary.averageWeightKg.toFixed(1)} ${t("diary.unitKg")}`     : "—" },
    { labelKey: "diary.statSugar",    value: summary.averageBloodSugar != null ? `${summary.averageBloodSugar.toFixed(1)} ${t("diary.unitMmol")}` : "—" },
    { labelKey: "diary.statSleep",    value: summary.averageSleepHours != null ? `${summary.averageSleepHours.toFixed(1)} ${t("diary.unitHour")}` : "—" },
    { labelKey: "diary.statMedTaken", value: summary.medicationTakenCount  ?? "—" },
    { labelKey: "diary.statMedMissed",value: summary.medicationMissedCount ?? "—" },
  ];

  return (
    <div className="hd-summary">
      <div className="hd-summary__grid">
        {stats.map(s => (
          <div className="hd-stat" key={s.labelKey}>
            <span className="hd-stat__value">{s.value}</span>
            <span className="hd-stat__label">{t(s.labelKey)}</span>
          </div>
        ))}
      </div>

      {summary.commonSymptoms?.length > 0 && (
        <div className="hd-summary__symptoms">
          <span className="hd-summary__symptoms-label">{t("diary.symptomsLabel")}</span>
          {summary.commonSymptoms.map((s, i) => (
            <span key={i} className="hd-tag">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ChartsSection({ entries }) {
  const { t } = useTranslation();
  const base = toChartBase(entries);

  const weightData = base.filter(e => e.weightKg     != null).map(e => ({ date: shortDate(e.entryDate), value: e.weightKg }));
  const sugarData  = base.filter(e => e.bloodSugar   != null).map(e => ({ date: shortDate(e.entryDate), value: e.bloodSugar }));
  const sleepData  = base.filter(e => e.sleepHours   != null).map(e => ({ date: shortDate(e.entryDate), value: e.sleepHours }));
  const bpData     = base
    .filter(e => e.systolicPressure != null || e.diastolicPressure != null)
    .map(e => ({ date: shortDate(e.entryDate), sys: e.systolicPressure, dia: e.diastolicPressure }));

  const hasEnough = (arr) => arr.length >= MIN_CHART_ENTRIES;
  const anyChart  = hasEnough(weightData) || hasEnough(sugarData) || hasEnough(sleepData) || hasEnough(bpData);

  if (!anyChart) {
    return (
      <div className="hd-section">
        <h3 className="hd-section__title">{t("diary.charts")}</h3>
        <p className="hd-charts__hint">
          {t("diary.chartsHint", { count: MIN_CHART_ENTRIES })}
        </p>
      </div>
    );
  }

  const chartProps = {
    margin: { top: 8, right: 16, left: 0, bottom: 0 },
  };

  const axisProps = {
    tick:   { fontSize: 11, fill: "var(--mid-gray)" },
    stroke: "var(--border)",
  };

  return (
    <div className="hd-section">
      <h3 className="hd-section__title">{t("diary.charts")}</h3>
      <p className="hd-section__sub">{t("diary.chartsLast30")}</p>

      <div className="hd-charts">
        {/* Weight chart */}
        {hasEnough(weightData) && (
          <div className="hd-chart-wrap">
            <span className="hd-chart-wrap__title">{t("diary.chartWeight")}</span>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weightData} {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                  formatter={v => [`${v} ${t("diary.unitKg")}`, t("diary.chartLabelWeight")]}
                />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} name={t("diary.chartLabelWeight")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Blood sugar chart */}
        {hasEnough(sugarData) && (
          <div className="hd-chart-wrap">
            <span className="hd-chart-wrap__title">{t("diary.chartSugar")}</span>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={sugarData} {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                  formatter={v => [`${v} ${t("diary.unitMmol")}`, t("diary.chartLabelSugar")]}
                />
                <Line type="monotone" dataKey="value" stroke="var(--green)" strokeWidth={2} dot={{ r: 3 }} name={t("diary.chartLabelSugar")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sleep chart */}
        {hasEnough(sleepData) && (
          <div className="hd-chart-wrap">
            <span className="hd-chart-wrap__title">{t("diary.chartSleep")}</span>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={sleepData} {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} domain={[0, 12]} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                  formatter={v => [`${v} ${t("diary.unitHour")}`, t("diary.chartLabelSleep")]}
                />
                <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} name={t("diary.chartLabelSleep")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Blood pressure chart — systolic + diastolic on same chart */}
        {hasEnough(bpData) && (
          <div className="hd-chart-wrap">
            <span className="hd-chart-wrap__title">{t("diary.chartBP")}</span>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={bpData} {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="sys" stroke="var(--red)"    strokeWidth={2} dot={{ r: 3 }} name={t("diary.chartLabelSys")} />
                <Line type="monotone" dataKey="dia" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} name={t("diary.chartLabelDia")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HealthDiaryPage() {
  const { t } = useTranslation();
  const [entries,        setEntries]        = useState([]);
  const [summary,        setSummary]        = useState(null);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [submitting,     setSubmitting]     = useState(false);
  const [deleting,       setDeleting]       = useState(null);
  const [showForm,       setShowForm]       = useState(false);
  const [toast,          setToast]          = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const loadEntries = useCallback(async () => {
    setLoadingEntries(true);
    try {
      const data = await getMyDiaryEntries();
      // Normalise possible wrapper shapes from the API
      setEntries(
        Array.isArray(data)           ? data :
        Array.isArray(data?.$values)  ? data.$values :
        Array.isArray(data?.items)    ? data.items :
        []
      );
    } catch {
      setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const data = await getMyDiarySummary();
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
    loadSummary();
  }, [loadEntries, loadSummary]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await createDiaryEntry(payload);
      setShowForm(false);
      showToast(t("diary.toastAdded"));
      await loadEntries();
      await loadSummary();
    } catch (err) {
      console.error("Failed to create diary entry:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteDiaryEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      showToast(t("diary.toastDeleted"));
      loadSummary();
    } catch (err) {
      console.error("Failed to delete diary entry:", err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="hd-page">
      <Navbar />

      {/* Toast notification */}
      {toast && <div className="hd-toast">{toast}</div>}

      <div className="hd-page__inner container">

        {/* Page header */}
        <div className="hd-header">
          <div>
            <h1 className="hd-header__title">{t("diary.title")}</h1>
            <p className="hd-header__desc">{t("diary.desc")}</p>
          </div>
          <button
            className="btn-primary hd-header__add-btn"
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? t("diary.hideForm") : t("diary.addEntry")}
          </button>
        </div>

        {/* Medical disclaimer */}
        <div className="hd-disclaimer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{t("diary.disclaimerText")}</p>
        </div>

        {/* Add entry form */}
        {showForm && (
          <div className="hd-section">
            <h3 className="hd-section__title">{t("diary.newEntry")}</h3>
            <HealthDiaryEntryForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              loading={submitting}
            />
          </div>
        )}

        {/* Summary statistics */}
        <div className="hd-section">
          <h3 className="hd-section__title">{t("diary.stats")}</h3>
          <SummaryCard summary={summary} loading={loadingSummary} />
        </div>

        {/* Charts */}
        {!loadingEntries && entries.length >= MIN_CHART_ENTRIES && (
          <ChartsSection entries={entries} />
        )}

        {/* Entry list */}
        <div className="hd-section">
          <h3 className="hd-section__title">
            {t("diary.journal")}
            {!loadingEntries && entries.length > 0 && (
              <span className="hd-section__count">{entries.length}</span>
            )}
          </h3>

          {loadingEntries ? (
            <div className="hd-loading"><Spinner size={32} /></div>
          ) : (
            <HealthDiaryList
              entries={entries}
              onDelete={handleDelete}
              deleting={deleting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
