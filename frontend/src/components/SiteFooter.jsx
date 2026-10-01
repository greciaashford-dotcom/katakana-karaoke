import { Link } from "react-router-dom";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { BUSINESS, CATALOG_PATH, CONTACT_PATH, DEFAULT_LOGO, EVENTS_PATH, LOCAL_PATH, MAIL_URL, MAPS_URL, MICRO_PATH, RESERVE_PATH, TEL_URL } from "@/lib/constants";
import { groupHours } from "@/lib/hours";

export const SiteFooter = ({ logoUrl, settings }) => (
  <footer className="k-footer" data-testid="site-footer">
    <div className="k-container">
      <div className="k-footer-grid">
        <div className="k-footer-brand">
          <img src={logoUrl || DEFAULT_LOGO} alt="Karaoke Katakana" data-testid="footer-logo" />
          <p data-testid="footer-tagline">Karaoke-bar multigeneracional en Avenida de América desde 2006. Para cantar, celebrar o simplemente escuchar música y tomar algo.</p>
          <div className="k-socials">
            <a href={BUSINESS.instagram} target="_blank" rel="noreferrer" className="k-icon-btn" aria-label="Instagram de Karaoke Katakana" data-testid="footer-instagram-link"><Instagram /></a>
            <a href={BUSINESS.facebook} target="_blank" rel="noreferrer" className="k-icon-btn" aria-label="Facebook de Karaoke Katakana" data-testid="footer-facebook-link"><Facebook /></a>
          </div>
        </div>
        <div>
          <p className="k-footer-title">Visítanos</p>
          <div className="k-footer-links">
            <a href={MAPS_URL} target="_blank" rel="noreferrer" data-testid="footer-address-link"><MapPin /> <span>{BUSINESS.address1}<br />{BUSINESS.address2}</span></a>
            {groupHours(settings?.hours).map((g) => <span key={g.label} style={{ display: "flex", gap: 10 }}><Clock style={{ width: 17, color: "var(--k-orange)", flex: "none", marginTop: 2 }} /> <span>{g.label}: {g.value}</span></span>)}
          </div>
        </div>
        <div>
          <p className="k-footer-title">Contacto</p>
          <div className="k-footer-links">
            <a href={TEL_URL} data-testid="footer-phone-link"><Phone /> {BUSINESS.phoneIntl}</a>
            <a href={MAIL_URL} data-testid="footer-email-link"><Mail /> {BUSINESS.email}</a>
            {settings?.reservationHours && <span style={{ fontSize: 14, lineHeight: 1.6 }}>{settings.reservationHours}</span>}
          </div>
        </div>
        <div>
          <p className="k-footer-title">Explora</p>
          <div className="k-footer-links">
            <Link to={CATALOG_PATH} data-testid="footer-catalog-link">Lista de canciones</Link>
            <Link to={RESERVE_PATH} data-testid="footer-reserve-link">Reservar mesa</Link>
            <Link to={EVENTS_PATH} data-testid="footer-events-link">Eventos y celebraciones</Link>
            <Link to={MICRO_PATH} data-testid="footer-micro-link">Micro abierto</Link>
            <Link to={LOCAL_PATH} data-testid="footer-local-link">El local</Link>
            <Link to={CONTACT_PATH} data-testid="footer-contact-link">Contacto</Link>
          </div>
        </div>
      </div>
      <div className="k-footer-bottom">
        <span data-testid="footer-copyright">© {new Date().getFullYear()} Karaoke Katakana · Avenida de América, 22 · Madrid</span>
        <nav aria-label="Legal">
          <Link to="/aviso-legal" data-testid="footer-terms-link">Aviso legal</Link>
          <Link to="/privacidad" data-testid="footer-privacy-link">Privacidad</Link>
          <Link to="/cookies" data-testid="footer-cookies-link">Cookies</Link>
          <Link to="/admin/login" data-testid="footer-admin-link">Administración</Link>
        </nav>
      </div>
    </div>
  </footer>
);
