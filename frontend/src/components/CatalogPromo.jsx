import { QRCodeSVG } from "qrcode.react";
import { ArrowUpRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { CATALOG_PATH } from "@/lib/constants";
import { Reveal } from "@/components/Reveal";

export const CatalogPromo = ({ songCount }) => (
  <section className="catalog-promo" data-testid="catalog-promo-section">
    <div className="catalog-promo-inner">
      <Reveal>
        <p className="eyebrow" data-testid="catalog-eyebrow"><span /> {songCount.toLocaleString("es-ES")} CANCIONES</p>
        <h2 data-testid="catalog-promo-heading">Tu canción<br />está <em>aquí.</em></h2>
        <p data-testid="catalog-promo-description">Busca por artista o título y prepara tu repertorio antes de subir al escenario.</p>
        <Link to={CATALOG_PATH} className="button button--cream" data-testid="catalog-open-button"><Search /> Explorar catálogo <ArrowUpRight /></Link>
      </Reveal>
      <Reveal className="qr-block" delay={0.15} data-testid="catalog-qr-code">
        <div className="qr-frame"><QRCodeSVG value={`https://okumekaraoke.com${CATALOG_PATH}`} size={172} bgColor="#f8efd2" fgColor="#111713" level="M" /></div>
        <p>Escanea y canta</p>
        <span>okumekaraoke.com</span>
      </Reveal>
    </div>
  </section>
);
