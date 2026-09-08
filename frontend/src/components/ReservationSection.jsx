import { useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Minus, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";

const initial = { name: "", people: 2, date: "", time: "", email: "", contact: "", notes: "" };

export const ReservationSection = () => {
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setPeople = (n) => setForm({ ...form, people: Math.min(40, Math.max(1, n)) });
  const step0Valid = Boolean(form.date && form.time && form.people >= 1);
  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/reservations", { ...form, people: Number(form.people) });
      setDone(true);
      toast.success("Solicitud de mesa enviada");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo enviar la reserva");
    } finally {
      setSending(false);
    }
  };
  const reset = () => { setDone(false); setStep(0); setForm(initial); };

  return (
    <section id="reservas" className="section reservation-section" data-testid="reservation-section">
      <div className="reservation-copy">
        <p className="eyebrow" data-testid="reservation-eyebrow"><span /> TU NOCHE EMPIEZA AQUÍ</p>
        <h2 data-testid="reservation-heading">Reserva tu mesa.<br /><em>El escenario es tuyo.</em></h2>
        <p data-testid="reservation-description">Cuéntanos cuándo vienes y prepararemos una experiencia a tu medida en el corazón de Madrid.</p>
        <div className="reservation-facts">
          <span data-testid="reservation-capacity-info"><Users /> Grupos de 1 a 40</span>
          <span data-testid="reservation-response-info"><CalendarDays /> Confirmación personal</span>
        </div>
      </div>
      <div className="reservation-panel">
        {done ? (
          <div className="success-state" data-testid="reservation-success-message">
            <Check />
            <h3>Solicitud recibida</h3>
            <p>Nos pondremos en contacto contigo para confirmar disponibilidad. Revisa tu correo: te hemos dado la bienvenida.</p>
            <button className="text-button" onClick={reset} data-testid="new-reservation-button">Nueva reserva</button>
          </div>
        ) : (
          <form onSubmit={submit} data-testid="reservation-form">
            <div className="reservation-steps" data-testid="reservation-step-indicator">
              <span className={step === 0 ? "is-active" : ""}>1 · Cuándo</span>
              <span className="reservation-steps-line" />
              <span className={step === 1 ? "is-active" : ""}>2 · Contacto</span>
            </div>
            {step === 0 ? (
              <div className="reservation-step" data-testid="reservation-step-when">
                <div className="people-stepper">
                  <span>Personas</span>
                  <div>
                    <button type="button" onClick={() => setPeople(form.people - 1)} aria-label="Menos personas" data-testid="reservation-people-minus"><Minus /></button>
                    <strong data-testid="reservation-people-value">{form.people}</strong>
                    <button type="button" onClick={() => setPeople(form.people + 1)} aria-label="Más personas" data-testid="reservation-people-plus"><Plus /></button>
                  </div>
                </div>
                <div className="form-row">
                  <label>Fecha<input required type="date" min={new Date().toISOString().split("T")[0]} value={form.date} onChange={update("date")} data-testid="reservation-date-input" /></label>
                  <label>Hora<input required type="time" value={form.time} onChange={update("time")} data-testid="reservation-time-input" /></label>
                </div>
                <button type="button" className="button button--cream button--wide" disabled={!step0Valid} onClick={() => setStep(1)} data-testid="reservation-next-button">Continuar <ChevronRight /></button>
              </div>
            ) : (
              <div className="reservation-step" data-testid="reservation-step-contact">
                <label>Nombre<input required value={form.name} onChange={update("name")} placeholder="Nombre de la reserva" data-testid="reservation-name-input" /></label>
                <label>Correo electrónico<input required type="email" value={form.email} onChange={update("email")} placeholder="tucorreo@email.com" data-testid="reservation-email-input" /></label>
                <label>Teléfono<input required value={form.contact} onChange={update("contact")} placeholder="Tu teléfono de contacto" data-testid="reservation-contact-input" /></label>
                <label>Notas <small>(opcional)</small><textarea value={form.notes} onChange={update("notes")} placeholder="Celebración, preferencias o cualquier detalle" data-testid="reservation-notes-input" /></label>
                <div className="reservation-step-actions">
                  <button type="button" className="button button--ghost-dark" onClick={() => setStep(0)} data-testid="reservation-back-button"><ChevronLeft /> Atrás</button>
                  <button className="button button--cream" disabled={sending} data-testid="reservation-submit-button">{sending ? "Enviando…" : "Solicitar mesa"}</button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
};
