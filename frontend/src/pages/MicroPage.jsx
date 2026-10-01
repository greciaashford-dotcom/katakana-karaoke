import { CalendarCheck, Guitar, Info, Laugh, Mic2, Phone } from "lucide-react";
import { BUSINESS, TEL_URL } from "@/lib/constants";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { ReservationForm } from "@/components/ReservationForm";
import { FaqList } from "@/components/FaqList";
import { Reveal } from "@/components/Reveal";

const DISCIPLINES = [
  { icon: Mic2, title: "Canta en directo", text: "Tu versión, tu estilo. Sube al escenario con el repertorio de karaoke o con tu propia música." },
  { icon: Guitar, title: "Toca tu instrumento", text: "Trae tu guitarra, teclado o percusión y comparte escenario con otros músicos." },
  { icon: Laugh, title: "Prueba tu monólogo", text: "¿Humor? El micro también es para cómicos que quieren rodar material nuevo." },
];

const FAQ = [
  { q: "¿Qué días hay micro abierto?", a: "El micro abierto se celebra de lunes a jueves. Llámanos antes de venir para confirmar fechas y horario de cada semana." },
  { q: "¿Cómo me apunto?", a: "Envía la solicitud con el formulario (tipo «Micro abierto») o llámanos. Te confirmaremos turno y lo que necesitas." },
  { q: "¿Qué equipo técnico hay?", a: "Contamos con equipo de sonido digital y micrófonos. Si necesitas conexiones especiales para tu instrumento, indícalo en las notas." },
  { q: "¿Puedo venir solo a escuchar?", a: "¡Claro! El público es parte del micro abierto: barra, mesas altas y salón con vista al escenario." },
];

export default function MicroPage() {
  return (
    <SiteLayout title="Micro abierto de lunes a jueves" description="Micro abierto en Karaoke Katakana (Madrid) de lunes a jueves: canta, toca tu instrumento o haz tu monólogo en Avenida de América." testid="micro-page">
      <PageHero eyebrow="Katakana Garage" title={<>Micro abierto <span className="k-grad-text">de lunes a jueves</span></>} lead="Canta, toca tu instrumento o estrena tu monólogo delante de un público con ganas de escucharte." image="/images/noche-escenario.jpg" imageAlt="Escenario de Katakana iluminado" crumbs={[{ label: "Micro abierto" }]} testid="micro-hero">
        <div className="k-hero-actions">
          <a href="#apuntate" className="k-btn k-btn--primary" data-testid="micro-signup-anchor"><CalendarCheck /> Apúntate</a>
          <a href={TEL_URL} className="k-btn k-btn--ghost" data-testid="micro-call-button"><Phone /> {BUSINESS.phoneDisplay}</a>
        </div>
      </PageHero>

      <section className="k-section" style={{ paddingTop: 0 }} data-testid="micro-disciplines">
        <div className="k-container">
          <div className="k-steps">
            {DISCIPLINES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08} className="k-value">
                <span className="k-value-icon"><Icon /></span>
                <h3 className="k-h3">{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
          <div className="k-card" style={{ marginTop: 22, display: "flex", gap: 14, alignItems: "flex-start" }} data-testid="micro-notice">
            <Info style={{ width: 22, flex: "none", color: "var(--k-amber)" }} />
            <p className="k-text">Las fechas, el horario y los requisitos técnicos pueden variar según la semana. Confírmalos por teléfono antes de venir o envíanos tu solicitud.</p>
          </div>
        </div>
      </section>

      <section className="k-section k-section--alt" id="apuntate" style={{ scrollMarginTop: 80 }}>
        <div className="k-container">
          <div className="k-reserve">
            <div>
              <p className="k-eyebrow">Preguntas frecuentes</p>
              <h2 className="k-h2">Todo sobre el micro abierto</h2>
              <div style={{ marginTop: 32 }}><FaqList items={FAQ} testid="micro-faq" /></div>
            </div>
            <ReservationForm defaultType="micro" testid="micro-reservation-form" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
