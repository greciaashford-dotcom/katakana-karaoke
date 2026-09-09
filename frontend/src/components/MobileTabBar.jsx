import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarCheck, Home, Instagram, ListMusic, MapPin, Menu, MessageCircle, Mic2, Phone, Sparkles, X } from "lucide-react";
import { CATALOG_PATH, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/lib/constants";

const MenuSheet = ({ onClose }) => (
  <div className="tab-sheet-backdrop" onClick={onClose} data-testid="mobile-menu-sheet">
    <div className="tab-sheet" onClick={(e) => e.stopPropagation()}>
      <div className="tab-sheet-handle" />
      <button className="tab-sheet-close" onClick={onClose} aria-label="Cerrar menú" data-testid="mobile-menu-close"><X /></button>
      <p className="tab-sheet-title">Menú</p>
      <nav className="tab-sheet-links">
        <a href="/#artistas" onClick={onClose} data-testid="mobile-menu-artists"><Mic2 /> Artistas destacados</a>
        <Link to={CATALOG_PATH} onClick={onClose} data-testid="mobile-menu-songs"><ListMusic /> Lista de canciones</Link>
        <a href="/#eventos" onClick={onClose} data-testid="mobile-menu-events"><Sparkles /> Eventos y galería</a>
        <a href="/#ubicacion" onClick={onClose} data-testid="mobile-menu-location"><MapPin /> Cómo llegar</a>
        <a href="/#reservas" onClick={onClose} data-testid="mobile-menu-reservation"><CalendarCheck /> Reservar mesa</a>
      </nav>
      <div className="tab-sheet-contact">
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="tab-sheet-whatsapp" data-testid="mobile-menu-whatsapp"><MessageCircle /> WhatsApp</a>
        <a href={`tel:${PHONE_TEL}`} data-testid="mobile-menu-phone"><Phone /> {PHONE_DISPLAY}</a>
        <a href="https://instagram.com/okume.madrid" target="_blank" rel="noreferrer" data-testid="mobile-menu-instagram"><Instagram /> Instagram</a>
      </div>
      <div className="tab-sheet-legal">
        <Link to="/privacidad" onClick={onClose}>Privacidad</Link><Link to="/terminos" onClick={onClose}>Términos</Link><Link to="/cookies" onClick={onClose}>Cookies</Link>
      </div>
    </div>
  </div>
);

export const MobileTabBar = () => {
  const { pathname, hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [pathname, hash]);
  const isHome = pathname === "/" && hash !== "#reservas";
  const isSongs = pathname.startsWith(CATALOG_PATH);
  const isReserve = pathname === "/" && hash === "#reservas";
  return (
    <>
      <nav className="mobile-tabbar" aria-label="Navegación móvil" data-testid="mobile-tabbar">
        <Link to="/" className={isHome && !menuOpen ? "is-active" : ""} data-testid="tab-home"><Home /><span>Inicio</span></Link>
        <Link to={CATALOG_PATH} className={isSongs && !menuOpen ? "is-active" : ""} data-testid="tab-songs"><ListMusic /><span>Canciones</span></Link>
        <a href="/#reservas" className={isReserve && !menuOpen ? "is-active" : ""} data-testid="tab-reservations"><CalendarCheck /><span>Reservas</span></a>
        <button type="button" className={menuOpen ? "is-active" : ""} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} data-testid="tab-menu"><Menu /><span>Menú</span></button>
      </nav>
      {menuOpen && <MenuSheet onClose={() => setMenuOpen(false)} />}
    </>
  );
};
