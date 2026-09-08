import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const DEFAULT_LOGO = "https://assets.zyrosite.com/A1a5zx5q1vs656b0/logo_okume_karaoke-removebg-preview-Yyv0x9rkzXcyLOyo.png";

export const LegalLayout = ({ title, updated, testid, children }) => {
  const { data } = useQuery({ queryKey: ["site"], queryFn: async () => (await api.get("/site")).data });
  const logoUrl = data?.settings?.logoUrl || DEFAULT_LOGO;
  return (
    <main className="legal-page" data-testid={testid}>
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
