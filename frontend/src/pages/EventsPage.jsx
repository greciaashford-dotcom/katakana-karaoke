import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, CheckCircle2, Phone } from "lucide-react";
import { EVENT_STEPS } from "@/lib/events";
import { BUSINESS, LOCAL_PATH, RESERVE_PATH, TEL_URL } from "@/lib/constants";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { EventsShowcase } from "@/components/EventsShowcase";
import { ReserveCta } from "@/components/ReserveCta";
import { Reveal } from "@/components/Reveal";

const ZONES = ["Una barra amplia para tomar algo y animar a quien canta", "Mesas altas con vista directa al escenario", "Salón interior con butacas junto al escenario"];

export default function EventsPage() {
  return (
    <SiteLayout title="Eventos y celebraciones con karaoke" description="Cumpleaños, despedidas, afterworks, fiestas de empresa, karaoke infantil y fiestas privadas en Karaoke Katakana, Avenida de América (Madrid)." testid="events-page">
      <PageHero eyebrow="Eventos" title={<>Celebra con <span className="k-grad-text">banda sonora propia</span></>} lead="Cumpleaños, despedidas, afterworks, fiestas de empresa, karaoke infantil y fiestas privadas en Avenida de América." image="/images/evento-grupo.jpg" imageAlt="Grupo de amigos cantando juntos en Katakana" crumbs={[{ label: "Eventos" }]} testid="events-hero">
        <div className="k-hero-actions">
          <Link to={RESERVE_PATH} className="k-btn k-btn--primary" data-testid="events-hero-reserve"><CalendarCheck /> Solicitar reserva</Link>
          <a href={TEL_URL} className="k-btn k-btn--ghost" data-testid="events-hero-call"><Phone /> {BUSINESS.phoneDisplay}</a>
        </div>
      </PageHero>

      <section className="k-section" style={{ paddingTop: 0 }}>
        <div className="k-container"><EventsShowcase /></div>
      </section>

      <section className="k-section k-section--alt" data-testid="events-steps-section">
        <div className="k-container">
          <Reveal className="k-heading">
            <div><p className="k-eyebrow">Cómo funciona</p><h2 className="k-h2">Tres pasos y <span className="k-grad-text">a cantar</span></h2></div>
            <p>Sin complicaciones: nos cuentas tu plan y nosotros te ayudamos a organizarlo.</p>
          </Reveal>
          <div className="k-steps">
            {EVENT_STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08} className="k-step" data-testid={`events-step-${i}`}>
                <span className="k-step-num k-grad-text">0{i + 1}</span>
                <h3 className="k-h3">{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="k-section" data-testid="events-zones-section">
        <div className="k-container">
          <div className="k-grid-2">
            <Reveal className="k-media k-media--wide"><img src="/images/local-zona-mesas.jpg" alt="Zona de mesas de Katakana con vista al escenario" loading="lazy" /></Reveal>
            <Reveal delay={0.1}>
              <p className="k-eyebrow">Tres ambientes</p>
              <h2 className="k-h2">Un espacio para cada grupo</h2>
              <p className="k-text" style={{ margin: "18px 0 24px" }}>Las tres zonas del local están comunicadas: quien quiere cantar tiene el escenario cerca y quien prefiere charlar encuentra su sitio.</p>
              <ul className="k-list">{ZONES.map((z) => <li key={z}><CheckCircle2 /> {z}</li>)}</ul>
              <Link to={LOCAL_PATH} className="k-link" style={{ marginTop: 26 }} data-testid="events-local-link">Conoce el local <ArrowRight /></Link>
            </Reveal>
          </div>
        </div>
      </section>

      <ReserveCta title="¿Organizamos tu celebración?" text="Envíanos fecha, número de personas y qué celebráis. Te respondemos con disponibilidad y condiciones." />
    </SiteLayout>
  );
}
