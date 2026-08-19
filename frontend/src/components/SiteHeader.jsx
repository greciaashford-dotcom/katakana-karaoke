import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export const SiteHeader = ({ logoUrl, transparent = false }) => {
  const [open, setOpen] = useState(false);
  return <header className={`site-header ${transparent ? "site-header--overlay" : ""}`} data-testid="site-header">
    <Link to="/" className="brand-link" data-testid="site-logo-link"><img src={logoUrl} alt="Okume Karaoke" data-testid="site-logo-image" /></Link>
    <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Abrir navegación" data-testid="mobile-menu-button">{open ? <X /> : <Menu />}</button>
    <nav className={open ? "site-nav is-open" : "site-nav"} data-testid="site-navigation">
      <a href="/#artistas" data-testid="nav-artists-link">Artistas</a><Link to="/catalogo" data-testid="nav-catalog-link">Canciones</Link>
      <a href="/#eventos" data-testid="nav-events-link">Eventos</a><a className="nav-reserve" href="/#reservas" data-testid="nav-reservation-link">Reserva</a>
    </nav>
  </header>;
};