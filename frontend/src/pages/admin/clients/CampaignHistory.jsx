import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/api/client";
import { sourceLabels } from "./labels";

export const CampaignHistory = () => {
  const { data } = useQuery({ queryKey: ["admin-campaigns"], queryFn: async () => (await api.get("/admin/campaigns")).data.items, refetchInterval: (query) => (query.state.data?.some((c) => c.status === "sending") ? 3000 : false) });
  const items = data || [];
  return (
    <section className="admin-form-section" data-testid="admin-campaign-history">
      <div className="admin-section-title"><div><h2>Historial de campañas</h2><p>Progreso de envío, entregados y fallidos de cada campaña.</p></div></div>
      {!items.length && <div className="empty-state" data-testid="campaign-history-empty">Todavía no has enviado ninguna campaña.</div>}
      <div className="campaign-list">
        {items.map((c) => (
          <article key={c.id} data-testid={`campaign-${c.id}`}>
            <div className={`campaign-status ${c.status === "sending" ? "is-sending" : "is-done"}`}>{c.status === "sending" ? <Loader2 /> : <CheckCircle2 />}</div>
            <div className="campaign-info">
              <h3 data-testid={`campaign-subject-${c.id}`}>{c.subject}</h3>
              <p>{new Date(c.createdAt).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })} · {c.source ? `Origen: ${sourceLabels[c.source] || c.source}` : "Todos los suscritos"}</p>
            </div>
            <div className="campaign-metrics" data-testid={`campaign-metrics-${c.id}`}>
              <span><strong>{c.sent}</strong> enviados</span>
              <span><strong>{c.failed}</strong> fallidos</span>
              <span><strong>{c.total}</strong> total</span>
            </div>
            <div className="campaign-progress"><div style={{ width: `${c.total ? Math.round(((c.sent + c.failed) / c.total) * 100) : 0}%` }} /></div>
          </article>
        ))}
      </div>
    </section>
  );
};
