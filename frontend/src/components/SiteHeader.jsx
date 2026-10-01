import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { CalendarCheck, Menu, Search } from "lucide-react";
import { useUi } from "@/contexts/UiContext";
import { CATALOG_PATH, CONTACT_PATH, DEFAULT_LOGO, EVENTS_PATH, LOCAL_PATH, MICRO_PATH, RESERVE_PATH } from "@/lib/constants";

export const NAV_LINKS = [
  { to: CATALOG_PATH, label: "Canciones", testid: "nav-songs-link" },
  { to: EVENTS_PATH, label: "Eventos", testid: "nav-events-link" },
  { to: MICRO_PATH, label: "Micro abierto", testid: "nav-micro-link" },
  { to: LOCAL_PATH, label: "El local", testid: "nav-local-link" },
  { to: CONTACT_PATH, label: "Contacto", testid: "nav-contact-link" },
];

export const SiteHeader = ({ logoUrl, notice, solid = false }) => {
  const { openSearch, setMenuOpen } = useUi();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`k-header ${scrolled ? "is-scrolled" : ""} ${solid ? "is-solid" : ""}`} data-testid="site-header" data-scrolled={scrolled}>
      {notice && <div className="k-notice" role="status" data-testid="site-notice">{notice}</div>}
      <div className="k-header-inner">
        <Link to="/" className="k-logo" aria-label="Karaoke Katakana, inicio" data-testid="site-logo-link"><img src={logoUrl || DEFAULT_LOGO} alt="Karaoke Katakana" data-testid="site-logo-image" /></Link>
        <nav className="k-nav" aria-label="Principal" data-testid="site-navigation">
          {NAV_LINKS.map((link) => <NavLink key={link.to} to={link.to} data-testid={link.testid}>{link.label}</NavLink>)}
        </nav>
        <div className="k-header-actions">
          <button type="button" className="k-search-trigger" onClick={() => openSearch()} aria-label="Buscar canciones" data-testid="header-search-button"><Search /><span>¿Qué cantarás hoy?</span><kbd>/</kbd></button>
          <Link to={RESERVE_PATH} className="k-btn k-btn--primary k-btn--sm k-header-cta" data-testid="nav-reservation-link"><CalendarCheck /> Reservar</Link>
          <button type="button" className="k-icon-btn k-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" data-testid="header-menu-button"><Menu /></button>
        </div>
      </div>
    </header>
  );
};
