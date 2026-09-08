import "@/App.css";
import "@/styles/extra.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CookieConsent } from "@/components/CookieConsent";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import LoginPage from "@/pages/LoginPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import CookiesPage from "@/pages/CookiesPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminContent from "@/pages/admin/AdminContent";
import AdminArtists from "@/pages/admin/AdminArtists";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminClients from "@/pages/admin/AdminClients";
import AdminSongQueue from "@/pages/admin/AdminSongQueue";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="route-loader" data-testid="auth-loading-state">OKUME</div>;
  return user ? children : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
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
        <CookieConsent />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
