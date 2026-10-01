import { useSite } from "@/lib/useSite";
import { SiteLayout } from "@/components/SiteLayout";
import { HomeHero } from "@/components/home/HomeHero";
import { ValueBlocks } from "@/components/home/ValueBlocks";
import { MicroBand } from "@/components/home/MicroBand";
import { FeaturedArtists } from "@/components/FeaturedArtists";
import { EventsShowcase } from "@/components/EventsShowcase";
import { CatalogPromo } from "@/components/CatalogPromo";
import { GallerySection } from "@/components/GallerySection";
import { GoogleReviews } from "@/components/GoogleReviews";
import { LocationSection } from "@/components/LocationSection";
import { ReserveCta } from "@/components/ReserveCta";
import { Reveal } from "@/components/Reveal";

export default function HomePage() {
  const { data } = useSite();
  const settings = data?.settings;
  return (
    <SiteLayout testid="home-page" description="Karaoke Katakana: karaoke-bar en Avenida de América, Madrid, desde 2006. Más de 20.000 canciones en varios idiomas, sonido digital, tres ambientes y celebraciones.">
      <HomeHero settings={settings} catalog={data?.catalog} />
      <ValueBlocks />
      <FeaturedArtists artists={data?.artists} />
      <section className="k-section" data-testid="home-events-section">
        <div className="k-container">
          <Reveal className="k-heading">
            <div>
              <p className="k-eyebrow">Eventos y celebraciones</p>
              <h2 className="k-h2">Tu celebración, <span className="k-grad-text">con micro</span></h2>
            </div>
            <p>Reservamos para grupos de amigos, familias y empresas. Cuéntanos tu plan y te preparamos la noche.</p>
          </Reveal>
          <EventsShowcase />
        </div>
      </section>
      <MicroBand />
      <CatalogPromo catalog={data?.catalog} />
      <GallerySection images={data?.gallery} />
      <GoogleReviews settings={settings} />
      <LocationSection settings={settings} />
      <ReserveCta />
    </SiteLayout>
  );
}
