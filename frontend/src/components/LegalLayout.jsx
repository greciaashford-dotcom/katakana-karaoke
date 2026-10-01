import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";

export const LegalLayout = ({ title, updated, testid, children }) => (
  <SiteLayout title={title} testid={testid}>
    <PageHero eyebrow="Información legal" title={title} lead={`Última actualización: ${updated}`} testid="legal-hero" />
    <section className="k-section" style={{ paddingTop: 0 }}>
      <div className="k-container">
        <article className="k-legal" data-testid="legal-body">{children}</article>
      </div>
    </section>
  </SiteLayout>
);
