import { Link, NavLink } from "react-router-dom";
import { CalendarCheck, Facebook, Guitar, Home, Instagram, Landmark, ListMusic, Mail, MapPin, Navigation, Phone, Sparkles, X } from "lucide-react";
import { useUi } from "@/contexts/UiContext";
import { BUSINESS, CATALOG_PATH, CONTACT_PATH, DIRECTIONS_URL, EVENTS_PATH, LOCAL_PATH, MAIL_URL, MICRO_PATH, RESERVE_PATH, TEL_URL } from "@/lib/constants";

const LINKS = [
  { to: "/", label: "Inicio", icon: Home, end: true },
  { to: CATALOG_PATH, label: "Canciones", icon: ListMusic },
  { to: EVENTS_PATH, label: "Eventos y celebraciones", icon: Sparkles },
  { to: MICRO_PATH, label: "Micro abierto", icon: Guitar },
  { to: LOCAL_PATH, label: "El local", icon: Landmark },
  { to: CONTACT_PATH, label: "Contacto y horarios", icon: MapPin },
  { to: RESERVE_PATH, label: "Reservar mesa", icon: CalendarCheck },
];

export const MenuSheet = () => {
  const { menuOpen, setMenuOpen } = useUi();
  if (!menuOpen) return null;
  const close = () => setMenuOpen(false);
  return (
    <div className="k-sheet-backdrop" onClick={close} data-testid="mobile-menu-sheet">
      <div className="k-sheet" role="dialog" aria-modal="true" aria-label="Menú" onClick={(e) => e.stopPropagation()}>
        <div className="k-sheet-handle" />
        <button type="button" className="k-icon-btn k-sheet-close" onClick={close} aria-label="Cerrar menú" data-testid="mobile-menu-close"><X /></button>
        <p className="k-eyebrow">Menú</p>
        <nav className="k-sheet-links">
          {LINKS.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={close} data-testid={`mobile-menu-link-${to === "/" ? "home" : to.slice(1)}`}><Icon /> {label}</NavLink>)}
        </nav>
        <div className="k-sheet-contact">
          <a href={TEL_URL} className="k-btn k-btn--primary" data-testid="mobile-menu-phone"><Phone /> {BUSINESS.phoneDisplay}</a>
          <a href={DIRECTIONS_URL} target="_blank" rel="noreferrer" className="k-btn k-btn--ghost" data-testid="mobile-menu-directions"><Navigation /> Cómo llegar</a>
          <a href={MAIL_URL} className="k-btn k-btn--ghost" data-testid="mobile-menu-email"><Mail /> Escríbenos</a>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={BUSINESS.instagram} target="_blank" rel="noreferrer" className="k-btn k-btn--ghost" style={{ flex: 1 }} aria-label="Instagram" data-testid="mobile-menu-instagram"><Instagram /></a>
            <a href={BUSINESS.facebook} target="_blank" rel="noreferrer" className="k-btn k-btn--ghost" style={{ flex: 1 }} aria-label="Facebook" data-testid="mobile-menu-facebook"><Facebook /></a>
          </div>
        </div>
        <div className="k-sheet-legal"><Link to="/aviso-legal" onClick={close}>Aviso legal</Link><Link to="/privacidad" onClick={close}>Privacidad</Link><Link to="/cookies" onClick={close}>Cookies</Link></div>
      </div>
    </div>
  );
};
