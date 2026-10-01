import asyncio
import logging
import uuid

import resend

from .common import clean, is_email, iso_after, now_iso
from .config import PUBLIC_SITE_URL, RESEND_API_KEY, SENDER_EMAIL
from .defaults import DEFAULT_LOGO

log = logging.getLogger("katakana.email")
DARK, CREAM, ORANGE, INK = "#1a110d", "#fff6ec", "#ff7a1a", "#120c0a"
FOLLOWUP_HOURS = 130

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def next_followup_iso() -> str:
    return iso_after(FOLLOWUP_HOURS)


def unsubscribe_url_for(client: dict | None) -> str:
    token = (client or {}).get("unsubscribeToken")
    return f"{PUBLIC_SITE_URL}/baja?token={token}" if token else ""


def absolute_url(url: str) -> str:
    return f"{PUBLIC_SITE_URL}{url}" if url.startswith("/") else url


async def get_logo_url(db) -> str:
    try:
        settings = await db.settings.find_one({"id": "main"}, {"_id": 0, "logoUrl": 1})
        return absolute_url((settings or {}).get("logoUrl") or DEFAULT_LOGO)
    except Exception:
        return absolute_url(DEFAULT_LOGO)


def brand_wrap(*, logo_url: str, heading: str, paragraphs: list[str], cta_text: str = "", cta_url: str = "", unsubscribe_url: str = "") -> str:
    body = "".join(f'<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#3b2a22;">{p}</p>' for p in paragraphs)
    cta = (
        f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;"><tr><td style="background:{ORANGE};border-radius:14px;">'
        f'<a href="{cta_url}" style="display:inline-block;padding:15px 34px;color:#ffffff;font-weight:bold;font-size:15px;text-decoration:none;border-radius:14px;">{cta_text}</a></td></tr></table>'
        if cta_text else ""
    )
    unsub = f'<br/><a href="{unsubscribe_url}" style="color:rgba(255,246,236,.72);text-decoration:underline;">Darme de baja de estos correos</a>' if unsubscribe_url else ""
    return f"""<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:{INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{INK};padding:28px 0;font-family:Arial,Helvetica,sans-serif;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td align="center" style="background:{DARK};padding:34px 24px;border-radius:22px 22px 0 0;">
<img src="{logo_url}" width="150" alt="Karaoke Katakana" style="display:block;width:190px;max-width:190px;height:auto;"/>
</td></tr>
<tr><td style="background:{CREAM};color:{INK};padding:42px 40px 46px;border-radius:0 0 22px 22px;">
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:27px;line-height:1.2;color:#e8461e;">{heading}</h1>
{body}{cta}
</td></tr>
<tr><td align="center" style="padding:22px 24px 6px;color:rgba(255,246,236,.55);font-size:12px;line-height:1.7;">
Karaoke Katakana &middot; Avenida de Am&eacute;rica 22, 28028 Madrid<br/>
+34 917 260 183 &middot; katakana1700@yahoo.es<br/>
<a href="{PUBLIC_SITE_URL}/cookies" style="color:rgba(255,246,236,.72);text-decoration:underline;">Cookies</a> &middot;
<a href="{PUBLIC_SITE_URL}/privacidad" style="color:rgba(255,246,236,.72);text-decoration:underline;">Privacidad</a> &middot;
<a href="{PUBLIC_SITE_URL}/terminos" style="color:rgba(255,246,236,.72);text-decoration:underline;">Términos</a>
{unsub}
</td></tr>
</table></td></tr></table></body></html>"""


