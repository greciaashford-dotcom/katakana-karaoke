import { NavLink } from "react-router-dom";
import { CalendarCheck, ListMusic, Menu, Navigation, Phone } from "lucide-react";
import { useUi } from "@/contexts/UiContext";
import { CATALOG_PATH, DIRECTIONS_URL, RESERVE_PATH, TEL_URL } from "@/lib/constants";

export const MobileTabBar = () => {
  const { menuOpen, setMenuOpen } = useUi();
  const cls = ({ isActive }) => (isActive && !menuOpen ? "is-active" : "");
  return (
    <nav className="k-tabbar" aria-label="Acciones rápidas" data-testid="mobile-tabbar">
      <NavLink to={CATALOG_PATH} className={cls} data-testid="tab-songs"><ListMusic /><span>Canciones</span></NavLink>
      <NavLink to={RESERVE_PATH} className={cls} data-testid="tab-reservations"><CalendarCheck /><span>Reservar</span></NavLink>
      <a href={TEL_URL} className="k-tab-call" data-testid="tab-call"><Phone /><span>Llamar</span></a>
      <a href={DIRECTIONS_URL} target="_blank" rel="noreferrer" data-testid="tab-directions"><Navigation /><span>Cómo llegar</span></a>
      <button type="button" className={menuOpen ? "is-active" : ""} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} data-testid="tab-menu"><Menu /><span>Menú</span></button>
    </nav>
  );
};
