import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Mail, Music4, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { clearGuest, getGuest, saveGuest } from "@/lib/guest";

export const SongRequestModal = ({ song, onClose }) => {
  const guest = useRef(getGuest());
  const [email, setEmail] = useState(guest.current.email);
  const [name, setName] = useState(guest.current.name);
  const [mode, setMode] = useState(guest.current.email ? "auto" : "form");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const send = async (targetEmail, targetName) => {
    setSending(true);
    try {
      await api.post("/song-requests", { email: targetEmail, name: targetName, title: song.title, artist: song.artist, code: song.code, songId: song.id });
      saveGuest({ email: targetEmail, name: targetName });
      setDone(true);
      toast.success("¡Canción añadida a la cola!");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo pedir la canción");
      setMode("form");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { if (mode === "auto" && !done && !sending) send(guest.current.email, guest.current.name); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const changeEmail = () => { clearGuest(); guest.current = { email: "", name: "" }; setEmail(""); setName(""); setDone(false); setMode("form"); };

  return (
    <div className="song-modal-backdrop" onClick={onClose} data-testid="song-request-modal">
      <div className="song-modal" onClick={(e) => e.stopPropagation()}>
        <button className="song-modal-close" onClick={onClose} aria-label="Cerrar" data-testid="song-request-close-button"><X /></button>
        {done ? (
          <div className="song-modal-done" data-testid="song-request-success">
            <div className="song-modal-check"><Check /></div>
            <h3>¡Pedida!</h3>
            <p>«{song.title}» está en la cola. El equipo la pondrá muy pronto.</p>
            {song.code && <p className="song-modal-code" data-testid="song-request-code">Código <strong>{song.code}</strong></p>}
            <small className="song-modal-identity" data-testid="song-request-identity">Pedida como <strong>{email}</strong> · <button type="button" onClick={changeEmail} data-testid="song-request-change-email">¿No eres tú?</button></small>
            <button className="button button--primary button--wide" onClick={onClose} data-testid="song-request-done-button">Perfecto</button>
          </div>
        ) : mode === "auto" ? (
          <div className="song-modal-done" data-testid="song-request-auto-state">
            <div className="song-modal-check is-loading"><Loader2 /></div>
            <h3>Añadiendo a la cola…</h3>
            <p>«{song.title}» · {song.artist}</p>
          </div>
        ) : (
          <>
            <p className="song-modal-eyebrow"><Music4 /> Pide tu canción</p>
            <h3 className="song-modal-title" data-testid="song-request-title">{song.title}</h3>
            <p className="song-modal-artist" data-testid="song-request-artist">{song.artist}{song.code ? <> · <strong className="song-modal-code-inline">{song.code}</strong></> : null}</p>
            <form onSubmit={(e) => { e.preventDefault(); send(email.trim().toLowerCase(), name.trim()); }} data-testid="song-request-form">
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
              <small className="song-modal-note">Solo te lo pediremos una vez: recordaremos tu correo en este dispositivo para que pidas canciones con un toque. Tratamos tus datos según nuestra política de privacidad y puedes darte de baja cuando quieras.</small>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
