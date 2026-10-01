import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { MICRO_PATH } from "@/lib/constants";

export const MicroBand = () => (
  <section className="k-section k-section--tight" data-testid="micro-band-section">
    <div className="k-container">
      <Reveal className="k-band" data-testid="micro-band">
        <div className="k-band-body">
          <p className="k-eyebrow">De lunes a jueves</p>
          <h2 className="k-h2">Micro abierto</h2>
          <p style={{ marginTop: 18 }}>Canta, toca tu instrumento o estrena tu monólogo delante de un público con ganas de escucharte. El escenario de Katakana también es tuyo entre semana.</p>
          <div className="k-band-tags"><span>Música</span><span>Instrumentos</span><span>Monólogos</span></div>
          <Link to={MICRO_PATH} className="k-btn k-btn--dark" data-testid="micro-band-button">Descubre el micro abierto <ArrowRight /></Link>
        </div>
        <div className="k-band-media"><img src="/images/noche-escenario.jpg" alt="Escenario de Katakana iluminado durante una actuación" loading="lazy" /></div>
      </Reveal>
    </div>
  </section>
);
