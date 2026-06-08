import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";
import { KZ_CITIES, WAREHOUSE_COORDS } from "../data/kzCities";
import "./DeliveryMap.css";

/* ── Progress per status ── */
const STATUS_PROGRESS = {
  new:        0,
  pending:    0,
  confirmed:  0.2,
  processing: 0.35,
  shipped:    0.55,
  delivered:  1,
};

const STATUS_COLOR = {
  new:        "#94A3B8",
  pending:    "#94A3B8",
  confirmed:  "#3B82F6",
  processing: "#8B5CF6",
  shipped:    "#F59E0B",
  delivered:  "#10B981",
};

/* ── Leaflet DivIcon helpers ── */
function makeIcon(emoji, size = 36) {
  return L.divIcon({
    html: `<div class="dlv-emoji-icon" style="font-size:${size}px">${emoji}</div>`,
    className: "",
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2 + 4)],
  });
}

const ICON_WAREHOUSE = makeIcon("📦", 32);
const ICON_DEST      = makeIcon("🏠", 32);
const ICON_COURIER   = makeIcon("🚚", 34);

/* ── Linear interpolation between two coords ── */
function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/* ── Translate status key ── */
function statusLabel(status, t) {
  return t(`status.${status}`, { defaultValue: status || "—" });
}

export default function DeliveryMap({ order, onClose }) {
  const { t } = useTranslation();

  const destCity   = order?.city || "Алматы";
  const destCoords = KZ_CITIES[destCity] || KZ_CITIES["Алматы"];
  const status     = order?.status || null;

  /* Initial progress from status */
  const initProgress = STATUS_PROGRESS[status] ?? 0.05;
  const [progress, setProgress] = useState(initProgress);

  /* Animate courier */
  useEffect(() => {
    setProgress(STATUS_PROGRESS[status] ?? 0.05);
  }, [status]);

  useEffect(() => {
    let id;
    if (status === "shipped") {
      /* Animate from current position toward ~0.82 */
      id = setInterval(() => {
        setProgress((p) => (p >= 0.82 ? 0.82 : p + 0.008));
      }, 80);
    } else if (!status) {
      /* Demo: advance 10% every 5 seconds */
      id = setInterval(() => {
        setProgress((p) => (p >= 1 ? 1 : p + 0.1));
      }, 5000);
    }
    return () => clearInterval(id);
  }, [status]);

  const courierPos = useMemo(
    () => lerp(WAREHOUSE_COORDS, destCoords, progress),
    [progress, destCoords]
  );

  const routePoints = useMemo(
    () => [WAREHOUSE_COORDS, destCoords],
    [destCoords]
  );

  const pct = Math.round(progress * 100);
  const statusColor = STATUS_COLOR[status] || "#94A3B8";

  /* Suppress "duplicate key" Leaflet warning when city === Астана */
  const destIsWarehouse =
    destCoords[0] === WAREHOUSE_COORDS[0] && destCoords[1] === WAREHOUSE_COORDS[1];

  return (
    <div className="dlv-overlay" onClick={onClose}>
      <div className="dlv-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="dlv-header">
          <h2 className="dlv-title">{t("delivery.modalTitle")}</h2>
          <button className="dlv-close" onClick={onClose} aria-label={t("delivery.close")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Map */}
        <div className="dlv-map-wrap">
          <MapContainer
            center={[48.0, 67.0]}
            zoom={5}
            className="dlv-map"
            zoomControl={true}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Route line — dashed purple */}
            <Polyline
              positions={routePoints}
              pathOptions={{ color: "#5B4FCF", weight: 3, dashArray: "10 8", opacity: 0.8 }}
            />

            {/* Warehouse marker */}
            <Marker position={WAREHOUSE_COORDS} icon={ICON_WAREHOUSE}>
              <Popup>{t("delivery.warehouse")}</Popup>
            </Marker>

            {/* Destination marker */}
            {!destIsWarehouse && (
              <Marker position={destCoords} icon={ICON_DEST}>
                <Popup>{destCity}</Popup>
              </Marker>
            )}

            {/* Courier marker (animated) */}
            <Marker position={courierPos} icon={ICON_COURIER} zIndexOffset={1000}>
              <Popup>🚚 {t("delivery.progressLabel")}: {pct}%</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Info panel */}
        <div className="dlv-info">
          <div className="dlv-info__row">
            <div className="dlv-info__item">
              <span className="dlv-info__label">{t("delivery.from")}</span>
              <span className="dlv-info__value">📦 Астана</span>
            </div>
            <div className="dlv-info__arrow">→</div>
            <div className="dlv-info__item">
              <span className="dlv-info__label">{t("delivery.to")}</span>
              <span className="dlv-info__value">🏠 {destCity}</span>
            </div>
          </div>

          <div className="dlv-info__row dlv-info__row--spread">
            <div className="dlv-info__item">
              <span className="dlv-info__label">{t("delivery.statusLabel")}</span>
              <span
                className="dlv-badge"
                style={{ background: statusColor + "20", color: statusColor, border: `1px solid ${statusColor}40` }}
              >
                {statusLabel(status, t)}
              </span>
            </div>
            <div className="dlv-info__item">
              <span className="dlv-info__label">{t("delivery.etaLabel")}</span>
              <span className="dlv-info__value">{t("delivery.etaValue")}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="dlv-progress">
            <div className="dlv-progress__header">
              <span className="dlv-info__label">{t("delivery.progressLabel")}</span>
              <span className="dlv-progress__pct" style={{ color: statusColor }}>{pct}%</span>
            </div>
            <div className="dlv-progress__track">
              <div
                className="dlv-progress__fill"
                style={{ width: `${pct}%`, background: statusColor }}
              />
            </div>
            <div className="dlv-progress__labels">
              <span>📦 Астана</span>
              <span>{destCity} 🏠</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
