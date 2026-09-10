# PRD — Okume Karaoke

## Problema original
Crear una aplicación web full-stack premium y moderna para **Okume Karaoke**, preparada para GitHub y alojamiento Node.js estándar. Debe incluir una web pública mobile-first con estética “Nightlife Premium”, hero multimedia editable, carrusel 3D de artistas, reservas, catálogo completo extraído del PDF KaraFun, buscador, QR, galería, reseñas de Google, datos de marca y un panel privado para gestionar contenido, artistas y reservas.

## Decisiones de arquitectura
- **Frontend:** React 19, React Router, TanStack Query, Axios, Framer Motion disponible, Shadcn/UI y CSS responsive propio.
- **Backend (desde 2026-09-10):** Python FastAPI + Motor (MongoDB) en un único proceso `uvicorn server:app` en el puerto 8001 (`backend/server.py` + paquete `backend/okume/`). Sustituye por completo al antiguo Node/Express + proxy: el contenedor de producción solo tiene Python y el despliegue fallaba con `FileNotFoundError: 'node'`. Los contratos de la API (rutas `/api/*`, formas JSON, errores `{error}` y códigos 201/202/204/401/403/404/409) se mantienen idénticos para el frontend.
- **Autenticación:** JWT HS256 de 8 horas (PyJWT), contraseñas bcrypt (compatibles con los hashes previos de bcryptjs); el rol se vuelve a consultar en MongoDB en cada petición protegida. Rate limit de login 12/15 min por IP (X-Forwarded-For). Dos cuentas admin sembradas: `ADMIN_EMAIL` y `OWNER_EMAIL` (achat.revente.paris20@gmail.com).
- **Datos:** identificadores UUID públicos; `_id` de MongoDB excluido de todas las respuestas.
- **Catálogo:** 88.770 canciones y 16.365 artistas extraídos de 689 páginas; búsqueda normalizada sin acentos y paginación de servidor.
- **Media:** URLs externas editables. Las 25 portadas iniciales son composiciones gráficas originales sin usar fotografías de artistas.
- **Integraciones:** widget Elfsight Google Reviews cargado de forma asíncrona y singleton; QR local con `qrcode.react`.

## Personas
1. **Cliente del local:** busca una canción rápidamente desde el móvil, solicita mesa y consulta ubicación/contacto.
2. **Grupo o celebrante:** explora ambiente y artistas antes de reservar una noche especial.
3. **Administrador de Okume:** actualiza la portada, galería y artistas, y gestiona solicitudes de reserva.

## Requisitos esenciales (estáticos)
- Hero como primera sección con imagen/video editable, textos de marca y dos CTA.
- Coverflow 3D inmediatamente después del hero con 25 artistas iniciales.
- Formulario de reserva con nombre, personas, fecha, hora y contacto.
- Catálogo completo del PDF con búsqueda por artista/título y paginación.
- QR prominente hacia `https://okumekaraoke.com/catalogo`.
- Galería con las 9 imágenes suministradas.
- Widget Elfsight `6e1cb35c-4f12-4095-aa0a-55886b10306d`.
- Datos de marca, contacto, dirección y redes de Okume.
- Panel privado JWT con CRUD de ajustes, galería, artistas y reservas.
- Diseño premium, accesible y responsive sin desplazamiento horizontal.

## Implementado

### 2026-08-19 — MVP completo
- Web pública completa: hero, navegación, coverflow 3D, reservas, QR, galería, reseñas, contacto y footer.
- Catálogo de 88.770 canciones extraído íntegramente y verificado visualmente contra páginas del PDF; búsqueda instantánea y paginación.
- Panel admin con login JWT, resumen, ajustes de contenido, gestor de galería, CRUD de artistas y gestor de reservas.
- Seed idempotente para administrador, ajustes, portadas, galería y canciones.
- Seguridad: rate limit de login, Helmet, validación, autorización en servidor y respuestas MongoDB saneadas.
- Compilación de producción correcta; pruebas backend 12/12 y flujo frontend completo aprobados.

### 2026-08-19 — Navegación por artista
- Cada portada del coverflow abre el catálogo con un filtro exacto por artista.
- El clic y el gesto de arrastre se distinguen para mantener ambas interacciones.
- El catálogo conserva el artista en el buscador y permite limpiar o cambiar a una búsqueda general.
- El carrusel avanza automáticamente hacia la izquierda cada 2 segundos con transición suave, sin interferir con el arrastre manual.

### 2026-08-19 — Ajustes visuales de cabecera
- Logo principal ampliado un 80% manteniendo adaptación responsive.
- Eliminado el indicador decorativo “OKUME 01” del hero.

