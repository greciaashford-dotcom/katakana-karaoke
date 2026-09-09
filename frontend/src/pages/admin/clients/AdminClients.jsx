import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Send } from "lucide-react";
import { api } from "@/api/client";
import { ClientsToolbar } from "./ClientsToolbar";
import { ClientsTable } from "./ClientsTable";
import { ClientFormModal } from "./ClientFormModal";
import { CampaignComposer } from "./CampaignComposer";
import { CampaignHistory } from "./CampaignHistory";

import { sourceLabels } from "./labels";

export default function AdminClients() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("clients");
  const [filters, setFilters] = useState({ q: "", source: "", subscribed: "" });
  const [editing, setEditing] = useState(null);
  const { data } = useQuery({ queryKey: ["admin-clients", filters], queryFn: async () => (await api.get("/admin/clients", { params: filters })).data, placeholderData: (old) => old });
  const refresh = () => { queryClient.invalidateQueries({ queryKey: ["admin-clients"] }); queryClient.invalidateQueries({ queryKey: ["admin-stats"] }); };

  return (
    <div className="admin-page" data-testid="admin-clients-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">BASE DE DATOS Y EMAIL MARKETING</p><h1 data-testid="admin-clients-heading">Clientes</h1></div>
        <div className="clients-kpis">
          <span data-testid="admin-clients-count"><strong>{data?.total ?? "—"}</strong> contactos</span>
          <span data-testid="admin-clients-subscribed"><strong>{data?.subscribed ?? "—"}</strong> suscritos</span>
          <span data-testid="admin-clients-unsubscribed"><strong>{data?.unsubscribed ?? "—"}</strong> bajas</span>
        </div>
      </header>

      <div className="admin-tabs" role="tablist" data-testid="admin-clients-tabs">
        <button role="tab" aria-selected={tab === "clients"} className={tab === "clients" ? "is-active" : ""} onClick={() => setTab("clients")} data-testid="clients-tab-database"><Database /> Base de datos</button>
        <button role="tab" aria-selected={tab === "marketing"} className={tab === "marketing" ? "is-active" : ""} onClick={() => setTab("marketing")} data-testid="clients-tab-marketing"><Send /> Email marketing</button>
      </div>

      {tab === "clients" ? (
        <section className="admin-form-section" data-testid="admin-clients-list-section">
          <ClientsToolbar filters={filters} onChange={setFilters} onAdd={() => setEditing({})} onRefresh={refresh} />
          <ClientsTable items={data?.items || []} onEdit={setEditing} onRefresh={refresh} />
        </section>
      ) : (
        <>
          <CampaignComposer subscribedCount={data?.subscribed || 0} onSent={refresh} />
          <CampaignHistory />
        </>
      )}
      {editing && <ClientFormModal client={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={refresh} />}
    </div>
  );
}
