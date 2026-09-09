import { useRef, useState } from "react";
import { Download, FileUp, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { sourceLabels } from "./labels";

export const ClientsToolbar = ({ filters, onChange, onAdd, onRefresh }) => {
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportExcel = async () => {
    setExporting(true);
    try {
      const { data } = await api.get("/admin/clients/export", { params: filters, responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = Object.assign(document.createElement("a"), { href: url, download: `okume-clientes-${new Date().toISOString().slice(0, 10)}.xlsx` });
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      toast.success("Excel descargado");
    } catch { toast.error("No se pudo exportar"); } finally { setExporting(false); }
  };

  const importExcel = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/admin/clients/import", form);
      toast.success(`Importación completada: ${data.created} nuevos · ${data.updated} actualizados · ${data.skipped} omitidos`, { duration: 7000 });
      onRefresh();
    } catch (error) { toast.error(error.response?.data?.error || "No se pudo importar el archivo"); } finally { setImporting(false); }
  };

  return (
    <div className="clients-toolbar" data-testid="clients-toolbar">
      <label className="clients-search">
        <Search />
        <input value={filters.q} onChange={(e) => onChange({ ...filters, q: e.target.value })} placeholder="Buscar por correo, nombre o teléfono" data-testid="clients-search-input" />
      </label>
      <select value={filters.source} onChange={(e) => onChange({ ...filters, source: e.target.value })} data-testid="clients-source-filter">
        <option value="">Todos los orígenes</option>
        {Object.entries(sourceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select value={filters.subscribed} onChange={(e) => onChange({ ...filters, subscribed: e.target.value })} data-testid="clients-subscribed-filter">
        <option value="">Suscritos y bajas</option>
        <option value="true">Solo suscritos</option>
        <option value="false">Solo bajas</option>
      </select>
      <div className="clients-toolbar-actions">
        <input ref={fileRef} type="file" accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={importExcel} hidden data-testid="clients-import-input" />
        <button type="button" className="admin-chip" onClick={() => fileRef.current?.click()} disabled={importing} data-testid="clients-import-button"><FileUp /> {importing ? "Importando…" : "Importar Excel"}</button>
        <button type="button" className="admin-chip" onClick={exportExcel} disabled={exporting} data-testid="clients-export-button"><Download /> {exporting ? "Generando…" : "Exportar Excel"}</button>
        <button type="button" className="admin-save" onClick={onAdd} data-testid="clients-add-button"><UserPlus /> Añadir cliente</button>
      </div>
    </div>
  );
};
