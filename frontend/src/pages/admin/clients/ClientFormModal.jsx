import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { useEscape } from "@/lib/useEscape";

export const ClientFormModal = ({ client, onClose, onSaved }) => {
  useEscape(onClose);
  const [form, setForm] = useState({ email: client?.email || "", name: client?.name || "", phone: client?.phone || "", notes: client?.notes || "", subscribed: client ? client.subscribed !== false : true });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (client) await api.put(`/admin/clients/${client.id}`, form); else await api.post("/admin/clients", form);
      toast.success(client ? "Cliente actualizado" : "Cliente añadido");
      onSaved(); onClose();
    } catch (error) { toast.error(error.response?.data?.error || "No se pudo guardar"); } finally { setSaving(false); }
  };
  return (
    <div className="admin-modal-backdrop" onClick={onClose} data-testid="client-form-modal">
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar" data-testid="client-form-close"><X /></button>
        <h2>{client ? "Editar cliente" : "Nuevo cliente"}</h2>
        <label>Correo<input required type="email" value={form.email} onChange={set("email")} disabled={Boolean(client)} placeholder="cliente@email.com" data-testid="client-form-email" /></label>
        <label>Nombre<input value={form.name} onChange={set("name")} placeholder="Nombre y apellidos" data-testid="client-form-name" /></label>
        <label>Teléfono<input value={form.phone} onChange={set("phone")} placeholder="+34 600 000 000" data-testid="client-form-phone" /></label>
        <label>Notas<textarea value={form.notes} onChange={set("notes")} placeholder="Cumpleaños, preferencias, grupo habitual…" data-testid="client-form-notes" /></label>
        <label className="admin-checkbox"><input type="checkbox" checked={form.subscribed} onChange={set("subscribed")} data-testid="client-form-subscribed" /> Suscrito a correos automáticos y campañas</label>
        {!client && <p className="admin-hint">Los clientes añadidos manualmente no reciben el correo de bienvenida; entran directamente en el ciclo de seguimiento de 130 h.</p>}
        <button className="admin-save" disabled={saving} data-testid="client-form-submit">{saving ? "Guardando…" : "Guardar"}</button>
      </form>
    </div>
  );
};
