import { Link } from "react-router-dom";
import { ArrowRight, Mic2, PartyPopper, Search, Wine } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CATALOG_PATH, EVENTS_PATH, LOCAL_PATH, RESERVE_PATH } from "@/lib/constants";

const VALUES = [
  { icon: Search, title: "Encuentra tu canción", text: "Busca por artista, título, código o idioma desde el móvil, sin preocuparte por tildes ni mayúsculas.", to: CATALOG_PATH, cta: "Ver canciones" },
  { icon: Mic2, title: "Sube al escenario", text: "Sonido digital y un ambiente participativo para todos los niveles, del primer tímido al rey del bis.", to: RESERVE_PATH, cta: "Reservar" },
  { icon: PartyPopper, title: "Celebra en grupo", text: "Cumpleaños, despedidas, afterworks y eventos de empresa con vuestra propia banda sonora.", to: EVENTS_PATH, cta: "Ver eventos" },
  { icon: Wine, title: "También para quien no canta", text: "Barra, mesas altas y salón para escuchar música y tomar algo con vista al escenario.", to: LOCAL_PATH, cta: "Conoce el local" },
];

export const ValueBlocks = () => (
  <section className="k-section" data-testid="values-section">
    <div className="k-container">
      <Reveal className="k-heading">
        <div>
          <p className="k-eyebrow">Karaoke-bar desde 2006</p>
          <h2 className="k-h2">Para cantar, escuchar <span className="k-grad-text">y celebrar</span></h2>
        </div>
        <p>Un local multigeneracional donde se juntan quienes viven por el micro y quienes solo quieren buena música y una copa.</p>
      </Reveal>
      <div className="k-values">
        {VALUES.map(({ icon: Icon, title, text, to, cta }, i) => (
          <Reveal key={title} delay={i * 0.08}>
            <Link to={to} className="k-value" style={{ display: "block", height: "100%" }} data-testid={`value-card-${i}`}>
              <span className="k-value-icon"><Icon /></span>
              <h3 className="k-h3">{title}</h3>
              <p>{text}</p>
              <span className="k-link" style={{ marginTop: 18 }}>{cta} <ArrowRight /></span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
