import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { EVENT_TYPES, eventTypeLabel } from "@/lib/constants";

const todayIso = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];
};

const initialForm = (eventType) => ({ eventType: EVENT_TYPES.some((t) => t.value === eventType) ? eventType : "karaoke", people: 4, date: "", time: "", name: "", email: "", contact: "", notes: "", consent: false });

export const ReservationForm = ({ defaultType = "karaoke", testid = "reservation-form" }) => {
  const [form, setForm] = useState(() => initialForm(defaultType));
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const setPeople = (n) => setForm({ ...form, people: Math.min(120, Math.max(1, Number(n) || 1)) });
  const stepValid = Boolean(form.date && form.time && form.people >= 1);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.consent) { toast.error("Acepta la política de privacidad para continuar"); return; }
    setSending(true);
    try {
      await api.post("/reservations", { ...form, people: Number(form.people) });
      setDone(true);
      toast.success("Solicitud de reserva enviada");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo enviar la reserva");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="k-form-panel" data-testid={`${testid}-success`}>
        <div className="k-success" data-testid="reservation-success-message">
          <div className="k-success-icon"><Check /></div>
          <h3 className="k-h3" style={{ fontSize: 28 }}>¡Solicitud recibida!</h3>
          <p>{eventTypeLabel(form.eventType)} para {form.people} {form.people === 1 ? "persona" : "personas"} el {new Date(`${form.date}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} a las {form.time}. Te contactaremos para confirmar la disponibilidad.</p>
          <button type="button" className="k-btn k-btn--ghost k-btn--sm" onClick={() => { setDone(false); setStep(0); setForm(initialForm(defaultType)); }} data-testid="new-reservation-button">Hacer otra reserva</button>
        </div>
      </div>
    );
  }

  return (
    <form className="k-form-panel" onSubmit={submit} data-testid={testid}>
      <div className="k-form-steps" data-testid="reservation-step-indicator">
        <span className={step === 0 ? "is-active" : ""}>1 · Tu plan</span>
        <i className={step === 1 ? "is-done" : ""} />
        <span className={step === 1 ? "is-active" : ""}>2 · Tus datos</span>
      </div>
      {step === 0 ? (
        <div data-testid="reservation-step-when">
          <div className="k-field">
            <span>¿Qué celebráis?</span>
            <div className="k-type-pills" role="radiogroup" aria-label="Tipo de evento">
              {EVENT_TYPES.map((t) => <button type="button" key={t.value} role="radio" aria-checked={form.eventType === t.value} className={`k-chip ${form.eventType === t.value ? "is-active" : ""}`} onClick={() => setForm({ ...form, eventType: t.value })} data-testid={`reservation-type-${t.value}`}>{t.label}</button>)}
            </div>
          </div>
          <div className="k-stepper">
            <span>Personas</span>
            <div>
              <button type="button" className="k-icon-btn" onClick={() => setPeople(form.people - 1)} aria-label="Menos personas" data-testid="reservation-people-minus"><Minus /></button>
              <strong data-testid="reservation-people-value">{form.people}</strong>
              <button type="button" className="k-icon-btn" onClick={() => setPeople(form.people + 1)} aria-label="Más personas" data-testid="reservation-people-plus"><Plus /></button>
            </div>
          </div>
          <div className="k-row-2">
            <label className="k-field">Fecha<input className="k-input" required type="date" min={todayIso()} value={form.date} onChange={update("date")} data-testid="reservation-date-input" /></label>
            <label className="k-field">Hora<input className="k-input" required type="time" value={form.time} onChange={update("time")} data-testid="reservation-time-input" /></label>
          </div>
          <button type="button" className="k-btn k-btn--primary k-btn--block" disabled={!stepValid} onClick={() => setStep(1)} data-testid="reservation-next-button">Continuar <ChevronRight /></button>
        </div>
      ) : (
        <div data-testid="reservation-step-contact">
          <label className="k-field">Nombre<input className="k-input" required value={form.name} onChange={update("name")} placeholder="Nombre de la reserva" autoComplete="name" data-testid="reservation-name-input" /></label>
          <div className="k-row-2">
            <label className="k-field">Correo electrónico<input className="k-input" required type="email" value={form.email} onChange={update("email")} placeholder="tucorreo@email.com" autoComplete="email" data-testid="reservation-email-input" /></label>
            <label className="k-field">Teléfono<input className="k-input" required type="tel" value={form.contact} onChange={update("contact")} placeholder="600 000 000" autoComplete="tel" data-testid="reservation-contact-input" /></label>
          </div>
          <label className="k-field">Notas <small>(opcional)</small><textarea className="k-textarea" value={form.notes} onChange={update("notes")} placeholder="Celebración, preferencias de zona o cualquier detalle" data-testid="reservation-notes-input" /></label>
          <label className="k-check" data-testid="reservation-consent-label">
            <input type="checkbox" checked={form.consent} onChange={update("consent")} data-testid="reservation-consent-checkbox" />
            <span>He leído y acepto la <Link to="/privacidad" target="_blank">política de privacidad</Link>. Usaremos tus datos para gestionar la reserva y, si no te opones, enviarte novedades de Katakana.</span>
          </label>
          <div className="k-form-actions">
            <button type="button" className="k-btn k-btn--ghost" onClick={() => setStep(0)} data-testid="reservation-back-button"><ChevronLeft /> Atrás</button>
            <button className="k-btn k-btn--primary" disabled={sending || !form.consent} data-testid="reservation-submit-button">{sending ? "Enviando…" : "Solicitar reserva"}</button>
          </div>
        </div>
      )}
    </form>
  );
};
