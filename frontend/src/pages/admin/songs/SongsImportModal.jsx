import { useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";

export const SongsImportModal = ({ onClose, onDone }) => {
  const fileRef = useRef(null);
  const [mode, setMode] = useState("merge");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Selecciona un archivo Excel (.xlsx)"); return; }
    if (mode === "replace" && !window.confirm("Se borrará el catálogo actual y se sustituirá por el del Excel. ¿Continuar?")) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("mode", mode);
      const { data } = await api.post("/admin/songs/import", form, { timeout: 180000 });
      setResult(data);
      toast.success("Importación completada");
      onDone();
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo importar el archivo");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="admin-modal-backdrop" onClick={onClose} data-testid="songs-import-modal">
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar" data-testid="songs-import-close"><X /></button>
        <h2>Importar catálogo desde Excel</h2>
        <p className="admin-hint">El archivo debe tener columnas de <strong>Artista</strong> y <strong>Título</strong>. Opcionales: ID, Código e Idioma (o Código idioma). Puedes usar el mismo formato que la exportación.</p>
        {result ? (
          <div className="import-result" data-testid="songs-import-result">
            <p><strong>{result.total.toLocaleString("es-ES")}</strong> filas leídas</p>
            <p><strong>{result.created.toLocaleString("es-ES")}</strong> nuevas · <strong>{(result.updated || 0).toLocaleString("es-ES")}</strong> actualizadas · <strong>{(result.unchanged || 0).toLocaleString("es-ES")}</strong> sin cambios · <strong>{result.skipped.toLocaleString("es-ES")}</strong> omitidas</p>
            <button type="button" className="admin-save" onClick={onClose} data-testid="songs-import-finish">Cerrar</button>
          </div>
        ) : (
          <>
            <div className="import-modes" role="radiogroup" aria-label="Modo de importación">
              <label className={`import-mode ${mode === "merge" ? "is-active" : ""}`}><input type="radio" name="mode" checked={mode === "merge"} onChange={() => setMode("merge")} data-testid="songs-import-mode-merge" /><span><strong>Combinar</strong> Añade las canciones nuevas y actualiza las existentes (recomendado).</span></label>
              <label className={`import-mode ${mode === "replace" ? "is-active" : ""}`}><input type="radio" name="mode" checked={mode === "replace"} onChange={() => setMode("replace")} data-testid="songs-import-mode-replace" /><span><strong>Reemplazar todo</strong> Borra el catálogo actual y deja solo las canciones del Excel.</span></label>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} data-testid="songs-import-file-input" />
            <button type="button" className="admin-chip" onClick={() => fileRef.current?.click()} data-testid="songs-import-pick-button"><FileUp /> {file ? file.name : "Elegir archivo .xlsx"}</button>
            <button className="admin-save" disabled={busy || !file} data-testid="songs-import-submit">{busy ? "Importando… puede tardar unos segundos" : "Importar"}</button>
          </>
        )}
      </form>
    </div>
  );
};
