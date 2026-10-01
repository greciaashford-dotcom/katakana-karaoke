import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_LOGO } from "@/lib/constants";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/admin" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="login-page" data-testid="admin-login-page">
      <section className="login-brand" style={{ background: "linear-gradient(155deg, rgba(232,90,30,.94), rgba(20,12,8,.9)), url(/images/local-salon.jpg) center/cover" }}>
        <a href="/" data-testid="login-home-link"><ArrowLeft style={{ width: 16, verticalAlign: "-3px" }} /> Volver a Katakana</a>
        <div>
          <img src={DEFAULT_LOGO} alt="Karaoke Katakana" style={{ height: 72, width: "auto", marginBottom: 28 }} />
          <p className="eyebrow"><span /> ÁREA PRIVADA</p>
          <h1 data-testid="login-heading">El backstage<br />de <em>Katakana.</em></h1>
        </div>
        <p data-testid="login-support-text">Reservas, catálogo de canciones, clientes y contenido de la web.</p>
      </section>
      <section className="login-panel">
        <form onSubmit={submit} data-testid="admin-login-form">
          <LockKeyhole />
          <h2>Acceso al panel</h2>
          <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="username" data-testid="admin-email-input" /></label>
          <label>Contraseña<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" data-testid="admin-password-input" /></label>
          <button className="button button--primary button--wide" disabled={loading} data-testid="admin-login-submit-button">{loading ? "Accediendo…" : "Entrar"}</button>
        </form>
      </section>
    </main>
  );
}
