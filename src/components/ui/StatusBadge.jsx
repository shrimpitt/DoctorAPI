const MAP = {
  pending:   { label: "Ожидает",    bg: "#FFF7E6", color: "#B07D00" },
  confirmed: { label: "Подтверждён", bg: "#EDF5EC", color: "#3A7A34" },
  completed: { label: "Завершён",    bg: "#E8F0FE", color: "#1A56B0" },
  cancelled: { label: "Отменён",    bg: "#FEE8E8", color: "#B01A1A" },
  shipped:   { label: "Отправлен",  bg: "#EDE8FE", color: "#5B1AB0" },
  delivered: { label: "Доставлен",  bg: "#EDF5EC", color: "#3A7A34" },
};

export default function StatusBadge({ status }) {
  const s = MAP[status] ?? { label: status, bg: "#F0F0F0", color: "#555" };
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      background: s.bg,
      color: s.color,
    }}>
      {s.label}
    </span>
  );
}