async def send_email(*, to: str, subject: str, html: str, unsubscribe_url: str = "") -> bool:
    if not RESEND_API_KEY:
        log.warning("[email] RESEND_API_KEY no configurada; correo omitido")
        return False
    params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
    if unsubscribe_url:
        params["headers"] = {"List-Unsubscribe": f"<{unsubscribe_url}>", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"}
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        return bool(result and result.get("id"))
    except Exception as error:
        log.error("[email] Resend error: %s", error)
        return False


def first_name(client: dict) -> str:
    return (client.get("name") or "").split(" ")[0]


async def send_welcome_email(db, client: dict) -> bool:
    name = first_name(client)
    unsub = unsubscribe_url_for(client)
    html = brand_wrap(
        logo_url=await get_logo_url(db),
        heading=f"¡Bienvenido/a a Katakana{f', {name}' if name else ''}!",
        paragraphs=[
            "Gracias por unirte a la familia de <strong>Karaoke Katakana</strong>, el karaoke-bar de Avenida de América que hace cantar a Madrid desde 2006.",
            "Escenario, sonido digital y más de 20.000 canciones en español, inglés, francés, italiano y portugués esperando tu voz.",
            "Reserva tu mesa cuando quieras y busca tus canciones favoritas directamente desde nuestra web.",
        ],
        cta_text="Reserva tu mesa", cta_url=f"{PUBLIC_SITE_URL}/reservas", unsubscribe_url=unsub,
    )
    return await send_email(to=client["email"], subject="Bienvenido/a a Karaoke Katakana", html=html, unsubscribe_url=unsub)


FOLLOWUPS = [
    {"subject": "¿Listo para tu próxima noche en Katakana?", "heading": lambda n: f"Te echamos de menos en el escenario{f', {n}' if n else ''}", "paragraphs": ["Han pasado unos días y el micro de Katakana sigue esperándote.", "Reúne a tus amigos y volved a cantar vuestras canciones favoritas en Avenida de América. Barra, mesas altas y salón: elige tu ambiente.", "¿Preparamos vuestra mesa para la próxima?"], "cta": "Vuelve a cantar con nosotros", "path": "/reservas"},
    {"subject": "Esta semana el escenario es tuyo", "heading": lambda n: f"{f'{n}, ' if n else ''}hay una canción con tu nombre", "paragraphs": ["Más de 20.000 canciones en varios idiomas, sonido digital y un público que siempre acompaña.", "Busca tu canción por artista, título o código desde el móvil y llega con el repertorio preparado.", "Reserva en un minuto y nosotros nos encargamos del resto."], "cta": "Reservar mi noche", "path": "/reservas"},
    {"subject": "¿Celebramos algo? Katakana te espera", "heading": lambda n: f"Cumpleaños, despedidas o simplemente porque sí{f', {n}' if n else ''}", "paragraphs": ["En Katakana celebramos cumpleaños, despedidas, afterworks y fiestas de empresa desde 2006.", "Cuéntanos qué celebráis y cuántos seréis: te preparamos la propuesta.", "Las mejores noches se planean con tiempo: reserva ya la vuestra."], "cta": "Quiero celebrar en Katakana", "path": "/eventos"},
    {"subject": "Tu canción favorita te está esperando", "heading": lambda n: f"¿Cuál será tu próxima canción{f', {n}' if n else ''}?", "paragraphs": ["Busca tu canción en nuestro catálogo y prepárala antes de subir al escenario.", "Y si no la encuentras, pídenos que la incorporemos: si existe en formato karaoke, la buscamos.", "Te esperamos en Avenida de América, 22."], "cta": "Buscar mi canción", "path": "/canciones"},
]


async def send_followup_email(db, client: dict) -> bool:
    variant = FOLLOWUPS[(client.get("followupCount") or 0) % len(FOLLOWUPS)]
    unsub = unsubscribe_url_for(client)
    html = brand_wrap(logo_url=await get_logo_url(db), heading=variant["heading"](first_name(client)), paragraphs=variant["paragraphs"], cta_text=variant["cta"], cta_url=f"{PUBLIC_SITE_URL}{variant['path']}", unsubscribe_url=unsub)
    return await send_email(to=client["email"], subject=variant["subject"], html=html, unsubscribe_url=unsub)


async def send_campaign_email(db, client: dict, payload: dict) -> bool:
    paragraphs = [block.replace("\n", "<br/>") for block in payload["message"].replace("\r", "").split("\n\n") if block.strip()]
    unsub = unsubscribe_url_for(client)
    html = brand_wrap(logo_url=await get_logo_url(db), heading=payload["subject"], paragraphs=paragraphs, cta_text=payload.get("ctaText") or "Reserva tu mesa", cta_url=payload.get("ctaUrl") or f"{PUBLIC_SITE_URL}/reservas", unsubscribe_url=unsub)
    return await send_email(to=client["email"], subject=payload["subject"], html=html, unsubscribe_url=unsub)


def build_client(*, email: str, name="", phone="", source="web", subscribed=True, notes="") -> dict:
    now = now_iso()
    return {
        "id": str(uuid.uuid4()), "email": email, "name": clean(name, 80), "phone": clean(phone, 40), "source": source, "notes": clean(notes, 300),
        "subscribed": subscribed, "createdAt": now, "welcomeSentAt": None, "lastEmailAt": None, "lastFollowupAt": None, "followupCount": 0,
        "nextFollowupAt": next_followup_iso() if subscribed else None, "unsubscribeToken": str(uuid.uuid4()), "unsubscribedAt": None,
    }


async def _deliver_welcome(db, client: dict) -> None:
    try:
        if await send_welcome_email(db, client):
            stamp = now_iso()
            await db.clients.update_one({"id": client["id"]}, {"$set": {"welcomeSentAt": stamp, "lastEmailAt": stamp}})
    except Exception as error:
        log.error("[email] welcome falló: %s", error)


async def upsert_client(db, *, email: str, name="", phone="", source="web", send_welcome=True) -> dict | None:
    normalized = clean(email).lower()
    if not is_email(normalized):
        return None
    existing = await db.clients.find_one({"email": normalized})
    if existing:
        patch = {}
        if clean(name) and not existing.get("name"):
            patch["name"] = clean(name, 80)
        if clean(phone) and not existing.get("phone"):
            patch["phone"] = clean(phone, 40)
        if patch:
            await db.clients.update_one({"email": normalized}, {"$set": patch})
        existing.pop("_id", None)
        return existing
    client = build_client(email=normalized, name=name, phone=phone, source=source)
    await db.clients.insert_one(dict(client))
    if send_welcome:
        asyncio.create_task(_deliver_welcome(db, client))
    return client
