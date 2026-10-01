import { useState } from "react";
import { Check, Copy, Mic2 } from "lucide-react";
import { toast } from "sonner";
import { LANG_SHORT } from "@/lib/constants";

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = Object.assign(document.createElement("textarea"), { value: text });
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
};

export const SongRow = ({ song, onRequest, onArtist, compact = false }) => {
  const [copied, setCopied] = useState(false);
  const copy = async (e) => {
    e.stopPropagation();
    if (await copyText(song.code)) {
      setCopied(true);
      toast.success(`Código ${song.code} copiado`);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };
  return (
    <article className={`k-song ${compact ? "k-song--compact" : ""}`} data-testid={`song-row-${song.id}`}>
      <div className="k-song-meta">
        {song.code && (
          <button type="button" className={`k-song-code ${copied ? "is-copied" : ""}`} onClick={copy} aria-label={`Copiar código ${song.code}`} title="Copiar código" data-testid={`song-code-${song.id}`}>
            <span>{song.code}</span>{copied ? <Check /> : <Copy />}
          </button>
        )}
        <span className="k-lang" title={song.language} data-testid={`song-lang-${song.id}`}>{LANG_SHORT[song.lang] || song.lang?.toUpperCase()}</span>
      </div>
      <div className="k-song-main">
        <h3 className="k-song-title" data-testid={`song-title-${song.id}`}>{song.title}</h3>
        <p className="k-song-artist" data-testid={`song-artist-${song.id}`}>
          {onArtist ? <button type="button" onClick={() => onArtist(song.artist)} data-testid={`song-artist-filter-${song.id}`}>{song.artist}</button> : song.artist}
        </p>
      </div>
      {onRequest && <button type="button" className="k-song-request" onClick={() => onRequest(song)} aria-label={`Pedir ${song.title}`} title="Pedir esta canción" data-testid={`song-request-button-${song.id}`}><Mic2 /></button>}
    </article>
  );
};
