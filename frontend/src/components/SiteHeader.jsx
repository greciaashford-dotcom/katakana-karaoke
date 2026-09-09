import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CATALOG_PATH } from "@/lib/constants";
import { HeaderSearch } from "@/components/HeaderSearch";

export const SiteHeader = ({ logoUrl, transparent = false, showSearch = true }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const classes = ["site-header", transparent ? "site-header--overlay" : "site-header--solid", scrolled ? "is-scrolled" : "", showSearch ? "" : "site-header--no-search"].join(" ");
  return (
    <header className={classes} data-testid="site-header" data-scrolled={scrolled}>
      <div className="site-header-inner">
        <Link to="/" className="brand-link" data-testid="site-logo-link"><img src={logoUrl} alt="Okume Karaoke" data-testid="site-logo-image" /></Link>
        {showSearch && <HeaderSearch />}
        <nav className="site-nav" data-testid="site-navigation">
          <a href="/#artistas" data-testid="nav-artists-link">Artistas</a>
          <Link to={CATALOG_PATH} data-testid="nav-catalog-link">Canciones</Link>
          <a href="/#eventos" data-testid="nav-events-link">Eventos</a>
          <a href="/#ubicacion" data-testid="nav-location-link">Ubicación</a>
          <a className="nav-reserve" href="/#reservas" data-testid="nav-reservation-link">Reserva</a>
        </nav>
      </div>
    </header>
  );
};
