import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarClock, Library, Lightbulb, ListMusic, Mic2, Sparkles, Users } from "lucide-react";
import { api } from "@/api/client";

const CARDS = [
  { key: "pending", label: "Reservas pendientes", icon: CalendarClock, to: "/admin/reservas" },
  { key: "reservations", label: "Reservas totales", icon: Sparkles, to: "/admin/reservas" },
  { key: "songs", label: "Canciones en catálogo", icon: Library, to: "/admin/canciones" },
  { key: "suggestionsPending", label: "Sugerencias pendientes", icon: Lightbulb, to: "/admin/sugerencias" },
  { key: "requestsToday", label: "Peticiones de hoy", icon: ListMusic, to: "/admin/cola" },
  { key: "clients", label: "Clientes", icon: Users, to: "/admin/clientes" },
  { key: "artists", label: "Artistas destacados", icon: Mic2, to: "/admin/artistas" },
];

export default function AdminOverview() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: async () => (await api.get("/admin/stats")).data });
  return (
    <div className="admin-page" data-testid="admin-overview-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">PANEL DE CONTROL</p><h1 data-testid="admin-overview-heading">Buenas noches.</h1></div>
        <span data-testid="admin-current-date">{new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date())}</span>
      </header>
      <div className="stats-grid">
        {CARDS.map(({ key, label, icon: Icon, to }) => (
          <Link key={key} to={to} className="stat-card" data-testid={`admin-stat-${key}`}>
            <Icon /><p>{label}</p><strong>{isLoading ? "—" : (data?.[key] ?? 0).toLocaleString("es-ES")}</strong>
          </Link>
        ))}
      </div>
      <section className="admin-note" data-testid="admin-welcome-message">
        <div><Sparkles /></div>
        <h2>Todo listo para la próxima noche</h2>
        <p>Revisa las reservas, mantén el catálogo al día importando tu Excel y actualiza horarios y avisos desde Contenido.</p>
      </section>
    </div>
  );
}
