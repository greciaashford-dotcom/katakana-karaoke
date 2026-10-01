import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";

export const SongsTable = ({ items, onEdit, onRefresh }) => {
  const remove = async (song) => {
    if (!window.confirm(`¿Eliminar «${song.title}» de ${song.artist}?`)) return;
    try {
      await api.delete(`/admin/songs/${song.id}`);
      toast.success("Canción eliminada");
      onRefresh();
    } catch (error) { toast.error(error.response?.data?.error || "No se pudo eliminar"); }
  };
  if (!items.length) return <div className="empty-state" data-testid="admin-songs-empty">No hay canciones con estos filtros.</div>;
  return (
    <div className="clients-table-wrap">
      <table className="clients-table" data-testid="admin-songs-table">
        <thead><tr><th>ID</th><th>Artista</th><th>Título</th><th>Código</th><th>Idioma</th><th aria-label="Acciones" /></tr></thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} data-testid={`admin-song-${s.id}`}>
              <td data-testid={`admin-song-source-${s.id}`}>{s.sourceId ?? "—"}</td>
              <td data-testid={`admin-song-artist-${s.id}`}>{s.artist}</td>
              <td><strong data-testid={`admin-song-title-${s.id}`}>{s.title}</strong></td>
              <td><code data-testid={`admin-song-code-${s.id}`}>{s.code || "—"}</code></td>
              <td><span className="client-source">{s.language}</span></td>
              <td className="clients-row-actions">
                <button type="button" onClick={() => onEdit(s)} aria-label="Editar canción" data-testid={`admin-song-edit-${s.id}`}><Pencil /></button>
                <button type="button" onClick={() => remove(s)} aria-label="Eliminar canción" data-testid={`admin-song-delete-${s.id}`}><Trash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
