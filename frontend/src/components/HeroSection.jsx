import { ArrowDownRight, Music2 } from "lucide-react";
import { Link } from "react-router-dom";
import { CATALOG_PATH } from "@/lib/constants";

export const HeroSection = ({ settings }) => (
  <section className="hero" data-testid="hero-section">
    {settings.heroVideoUrl ? <video className="hero-media" autoPlay muted loop playsInline poster={settings.heroImageUrl} data-testid="hero-background-video"><source src={settings.heroVideoUrl} /></video> : <img className="hero-media" src={settings.heroImageUrl} alt="Interior de Okume Karaoke" data-testid="hero-background-image" />}
    <div className="hero-shade" />
    <div className="hero-content">
      <p className="eyebrow" data-testid="hero-location-text"><span /> MADRID · SALAMANCA</p>
      <h1 data-testid="hero-title">{settings.heroTitle}</h1>
      <p className="hero-copy" data-testid="hero-description">{settings.heroDescription}</p>
      <div className="hero-actions">
        <a href="#reservas" className="button button--primary" data-testid="hero-reserve-button">Reserva <ArrowDownRight /></a>
        <Link to={CATALOG_PATH} className="button button--ghost" data-testid="hero-catalog-button"><Music2 /> Lista de canciones</Link>
      </div>
    </div>
    <div className="hero-scroll-cue" aria-hidden="true"><span /></div>
  </section>
);
