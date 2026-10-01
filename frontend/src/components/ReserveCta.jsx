import { Link } from "react-router-dom";
import { CalendarCheck, Phone } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { BUSINESS, RESERVE_PATH, TEL_URL } from "@/lib/constants";

export const ReserveCta = ({ title = "¿Cantamos esta noche?", text = "Reserva tu mesa en un minuto o llámanos y te ayudamos a organizar tu plan.", to = RESERVE_PATH, testid = "reserve-cta" }) => (
  <section className="k-section k-section--tight" data-testid={testid}>
    <div className="k-container">
      <Reveal className="k-cta">
        <p className="k-eyebrow">Reservas</p>
        <h2 className="k-h2">{title}</h2>
        <p className="k-lead">{text}</p>
        <div className="k-actions">
          <Link to={to} className="k-btn k-btn--primary" data-testid={`${testid}-reserve`}><CalendarCheck /> Reservar mesa</Link>
          <a href={TEL_URL} className="k-btn k-btn--ghost" data-testid={`${testid}-call`}><Phone /> Llamar al {BUSINESS.phoneDisplay}</a>
        </div>
      </Reveal>
    </div>
  </section>
);
