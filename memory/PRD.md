# PRD — Karaoke Katakana

## Problema original
Adaptar la web existente de Okume Karaoke para **Karaoke Katakana** (Avenida de América, 22, Madrid, desde 2006): importar el catálogo Excel (20.714 canciones), web multipágina (Inicio, Canciones, Reservas, Eventos + subpáginas, Micro abierto, El local, Contacto, legales) con redirecciones desde las URLs antiguas de WordPress, desactivar los correos de Resend (seguir guardando clientes), bloque propio de reseñas de Google con botón «Ver reseñas en Google» (sin Elfsight), botones flotantes «Llamar» y «Cómo llegar» (sin WhatsApp) y gestión completa del catálogo en el panel (buscar, añadir, editar, borrar, importar/exportar Excel). Fuente de contenidos: auditoría del usuario (`/app/memory/assets/audit.md`).

## Arquitectura
- **Frontend:** React 19 + React Router 7 + TanStack Query; sistema visual propio `styles/katakana.css` (clases `k-*`, tema oscuro con degradado naranja del logo; fuentes Bricolage Grotesque + Figtree). Panel admin con estilos claros (`App.css`/`modern.css`/`extra.css`).
- **Backend:** FastAPI + Motor (`backend/katakana/`), DB `katakana_karaoke`. JWT admin. Búsqueda sin tildes (`songs_query.py`), Excel con openpyxl (`catalog.py`).
- **Emails:** Resend DESACTIVADO intencionadamente (sin API key / dominio). Clientes se siguen guardando.

## Implementado
### Backend (fork anterior)
- Catálogo importado (20.714 canciones, 8 idiomas), búsqueda por artista/título/código sin tildes, filtros idioma, orden y facetas.
- Endpoints admin: `/api/admin/songs` CRUD, `/songs/import` (merge|replace), `/songs/export`, `/song-suggestions`, `/settings` (horarios, aviso, reseñas Google).
- Público: `/api/site`, `/api/songs`, `/api/reservations` (tipo de evento + consentimiento), `/api/song-requests`, `/api/song-suggestions`.

### 2026-06 — Frontend multipágina Katakana (iteración 5, probado)
- Rutas: `/`, `/canciones`, `/reservas`, `/eventos`, `/eventos/{cumpleanos,despedidas,empresas,infantil,fiestas-privadas}`, `/micro-abierto`, `/el-local`, `/contacto`, `/aviso-legal`, `/privacidad`, `/cookies`, `/baja`.
- Redirecciones cliente (conservan parámetros): `/catalogo`, `/canciones-karaoke-madrid`, `/repertorio-de-canciones`, `/app/*`, `/servicios-karaoke-katakana`, `/sobre-karaoke-katakana`, `/micro-abierto-de-lunes-a-jueves`, `/politica-de-privacidad`, `/politica-de-cookies`, `/terminos`, etc.
- Inicio: hero con estado «Abierto ahora» en vivo, buscador, chips de artistas, cifras; bloques de valor; coverflow de 25 artistas; eventos; banda micro abierto; promo catálogo + QR (karaokekatakana.com/canciones); galería; **bloque propio de reseñas de Google** (valoración/nº ocultos si están vacíos); ubicación con mapa y horarios; CTA reserva.
- Catálogo: búsqueda con URL compartible (q, artist, lang, sort, page), chips de idioma con recuento, orden, paginación numérica, copiar código, pedir canción, sugerir canción nueva.
- Reservas en 2 pasos con tipo de evento (preseleccionable `?tipo=`), formularios en cada evento y en micro abierto; FAQ por evento.
- Cabecera fija con buscador superpuesto (atajo «/»), menú móvil, barra inferior móvil (Canciones, Reservar, Llamar, Cómo llegar, Menú), botones flotantes Llamar / Cómo llegar en escritorio. Sin WhatsApp ni Elfsight.
- Panel: marca Katakana, nuevas secciones **Catálogo** (buscar, filtrar, ordenar, paginar, añadir/editar/borrar, importar Excel combinar/reemplazar, exportar) y **Sugerencias** (pendientes/añadidas/descartadas, añadir al catálogo con un clic); Contenido con editor de horarios, aviso destacado, reseñas de Google y galería; resumen con enlaces.
- `sitemap.xml` + `robots.txt`. Esc cierra todos los modales.
- Pruebas: backend 19/19 (`backend/tests/test_katakana_api.py`), E2E frontend ~100% (`/app/test_reports/iteration_5.json`).

## Backlog
### P1
- Confirmar con el propietario: teléfono definitivo, horarios vigentes, precios/condiciones de eventos, vigencia del micro abierto, razón social/CIF para textos legales.
- Activar Resend cuando haya dominio verificado + API key (`RESEND_API_KEY`, `SENDER_EMAIL`).
- Redirecciones 301 a nivel de servidor/hosting para SEO (las actuales son de cliente).
- Rellenar valoración y nº de reseñas de Google desde el panel.
### P2
- Blog (27 artículos a migrar), datos estructurados `Event` para micro abierto.
- Exportación Excel de reservas y avisos al equipo por nueva reserva.
- Cola por QR en mesa con turno en vivo.