### 2026-06 — Legal, peticiones de canciones, clientes y email marketing (Resend)
- **Páginas legales** conformes a RGPD/LOPDGDD/LSSI-CE: `/privacidad`, `/terminos`, `/cookies` (contenido en español) con `LegalLayout` reutilizable (cabecera + pie).
- **Banner de consentimiento de cookies** (`CookieConsent`) con aceptar/rechazar, persistido en `localStorage`, enlazado desde el pie.
- **Peticiones de canciones**: cada canción del catálogo tiene un botón que abre un modal (`SongRequestModal`) donde el invitado indica su correo (nombre opcional). `POST /api/song-requests` crea la petición con `dateKey` en zona Europe/Madrid y registra al cliente. El correo se recuerda en `localStorage`.
- **Cola de canciones (admin)**: nueva vista `Cola de canciones` con columnas «Por sonar» / «Ya sonaron», check para marcar reproducidas (y deshacer), borrado y filtro por fecha (día actual por defecto).
- **Clientes + Email marketing (admin)**: vista `Clientes` con la lista capturada desde reservas y peticiones, y compositor de campañas que envía por Resend (`POST /api/admin/campaigns`, devuelve enviados/fallidos).
- **Correos automáticos (Resend)**: correo de bienvenida con marca/colores (#29493a, #f8efd2, #ff665a) y logo al capturar un correo por primera vez; seguimiento a las 130 h mediante cron de plataforma (`.emergent/crons.yml` → `POST /api/cron/followup`, protegido con `WEBHOOK_CRON_SECRET` y `timingSafeEqual`, ACK 202 + trabajo en `setImmediate`).
- **Reservas modernizadas**: formulario en 2 pasos (stepper de personas, fecha/hora → nombre, correo, teléfono, notas) con captura de correo del cliente.
- **Datos nuevos**: colecciones `clients` (email único), `songRequests` (índice `dateKey`+`createdAt`), `campaigns`. Estadísticas del panel ampliadas con `clients` y `requestsToday`.
- **Estado Resend**: dominio `okumekaraoke.com` VERIFICADO; remitente `no-reply@okumekaraoke.com` (SENDER_EMAIL). Entrega a cualquier destinatario.
- Pruebas: backend 21/21 (12 regresión + 9 nuevas) y E2E frontend de todas las funciones nuevas aprobadas (iteración 2).

### 2026-06 — Rediseño de cabecera, móvil, mapa, base de clientes Excel y ciclo de email de por vida (iteración 3)
- **Error ResizeObserver** corregido: el observer del coverflow difiere la medición con `requestAnimationFrame` y el aviso benigno se filtra en `index.html`.
- **Favicon y metadatos**: favicon.ico / PNG 32-192-512 / apple-touch-icon generados desde el logo aportado; título, descripción, `lang="es"`, `theme-color` y `site.webmanifest`.
- **Cabecera nueva (`SiteHeader` + `HeaderSearch`)**: fija y siempre visible; al hacer scroll se transforma en píldora flotante translúcida (glass, bordes 26px). Elementos más grandes y espaciados, enlace «Ubicación» y CTA «Reserva» en píldora coral. Buscador «¿Qué cantarás hoy?» con sugerencias en vivo (6 resultados, pedir canción desde la sugerencia, «Ver N resultados»). En `/canciones-karaoke-madrid` el buscador de cabecera se oculta y queda solo el del catálogo.
- **Móvil**: tab bar inferior fija (Inicio, Canciones, Reservas, Menú con hoja deslizante) en ≤900px; inputs a 16px para evitar el zoom de iOS; sin desplazamiento horizontal; espaciados para la barra y el botón de WhatsApp.
- **WhatsApp flotante** (`wa.me/34680590364`) en todas las páginas públicas, oculto en admin.
- **Bordes semiredondeados** en botones, tarjetas, imágenes, inputs, modales y paneles (`styles/modern.css`), sombras suaves en lugar de sombras desplazadas, micro-animaciones (reveal al hacer scroll con Framer Motion, hover, indicador de scroll en el hero).
- **Sección Ubicación** (`#ubicacion`) con Google Maps embebido (sin API key) en estilo oscuro, dirección, barrio y botones Cómo llegar / WhatsApp / Llamar.
- **URL del catálogo**: `/canciones-karaoke-madrid`; `/catalogo` redirige conservando parámetros (QR y enlaces antiguos siguen funcionando). QR actualizado.
- **Admin › Clientes v2** (`pages/admin/clients/`): pestañas «Base de datos» y «Email marketing». Tabla con búsqueda, filtro por origen y estado, alta manual, edición, baja/alta con un clic y borrado. **Importar / Exportar Excel** (exceljs): exportación con cabeceras Correo, Nombre, Teléfono, Origen, Fecha de alta, Suscrito, Último correo, Próximo seguimiento, Seguimientos, Notas; importación con detección flexible de cabeceras, deduplicación por correo, sin correo de bienvenida (origen `importado`). Campañas: audiencia por origen, solo suscritos, botón «Enviarme una prueba», envío en segundo plano (202) con historial y progreso (enviados/fallidos).
- **Ciclo de email de por vida**: el correo se recuerda en el dispositivo (`localStorage`) y la segunda petición de canción se envía con un toque («¿No eres tú?» para cambiar). Bienvenida solo una vez; seguimiento cada 130 h indefinidamente (4 plantillas rotativas que invitan a volver) hasta la baja. Enlace de baja RGPD en todos los correos + cabeceras `List-Unsubscribe`; página `/baja?token=` con baja y re-suscripción. Migración automática de clientes antiguos (`subscribed`, `unsubscribeToken`, `nextFollowupAt`).
- Datos nuevos en `clients`: `phone, notes, subscribed, unsubscribeToken, unsubscribedAt, nextFollowupAt, lastFollowupAt, lastEmailAt, followupCount`. `campaigns`: `status, source, ctaText, ctaUrl, finishedAt`.
- Endpoints nuevos: `GET/POST /api/unsubscribe/:token`, `GET /api/admin/clients?q&source&subscribed`, `POST/PUT /api/admin/clients(/:id)`, `GET /api/admin/clients/export`, `POST /api/admin/clients/import` (multipart `file`), `GET /api/admin/campaigns`, `POST /api/admin/campaigns/test`.
- Pruebas: backend 10/10 nuevas + regresión, E2E frontend desktop y móvil aprobadas (iteración 3, `/app/test_reports/iteration_3.json`). Sin errores ResizeObserver en consola.

### 2026-09-10 — Corrección de despliegue: backend portado a Python (iteración 4)
- Causa raíz del fallo de deploy: `server.py` lanzaba `node server.js` y la imagen de producción (python:3.11) no tiene Node → `FileNotFoundError: 'node'`, el backend moría y el health check `/health` nunca respondía.
- Solución: todo el backend Express reescrito en FastAPI puro (`backend/okume/`: `config`, `database`, `auth`, `emails` (SDK resend), `excel_utils` (openpyxl), `seed`, `routes_public`, `routes_admin`). Archivos Node eliminados (`server.js`, `src/`, `package.json`, `node_modules`). `requirements.txt` + `resend`, `openpyxl`.
- Health check en `GET /health` y `GET /api/health` (`{ok:true, service:"okume-api"}`). Siembra idempotente; el catálogo de 88.770 canciones se carga en segundo plano si la base está vacía (Atlas) para no bloquear el readiness.
- `.gitignore`: eliminadas las reglas que ocultaban los `.env` (bloqueaban el despliegue). Nueva variable `OWNER_EMAIL` en `backend/.env`.
- Verificación: deployment_agent PASS; pytest 30/30 (una prueba obsoleta que enviaba campañas a todos los clientes fue eliminada); smoke E2E frontend sin errores 5xx (`/app/test_reports/iteration_4.json`).

## Backlog priorizado

### P0 — Bloqueantes
- Ninguno.

### P1 — Próxima fase
- Cambio de contraseña desde el panel y recuperación segura de acceso.
- Avisos automáticos al equipo (email/WhatsApp) cuando entra una nueva reserva.
- Configurar la URL definitiva del vídeo de fondo desde el panel cuando el usuario disponga del enlace.
- Filtros por fecha y exportación Excel de reservas (reutilizando `clientsExcel`).
- Editor de orden mediante arrastrar y soltar para artistas y galería.
- Cambiar `PUBLIC_SITE_URL` al dominio definitivo (okumekaraoke.com) para los enlaces de los correos al desplegar.

### P2 — Mejoras
- Cola por QR en mesa: cada mesa pide canciones con su propio QR y ve su turno en vivo.
- Métricas de búsquedas para identificar canciones más demandadas.
- Actualización incremental del catálogo mediante nueva carga de PDF.
- Página independiente para eventos privados y celebraciones.
- Segmentación avanzada de campañas (etiquetas, cumpleaños) y plantillas guardadas.

## Próximas tareas recomendadas
1. Notificaciones de nuevas reservas al equipo por email o WhatsApp.
2. Exportación Excel de reservas y filtros por fecha.
3. Cola compartida por QR para cada mesa.