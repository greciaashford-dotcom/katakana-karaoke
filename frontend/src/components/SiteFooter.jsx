import { Facebook, Instagram, MapPin, MessageCircle, Music2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ADDRESS_LINE_1, ADDRESS_LINE_2, CATALOG_PATH, MAPS_URL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/lib/constants";

export const SiteFooter = ({ logoUrl }) => (
  <footer className="site-footer" data-testid="site-footer">
    <div className="footer-brand"><img src={logoUrl} alt="Okume Karaoke" data-testid="footer-logo" /><p data-testid="footer-tagline">Madrid canta diferente.</p></div>
    <div>
      <p className="footer-label">Visítanos</p>
      <a href={MAPS_URL} target="_blank" rel="noreferrer" data-testid="footer-address-link"><MapPin /> {ADDRESS_LINE_1}<br />{ADDRESS_LINE_2}</a>
      <Link to={CATALOG_PATH} data-testid="footer-catalog-link"><Music2 /> Canciones karaoke Madrid</Link>
    </div>
    <div>
      <p className="footer-label">Contacto</p>
      <a href={`tel:${PHONE_TEL}`} data-testid="footer-phone-link">{PHONE_DISPLAY}</a>
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" data-testid="footer-whatsapp-link"><MessageCircle /> WhatsApp</a>
      <a href="mailto:info@okumekaraoke.com" data-testid="footer-email-link">info@okumekaraoke.com</a>
    </div>
    <div>
      <p className="footer-label">Síguenos</p>
      <div className="socials">
        <a href="https://instagram.com/okume.madrid" target="_blank" rel="noreferrer" aria-label="Instagram" data-testid="footer-instagram-link"><Instagram /></a>
        <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" data-testid="footer-tiktok-link"><Music2 /></a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" data-testid="footer-facebook-link"><Facebook /></a>
      </div>
    </div>
    <div className="footer-bottom">
      <span data-testid="footer-copyright">© 2026 Okume Karaoke</span>
      <nav className="footer-legal">
        <Link to="/privacidad" data-testid="footer-privacy-link">Privacidad</Link>
        <Link to="/terminos" data-testid="footer-terms-link">Términos</Link>
        <Link to="/cookies" data-testid="footer-cookies-link">Cookies</Link>
        <Link to="/admin/login" data-testid="footer-admin-link">Administración</Link>
      </nav>
    </div>
  </footer>
);
