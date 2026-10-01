import { useSearchParams } from "react-router-dom";
import { Clock, Mail, Phone, ShieldCheck, Users } from "lucide-react";
import { useSite } from "@/lib/useSite";
import { BUSINESS, MAIL_URL, TEL_URL } from "@/lib/constants";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { ReservationForm } from "@/components/ReservationForm";
import { Fact } from "@/components/Fact";

export default function ReservePage() {
  const [params] = useSearchParams();
  const { data } = useSite();
  const settings = data?.settings;
  return (
    <SiteLayout title="Reservar mesa" description="Reserva tu mesa en Karaoke Katakana (Avenida de América, Madrid) para una noche de karaoke, cumpleaños, despedida o evento de empresa." testid="reserve-page">
      <PageHero eyebrow="Reservas" title={<>Reserva tu <span className="k-grad-text">noche de karaoke</span></>} lead="Cuéntanos qué celebráis, cuántos seréis y cuándo venís. Te confirmaremos la disponibilidad por teléfono o correo." crumbs={[{ label: "Reservar" }]} testid="reserve-hero" />
      <section className="k-section" style={{ paddingTop: 0 }}>
        <div className="k-container">
          <div className="k-reserve">
            <div>
              <h2 className="k-h3">Antes de reservar</h2>
              <div className="k-reserve-facts">
                <Fact icon={Clock} title="Atención a reservas" text={settings?.reservationHours || "De lunes a sábado, de 20:00 a 03:00."} testid="reserve-fact-hours" />
                <Fact icon={Phone} title="¿Prefieres llamar?" text={BUSINESS.phoneIntl} href={TEL_URL} testid="reserve-fact-phone" />
                <Fact icon={Mail} title="Escríbenos" text={BUSINESS.email} href={MAIL_URL} testid="reserve-fact-email" />
                <Fact icon={Users} title="Grupos y celebraciones" text="Cumpleaños, despedidas o empresa: indícalo en el formulario y te proponemos la mejor zona del local." testid="reserve-fact-groups" />
                <Fact icon={ShieldCheck} title="Sin compromiso" text="Tu solicitud no es una reserva confirmada hasta que te contactemos para cerrar los detalles." testid="reserve-fact-confirm" />
              </div>
            </div>
            <ReservationForm defaultType={params.get("tipo") || "karaoke"} />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
