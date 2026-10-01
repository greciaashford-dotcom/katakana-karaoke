import { Reveal } from "@/components/Reveal";

export const GallerySection = ({ images, testid = "gallery-section" }) => {
  if (!images?.length) return null;
  return (
    <section className="k-section" data-testid={testid}>
      <div className="k-container">
        <Reveal className="k-heading">
          <div>
            <p className="k-eyebrow">Noches Katakana</p>
            <h2 className="k-h2">Esto pasa cuando <span className="k-grad-text">suena tu canción</span></h2>
          </div>
          <p>Cumpleaños, despedidas, Halloween y noches cualquiera que acaban siendo legendarias.</p>
        </Reveal>
        <div className="k-gallery">
          {images.map((img) => <figure key={img.id} data-testid={`gallery-item-${img.id}`}><img src={img.imageUrl} alt={img.alt} loading="lazy" /></figure>)}
        </div>
      </div>
    </section>
  );
};
