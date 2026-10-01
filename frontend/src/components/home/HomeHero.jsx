import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, PartyPopper, Search } from "lucide-react";
import { OpenStatus } from "@/components/OpenStatus";
import { CATALOG_PATH, EVENTS_PATH, RESERVE_PATH, formatNumber } from "@/lib/constants";

const DEFAULT_TITLE = "Karaoke en Madrid para cantar, celebrar y disfrutar";
const DEFAULT_DESC = "En Avenida de América, con repertorio multilingüe, sonido digital y tres ambientes para vivir la noche a tu manera.";
const CHIPS = ["Queen", "Rocío Jurado", "ABBA", "Mecano", "Infantiles"];

const HeroTitle = ({ text }) => {
  const at = text.indexOf(" para ");
  if (at < 0) return text;
  return <>{text.slice(0, at)} <span className="k-grad-text">{text.slice(at + 1)}</span></>;
};

export const HomeHero = ({ settings, catalog }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const image = settings?.heroImageUrl || "/images/hero-escenario.jpg";
  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `${CATALOG_PATH}?q=${encodeURIComponent(q.trim())}` : CATALOG_PATH);
  };
  const stats = [
    { value: catalog?.songs ? formatNumber(catalog.songs) : "+20.000", label: "canciones" },
    { value: catalog?.languages?.length || 8, label: "idiomas" },
    { value: 3, label: "ambientes comunicados" },
    { value: 2006, label: "cantando desde" },
  ];
  return (
    <section className="k-hero" data-testid="home-hero">
      {settings?.heroVideoUrl ? (
        <video className="k-hero-media" autoPlay muted loop playsInline poster={image} data-testid="hero-video"><source src={settings.heroVideoUrl} /></video>
      ) : (
        <img className="k-hero-media" src={image} alt="Cantante actuando en el escenario de Karaoke Katakana" data-testid="hero-image" />
      )}
      <div className="k-hero-shade" aria-hidden="true" />
      <div className="k-container">
        <div className="k-hero-content">
          <div className="k-hero-top">
            <OpenStatus hours={settings?.hours} testid="hero-open-status" />
            <span className="k-status" data-testid="hero-location-badge">Avenida de América, 22 · Madrid</span>
          </div>
          <h1 className="k-h1" data-testid="hero-title"><HeroTitle text={settings?.heroTitle || DEFAULT_TITLE} /></h1>
          <p className="k-lead" data-testid="hero-description">{settings?.heroDescription || DEFAULT_DESC}</p>
          <form className="k-hero-search" role="search" onSubmit={submit} data-testid="hero-search-form">
            <Search aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca artista, título o código…" aria-label="Buscar canciones" enterKeyHint="search" autoComplete="off" data-testid="hero-search-input" />
            <button className="k-btn k-btn--primary k-btn--sm" aria-label="Buscar canciones" data-testid="hero-search-button"><Search /><span>Buscar</span></button>
          </form>
          <div className="k-hero-chips" aria-label="Búsquedas populares">
            {CHIPS.map((artist, i) => <Link key={artist} to={`${CATALOG_PATH}?artist=${encodeURIComponent(artist)}`} className="k-chip" data-testid={`hero-chip-${i}`}>{artist}</Link>)}
          </div>
          <div className="k-hero-actions">
            <Link to={RESERVE_PATH} className="k-btn k-btn--primary" data-testid="hero-reserve-button"><CalendarCheck /> Reservar mesa</Link>
            <Link to={EVENTS_PATH} className="k-btn k-btn--ghost" data-testid="hero-events-button"><PartyPopper /> Celebra con nosotros</Link>
          </div>
          <div className="k-stats" data-testid="hero-stats">
            {stats.map((s) => <div className="k-stat" key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>)}
          </div>
        </div>
      </div>
    </section>
  );
};
