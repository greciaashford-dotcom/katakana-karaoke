import { useSiteLogo } from "@/lib/useSiteLogo";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const LegalLayout = ({ title, updated, testid, children }) => {
  const logoUrl = useSiteLogo();
  return (
    <main className="legal-page page-offset" data-testid={testid}>
      <SiteHeader logoUrl={logoUrl} />
      <article className="legal-content">
        <p className="eyebrow"><span /> INFORMACIÓN LEGAL</p>
        <h1 className="legal-title" data-testid="legal-title">{title}</h1>
        <p className="legal-updated">Última actualización: {updated}</p>
        <div className="legal-body">{children}</div>
      </article>
      <SiteFooter logoUrl={logoUrl} />
    </main>
  );
};
