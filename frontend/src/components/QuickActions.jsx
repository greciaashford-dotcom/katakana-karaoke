import { Navigation, Phone } from "lucide-react";
import { BUSINESS, DIRECTIONS_URL, TEL_URL } from "@/lib/constants";

export const QuickActions = () => (
  <div className="k-fab" data-testid="quick-actions">
    <a href={DIRECTIONS_URL} target="_blank" rel="noreferrer" className="k-fab-map" aria-label="Cómo llegar a Karaoke Katakana" data-testid="quick-directions-button"><Navigation /> Cómo llegar</a>
    <a href={TEL_URL} className="k-fab-call" aria-label={`Llamar al ${BUSINESS.phoneDisplay}`} data-testid="quick-call-button"><Phone /> Llamar</a>
  </div>
);
