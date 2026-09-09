const crypto = require("crypto");
const { Resend } = require("resend");

const GREEN = "#29493a";
const CREAM = "#f8efd2";
const CORAL = "#ff665a";
const INK = "#111713";
const DEFAULT_LOGO = "https://assets.zyrosite.com/A1a5zx5q1vs656b0/logo_okume_karaoke-removebg-preview-Yyv0x9rkzXcyLOyo.png";
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://karaoke-experience.preview.emergentagent.com";
const SENDER = process.env.SENDER_EMAIL || "Okume Karaoke <onboarding@resend.dev>";
const FOLLOWUP_HOURS = 130;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const cleanValue = (value = "") => value.toString().trim();
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const nextFollowupISO = (from = Date.now()) => new Date(from + FOLLOWUP_HOURS * 3600 * 1000).toISOString();
const unsubscribeUrlFor = (client) => (client?.unsubscribeToken ? `${SITE_URL}/baja?token=${client.unsubscribeToken}` : "");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getLogoUrl = async (db) => {
  try {
    const settings = await db.collection("settings").findOne({ id: "main" }, { projection: { _id: 0, logoUrl: 1 } });
    return settings?.logoUrl || DEFAULT_LOGO;
  } catch (_error) {
    return DEFAULT_LOGO;
  }
};

const brandWrap = ({ logoUrl, heading, paragraphs = [], ctaText, ctaUrl, unsubscribeUrl }) => `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};padding:28px 0;font-family:Arial,Helvetica,sans-serif;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td align="center" style="background:${GREEN};padding:34px 24px;border-radius:22px 22px 0 0;">
<img src="${logoUrl}" width="150" alt="Okume Karaoke" style="display:block;width:150px;max-width:150px;height:auto;"/>
</td></tr>
<tr><td style="background:${CREAM};color:${INK};padding:42px 40px 46px;border-radius:0 0 22px 22px;">
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:27px;line-height:1.2;color:${GREEN};">${heading}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#33403a;">${p}</p>`).join("")}
${ctaText ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;"><tr><td style="background:${CORAL};border-radius:14px;"><a href="${ctaUrl}" style="display:inline-block;padding:15px 34px;color:${INK};font-weight:bold;font-size:15px;text-decoration:none;border-radius:14px;">${ctaText}</a></td></tr></table>` : ""}
</td></tr>
<tr><td align="center" style="padding:22px 24px 6px;color:rgba(248,239,210,.55);font-size:12px;line-height:1.7;">
Okume Karaoke &middot; Calle de Coslada 14, 28028 Madrid<br/>
+34 680 59 03 64 &middot; info@okumekaraoke.com<br/>
<a href="${SITE_URL}/cookies" style="color:rgba(248,239,210,.72);text-decoration:underline;">Cookies</a> &middot;
<a href="${SITE_URL}/privacidad" style="color:rgba(248,239,210,.72);text-decoration:underline;">Privacidad</a> &middot;
<a href="${SITE_URL}/terminos" style="color:rgba(248,239,210,.72);text-decoration:underline;">Términos</a>
${unsubscribeUrl ? `<br/><a href="${unsubscribeUrl}" style="color:rgba(248,239,210,.72);text-decoration:underline;">Darme de baja de estos correos</a>` : ""}
</td></tr>
</table></td></tr></table></body></html>`;

const sendEmail = async ({ to, subject, html, unsubscribeUrl }) => {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurada; correo omitido");
    return false;
  }
  try {
    const payload = { from: SENDER, to: [to], subject, html };
    if (unsubscribeUrl) payload.headers = { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" };
    const { data, error } = await resend.emails.send(payload);
    if (error) {
      console.error("[email] Resend error", error);
      return false;
    }
    return Boolean(data);
  } catch (error) {
    console.error("[email] Excepción al enviar", error?.message || error);
    return false;
  }
};

const firstNameOf = (client) => (client.name ? client.name.split(" ")[0] : "");

const sendWelcomeEmail = async (db, client) => {
  const logoUrl = await getLogoUrl(db);
  const firstName = firstNameOf(client);
  const unsubscribeUrl = unsubscribeUrlFor(client);
  const html = brandWrap({
    logoUrl,
    heading: `¡Bienvenido/a a Okume${firstName ? `, ${firstName}` : ""}!`,
    paragraphs: [
      "Gracias por unirte a la familia de <strong>Okume Karaoke</strong>, el karaoke más exclusivo de Madrid.",
      "Aquí cada noche es tuya: escenario, luces y más de 88.000 canciones esperando tu voz. Brilla como una estrella junto a tus amigos.",
      "Reserva tu mesa cuando quieras y pide tus canciones favoritas directamente desde nuestra web.",
    ],
    ctaText: "Reserva tu mesa",
    ctaUrl: `${SITE_URL}/#reservas`,
    unsubscribeUrl,
  });
  return sendEmail({ to: client.email, subject: "Bienvenido/a a Okume Karaoke", html, unsubscribeUrl });
};

