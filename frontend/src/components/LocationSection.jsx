import { Clock, MapPin, MessageCircle, Navigation, Phone, Train } from "lucide-react";
import { ADDRESS_LINE_1, ADDRESS_LINE_2, MAPS_EMBED_URL, MAPS_URL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/lib/constants";
import { Reveal } from "@/components/Reveal";

export const LocationSection = () => (
  <section id="ubicacion" className="section location-section" data-testid="location-section">
    <div className="location-grid">
      <Reveal className="location-copy">
        <p className="eyebrow" data-testid="location-eyebrow"><span /> DÓNDE ESTAMOS</p>
        <h2 data-testid="location-heading">Ven a cantar<br /><em>al barrio de Salamanca.</em></h2>
        <p className="location-lead" data-testid="location-description">En pleno Madrid, con acceso fácil en metro y a un paso de las mejores noches de la ciudad. Escríbenos y te guiamos hasta la puerta.</p>
        <ul className="location-facts">
          <li data-testid="location-address"><MapPin /><span>{ADDRESS_LINE_1}<br />{ADDRESS_LINE_2}</span></li>
          <li data-testid="location-metro"><Train /><span>Guindalera · Distrito de Salamanca</span></li>
          <li data-testid="location-hours"><Clock /><span>Consulta horarios y disponibilidad por WhatsApp</span></li>
        </ul>
        <div className="location-actions">
          <a href={MAPS_URL} target="_blank" rel="noreferrer" className="button button--primary" data-testid="location-directions-button"><Navigation /> Cómo llegar</a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="button button--ghost" data-testid="location-whatsapp-button"><MessageCircle /> WhatsApp</a>
          <a href={`tel:${PHONE_TEL}`} className="button button--ghost" data-testid="location-phone-button"><Phone /> {PHONE_DISPLAY}</a>
        </div>
      </Reveal>
      <Reveal className="location-map" delay={0.15}>
        <iframe title="Mapa de Okume Karaoke" src={MAPS_EMBED_URL} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" data-testid="location-map-iframe" />
        <a href={MAPS_URL} target="_blank" rel="noreferrer" className="location-map-badge" data-testid="location-map-badge"><MapPin /> Okume Karaoke · Abrir en Google Maps</a>
      </Reveal>
    </div>
  </section>
);
