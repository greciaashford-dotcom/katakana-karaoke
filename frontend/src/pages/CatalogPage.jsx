import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Mic2, Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "@/api/client";
import { SongRequestModal } from "@/components/SongRequestModal";

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const artistFilter = searchParams.get("artist") || "";
  const urlQuery = searchParams.get("q") || "";
  const initialQuery = artistFilter || urlQuery;
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(artistFilter ? "" : urlQuery);
  const [page, setPage] = useState(1);
  const [requestSong, setRequestSong] = useState(null);
  useEffect(() => { setInput(initialQuery); setQuery(artistFilter ? "" : urlQuery); setPage(1); }, [artistFilter, initialQuery, urlQuery]);
  useEffect(() => { const timer = setTimeout(() => { setQuery(input); setPage(1); }, 250); return () => clearTimeout(timer); }, [input]);
  const { data, isLoading } = useQuery({ queryKey: ["songs", artistFilter, query, page], queryFn: async () => (await api.get("/songs", { params: { q: artistFilter ? "" : query, artist: artistFilter, page, limit: 30 } })).data, placeholderData: (old) => old });
  const updateSearch = (value) => { setInput(value); if (artistFilter) setSearchParams(value ? { q: value } : {}); };
  const clearSearch = () => { setInput(""); setQuery(""); setSearchParams({}); };
  return (
    <main className="catalog-page" data-testid="catalog-page">
      <header className="catalog-header">
        <Link to="/" data-testid="catalog-back-link"><ArrowLeft /> Okume</Link>
        <span data-testid="catalog-total-header">Catálogo completo</span>
        <a href="/#reservas" data-testid="catalog-reserve-link">Reservar mesa</a>
      </header>
      <section className="catalog-hero">
        <p className="eyebrow" data-testid="catalog-page-eyebrow"><span /> ENCUENTRA TU CANCIÓN</p>
        <h1 data-testid="catalog-page-title">¿Qué vas a<br /><em>cantar hoy?</em></h1>
        <div className="catalog-search">
          <Search />
          <input autoFocus value={input} onChange={(e) => updateSearch(e.target.value)} placeholder="Busca artista o título…" aria-label="Buscar canciones" data-testid="song-search-input" />
          {input && <button onClick={clearSearch} aria-label="Limpiar búsqueda" data-testid="song-search-clear-button"><X /></button>}
        </div>
        <p className="catalog-hint" data-testid="catalog-request-hint">Pulsa el micrófono junto a cada canción para pedirla al escenario desde tu móvil.</p>
      </section>
      <section className="songs-section">
        <div className="songs-summary">
          <p data-testid="song-results-count">{data ? `${data.total.toLocaleString("es-ES")} canciones` : "Buscando…"}</p>
          <span data-testid="song-results-query">{artistFilter ? `Canciones de “${artistFilter}”` : query ? `Resultados para “${query}”` : "Todo el catálogo"}</span>
        </div>
        {isLoading && !data ? (
          <div className="songs-loading" data-testid="songs-loading-state">Buscando canciones…</div>
        ) : (
          <div className="songs-list" data-testid="song-results-list">
            {data?.items.map((song, index) => (
              <article key={song.id} className="song-row" data-testid={`song-result-${song.id}`}>
                <span className="song-number">{String((page - 1) * 30 + index + 1).padStart(3, "0")}</span>
                <div>
                  <h2 data-testid={`song-title-${song.id}`}>{song.title}</h2>
                  <p data-testid={`song-artist-${song.id}`}>{song.artist}</p>
                </div>
                <button className="song-request-btn" onClick={() => setRequestSong(song)} aria-label={`Pedir ${song.title}`} data-testid={`song-request-button-${song.id}`}><Mic2 /></button>
              </article>
            ))}
          </div>
        )}
        {data?.total === 0 && <div className="empty-state" data-testid="songs-empty-state">No encontramos esa canción. Prueba con otro título o artista.</div>}
        {data && data.pages > 1 && (
          <nav className="catalog-pagination" data-testid="catalog-pagination">
            <button disabled={page === 1} onClick={() => { setPage(page - 1); window.scrollTo(0, 500); }} data-testid="catalog-previous-page-button"><ChevronLeft /> Anterior</button>
            <span data-testid="catalog-current-page">Página {page} de {data.pages}</span>
            <button disabled={page === data.pages} onClick={() => { setPage(page + 1); window.scrollTo(0, 500); }} data-testid="catalog-next-page-button">Siguiente <ChevronRight /></button>
          </nav>
        )}
      </section>
      {requestSong && <SongRequestModal song={requestSong} onClose={() => setRequestSong(null)} />}
    </main>
  );
}
