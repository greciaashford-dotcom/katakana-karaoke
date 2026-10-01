import { useEffect, useState } from "react";
import { groupHours, openStatus, todayIndex } from "@/lib/hours";

export const useOpenStatus = (hours) => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = window.setInterval(() => setTick((n) => n + 1), 60_000); return () => window.clearInterval(t); }, []);
  return openStatus(hours, new Date(Date.now() + tick * 0));
};

export const OpenStatus = ({ hours, testid = "open-status" }) => {
  const status = useOpenStatus(hours);
  if (!status) return null;
  return <span className={`k-status ${status.open ? "is-open" : ""}`} data-testid={testid} data-open={status.open}><span className="k-status-dot" aria-hidden="true" />{status.label}</span>;
};

export const HoursList = ({ hours, note, testid = "hours-list" }) => {
  const today = todayIndex();
  return (
    <div data-testid={testid}>
      <div className="k-hours">
        {(hours || []).map((h) => (
          <div key={h.day} className={`k-hours-row ${h.day === today ? "is-today" : ""} ${h.closed ? "is-closed" : ""}`} data-testid={`hours-row-${h.day}`}>
            <span>{h.label}{h.day === today ? " · hoy" : ""}</span>
            <span>{h.closed ? "Cerrado" : `${h.open} – ${h.close}`}</span>
          </div>
        ))}
      </div>
      {note && <p className="k-hours-note" data-testid={`${testid}-note`}>{note}</p>}
    </div>
  );
};

export const HoursSummary = ({ hours }) => groupHours(hours).map((g) => <span key={g.label} style={{ display: "block" }}>{g.label}: {g.value}</span>);
