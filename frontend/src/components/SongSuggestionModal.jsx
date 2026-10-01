import { useState } from "react";
import { Check, Mail, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { getGuest, saveGuest } from "@/lib/guest";

export const SongSuggestionModal = ({ initial = {}, onClose }) => {
  const guest = getGuest();
  const [form, setForm] = useState({ title: initial.title || "", artist: initial.artist || "", email: guest.email || "", name: guest.name || "", notes: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const payload = { ...form, email: form.email.trim().toLowerCase(), title: form.title.trim(), artist: form.artist.trim() };
      await api.post("/song-suggestions", payload);
      if (payload.email) saveGuest({ email: payload.email, name: form.name.trim() });
      setDone(true);
      toast.success("¡Gracias! Hemos recibido tu sugerencia");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo enviar la sugerencia");
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="song-modal-backdrop" onClick={onClose} data-testid="song-suggestion-modal">
      <div className="song-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Sugerir canción">
        <button className="song-modal-close" onClick={onClose} aria-label="Cerrar" data-testid="song-suggestion-close-button"><X /></button>
        {done ? (
          <div className="song-modal-done" data-testid="song-suggestion-success">
            <div className="song-modal-check"><Check /></div>
            <h3>¡Apuntada!</h3>
            <p>Si «{form.title}» existe en formato karaoke, la buscaremos para incorporarla al repertorio.</p>
            <button className="button button--primary button--wide" onClick={onClose} data-testid="song-suggestion-done-button">Perfecto</button>
          </div>
        ) : (
          <>
            <p className="song-modal-eyebrow"><Sparkles /> Pide una canción nueva</p>
            <h3 className="song-modal-title">¿No está tu canción?</h3>
            <p className="song-modal-artist">Cuéntanos cuál es y, si está disponible en formato karaoke, intentaremos añadirla.</p>
            <form onSubmit={submit} data-testid="song-suggestion-form">
              <label>Título de la canción<input required value={form.title} onChange={set("title")} placeholder="Ej.: Despechá" data-testid="song-suggestion-title-input" /></label>
              <label>Artista<input required value={form.artist} onChange={set("artist")} placeholder="Ej.: Rosalía" data-testid="song-suggestion-artist-input" /></label>
              <label>Tu correo <small>(opcional, para avisarte)</small>
                <div className="song-modal-input-icon"><Mail /><input type="email" value={form.email} onChange={set("email")} placeholder="tucorreo@email.com" data-testid="song-suggestion-email-input" /></div>
              </label>
              <button className="button button--primary button--wide" disabled={sending} data-testid="song-suggestion-submit-button">{sending ? "Enviando…" : "Enviar sugerencia"}</button>
              <small className="song-modal-note">Las sugerencias se revisan periódicamente. La incorporación depende de su disponibilidad y licencias en formato karaoke.</small>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
