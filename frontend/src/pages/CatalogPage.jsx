import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Copy, Languages, Mic2, Search, SearchX, Sparkles, X } from "lucide-react";
import { api } from "@/api/client";
import { useSite } from "@/lib/useSite";
import { formatNumber } from "@/lib/constants";
import { SiteLayout } from "@/components/SiteLayout";
import { SongRow } from "@/components/SongRow";
import { Pagination } from "@/components/Pagination";
import { SongRequestModal } from "@/components/SongRequestModal";
import { SongSuggestionModal } from "@/components/SongSuggestionModal";

const SORTS = [
  { value: "relevance", label: "Más relevantes", needsQuery: true },
  { value: "artist", label: "Artista A–Z" },
  { value: "title", label: "Título A–Z" },
  { value: "new", label: "Últimas incorporaciones" },
];

const SongSkeleton = () => <div className="k-songs" data-testid="songs-loading-state">{Array.from({ length: 6 }, (_, i) => <div key={i} className="k-skeleton" />)}</div>;

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const artist = params.get("artist") || "";
  const lang = params.get("lang") || "";
  const sort = params.get("sort") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [input, setInput] = useState(q);
  const [requestSong, setRequestSong] = useState(null);
  const [suggest, setSuggest] = useState(null);
  const { data: site } = useSite();

  const update = (patch) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, String(value)) : next.delete(key)));
    if (!("page" in patch)) next.delete("page");
    return next;
  }, { replace: true });

  useEffect(() => { setInput(q); }, [q]);
  useEffect(() => {
    const t = setTimeout(() => { if (input.trim() !== q) update({ q: input.trim() }); }, 250);
    return () => clearTimeout(t);
  }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading } = useQuery({
    queryKey: ["songs", q, artist, lang, sort, page],
    queryFn: async () => (await api.get("/songs", { params: { q, artist, lang, sort, page, limit: 30 } })).data,
    placeholderData: (old) => old,
  });
  const currentSort = data?.sort || sort || (q ? "relevance" : "artist");
  const goPage = (p) => { update({ page: p }); document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const languages = (data?.languages || []).filter((l) => l.count > 0 || l.lang === lang);

  return (
    <SiteLayout title="Lista de canciones de karaoke" description="Busca entre más de 20.000 canciones de karaoke en español, inglés, francés, italiano y portugués. Copia el código y pide tu canción en Karaoke Katakana." testid="catalog-page">
      <section className="k-catalog-hero">
        <div className="k-container">
          <p className="k-eyebrow" data-testid="catalog-page-eyebrow">Repertorio · {formatNumber(site?.catalog?.songs) || "+20.000"} canciones</p>
          <h1 className="k-h1 k-h1--sm" data-testid="catalog-page-title">¿Qué vas a <span className="k-grad-text">cantar hoy?</span></h1>
          <form className="k-catalog-search" role="search" onSubmit={(e) => { e.preventDefault(); update({ q: input.trim() }); }} data-testid="catalog-search-box">
            <Search aria-hidden="true" />
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Artista, título o código…" aria-label="Buscar canciones" autoComplete="off" enterKeyHint="search" data-testid="song-search-input" />
            {input && <button type="button" className="k-icon-btn" onClick={() => { setInput(""); update({ q: "" }); }} aria-label="Limpiar búsqueda" data-testid="song-search-clear-button"><X /></button>}
          </form>
          <div className="k-catalog-tips">
            <span><Copy /> Toca el código para copiarlo</span>
            <span><Mic2 /> Pide la canción al escenario desde tu mesa</span>
            <span><Languages /> Sin tildes ni mayúsculas</span>
          </div>
        </div>
      </section>

      <section className="k-container" id="resultados" style={{ paddingBottom: 96, scrollMarginTop: 90 }}>
        <div className="k-toolbar">
          <div className="k-toolbar-row">
            <div className="k-lang-chips" role="group" aria-label="Filtrar por idioma" data-testid="lang-filter">
              <button type="button" className={`k-chip ${!lang ? "is-active" : ""}`} onClick={() => update({ lang: "" })} data-testid="lang-filter-all">Todos</button>
              {languages.map((l) => <button type="button" key={l.lang} className={`k-chip ${lang === l.lang ? "is-active" : ""}`} onClick={() => update({ lang: l.lang })} data-testid={`lang-filter-${l.lang}`}>{l.label} <small>{formatNumber(l.count)}</small></button>)}
            </div>
            <div className="k-toolbar-right">
              <select className="k-select" value={currentSort} onChange={(e) => update({ sort: e.target.value })} aria-label="Ordenar" data-testid="catalog-sort-select">
                {SORTS.filter((s) => !s.needsQuery || q).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="k-results-meta">
          <span data-testid="song-results-count"><strong>{data ? formatNumber(data.total) : "…"}</strong> canciones{q ? <> para «{q}»</> : null}</span>
          {artist && <span className="k-filter-tag" data-testid="artist-filter-tag">Artista: {artist}<button type="button" onClick={() => update({ artist: "" })} aria-label="Quitar filtro de artista" data-testid="artist-filter-clear"><X /></button></span>}
        </div>

        {isLoading && !data ? <SongSkeleton /> : data?.total === 0 ? (
          <div className="k-empty" data-testid="songs-empty-state">
            <SearchX />
            <h3 className="k-h3">No encontramos esa canción</h3>
            <p>Prueba con otra forma de escribirla, busca solo por artista o pídenos que la incorporemos al repertorio.</p>
            <button type="button" className="k-btn k-btn--primary" onClick={() => setSuggest({ title: q })} data-testid="songs-empty-suggest-button"><Sparkles /> Sugerir esta canción</button>
          </div>
        ) : (
          <div className="k-songs" data-testid="song-results-list">
            {data?.items.map((song) => <SongRow key={song.id} song={song} onRequest={setRequestSong} onArtist={(name) => update({ artist: name, q: "" })} />)}
          </div>
        )}

        <Pagination page={page} pages={data?.pages} onChange={goPage} testid="catalog-pagination" />

        <div className="k-suggest" data-testid="song-suggest-block">
          <div>
            <h3 className="k-h3">¿No encuentras tu canción?</h3>
            <p>Si existe en formato karaoke, intentaremos incorporarla al repertorio.</p>
          </div>
          <button type="button" className="k-btn k-btn--primary" onClick={() => setSuggest({ title: q })} data-testid="song-suggest-button"><Sparkles /> Sugerir una canción</button>
        </div>
      </section>
      {requestSong && <SongRequestModal song={requestSong} onClose={() => setRequestSong(null)} />}
      {suggest && <SongSuggestionModal initial={suggest} onClose={() => setSuggest(null)} />}
    </SiteLayout>
  );
}
