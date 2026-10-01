import { CoverflowCarousel } from "./CoverflowCarousel";
import { Reveal } from "@/components/Reveal";

export const FeaturedArtists = ({ artists }) => {
  if (!artists?.length) return null;
  return (
    <section className="k-section k-artists" data-testid="featured-artists-section">
      <div className="k-container">
        <Reveal className="k-heading k-heading--center">
          <p className="k-eyebrow">En el escenario</p>
          <h2 className="k-h2" data-testid="artists-heading">Artistas que <span className="k-grad-text">nunca fallan</span></h2>
        </Reveal>
        <CoverflowCarousel slides={artists} />
        <p className="k-artists-hint">Toca una portada para ver todas sus canciones del repertorio.</p>
      </div>
    </section>
  );
};
