import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import LoginPage from "@/pages/LoginPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminContent from "@/pages/admin/AdminContent";
import AdminArtists from "@/pages/admin/AdminArtists";
import AdminReservations from "@/pages/admin/AdminReservations";

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
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<Protected><AdminLayout /></Protected>}>
            <Route index element={<AdminOverview />} />
            <Route path="contenido" element={<AdminContent />} />
            <Route path="artistas" element={<AdminArtists />} />
            <Route path="reservas" element={<AdminReservations />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}