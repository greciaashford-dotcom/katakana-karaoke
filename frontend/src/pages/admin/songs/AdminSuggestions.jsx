import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Mail, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { SongFormModal } from "./SongFormModal";

const TABS = [
  { value: "pending", label: "Pendientes" },
  { value: "added", label: "Añadidas" },
  { value: "rejected", label: "Descartadas" },
  { value: "", label: "Todas" },
];
const STATUS_LABEL = { pending: "Pendiente", added: "Añadida", rejected: "Descartada" };
const fmt = (iso) => new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function AdminSuggestions() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pending");
  const [adding, setAdding] = useState(null);
  const { data } = useQuery({ queryKey: ["admin-suggestions", status], queryFn: async () => (await api.get("/admin/song-suggestions", { params: { status } })).data });
  const items = data?.items || [];
  const refresh = () => ["admin-suggestions", "admin-stats", "admin-songs"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  const setItemStatus = async (item, value) => {
    await api.patch(`/admin/song-suggestions/${item.id}`, { status: value });
    toast.success(value === "added" ? "Marcada como añadida" : value === "rejected" ? "Sugerencia descartada" : "Vuelve a pendientes");
    refresh();
  };
  const remove = async (item) => {
    if (!window.confirm(`¿Eliminar la sugerencia «${item.title}»?`)) return;
    await api.delete(`/admin/song-suggestions/${item.id}`);
    toast.success("Sugerencia eliminada");
    refresh();
  };
  const onAdded = async () => {
    await api.patch(`/admin/song-suggestions/${adding.id}`, { status: "added" });
    refresh();
  };

  return (
    <div className="admin-page" data-testid="admin-suggestions-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">PETICIONES DEL PÚBLICO</p><h1 data-testid="admin-suggestions-heading">Sugerencias de canciones</h1></div>
      </header>
      <div className="admin-tabs" role="tablist" data-testid="admin-suggestions-tabs">
        {TABS.map((t) => <button key={t.label} role="tab" aria-selected={status === t.value} className={status === t.value ? "is-active" : ""} onClick={() => setStatus(t.value)} data-testid={`suggestions-tab-${t.value || "all"}`}>{t.label}</button>)}
      </div>
      <section className="admin-form-section">
        {!items.length ? <div className="empty-state" data-testid="admin-suggestions-empty">No hay sugerencias en esta vista.</div> : (
          <div className="suggestion-list" data-testid="admin-suggestions-list">
            {items.map((item) => (
              <article key={item.id} className={`suggestion-item is-${item.status}`} data-testid={`suggestion-${item.id}`}>
                <div>
                  <h3 data-testid={`suggestion-title-${item.id}`}>{item.title}</h3>
                  <p>{item.artist}</p>
                  <small>
                    {fmt(item.createdAt)} · <span className="client-source">{STATUS_LABEL[item.status]}</span>
                    {item.email && <> · <a href={`mailto:${item.email}`}><Mail style={{ width: 13, verticalAlign: "-2px" }} /> {item.email}</a></>}
                  </small>
                  {item.notes && <p className="suggestion-notes">{item.notes}</p>}
                </div>
                <div className="suggestion-actions">
                  {item.status === "pending" && <button type="button" className="admin-save" onClick={() => setAdding(item)} data-testid={`suggestion-add-${item.id}`}><Plus /> Añadir al catálogo</button>}
                  {item.status !== "added" && <button type="button" className="admin-chip" onClick={() => setItemStatus(item, "added")} data-testid={`suggestion-mark-added-${item.id}`}><Check /> Ya está</button>}
                  {item.status === "pending" && <button type="button" className="admin-chip" onClick={() => setItemStatus(item, "rejected")} data-testid={`suggestion-reject-${item.id}`}><X /> Descartar</button>}
                  {item.status !== "pending" && <button type="button" className="admin-chip" onClick={() => setItemStatus(item, "pending")} data-testid={`suggestion-reset-${item.id}`}><RotateCcw /> Pendiente</button>}
                  <button type="button" className="admin-chip" onClick={() => remove(item)} aria-label="Eliminar sugerencia" data-testid={`suggestion-delete-${item.id}`}><Trash2 /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {adding && <SongFormModal initial={adding} onClose={() => setAdding(null)} onSaved={onAdded} />}
    </div>
  );
}
