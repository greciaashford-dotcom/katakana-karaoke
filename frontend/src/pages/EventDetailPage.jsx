import { Link, Navigate, useParams } from "react-router-dom";
import { CalendarCheck, CheckCircle2, ListMusic } from "lucide-react";
import { EVENTS, findEvent } from "@/lib/events";
import { CATALOG_PATH, EVENTS_PATH } from "@/lib/constants";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { ReservationForm } from "@/components/ReservationForm";
import { FaqList } from "@/components/FaqList";
import { Reveal } from "@/components/Reveal";

export default function EventDetailPage() {
  const { slug } = useParams();
  const event = findEvent(slug);
  if (!event) return <Navigate to={EVENTS_PATH} replace />;
  const others = EVENTS.filter((e) => e.slug !== event.slug);
  return (
    <SiteLayout title={event.title} description={event.intro} testid={`event-page-${event.slug}`}>
      <PageHero eyebrow={event.eyebrow} title={event.title} lead={event.teaser} crumbs={[{ label: "Eventos", to: EVENTS_PATH }, { label: event.short }]} testid="event-hero" />
      <section className="k-section" style={{ paddingTop: 0 }}>
        <div className="k-container">
          <div className="k-grid-2">
            <Reveal>
              <p className="k-lead" data-testid="event-intro">{event.intro}</p>
              <ul className="k-list" style={{ marginTop: 28 }} data-testid="event-highlights">
                {event.highlights.map((h) => <li key={h}><CheckCircle2 /> {h}</li>)}
              </ul>
              <div className="k-actions">
                <a href="#reservar" className="k-btn k-btn--primary" data-testid="event-reserve-anchor"><CalendarCheck /> Solicitar reserva</a>
                {event.catalogLink && <Link to={`${CATALOG_PATH}?artist=${encodeURIComponent(event.catalogLink.artist)}`} className="k-btn k-btn--ghost" data-testid="event-catalog-link"><ListMusic /> {event.catalogLink.label}</Link>}
              </div>
            </Reveal>
            <Reveal delay={0.1} className="k-media k-media--tall"><img src={event.image} alt={event.imageAlt} data-testid="event-image" /></Reveal>
          </div>
        </div>
      </section>

      <section className="k-section k-section--alt" id="reservar" style={{ scrollMarginTop: 80 }}>
        <div className="k-container">
          <div className="k-reserve">
            <div>
              <p className="k-eyebrow">Preguntas frecuentes</p>
              <h2 className="k-h2">Lo que suelen preguntarnos</h2>
              <div style={{ marginTop: 32 }}><FaqList items={event.faq} testid="event-faq" /></div>
            </div>
            <ReservationForm defaultType={event.type} testid="event-reservation-form" />
          </div>
        </div>
      </section>

      <section className="k-section k-section--tight" data-testid="event-others">
        <div className="k-container">
          <p className="k-eyebrow">Otras celebraciones</p>
          <div className="k-tag-list" style={{ marginTop: 18 }}>
            {others.map((o) => <Link key={o.slug} to={`${EVENTS_PATH}/${o.slug}`} className="k-tag" data-testid={`event-other-${o.slug}`}>{o.short}</Link>)}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
