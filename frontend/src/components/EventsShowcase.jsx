import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { EVENTS, MICRO_EVENT } from "@/lib/events";
import { EVENTS_PATH, MICRO_PATH } from "@/lib/constants";

const ITEMS = [...EVENTS, { ...MICRO_EVENT, imageAlt: "Escenario de Katakana durante una noche de micro abierto" }];

export const EventsShowcase = () => (
  <div className="k-events-grid" data-testid="events-grid">
    {ITEMS.map(({ slug, icon: Icon, short, teaser, image, imageAlt }) => (
      <Link key={slug} to={slug === MICRO_EVENT.slug ? MICRO_PATH : `${EVENTS_PATH}/${slug}`} className="k-event-card" data-testid={`event-card-${slug}`}>
        <img src={image} alt={imageAlt || short} loading="lazy" />
        <div className="k-event-body">
          <span className="k-event-icon"><Icon /></span>
          <h3 className="k-h3">{short}</h3>
          <p>{teaser}</p>
          <span className="k-link">Ver más <ArrowRight /></span>
        </div>
      </Link>
    ))}
  </div>
);
