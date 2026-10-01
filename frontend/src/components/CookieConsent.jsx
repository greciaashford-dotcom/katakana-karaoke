import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

const KEY = "katakana-cookie-consent";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (!localStorage.getItem(KEY)) setVisible(true); }, []);
  const decide = (value) => { localStorage.setItem(KEY, value); setVisible(false); };
  if (!visible) return null;
  return (
    <div className="cookie-consent" role="dialog" aria-label="Aviso de cookies" data-testid="cookie-consent-banner">
      <div className="cookie-consent-icon"><Cookie /></div>
      <p data-testid="cookie-consent-text">
        Usamos cookies propias y de terceros para mejorar tu experiencia y analizar el tráfico. Consulta nuestra{" "}
        <Link to="/cookies" data-testid="cookie-consent-policy-link">Política de Cookies</Link>.
      </p>
      <div className="cookie-consent-actions">
        <button className="cookie-btn cookie-btn--ghost" onClick={() => decide("rejected")} data-testid="cookie-reject-button">Rechazar</button>
        <button className="cookie-btn cookie-btn--primary" onClick={() => decide("accepted")} data-testid="cookie-accept-button">Aceptar</button>
      </div>
    </div>
  );
};
