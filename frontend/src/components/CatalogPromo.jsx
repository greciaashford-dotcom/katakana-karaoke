import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CATALOG_PATH, SITE_URL, formatNumber } from "@/lib/constants";

export const CatalogPromo = ({ catalog }) => (
  <section className="k-section k-section--tight" data-testid="catalog-promo-section">
    <div className="k-container">
      <Reveal className="k-promo">
        <div>
          <p className="k-eyebrow">Repertorio</p>
          <h2 className="k-h2" data-testid="catalog-promo-heading">{catalog?.songs ? formatNumber(catalog.songs) : "+20.000"} canciones <span className="k-grad-text">en tu bolsillo</span></h2>
          <p className="k-lead" style={{ marginTop: 18 }}>Busca por artista, título o código, copia el código con un toque y pide tu canción al escenario desde la mesa.</p>
          <div className="k-promo-langs" data-testid="catalog-promo-languages">
            {catalog?.languages?.slice(0, 5).map((l) => <Link key={l.lang} to={`${CATALOG_PATH}?lang=${l.lang}`} className="k-chip" data-testid={`catalog-promo-lang-${l.lang}`}>{l.label} <small>{formatNumber(l.count)}</small></Link>)}
          </div>
          <Link to={CATALOG_PATH} className="k-btn k-btn--primary" data-testid="catalog-open-button"><Search /> Explorar canciones</Link>
        </div>
        <div className="k-qr" data-testid="catalog-qr-code">
          <div className="k-qr-frame"><QRCodeSVG value={`${SITE_URL}${CATALOG_PATH}`} size={168} bgColor="#fff3e6" fgColor="#1a0c05" level="M" /></div>
          <p>Escanea y canta</p>
          <span>karaokekatakana.com/canciones</span>
        </div>
      </Reveal>
    </div>
  </section>
);
