export const CATALOG_PATH = "/canciones";
export const RESERVE_PATH = "/reservas";
export const EVENTS_PATH = "/eventos";
export const LOCAL_PATH = "/el-local";
export const CONTACT_PATH = "/contacto";
export const MICRO_PATH = "/micro-abierto";

export const BUSINESS = {
  name: "Karaoke Katakana",
  since: 2006,
  phoneDisplay: "91 726 01 83",
  phoneIntl: "+34 917 260 183",
  phoneTel: "+34917260183",
  email: "katakana1700@yahoo.es",
  address1: "Avenida de América, 22",
  address2: "28028 Madrid",
  facebook: "https://www.facebook.com/KaraokeKatakana",
  instagram: "https://www.instagram.com/karaoke_katakana_/",
};

export const SITE_URL = "https://www.karaokekatakana.com";

export const CATALOG_LANGS = [
  { value: "es", label: "Español" }, { value: "en", label: "Inglés" }, { value: "fr", label: "Francés" }, { value: "pt", label: "Portugués" },
  { value: "it", label: "Italiano" }, { value: "ca", label: "Catalán" }, { value: "de", label: "Alemán" }, { value: "gl", label: "Gallego" },
];

export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Karaoke+Katakana%2C+Avenida+de+Am%C3%A9rica+22%2C+28028+Madrid";
export const DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=40.4387556%2C-3.6741378";
export const MAPS_EMBED_URL = "https://www.google.com/maps?q=40.4387556,-3.6741378&hl=es&z=17&output=embed";
export const TEL_URL = `tel:${BUSINESS.phoneTel}`;
export const MAIL_URL = `mailto:${BUSINESS.email}`;
export const DEFAULT_LOGO = "/brand/katakana-logo.png";

export const EVENT_TYPES = [
  { value: "karaoke", label: "Noche de karaoke" },
  { value: "cumpleanos", label: "Cumpleaños" },
  { value: "despedida", label: "Despedida" },
  { value: "empresa", label: "Fiesta de empresa" },
  { value: "afterwork", label: "Afterwork" },
  { value: "infantil", label: "Karaoke infantil" },
  { value: "privada", label: "Fiesta privada" },
  { value: "micro", label: "Micro abierto" },
];

export const eventTypeLabel = (value) => EVENT_TYPES.find((t) => t.value === value)?.label || "Noche de karaoke";

export const LANG_SHORT = { es: "ES", en: "EN", fr: "FR", pt: "PT", it: "IT", ca: "CA", de: "DE", gl: "GL", xx: "··" };

export const formatNumber = (n) => (typeof n === "number" ? n.toLocaleString("es-ES") : n);
