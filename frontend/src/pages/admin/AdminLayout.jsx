import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarCheck, ExternalLink, Images, LayoutDashboard, Library, Lightbulb, ListMusic, LogOut, Mic2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LINKS = [
  { to: "/admin", end: true, label: "Resumen", icon: LayoutDashboard, testid: "admin-overview-link" },
  { to: "/admin/reservas", label: "Reservas", icon: CalendarCheck, testid: "admin-reservations-link" },
  { to: "/admin/canciones", label: "Catálogo", icon: Library, testid: "admin-songs-link" },
  { to: "/admin/sugerencias", label: "Sugerencias", icon: Lightbulb, testid: "admin-suggestions-link" },
  { to: "/admin/cola", label: "Cola de canciones", icon: ListMusic, testid: "admin-queue-link" },
  { to: "/admin/clientes", label: "Clientes", icon: Users, testid: "admin-clients-link" },
  { to: "/admin/artistas", label: "Artistas", icon: Mic2, testid: "admin-artists-link" },
  { to: "/admin/contenido", label: "Contenido", icon: Images, testid: "admin-content-link" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate("/admin/login"); };
  return (
    <main className="admin-shell" data-testid="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-wordmark" data-testid="admin-logo-link">KATAKANA<span>Panel</span></Link>
        <nav data-testid="admin-navigation">
          {LINKS.map(({ to, end, label, icon: Icon, testid }) => <NavLink key={to} end={end} to={to} data-testid={testid}><Icon /> {label}</NavLink>)}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer" data-testid="admin-view-site-link"><ExternalLink /> Ver web</a>
          <button type="button" onClick={signOut} data-testid="admin-logout-button"><LogOut /> Cerrar sesión</button>
          <small data-testid="admin-user-email">{user?.email}</small>
        </div>
      </aside>
      <section className="admin-main"><Outlet /></section>
    </main>
  );
}
