import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BellOff, BellRing, Check, MailX } from "lucide-react";
import { api } from "@/api/client";
import { SiteLayout } from "@/components/SiteLayout";

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState({ loading: true, error: "", email: "", subscribed: true, changed: false });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!token) { setState({ loading: false, error: "Este enlace no es válido.", email: "", subscribed: true, changed: false }); return; }
    api.get(`/unsubscribe/${token}`).then(({ data }) => setState({ loading: false, error: "", email: data.email, subscribed: data.subscribed, changed: false }))
      .catch(() => setState({ loading: false, error: "Este enlace de baja no es válido o ha caducado.", email: "", subscribed: true, changed: false }));
  }, [token]);
  const update = async (subscribed) => {
    setBusy(true);
    try { const { data } = await api.post(`/unsubscribe/${token}`, { subscribed }); setState((s) => ({ ...s, subscribed: data.subscribed, changed: true })); } finally { setBusy(false); }
  };
  return (
    <SiteLayout title="Preferencias de correo" testid="unsubscribe-page">
      <div style={{ padding: "150px 20px 90px" }}>
      <section className="unsubscribe-card">
        {state.loading ? <p data-testid="unsubscribe-loading">Comprobando tu enlace…</p> : state.error ? (
          <><div className="unsubscribe-icon"><MailX /></div><h1 data-testid="unsubscribe-error">{state.error}</h1><Link to="/" className="button button--primary" data-testid="unsubscribe-home-link">Volver a Katakana</Link></>
        ) : state.subscribed ? (
          <>
            <div className="unsubscribe-icon"><BellRing /></div>
            <p className="eyebrow"><span /> PREFERENCIAS DE CORREO</p>
            <h1 data-testid="unsubscribe-title">{state.changed ? "¡Volvemos a estar en contacto!" : "¿Quieres dejar de recibir nuestros correos?"}</h1>
            <p className="unsubscribe-email" data-testid="unsubscribe-email">Cuenta: <strong>{state.email}</strong></p>
            <p>Si te das de baja dejarás de recibir nuestras novedades, promociones y recordatorios para volver a cantar en Katakana.</p>
            <button className="button button--primary" disabled={busy} onClick={() => update(false)} data-testid="unsubscribe-confirm-button"><BellOff /> {busy ? "Un momento…" : "Darme de baja"}</button>
          </>
        ) : (
          <>
            <div className="unsubscribe-icon is-done"><Check /></div>
            <p className="eyebrow"><span /> BAJA CONFIRMADA</p>
            <h1 data-testid="unsubscribe-done-title">Ya no recibirás más correos de Katakana</h1>
            <p className="unsubscribe-email" data-testid="unsubscribe-email">Cuenta: <strong>{state.email}</strong></p>
            <p>Te echaremos de menos en el escenario. Si cambias de idea, puedes volver a suscribirte con un clic.</p>
            <div className="unsubscribe-actions">
              <button className="button button--ghost-dark" disabled={busy} onClick={() => update(true)} data-testid="resubscribe-button"><BellRing /> Volver a suscribirme</button>
              <Link to="/" className="button button--primary" data-testid="unsubscribe-home-link">Volver a Katakana</Link>
            </div>
          </>
        )}
      </section>
      </div>
    </SiteLayout>
  );
}