const FOLLOWUPS = [
  { subject: "¿Listo para tu próxima noche en Okume?", heading: (n) => `Te echamos de menos en el escenario${n ? `, ${n}` : ""}`, paragraphs: ["Han pasado unos días y el micrófono de Okume sigue calentito esperándote.", "Reúne a tus amigos y volved a cantar vuestras canciones favoritas. Las mejores noches de Madrid se viven cantando en Okume Karaoke.", "¿Preparamos vuestra mesa para la próxima?"], cta: "Vuelve a cantar con nosotros" },
  { subject: "Esta semana el escenario es tuyo", heading: (n) => `${n ? `${n}, ` : ""}hay una canción con tu nombre`, paragraphs: ["Más de 88.000 canciones, luces de concierto y una sala que solo espera tu voz.", "Ven con tu grupo, pide vuestras canciones desde el móvil y convertid una noche cualquiera en una noche Okume.", "Reserva en un minuto y nosotros nos encargamos del resto."], cta: "Reservar mi noche" },
  { subject: "¿Celebramos algo? Okume te espera", heading: (n) => `Cumpleaños, despedidas o simplemente porque sí${n ? `, ${n}` : ""}`, paragraphs: ["En Okume cada celebración suena diferente. Cuéntanos qué celebráis y preparamos la mesa perfecta.", "Cócteles, escenario y vuestras canciones favoritas en el corazón del barrio de Salamanca.", "Las mejores noches se planean con tiempo: reserva ya la vuestra."], cta: "Quiero celebrar en Okume" },
  { subject: "Tu canción favorita te está esperando", heading: (n) => `¿Cuál será tu próxima canción${n ? `, ${n}` : ""}?`, paragraphs: ["Busca tu canción en nuestro catálogo y prepárala antes de subir al escenario.", "Nuevas noches, nuevos himnos y el mismo lugar donde Madrid canta diferente.", "Reserva tu mesa y ven a brillar."], cta: "Buscar mi canción" },
];

const sendFollowupEmail = async (db, client) => {
  const logoUrl = await getLogoUrl(db);
  const variant = FOLLOWUPS[(client.followupCount || 0) % FOLLOWUPS.length];
  const unsubscribeUrl = unsubscribeUrlFor(client);
  const ctaUrl = variant.cta === "Buscar mi canción" ? `${SITE_URL}/canciones-karaoke-madrid` : `${SITE_URL}/#reservas`;
  const html = brandWrap({ logoUrl, heading: variant.heading(firstNameOf(client)), paragraphs: variant.paragraphs, ctaText: variant.cta, ctaUrl, unsubscribeUrl });
  return sendEmail({ to: client.email, subject: variant.subject, html, unsubscribeUrl });
};

const sendCampaignEmail = async (db, client, { subject, message, ctaText, ctaUrl }) => {
  const logoUrl = await getLogoUrl(db);
  const paragraphs = message.split(/\n{2,}/).map((block) => block.replace(/\n/g, "<br/>"));
  const unsubscribeUrl = unsubscribeUrlFor(client);
  const html = brandWrap({ logoUrl, heading: subject, paragraphs, ctaText: ctaText || "Reserva tu mesa", ctaUrl: ctaUrl || `${SITE_URL}/#reservas`, unsubscribeUrl });
  return sendEmail({ to: client.email, subject, html, unsubscribeUrl });
};

const buildClient = ({ email, name = "", phone = "", source = "web", subscribed = true, notes = "" }) => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(), email, name: cleanValue(name).slice(0, 80), phone: cleanValue(phone).slice(0, 40), source, notes: cleanValue(notes).slice(0, 300),
    subscribed, createdAt: now, welcomeSentAt: null, lastEmailAt: null, lastFollowupAt: null, followupCount: 0,
    nextFollowupAt: subscribed ? nextFollowupISO() : null, unsubscribeToken: crypto.randomUUID(), unsubscribedAt: null,
  };
};

const upsertClient = async (db, { email, name = "", phone = "", source = "web", sendWelcome = true }) => {
  const normalized = cleanValue(email).toLowerCase();
  if (!isEmail(normalized)) return null;
  const clients = db.collection("clients");
  const existing = await clients.findOne({ email: normalized });
  if (existing) {
    const patch = {};
    if (cleanValue(name) && !existing.name) patch.name = cleanValue(name).slice(0, 80);
    if (cleanValue(phone) && !existing.phone) patch.phone = cleanValue(phone).slice(0, 40);
    if (Object.keys(patch).length) await clients.updateOne({ email: normalized }, { $set: patch });
    return existing;
  }
  const client = buildClient({ email: normalized, name, phone, source });
  await clients.insertOne({ ...client });
  if (sendWelcome) {
    sendWelcomeEmail(db, client)
      .then((ok) => ok && clients.updateOne({ id: client.id }, { $set: { welcomeSentAt: new Date().toISOString(), lastEmailAt: new Date().toISOString() } }))
      .catch((error) => console.error("[email] welcome falló", error?.message || error));
  }
  return client;
};

module.exports = { upsertClient, buildClient, sendWelcomeEmail, sendFollowupEmail, sendCampaignEmail, nextFollowupISO, isEmail, cleanValue, sleep, FOLLOWUP_HOURS };
