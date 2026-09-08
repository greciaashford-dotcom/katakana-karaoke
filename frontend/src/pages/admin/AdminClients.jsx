import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";

const sourceLabels = { web: "Web", reserva: "Reserva", cancion: "Petición de canción" };

export default function AdminClients() {
  const client = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-clients"], queryFn: async () => (await api.get("/admin/clients")).data.items });
  const [campaign, setCampaign] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const count = data?.length || 0;

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    await api.delete(`/admin/clients/${id}`);
    client.invalidateQueries({ queryKey: ["admin-clients"] });
    client.invalidateQueries({ queryKey: ["admin-stats"] });
    toast.success("Cliente eliminado");
  };

  const send = async (e) => {
    e.preventDefault();
    if (!campaign.subject || !campaign.message) return;
    if (!window.confirm(`¿Enviar esta campaña a ${count} clientes?`)) return;
    setSending(true);
    try {
      const { data: result } = await api.post("/admin/campaigns", campaign);
      toast.success(`Campaña enviada: ${result.sent} entregados${result.failed ? `, ${result.failed} fallidos` : ""}`);
      setCampaign({ subject: "", message: "" });
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo enviar la campaña");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-page" data-testid="admin-clients-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">EMAIL MARKETING</p><h1 data-testid="admin-clients-heading">Clientes</h1></div>
        <span data-testid="admin-clients-count">{count} contactos</span>
      </header>

      <section className="admin-form-section" data-testid="admin-campaign-composer">
        <div className="admin-section-title"><div><h2>Campaña de email</h2><p>Envía novedades y promociones a todos tus clientes vía Resend.</p></div></div>
        <form className="campaign-form" onSubmit={send}>
          <label>Asunto<input required value={campaign.subject} onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })} placeholder="Ej: Noche especial de boleros este viernes" data-testid="campaign-subject-input" /></label>
          <label>Mensaje<textarea required value={campaign.message} onChange={(e) => setCampaign({ ...campaign, message: e.target.value })} placeholder="Escribe aquí el cuerpo del correo…" data-testid="campaign-message-input" /></label>
          <button className="admin-save" disabled={sending || count === 0} data-testid="campaign-send-button"><Send /> {sending ? "Enviando…" : `Enviar a ${count} clientes`}</button>
        </form>
      </section>

      <section className="admin-form-section" data-testid="admin-clients-list-section">
        <div className="admin-section-title"><div><h2>Lista de clientes</h2><p>Contactos capturados desde reservas y peticiones de canciones.</p></div></div>
        <div className="clients-list">
          {data?.map((c) => (
            <article key={c.id} data-testid={`admin-client-${c.id}`}>
              <div className="client-avatar"><Users /></div>
              <div className="client-info">
                <h3 data-testid={`client-name-${c.id}`}>{c.name || "Invitado"}</h3>
                <a href={`mailto:${c.email}`} data-testid={`client-email-${c.id}`}><Mail /> {c.email}</a>
              </div>
              <span className="client-source" data-testid={`client-source-${c.id}`}>{sourceLabels[c.source] || c.source}</span>
              <span className="client-date">{new Date(c.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</span>
              <button className="delete-row" onClick={() => remove(c.id)} aria-label="Eliminar cliente" data-testid={`client-delete-${c.id}`}><Trash2 /></button>
            </article>
          ))}
        </div>
        {count === 0 && <div className="empty-state" data-testid="admin-clients-empty">Aún no hay clientes registrados.</div>}
      </section>
    </div>
  );
}
