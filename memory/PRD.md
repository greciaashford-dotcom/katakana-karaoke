# PRD — Okume Karaoke

## Problema original
Crear una aplicación web full-stack premium y moderna para **Okume Karaoke**, preparada para GitHub y alojamiento Node.js estándar. Debe incluir una web pública mobile-first con estética “Nightlife Premium”, hero multimedia editable, carrusel 3D de artistas, reservas, catálogo completo extraído del PDF KaraFun, buscador, QR, galería, reseñas de Google, datos de marca y un panel privado para gestionar contenido, artistas y reservas.

## Decisiones de arquitectura
- **Frontend:** React 19, React Router, TanStack Query, Axios, Framer Motion disponible, Shadcn/UI y CSS responsive propio.
- **Backend principal:** Node.js 20 + Express 5 + MongoDB; API REST bajo `/api`.
- **Previsualización:** adaptador ASGI transparente en el puerto 8001 que inicia y reenvía al servidor Express interno. La lógica de negocio y persistencia permanecen en Express.
- **Autenticación:** JWT de 8 horas; el token solo identifica al usuario y el rol se vuelve a consultar en MongoDB en cada petición protegida.
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

## Backlog priorizado

### P0 — Bloqueantes
- Ninguno.

### P1 — Próxima fase
- Cambio de contraseña desde el panel y recuperación segura de acceso.
- Avisos automáticos al equipo cuando entra una nueva reserva.
- Filtros por fecha y exportación CSV de reservas.
- Editor de orden mediante arrastrar y soltar para artistas y galería.

### P2 — Mejoras
- Métricas de búsquedas para identificar canciones más demandadas.
- Favoritos o cola de canciones compartida por mesa.
- Actualización incremental del catálogo mediante nueva carga de PDF.
- Página independiente para eventos privados y celebraciones.

## Próximas tareas recomendadas
1. Añadir notificaciones de nuevas reservas por email o mensajería.
2. Incorporar analítica de búsquedas y conversiones a reserva.
3. Crear una experiencia de cola compartida por QR para cada mesa.