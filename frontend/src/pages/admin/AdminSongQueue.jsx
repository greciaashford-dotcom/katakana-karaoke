import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Mail, Music4, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";

const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export default function AdminSongQueue() {
  const client = useQueryClient();
  const [date, setDate] = useState(todayKey());
  const { data } = useQuery({ queryKey: ["admin-song-requests", date], queryFn: async () => (await api.get("/admin/song-requests", { params: { date } })).data });
  const items = data?.items || [];
  const queued = items.filter((i) => i.status === "queued");
  const played = items.filter((i) => i.status === "played");

  const toggle = async (item) => {
    await api.patch(`/admin/song-requests/${item.id}`, { status: item.status === "played" ? "queued" : "played" });
    client.invalidateQueries({ queryKey: ["admin-song-requests"] });
    client.invalidateQueries({ queryKey: ["admin-stats"] });
  };
  const remove = async (id) => {
    if (!window.confirm("¿Eliminar esta petición?")) return;
    await api.delete(`/admin/song-requests/${id}`);
    client.invalidateQueries({ queryKey: ["admin-song-requests"] });
    toast.success("Petición eliminada");
  };

  const Row = (item) => (
    <article key={item.id} className={item.status === "played" ? "queue-item is-played" : "queue-item"} data-testid={`queue-item-${item.id}`}>
      <button className="queue-check" onClick={() => toggle(item)} aria-label={item.status === "played" ? "Marcar pendiente" : "Marcar como sonada"} data-testid={`queue-toggle-${item.id}`}>
        {item.status === "played" ? <Check /> : <span className="queue-check-empty" />}
      </button>
      <div className="queue-info">
        <h3 data-testid={`queue-title-${item.id}`}>{item.title}</h3>
        <p data-testid={`queue-artist-${item.id}`}>{item.artist || "—"}</p>
      </div>
      <div className="queue-meta">
        <span data-testid={`queue-email-${item.id}`}><Mail /> {item.email}</span>
        <span><Clock /> {new Date(item.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div className="queue-actions">
        {item.status === "played" && <button onClick={() => toggle(item)} aria-label="Deshacer" data-testid={`queue-undo-${item.id}`}><Undo2 /></button>}
        <button onClick={() => remove(item.id)} aria-label="Eliminar" data-testid={`queue-delete-${item.id}`}><Trash2 /></button>
      </div>
    </article>
  );

  return (
    <div className="admin-page" data-testid="admin-queue-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">PETICIONES EN VIVO</p><h1 data-testid="admin-queue-heading">Cola de canciones</h1></div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value || todayKey())} className="queue-date-input" data-testid="queue-date-input" />
      </header>
      <div className="queue-columns">
        <section>
          <h2 className="queue-col-title"><Music4 /> Por sonar ({queued.length})</h2>
          <div className="queue-list" data-testid="queue-pending-list">
            {queued.map(Row)}
            {queued.length === 0 && <div className="empty-state" data-testid="queue-pending-empty">No hay canciones en cola.</div>}
          </div>
        </section>
        <section>
          <h2 className="queue-col-title"><Check /> Ya sonaron ({played.length})</h2>
          <div className="queue-list" data-testid="queue-played-list">
            {played.map(Row)}
            {played.length === 0 && <div className="empty-state" data-testid="queue-played-empty">Todavía nada sonó.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
