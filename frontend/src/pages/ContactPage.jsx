import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useSite } from "@/lib/useSite";
import { BUSINESS, DIRECTIONS_URL, MAIL_URL, TEL_URL } from "@/lib/constants";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { LocationSection } from "@/components/LocationSection";
import { ReserveCta } from "@/components/ReserveCta";
import { Reveal } from "@/components/Reveal";

export default function ContactPage() {
  const { data } = useSite();
  const settings = data?.settings;
  const cards = [
    { icon: Phone, title: "Teléfono", value: BUSINESS.phoneIntl, text: settings?.reservationHours || "Atención a reservas de lunes a sábado.", href: TEL_URL, testid: "contact-phone-card" },
    { icon: Mail, title: "Correo", value: BUSINESS.email, text: "Para reservas de grupos, eventos y cualquier consulta.", href: MAIL_URL, testid: "contact-email-card" },
    { icon: MapPin, title: "Dirección", value: BUSINESS.address1, text: BUSINESS.address2, href: DIRECTIONS_URL, testid: "contact-address-card" },
  ];
  return (
    <SiteLayout title="Contacto y horarios" description="Contacto de Karaoke Katakana: Avenida de América, 22, 28028 Madrid. Teléfono +34 917 260 183, correo, horarios y cómo llegar." testid="contact-page">
      <PageHero eyebrow="Contacto" title={<>Hablemos, <span className="k-grad-text">y luego cantamos</span></>} lead="Resolvemos tus dudas sobre reservas, celebraciones y el repertorio. Llámanos, escríbenos o ven a vernos." crumbs={[{ label: "Contacto" }]} testid="contact-hero" />
      <section className="k-section" style={{ paddingTop: 0 }}>
        <div className="k-container">
          <div className="k-values">
            {cards.map(({ icon: Icon, title, value, text, href, testid }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="k-value" style={{ display: "block", height: "100%" }} data-testid={testid}>
                  <span className="k-value-icon"><Icon /></span>
                  <h3 className="k-h3">{title}</h3>
                  <p style={{ color: "var(--k-text)", fontWeight: 700, overflowWrap: "anywhere" }}>{value}</p>
                  <p>{text}</p>
                </a>
              </Reveal>
            ))}
            <Reveal delay={0.18} className="k-value" data-testid="contact-social-card">
              <span className="k-value-icon"><Instagram /></span>
              <h3 className="k-h3">Redes sociales</h3>
              <p>Fotos, fiestas temáticas y novedades del repertorio.</p>
              <div className="k-socials">
                <a href={BUSINESS.instagram} target="_blank" rel="noreferrer" className="k-icon-btn" aria-label="Instagram" data-testid="contact-instagram-link"><Instagram /></a>
                <a href={BUSINESS.facebook} target="_blank" rel="noreferrer" className="k-icon-btn" aria-label="Facebook" data-testid="contact-facebook-link"><Facebook /></a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <LocationSection settings={settings} testid="contact-location-section" />
      <ReserveCta />
    </SiteLayout>
  );
}
