export const HoursEditor = ({ hours, onChange }) => {
  const set = (day, patch) => onChange(hours.map((h) => (h.day === day ? { ...h, ...patch } : h)));
  return (
    <div className="hours-editor" data-testid="admin-hours-editor">
      {hours.map((h) => (
        <div key={h.day} className={`hours-editor-row ${h.closed ? "is-closed" : ""}`} data-testid={`admin-hours-row-${h.day}`}>
          <strong>{h.label}</strong>
          <label className="admin-checkbox"><input type="checkbox" checked={h.closed} onChange={(e) => set(h.day, { closed: e.target.checked, open: e.target.checked ? "" : h.open || "20:00", close: e.target.checked ? "" : h.close || "03:30" })} data-testid={`admin-hours-closed-${h.day}`} /> Cerrado</label>
          <input type="time" value={h.open} disabled={h.closed} onChange={(e) => set(h.day, { open: e.target.value })} aria-label={`Apertura ${h.label}`} data-testid={`admin-hours-open-${h.day}`} />
          <span>a</span>
          <input type="time" value={h.close} disabled={h.closed} onChange={(e) => set(h.day, { close: e.target.value })} aria-label={`Cierre ${h.label}`} data-testid={`admin-hours-close-${h.day}`} />
        </div>
      ))}
    </div>
  );
};
