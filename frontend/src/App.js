import "@/App.css";
import "@/styles/extra.css";
import "@/styles/modern.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CookieConsent } from "@/components/CookieConsent";
import { MobileTabBar } from "@/components/MobileTabBar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CATALOG_PATH } from "@/lib/constants";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
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

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="route-loader" data-testid="auth-loading-state">OKUME</div>;
  return user ? children : <Navigate to="/admin/login" replace />;
};

const LegacyCatalogRedirect = () => { const { search } = useLocation(); return <Navigate to={`${CATALOG_PATH}${search}`} replace />; };

const PublicWidgets = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return <><WhatsAppButton /><MobileTabBar /></>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path={CATALOG_PATH} element={<CatalogPage />} />
          <Route path="/catalogo" element={<LegacyCatalogRedirect />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/baja" element={<UnsubscribePage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<Protected><AdminLayout /></Protected>}>
            <Route index element={<AdminOverview />} />
            <Route path="contenido" element={<AdminContent />} />
            <Route path="artistas" element={<AdminArtists />} />
            <Route path="reservas" element={<AdminReservations />} />
            <Route path="clientes" element={<AdminClients />} />
            <Route path="cola" element={<AdminSongQueue />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <PublicWidgets />
        <CookieConsent />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
