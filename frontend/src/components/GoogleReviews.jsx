import { ExternalLink, Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { MAPS_URL } from "@/lib/constants";

const PRESS = [
  { text: "Tres zonas diferenciadas y comunicadas: una amplia barra, mesas altas con vista al escenario y un salón interior.", source: "Turismo de Madrid", url: "https://www.esmadrid.com/noche/karaoke-katakana" },
  { text: "Seleccionado entre los karaokes de Madrid donde cantar y tomar algo.", source: "ELLE España", url: "https://www.elle.com/es/gourmet/donde-comer/g29868866/karaoke-madrid/" },
];

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8z" />
    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
    <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
  </svg>
);

const Stars = ({ value }) => (
  <div className="k-stars" aria-label={`${value} de 5 estrellas`} data-testid="google-rating-stars">
    {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={n <= Math.round(Number(value)) ? "" : "is-off"} />)}
  </div>
);

export const GoogleReviews = ({ settings }) => {
  const rating = settings?.googleRating;
  const count = settings?.googleReviewCount;
  const url = settings?.googleReviewsUrl || MAPS_URL;
  return (
    <section className="k-section k-section--alt" data-testid="google-reviews-section">
      <div className="k-container">
        <Reveal className="k-heading">
          <div>
            <p className="k-eyebrow">Opiniones</p>
            <h2 className="k-h2">Lo que se dice <span className="k-grad-text">de Katakana</span></h2>
          </div>
          <p>Lee las reseñas de quienes ya han cantado con nosotros y, después de tu noche, cuéntanos qué tal.</p>
        </Reveal>
        <div className="k-reviews">
          <Reveal className="k-rating-card" data-testid="google-rating-card">
            <div>
              <p className="k-eyebrow">Reseñas de Google</p>
              {rating ? (
                <div style={{ marginTop: 22 }}>
                  <div className="k-rating-big" data-testid="google-rating-value">{rating.replace(".", ",")}</div>
                  <Stars value={rating} />
                  <p style={{ marginTop: 12 }} data-testid="google-review-count">{count ? `Basado en ${count} reseñas de Google` : "Valoración media en Google"}</p>
                </div>
              ) : (
                <p style={{ marginTop: 22, fontSize: 22, fontFamily: "var(--k-display)" }} data-testid="google-reviews-text">Cientos de noches de karaoke, contadas por nuestros clientes.</p>
              )}
            </div>
            <a href={url} target="_blank" rel="noreferrer" className="k-btn k-btn--dark" style={{ alignSelf: "flex-start" }} data-testid="google-reviews-button"><GoogleMark /> Ver reseñas en Google <ExternalLink /></a>
          </Reveal>
          <div className="k-press">
            {PRESS.map((p, i) => (
              <Reveal key={p.source} delay={0.1 + i * 0.08} className="k-quote" data-testid={`press-quote-${i}`}>
                <blockquote>{p.text}</blockquote>
                <cite><a href={p.url} target="_blank" rel="noreferrer">{p.source}</a></cite>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
