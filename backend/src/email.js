const crypto = require("crypto");
const { Resend } = require("resend");

const GREEN = "#29493a";
const CREAM = "#f8efd2";
const CORAL = "#ff665a";
const INK = "#111713";
const DEFAULT_LOGO = "https://assets.zyrosite.com/A1a5zx5q1vs656b0/logo_okume_karaoke-removebg-preview-Yyv0x9rkzXcyLOyo.png";
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://karaoke-experience.preview.emergentagent.com";
const SENDER = process.env.SENDER_EMAIL || "Okume Karaoke <onboarding@resend.dev>";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const cleanValue = (value = "") => value.toString().trim();
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getLogoUrl = async (db) => {
  try {
    const settings = await db.collection("settings").findOne({ id: "main" }, { projection: { _id: 0, logoUrl: 1 } });
    return settings?.logoUrl || DEFAULT_LOGO;
  } catch (_error) {
    return DEFAULT_LOGO;
  }
};

const brandWrap = ({ logoUrl, heading, paragraphs = [], ctaText, ctaUrl }) => `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};padding:28px 0;font-family:Arial,Helvetica,sans-serif;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td align="center" style="background:${GREEN};padding:34px 24px;border-radius:14px 14px 0 0;">
<img src="${logoUrl}" width="150" alt="Okume Karaoke" style="display:block;width:150px;max-width:150px;height:auto;"/>
</td></tr>
<tr><td style="background:${CREAM};color:${INK};padding:42px 40px 46px;border-radius:0 0 14px 14px;">
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:27px;line-height:1.2;color:${GREEN};">${heading}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#33403a;">${p}</p>`).join("")}
${ctaText ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;"><tr><td style="background:${CORAL};"><a href="${ctaUrl}" style="display:inline-block;padding:15px 34px;color:${INK};font-weight:bold;font-size:15px;text-decoration:none;">${ctaText}</a></td></tr></table>` : ""}
</td></tr>
<tr><td align="center" style="padding:22px 24px 6px;color:rgba(248,239,210,.55);font-size:12px;line-height:1.7;">
Okume Karaoke &middot; Calle de Coslada 14, 28028 Madrid<br/>
+34 680 59 03 64 &middot; info@okumekaraoke.com<br/>
<a href="${SITE_URL}/cookies" style="color:rgba(248,239,210,.72);text-decoration:underline;">Cookies</a> &middot;
<a href="${SITE_URL}/privacidad" style="color:rgba(248,239,210,.72);text-decoration:underline;">Privacidad</a> &middot;
<a href="${SITE_URL}/terminos" style="color:rgba(248,239,210,.72);text-decoration:underline;">Términos</a>
</td></tr>
</table></td></tr></table></body></html>`;

const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurada; correo omitido");
    return false;
  }
  try {
    const { data, error } = await resend.emails.send({ from: SENDER, to: [to], subject, html });
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

const sendWelcomeEmail = async (db, client) => {
  const logoUrl = await getLogoUrl(db);
  const firstName = client.name ? client.name.split(" ")[0] : "";
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
  });
  return sendEmail({ to: client.email, subject: "Bienvenido/a a Okume Karaoke", html });
};

const sendFollowupEmail = async (db, client) => {
  const logoUrl = await getLogoUrl(db);
  const firstName = client.name ? client.name.split(" ")[0] : "";
  const html = brandWrap({
    logoUrl,
    heading: `Te echamos de menos en el escenario${firstName ? `, ${firstName}` : ""}`,
    paragraphs: [
      "Han pasado unos días y el micrófono de Okume sigue calentito esperándote.",
      "Reúne a tus amigos y volved a cantar vuestras canciones favoritas. Las mejores noches de Madrid se viven cantando en Okume Karaoke.",
      "¿Preparamos vuestra mesa para la próxima?",
    ],
    ctaText: "Vuelve a cantar con nosotros",
    ctaUrl: `${SITE_URL}/#reservas`,
  });
  return sendEmail({ to: client.email, subject: "¿Listo para tu próxima noche en Okume?", html });
};

const sendCampaignEmail = async (db, to, subject, message) => {
  const logoUrl = await getLogoUrl(db);
  const paragraphs = message.split(/\n{2,}/).map((block) => block.replace(/\n/g, "<br/>"));
  const html = brandWrap({ logoUrl, heading: subject, paragraphs, ctaText: "Reserva tu mesa", ctaUrl: `${SITE_URL}/#reservas` });
  return sendEmail({ to, subject, html });
};

const upsertClient = async (db, { email, name = "", source = "web" }) => {
  const normalized = cleanValue(email).toLowerCase();
  if (!isEmail(normalized)) return null;
  const cleanName = cleanValue(name).slice(0, 80);
  const existing = await db.collection("clients").findOne({ email: normalized });
  if (existing) {
    if (cleanName && !existing.name) await db.collection("clients").updateOne({ email: normalized }, { $set: { name: cleanName } });
    return existing;
  }
  const now = new Date().toISOString();
  const client = { id: crypto.randomUUID(), email: normalized, name: cleanName, source, createdAt: now, welcomeSentAt: now, followupSentAt: null };
  await db.collection("clients").insertOne({ ...client });
  sendWelcomeEmail(db, client).catch((error) => console.error("[email] welcome falló", error?.message || error));
  return client;
};

module.exports = { upsertClient, sendWelcomeEmail, sendFollowupEmail, sendCampaignEmail };
