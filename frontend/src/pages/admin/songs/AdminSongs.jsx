import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileUp, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { CATALOG_LANGS, formatNumber } from "@/lib/constants";
import { Pagination } from "@/components/Pagination";
import { SongsTable } from "./SongsTable";
import { SongFormModal } from "./SongFormModal";
import { SongsImportModal } from "./SongsImportModal";

const downloadBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
};

export default function AdminSongs() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [filters, setFilters] = useState({ q: "", lang: "", sort: "new", page: 1 });
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  useEffect(() => { const t = setTimeout(() => setFilters((f) => (f.q === input.trim() ? f : { ...f, q: input.trim(), page: 1 })), 250); return () => clearTimeout(t); }, [input]);
  const { data, isFetching } = useQuery({ queryKey: ["admin-songs", filters], queryFn: async () => (await api.get("/admin/songs", { params: { ...filters, limit: 50 } })).data, placeholderData: (old) => old });
  const refresh = () => ["admin-songs", "admin-stats", "site", "songs", "quick-songs"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page || 1 }));

  const exportExcel = async () => {
    setExporting(true);
    try {
      const { data: blob } = await api.get("/admin/songs/export", { responseType: "blob", timeout: 120000 });
      downloadBlob(blob, `katakana-canciones-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Catálogo exportado");
    } catch { toast.error("No se pudo exportar"); } finally { setExporting(false); }
  };

  return (
    <div className="admin-page" data-testid="admin-songs-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">REPERTORIO</p><h1 data-testid="admin-songs-heading">Catálogo de canciones</h1></div>
        <div className="clients-kpis"><span data-testid="admin-songs-total"><strong>{data ? formatNumber(data.total) : "—"}</strong> {filters.q || filters.lang ? "resultados" : "canciones"}</span></div>
      </header>
      <section className="admin-form-section">
        <div className="clients-toolbar" data-testid="admin-songs-toolbar">
          <label className="clients-search"><Search /><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Buscar por artista, título o código" data-testid="admin-songs-search-input" /></label>
          <select value={filters.lang} onChange={(e) => setFilter({ lang: e.target.value })} data-testid="admin-songs-lang-filter">
            <option value="">Todos los idiomas</option>
            {CATALOG_LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <select value={filters.sort} onChange={(e) => setFilter({ sort: e.target.value })} data-testid="admin-songs-sort">
            <option value="new">Últimas añadidas</option>
            <option value="artist">Artista A–Z</option>
            <option value="title">Título A–Z</option>
            {filters.q && <option value="relevance">Relevancia</option>}
          </select>
          <div className="clients-toolbar-actions">
            <button type="button" className="admin-chip" onClick={() => setImporting(true)} data-testid="admin-songs-import-button"><FileUp /> Importar Excel</button>
            <button type="button" className="admin-chip" onClick={exportExcel} disabled={exporting} data-testid="admin-songs-export-button"><Download /> {exporting ? "Generando…" : "Exportar Excel"}</button>
            <button type="button" className="admin-save" onClick={() => setEditing({})} data-testid="admin-songs-add-button"><Plus /> Añadir canción</button>
          </div>
        </div>
        <div style={{ opacity: isFetching ? 0.6 : 1, transition: "opacity .2s" }}>
          <SongsTable items={data?.items || []} onEdit={setEditing} onRefresh={refresh} />
        </div>
        <Pagination page={filters.page} pages={data?.pages} onChange={(page) => setFilters((f) => ({ ...f, page }))} testid="admin-songs-pagination" />
      </section>
      {editing && <SongFormModal song={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={refresh} />}
      {importing && <SongsImportModal onClose={() => setImporting(false)} onDone={refresh} />}
    </div>
  );
}
