import { MapPin, Navigation, Phone } from "lucide-react";
import { HoursList, OpenStatus } from "@/components/OpenStatus";
import { BUSINESS, DIRECTIONS_URL, MAPS_EMBED_URL, MAPS_URL, TEL_URL } from "@/lib/constants";

export const LocationSection = ({ settings, testid = "location-section" }) => (
  <section className="k-section k-section--alt" id="ubicacion" data-testid={testid}>
    <div className="k-container">
      <div className="k-location">
        <div>
          <p className="k-eyebrow">Visítanos</p>
          <h2 className="k-h2">{BUSINESS.address1}</h2>
          <p className="k-text" style={{ marginTop: 18 }}>{BUSINESS.address2} · Junto al intercambiador de Avenida de América (Metro L4, L6, L7 y L9) y con conexión directa en autobús con el aeropuerto.</p>
          <div style={{ marginTop: 26 }}><OpenStatus hours={settings?.hours} testid="location-open-status" /></div>
          <HoursList hours={settings?.hours} note={settings?.hoursNote} />
          <div className="k-actions">
            <a href={DIRECTIONS_URL} target="_blank" rel="noreferrer" className="k-btn k-btn--primary" data-testid="location-directions-button"><Navigation /> Cómo llegar</a>
            <a href={TEL_URL} className="k-btn k-btn--ghost" data-testid="location-call-button"><Phone /> {BUSINESS.phoneDisplay}</a>
          </div>
        </div>
        <div className="k-map">
          <iframe title="Mapa de Karaoke Katakana" src={MAPS_EMBED_URL} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" data-testid="location-map" />
          <a href={MAPS_URL} target="_blank" rel="noreferrer" className="k-map-badge" data-testid="location-map-badge"><MapPin /> Abrir en Google Maps</a>
        </div>
      </div>
    </div>
  </section>
);
