import { useSite } from "@/lib/useSite";
import { usePageMeta } from "@/lib/usePageMeta";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const SiteLayout = ({ title, description, testid, solidHeader = false, children }) => {
  usePageMeta(title, description);
  const { data } = useSite();
  const settings = data?.settings;
  return (
    <div className="k-site" data-testid={testid}>
      <SiteHeader logoUrl={settings?.logoUrl} notice={settings?.notice} solid={solidHeader} />
      <main>{children}</main>
      <SiteFooter logoUrl={settings?.logoUrl} settings={settings} />
    </div>
  );
};
