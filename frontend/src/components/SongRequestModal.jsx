import { useState } from "react";
import { Check, Mail, Music4, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";

const EMAIL_KEY = "okume-guest-email";
const NAME_KEY = "okume-guest-name";

export const SongRequestModal = ({ song, onClose }) => {
  const [email, setEmail] = useState(localStorage.getItem(EMAIL_KEY) || "");
  const [name, setName] = useState(localStorage.getItem(NAME_KEY) || "");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/song-requests", { email, name, title: song.title, artist: song.artist, songId: song.id });
      localStorage.setItem(EMAIL_KEY, email);
      if (name) localStorage.setItem(NAME_KEY, name);
      setDone(true);
      toast.success("¡Canción añadida a la cola!");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo pedir la canción");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="song-modal-backdrop" onClick={onClose} data-testid="song-request-modal">
      <div className="song-modal" onClick={(e) => e.stopPropagation()}>
        <button className="song-modal-close" onClick={onClose} aria-label="Cerrar" data-testid="song-request-close-button"><X /></button>
        {done ? (
          <div className="song-modal-done" data-testid="song-request-success">
            <div className="song-modal-check"><Check /></div>
            <h3>¡Pedida!</h3>
            <p>«{song.title}» está en la cola. El equipo la pondrá muy pronto.</p>
            <button className="button button--primary button--wide" onClick={onClose} data-testid="song-request-done-button">Perfecto</button>
          </div>
        ) : (
          <>
            <p className="song-modal-eyebrow"><Music4 /> Pide tu canción</p>
            <h3 className="song-modal-title" data-testid="song-request-title">{song.title}</h3>
            <p className="song-modal-artist" data-testid="song-request-artist">{song.artist}</p>
            <form onSubmit={submit} data-testid="song-request-form">
              <label>Tu nombre <small>(opcional)</small>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="¿Cómo te llamas?" data-testid="song-request-name-input" />
              </label>
              <label>Tu correo
                <div className="song-modal-input-icon">
                  <Mail />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@email.com" data-testid="song-request-email-input" />
                </div>
              </label>
              <button className="button button--primary button--wide" disabled={sending} data-testid="song-request-submit-button">{sending ? "Enviando…" : "Pedir esta canción"}</button>
              <small className="song-modal-note">Usaremos tu correo para gestionar tu petición y enviarte novedades de Okume. Puedes darte de baja cuando quieras.</small>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
