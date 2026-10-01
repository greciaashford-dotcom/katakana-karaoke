import "@/App.css";
import "@/styles/extra.css";
import "@/styles/modern.css";
import "@/styles/katakana.css";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { UiProvider } from "@/contexts/UiContext";
import { CookieConsent } from "@/components/CookieConsent";
import { MobileTabBar } from "@/components/MobileTabBar";
import { QuickActions } from "@/components/QuickActions";
import { MenuSheet } from "@/components/MenuSheet";
import { SearchOverlay } from "@/components/SearchOverlay";
import { CATALOG_PATH, CONTACT_PATH, EVENTS_PATH, LOCAL_PATH, MICRO_PATH, RESERVE_PATH } from "@/lib/constants";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import ReservePage from "@/pages/ReservePage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import MicroPage from "@/pages/MicroPage";
import LocalPage from "@/pages/LocalPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import CookiesPage from "@/pages/CookiesPage";
import UnsubscribePage from "@/pages/UnsubscribePage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminContent from "@/pages/admin/AdminContent";
import AdminArtists from "@/pages/admin/AdminArtists";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminClients from "@/pages/admin/clients/AdminClients";
import AdminSongQueue from "@/pages/admin/AdminSongQueue";
import AdminSongs from "@/pages/admin/songs/AdminSongs";
import AdminSuggestions from "@/pages/admin/songs/AdminSuggestions";

// URLs antiguas (WordPress, app de catálogo y web previa) → nuevas rutas
const LEGACY_REDIRECTS = [
  ["/catalogo", CATALOG_PATH], ["/canciones-karaoke-madrid", CATALOG_PATH], ["/repertorio-de-canciones", CATALOG_PATH],
  ["/app/*", CATALOG_PATH], ["/servicios-karaoke-katakana", EVENTS_PATH], ["/servicios", EVENTS_PATH],
  ["/sobre-karaoke-katakana", LOCAL_PATH], ["/sobre-nosotros", LOCAL_PATH], ["/micro-abierto-de-lunes-a-jueves", MICRO_PATH],
  ["/reservar", RESERVE_PATH], ["/reserva", RESERVE_PATH], ["/eventos/empresa", `${EVENTS_PATH}/empresas`],
  ["/eventos/despedida", `${EVENTS_PATH}/despedidas`], ["/eventos/cumpleaños", `${EVENTS_PATH}/cumpleanos`], ["/micro", MICRO_PATH],
  ["/politica-de-privacidad", "/privacidad"], ["/politica-de-cookies", "/cookies"], ["/terminos", "/aviso-legal"], ["/legal", "/aviso-legal"],
  ["/contact", CONTACT_PATH],
];

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="k-loader" data-testid="auth-loading-state"><img src="/brand/katakana-logo.png" alt="Karaoke Katakana" /></div>;
  return user ? children : <Navigate to="/admin/login" replace />;
};

const Redirect = ({ to }) => {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const PublicWidgets = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return <><QuickActions /><MobileTabBar /><MenuSheet /><SearchOverlay /><CookieConsent /></>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UiProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path={CATALOG_PATH} element={<CatalogPage />} />
            <Route path={RESERVE_PATH} element={<ReservePage />} />
            <Route path={EVENTS_PATH} element={<EventsPage />} />
            <Route path={`${EVENTS_PATH}/:slug`} element={<EventDetailPage />} />
            <Route path={MICRO_PATH} element={<MicroPage />} />
            <Route path={LOCAL_PATH} element={<LocalPage />} />
            <Route path={CONTACT_PATH} element={<ContactPage />} />
            <Route path="/aviso-legal" element={<TermsPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/baja" element={<UnsubscribePage />} />
            {LEGACY_REDIRECTS.map(([from, to]) => <Route key={from} path={from} element={<Redirect to={to} />} />)}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<Protected><AdminLayout /></Protected>}>
              <Route index element={<AdminOverview />} />
              <Route path="reservas" element={<AdminReservations />} />
              <Route path="canciones" element={<AdminSongs />} />
              <Route path="sugerencias" element={<AdminSuggestions />} />
              <Route path="cola" element={<AdminSongQueue />} />
              <Route path="clientes" element={<AdminClients />} />
              <Route path="artistas" element={<AdminArtists />} />
              <Route path="contenido" element={<AdminContent />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <PublicWidgets />
          <Toaster richColors position="top-right" />
        </UiProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
