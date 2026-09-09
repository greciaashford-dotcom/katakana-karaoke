import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mic2, Search, X } from "lucide-react";
import { api } from "@/api/client";
import { CATALOG_PATH } from "@/lib/constants";
import { SongRequestModal } from "@/components/SongRequestModal";

export const HeaderSearch = () => {
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const [value, setValue] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [requestSong, setRequestSong] = useState(null);
  useEffect(() => { const timer = setTimeout(() => setQ(value.trim()), 220); return () => clearTimeout(timer); }, [value]);
  useEffect(() => {
    const onDoc = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);
  const enabled = q.length >= 2;
  const { data } = useQuery({ queryKey: ["header-songs", q], queryFn: async () => (await api.get("/songs", { params: { q, limit: 6 } })).data, enabled, placeholderData: (old) => old });
  const goCatalog = () => { const term = value.trim(); navigate(term ? `${CATALOG_PATH}?q=${encodeURIComponent(term)}` : CATALOG_PATH); setOpen(false); };
  const showResults = open && enabled;
  return (
    <div ref={boxRef} className={`header-search ${showResults ? "is-open" : ""}`} data-testid="header-search">
      <form className="header-search-field" onSubmit={(e) => { e.preventDefault(); goCatalog(); }} role="search">
        <Search className="header-search-icon" />
        <input value={value} onChange={(e) => { setValue(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="¿Qué cantarás hoy?" aria-label="Buscar canciones" autoComplete="off" enterKeyHint="search" data-testid="header-search-input" />
        {value && <button type="button" className="header-search-clear" onClick={() => { setValue(""); setQ(""); }} aria-label="Limpiar" data-testid="header-search-clear"><X /></button>}
      </form>
      {showResults && (
        <div className="header-search-results" data-testid="header-search-results">
          {data?.items?.map((song) => (
            <button key={song.id} type="button" className="header-search-item" onClick={() => { setRequestSong(song); setOpen(false); }} data-testid={`header-search-result-${song.id}`}>
              <span className="header-search-item-icon"><Mic2 /></span>
              <span className="header-search-item-text"><strong>{song.title}</strong><small>{song.artist}</small></span>
            </button>
          ))}
          {data?.total === 0 && <p className="header-search-empty" data-testid="header-search-empty">No encontramos esa canción. Prueba otro título o artista.</p>}
          {data?.total > 0 && <button type="button" className="header-search-all" onClick={goCatalog} data-testid="header-search-view-all">Ver {data.total.toLocaleString("es-ES")} resultados <ArrowRight /></button>}
        </div>
      )}
      {requestSong && <SongRequestModal song={requestSong} onClose={() => setRequestSong(null)} />}
    </div>
  );
};
