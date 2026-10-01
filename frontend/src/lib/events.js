import { Briefcase, Cake, Baby, GlassWater, PartyPopper, Guitar } from "lucide-react";

export const EVENT_STEPS = [
  { title: "Cuéntanos tu plan", text: "Indica fecha, hora aproximada, número de personas y qué celebráis." },
  { title: "Te confirmamos", text: "Revisamos disponibilidad y te contactamos para cerrar los detalles." },
  { title: "¡A cantar!", text: "Llegad, buscad vuestras canciones en el móvil y subid al escenario." },
];

export const EVENTS = [
  {
    slug: "cumpleanos", type: "cumpleanos", icon: Cake, short: "Cumpleaños",
    title: "Cumpleaños con karaoke en Madrid", eyebrow: "Celebraciones",
    image: "/images/evento-cumpleanos.jpg", imageAlt: "Grupo de amigas celebrando un cumpleaños en el escenario de Katakana",
    teaser: "Sopla las velas cantando con tu gente.",
    intro: "Celebra tu cumpleaños con escenario, sonido digital y más de 20.000 canciones para que hasta el más tímido acabe cantando. Reserva para tu grupo y nosotros nos encargamos del ambiente.",
    highlights: ["Reserva para grupos de amigos o familia", "Escenario y micrófonos para todo el grupo", "Canciones en español, inglés, francés, italiano y portugués", "Barra, mesas altas o salón: elige vuestro ambiente"],
    faq: [
      { q: "¿Con cuánta antelación debo reservar?", a: "Cuanto antes, mejor, sobre todo para viernes y sábados. Envía tu solicitud y te confirmaremos la disponibilidad lo antes posible." },
      { q: "¿Puedo traer tarta o decoración?", a: "Indícalo en las notas de la reserva y te diremos qué es posible para tu celebración." },
      { q: "¿Cuánto cuesta?", a: "Depende del día, del número de personas y de lo que necesitéis. Llámanos o envía la solicitud y te informamos sin compromiso." },
    ],
  },
  {
    slug: "despedidas", type: "despedida", icon: GlassWater, short: "Despedidas",
    title: "Despedidas de soltero y soltera", eyebrow: "Despedidas",
    image: "/images/evento-despedida.jpg", imageAlt: "Cuatro amigas cantando con micrófonos en el escenario de Katakana",
    teaser: "La última noche merece banda sonora.",
    intro: "La despedida perfecta tiene banda sonora. Sube al escenario con tu grupo, dedica las canciones más míticas y convierte la noche en un recuerdo para toda la vida.",
    highlights: ["Ambiente festivo y participativo", "Canciones para dedicar, corear y bailar", "Escenario para todo el grupo", "Copas en la barra o en vuestra mesa"],
    faq: [
      { q: "¿Para cuántas personas?", a: "Cuéntanos cuántos seréis al hacer la solicitud y te propondremos la mejor zona para el grupo." },
      { q: "¿Podemos preparar alguna sorpresa?", a: "Indica en las notas cualquier plan especial y te confirmamos qué podemos hacer." },
      { q: "¿Cuánto cuesta?", a: "Las condiciones dependen del día y del tamaño del grupo. Te informamos al confirmar la reserva." },
    ],
  },
  {
    slug: "empresas", type: "empresa", icon: Briefcase, short: "Empresas y afterwork",
    title: "Afterworks y fiestas de empresa", eyebrow: "Empresas",
    image: "/images/evento-empresa.jpg", imageAlt: "Sala de Katakana llena durante una noche de karaoke en grupo",
    teaser: "Une al equipo fuera de la oficina.",
    intro: "Afterworks, cenas de Navidad y fiestas de empresa con karaoke, copas y muy buen ambiente, junto al intercambiador de Avenida de América: fácil de llegar para todo el equipo.",
    highlights: ["Afterworks para compañeros de trabajo", "Fiestas de empresa y celebraciones de Navidad", "Muy bien comunicado: metro y autobuses en Avenida de América", "Te ayudamos a organizar zona y horario para el grupo"],
    faq: [
      { q: "¿Podéis emitir factura?", a: "Indica en la solicitud que es un evento de empresa y te informaremos sobre facturación y condiciones." },
      { q: "¿Se puede reservar una zona o el local?", a: "Cuéntanos el número de asistentes y la fecha y estudiaremos la mejor opción para tu equipo." },
      { q: "¿Y si no todos quieren cantar?", a: "Katakana es también para quien solo quiere escuchar música y tomar algo: barra, mesas altas y salón con vista al escenario." },
    ],
  },
  {
    slug: "infantil", type: "infantil", icon: Baby, short: "Karaoke infantil",
    title: "Karaoke infantil", eyebrow: "Para los peques",
    image: "/images/local-salon-butacas.jpg", imageAlt: "Salón de Katakana con butacas rojas y luces de colores",
    teaser: "Pequeños artistas, gran escenario.",
    intro: "Los más pequeños también quieren su escenario. Canciones infantiles y éxitos para toda la familia en un karaoke pensado para todas las generaciones.",
    highlights: ["Canciones infantiles y clásicos para cantar en familia", "Escenario y micrófonos para los pequeños artistas", "Ideal para cumpleaños infantiles", "Horarios y condiciones para menores bajo consulta"],
    catalogLink: { label: "Ver canciones infantiles", artist: "infantiles" },
    faq: [
      { q: "¿En qué horario se puede organizar?", a: "El karaoke infantil se organiza bajo reserva. Llámanos y te indicamos horarios y condiciones para menores." },
      { q: "¿Qué canciones hay para niños?", a: "Tenemos una selección de canciones infantiles y cientos de éxitos que conocen pequeños y mayores. Puedes consultarlas en nuestro catálogo." },
    ],
  },
  {
    slug: "fiestas-privadas", type: "privada", icon: PartyPopper, short: "Fiestas privadas",
    title: "Fiestas privadas", eyebrow: "A tu medida",
    image: "/images/evento-baile.jpg", imageAlt: "Público bailando y cantando junto al escenario de Katakana",
    teaser: "Tu fiesta, tu repertorio, tu noche.",
    intro: "Reserva las instalaciones de Katakana para tu celebración: aniversarios, reencuentros, fiestas temáticas o cualquier excusa para cantar juntos.",
    highlights: ["Tres ambientes comunicados: barra, mesas altas y salón", "Equipo de sonido digital de alta calidad", "Fiestas temáticas como Halloween o Navidad", "Propuesta a medida según el tamaño del grupo"],
    faq: [
      { q: "¿Se puede reservar todo el local?", a: "Cuéntanos fecha y número de invitados y te propondremos la mejor opción para tu fiesta." },
      { q: "¿Podemos elegir la música?", a: "Claro: el repertorio es vuestro. Busca las canciones en el catálogo y, si falta alguna, pídenos que la incorporemos." },
    ],
  },
];

export const MICRO_EVENT = {
  slug: "micro-abierto", type: "micro", icon: Guitar, short: "Micro abierto",
  title: "Micro abierto · Katakana Garage", image: "/images/noche-escenario.jpg", teaser: "Música, instrumentos y monólogos.",
};

export const findEvent = (slug) => EVENTS.find((e) => e.slug === slug);
