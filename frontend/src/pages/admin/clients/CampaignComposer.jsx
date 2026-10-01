import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { sourceLabels } from "./labels";

const initial = { subject: "", message: "", ctaText: "Reserva tu mesa", ctaUrl: "", source: "" };

export const CampaignComposer = ({ subscribedCount, onSent }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState("");
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const valid = form.subject.trim() && form.message.trim();

  const sendTest = async () => {
    setBusy("test");
    try { const { data } = await api.post("/admin/campaigns/test", { ...form, email: user?.email }); toast.success(`Prueba enviada a ${data.to}`); }
    catch (error) { toast.error(error.response?.data?.error || "No se pudo enviar la prueba"); } finally { setBusy(""); }
  };
  const send = async (e) => {
    e.preventDefault();
    if (!valid) return;
    if (!window.confirm(`¿Enviar esta campaña a ${form.source ? `los suscritos con origen «${sourceLabels[form.source]}»` : `${subscribedCount} clientes suscritos`}?`)) return;
    setBusy("send");
    try {
      const { data } = await api.post("/admin/campaigns", form);
      toast.success(`Campaña en marcha: ${data.campaign.total} destinatarios. Puedes seguir el progreso en el historial.`);
      setForm(initial);
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      onSent();
    } catch (error) { toast.error(error.response?.data?.error || "No se pudo enviar la campaña"); } finally { setBusy(""); }
  };

  return (
    <section className="admin-form-section" data-testid="admin-campaign-composer">
      <div className="admin-section-title"><div><h2>Nueva campaña</h2><p>Solo se envía a clientes suscritos. Cada correo incluye tu marca y el enlace de baja obligatorio.</p></div></div>
      <form className="campaign-form" onSubmit={send}>
        <div className="campaign-grid">
          <label>Asunto<input required value={form.subject} onChange={set("subject")} placeholder="Ej: Noche especial de boleros este viernes" data-testid="campaign-subject-input" /></label>
          <label>Audiencia
            <select value={form.source} onChange={set("source")} data-testid="campaign-source-select">
              <option value="">Todos los suscritos ({subscribedCount})</option>
              {Object.entries(sourceLabels).map(([value, label]) => <option key={value} value={value}>Origen: {label}</option>)}
            </select>
          </label>
        </div>
        <label>Mensaje<textarea required value={form.message} onChange={set("message")} placeholder="Escribe aquí el cuerpo del correo. Separa párrafos con una línea en blanco." data-testid="campaign-message-input" /></label>
        <div className="campaign-grid">
          <label>Texto del botón<input value={form.ctaText} onChange={set("ctaText")} placeholder="Reserva tu mesa" data-testid="campaign-cta-text-input" /></label>
          <label>Enlace del botón <small>(opcional, por defecto reservas)</small><input value={form.ctaUrl} onChange={set("ctaUrl")} placeholder="https://www.karaokekatakana.com/reservas" data-testid="campaign-cta-url-input" /></label>
        </div>
        <div className="campaign-actions">
          <button type="button" className="admin-chip" disabled={!valid || Boolean(busy)} onClick={sendTest} data-testid="campaign-test-button"><FlaskConical /> {busy === "test" ? "Enviando prueba…" : `Enviarme una prueba`}</button>
          <button className="admin-save" disabled={!valid || Boolean(busy) || subscribedCount === 0} data-testid="campaign-send-button"><Send /> {busy === "send" ? "Enviando…" : "Enviar campaña"}</button>
        </div>
      </form>
    </section>
  );
};
