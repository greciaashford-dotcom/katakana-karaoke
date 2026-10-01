import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Music2, Search, Sparkles, X } from "lucide-react";
import { api } from "@/api/client";
import { useUi } from "@/contexts/UiContext";
import { CATALOG_PATH, formatNumber } from "@/lib/constants";
import { SongRow } from "@/components/SongRow";
import { SongRequestModal } from "@/components/SongRequestModal";
import { SongSuggestionModal } from "@/components/SongSuggestionModal";

const QUICK = [
  { label: "Novedades", params: { sort: "new" } },
  { label: "Español", params: { lang: "es" } },
  { label: "Inglés", params: { lang: "en" } },
  { label: "Francés", params: { lang: "fr" } },
  { label: "Italiano", params: { lang: "it" } },
  { label: "Portugués", params: { lang: "pt" } },
  { label: "Infantiles", params: { artist: "infantiles" } },
];

const SearchPanel = ({ initial, onClose }) => {
  const navigate = useNavigate();
  const [value, setValue] = useState(initial);
  const [q, setQ] = useState(initial.trim());
  const [requestSong, setRequestSong] = useState(null);
  const [suggest, setSuggest] = useState(null);
  useEffect(() => { const t = setTimeout(() => setQ(value.trim()), 200); return () => clearTimeout(t); }, [value]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape" && !requestSong && !suggest) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose, requestSong, suggest]);
  const enabled = q.length >= 2;
  const { data, isFetching } = useQuery({ queryKey: ["quick-songs", q], queryFn: async () => (await api.get("/songs", { params: { q, limit: 8 } })).data, enabled, placeholderData: (old) => old });
  const go = (params) => { navigate(`${CATALOG_PATH}?${new URLSearchParams(params).toString()}`); onClose(); };
  return (
    <div className="k-search-overlay" onClick={onClose} data-testid="search-overlay">
      <div className="k-search-panel" role="dialog" aria-modal="true" aria-label="Buscar canciones" onClick={(e) => e.stopPropagation()}>
        <form className="k-search-field" role="search" onSubmit={(e) => { e.preventDefault(); if (value.trim()) go({ q: value.trim() }); }}>
          {isFetching ? <Loader2 className="k-spin" /> : <Search />}
          <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="Artista, título o código…" aria-label="Buscar canciones" autoComplete="off" enterKeyHint="search" data-testid="search-overlay-input" />
          <button type="button" className="k-icon-btn" onClick={onClose} aria-label="Cerrar buscador" data-testid="search-overlay-close"><X /></button>
        </form>
        <div className="k-search-body">
          {!enabled ? (
            <>
              <p className="k-search-hint">Escribe al menos dos letras. Puedes buscar por <strong>artista</strong>, <strong>título</strong> o <strong>código</strong> (por ejemplo «KME-96-A62»), sin preocuparte por tildes ni mayúsculas.</p>
              <div className="k-search-quick">{QUICK.map((item) => <button key={item.label} type="button" className="k-chip" onClick={() => go(item.params)} data-testid={`search-quick-${item.label.toLowerCase()}`}>{item.label === "Novedades" ? <Sparkles /> : <Music2 />}{item.label}</button>)}</div>
            </>
          ) : data?.total === 0 ? (
            <div className="k-search-hint" data-testid="search-overlay-empty">
              <p style={{ margin: "0 0 14px" }}>No encontramos «{q}» en el repertorio.</p>
              <button type="button" className="k-btn k-btn--primary k-btn--sm" onClick={() => setSuggest({ title: q })} data-testid="search-overlay-suggest">Pídenos que la añadamos</button>
            </div>
          ) : (
            <div className="k-songs" data-testid="search-overlay-results">
              {data?.items?.map((song) => <SongRow key={song.id} song={song} compact onRequest={setRequestSong} onArtist={(artist) => go({ artist })} />)}
            </div>
          )}
        </div>
        <div className="k-search-foot">
          <span>Intro para ver todo · Esc para cerrar</span>
          {enabled && data?.total > 0 && <button type="button" className="k-link" style={{ border: 0, background: "none", cursor: "pointer", font: "inherit", fontWeight: 700 }} onClick={() => go({ q })} data-testid="search-overlay-view-all">Ver {formatNumber(data.total)} resultados <ArrowRight /></button>}
        </div>
      </div>
      {requestSong && <div onClick={(e) => e.stopPropagation()}><SongRequestModal song={requestSong} onClose={() => setRequestSong(null)} /></div>}
      {suggest && <div onClick={(e) => e.stopPropagation()}><SongSuggestionModal initial={suggest} onClose={() => setSuggest(null)} /></div>}
    </div>
  );
};

export const SearchOverlay = () => {
  const { search, closeSearch } = useUi();
  if (!search.open) return null;
  return <SearchPanel initial={search.q} onClose={closeSearch} />;
};
