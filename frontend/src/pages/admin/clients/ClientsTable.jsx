import { BellOff, BellRing, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { sourceLabels } from "./labels";

const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" }) : "—");

export const ClientsTable = ({ items, onEdit, onRefresh }) => {
  const remove = async (client) => {
    if (!window.confirm(`¿Eliminar a ${client.email}?`)) return;
    await api.delete(`/admin/clients/${client.id}`);
    toast.success("Cliente eliminado");
    onRefresh();
  };
  const toggle = async (client) => {
    const subscribed = client.subscribed === false;
    await api.put(`/admin/clients/${client.id}`, { name: client.name, phone: client.phone, notes: client.notes, subscribed });
    toast.success(subscribed ? "Cliente suscrito de nuevo" : "Cliente dado de baja");
    onRefresh();
  };
  if (!items.length) return <div className="empty-state" data-testid="admin-clients-empty">No hay clientes con estos filtros. Importa un Excel o añade el primero.</div>;
  return (
    <div className="clients-table-wrap">
      <table className="clients-table" data-testid="clients-table">
        <thead><tr><th>Cliente</th><th>Teléfono</th><th>Origen</th><th>Alta</th><th>Último correo</th><th>Próximo envío</th><th>Estado</th><th aria-label="Acciones" /></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className={c.subscribed === false ? "is-unsubscribed" : ""} data-testid={`admin-client-${c.id}`}>
              <td><strong data-testid={`client-name-${c.id}`}>{c.name || "Invitado"}</strong><a href={`mailto:${c.email}`} data-testid={`client-email-${c.id}`}>{c.email}</a></td>
              <td data-testid={`client-phone-${c.id}`}>{c.phone || "—"}</td>
              <td><span className="client-source" data-testid={`client-source-${c.id}`}>{sourceLabels[c.source] || c.source}</span></td>
              <td>{fmt(c.createdAt)}</td>
              <td>{fmt(c.lastEmailAt)}</td>
              <td>{c.subscribed === false ? "—" : fmt(c.nextFollowupAt)}</td>
              <td><button type="button" className={`client-status ${c.subscribed === false ? "is-off" : "is-on"}`} onClick={() => toggle(c)} title={c.subscribed === false ? "Volver a suscribir" : "Dar de baja"} data-testid={`client-toggle-${c.id}`}>{c.subscribed === false ? <><BellOff /> Baja</> : <><BellRing /> Suscrito</>}</button></td>
              <td className="clients-row-actions">
                <button type="button" onClick={() => onEdit(c)} aria-label="Editar cliente" data-testid={`client-edit-${c.id}`}><Pencil /></button>
                <button type="button" onClick={() => remove(c)} aria-label="Eliminar cliente" data-testid={`client-delete-${c.id}`}><Trash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
