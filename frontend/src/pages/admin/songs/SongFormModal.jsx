import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { CATALOG_LANGS } from "@/lib/constants";
import { useEscape } from "@/lib/useEscape";

export const SongFormModal = ({ song, initial, onClose, onSaved }) => {
  useEscape(onClose);
  const [form, setForm] = useState({ artist: song?.artist || initial?.artist || "", title: song?.title || initial?.title || "", code: song?.code || "", lang: song?.lang || "es" });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = song ? await api.put(`/admin/songs/${song.id}`, form) : await api.post("/admin/songs", form);
      toast.success(song ? "Canción actualizada" : "Canción añadida al catálogo");
      onSaved(data.song);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="admin-modal-backdrop" onClick={onClose} data-testid="song-form-modal">
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar" data-testid="song-form-close"><X /></button>
        <h2>{song ? "Editar canción" : "Nueva canción"}</h2>
        <label>Artista<input required value={form.artist} onChange={set("artist")} placeholder="Ej.: Rocío Jurado" data-testid="song-form-artist" /></label>
        <label>Título<input required value={form.title} onChange={set("title")} placeholder="Ej.: Como una ola" data-testid="song-form-title" /></label>
        <label>Código <small>(opcional)</small><input value={form.code} onChange={set("code")} placeholder="Ej.: KME-96-A62" data-testid="song-form-code" /></label>
        <label>Idioma
          <select value={form.lang} onChange={set("lang")} data-testid="song-form-lang">
            {CATALOG_LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            <option value="xx">Otros</option>
          </select>
        </label>
        <button className="admin-save" disabled={saving} data-testid="song-form-submit">{saving ? "Guardando…" : "Guardar"}</button>
      </form>
    </div>
  );
};
