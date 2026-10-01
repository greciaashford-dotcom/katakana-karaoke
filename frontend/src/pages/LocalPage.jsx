import { CheckCircle2 } from "lucide-react";
import { useSite } from "@/lib/useSite";
import { formatNumber } from "@/lib/constants";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { GallerySection } from "@/components/GallerySection";
import { ReserveCta } from "@/components/ReserveCta";
import { Reveal } from "@/components/Reveal";

const ZONES = [
  { n: "01", title: "La barra", image: "/images/local-barra.jpg", alt: "Barra de Katakana con luces de neón", text: "Una barra amplia para tomar algo, charlar y animar a quien está en el escenario." },
  { n: "02", title: "Mesas altas", image: "/images/local-mesas-altas.jpg", alt: "Zona de mesas altas de Katakana", text: "Con vista directa al escenario: perfectas para grupos que se van turnando el micro." },
  { n: "03", title: "El salón", image: "/images/local-salon-butacas.jpg", alt: "Salón interior de Katakana con butacas rojas", text: "El salón interior, junto al escenario, con butacas para disfrutar del espectáculo." },
];

const SOUND = [
  "Equipo de sonido digital de alta calidad",
  "Repertorio en español, inglés, francés, italiano, portugués y más",
  "Novedades de proveedores nacionales e internacionales",
  "Si falta tu canción y existe en karaoke, pídenos que la incorporemos",
];

export default function LocalPage() {
  const { data } = useSite();
  const stats = [
    { value: 2006, label: "abrimos en Avenida de América" },
    { value: "+30", label: "años de experiencia en karaoke" },
    { value: 3, label: "ambientes comunicados" },
    { value: data?.catalog?.songs ? formatNumber(data.catalog.songs) : "+20.000", label: "canciones en el repertorio" },
  ];
  return (
    <SiteLayout title="El local" description="Karaoke Katakana: karaoke-bar en Avenida de América desde 2006 con tres ambientes comunicados, sonido digital y repertorio multilingüe." testid="local-page">
      <PageHero eyebrow="El local" title={<>Katakana, <span className="k-grad-text">cantando desde 2006</span></>} lead="Un karaoke-bar multigeneracional en Avenida de América con tres ambientes comunicados, sonido digital y repertorio internacional." image="/images/local-escenario.jpg" imageAlt="Escenario de Karaoke Katakana" crumbs={[{ label: "El local" }]} testid="local-hero" />

      <section className="k-section" style={{ paddingTop: 0 }} data-testid="local-history">
        <div className="k-container">
          <div className="k-grid-2">
            <Reveal>
              <p className="k-eyebrow">Nuestra historia</p>
              <h2 className="k-h2">Gente distinta, <span className="k-grad-text">las mismas ganas de cantar</span></h2>
              <p className="k-text" style={{ marginTop: 22 }}>Karaoke Katakana abrió en 2006 con una idea sencilla: un lugar para públicos de todas las generaciones unidos por el gusto de cantar y de escuchar música. Detrás hay un equipo con más de 30 años de experiencia en la gestión de salas de karaoke.</p>
              <p className="k-text" style={{ marginTop: 16 }}>Aquí conviven quienes suben al escenario cada semana y quienes solo vienen a tomar una copa con buena música. Todos tienen su sitio.</p>
              <div className="k-stats" style={{ borderTop: 0, paddingTop: 0 }}>
                {stats.map((s) => <div className="k-stat" key={s.label}><strong className="k-grad-text">{s.value}</strong><span>{s.label}</span></div>)}
              </div>
            </Reveal>
            <Reveal delay={0.1} className="k-media k-media--tall">
              <img src="/images/fachada.jpg" alt="Entrada de Karaoke Katakana en Avenida de América" />
              <span className="k-media-badge">Avenida de América, 22 · Madrid</span>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="k-section k-section--alt" data-testid="local-zones">
        <div className="k-container">
          <Reveal className="k-heading">
            <div><p className="k-eyebrow">Tres ambientes</p><h2 className="k-h2">Elige cómo vivir la noche</h2></div>
            <p>Las tres zonas están comunicadas: el escenario siempre queda cerca.</p>
          </Reveal>
          <div className="k-zones">
            {ZONES.map((z, i) => (
              <Reveal key={z.n} delay={i * 0.08} className="k-zone" data-testid={`local-zone-${z.n}`}>
                <img src={z.image} alt={z.alt} loading="lazy" />
                <div><span>{z.n}</span><h3 className="k-h3">{z.title}</h3><p>{z.text}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="k-section" data-testid="local-sound">
        <div className="k-container">
          <div className="k-grid-2">
            <Reveal className="k-media k-media--wide"><img src="/images/duo-escenario.jpg" alt="Dos personas cantando a dúo en el escenario de Katakana" loading="lazy" /></Reveal>
            <Reveal delay={0.1}>
              <p className="k-eyebrow">Sonido y repertorio</p>
              <h2 className="k-h2">Suena como tiene que sonar</h2>
              <ul className="k-list" style={{ marginTop: 26 }}>{SOUND.map((s) => <li key={s}><CheckCircle2 /> {s}</li>)}</ul>
            </Reveal>
          </div>
        </div>
      </section>

      <GallerySection images={data?.gallery} testid="local-gallery" />
      <ReserveCta />
    </SiteLayout>
  );
}
