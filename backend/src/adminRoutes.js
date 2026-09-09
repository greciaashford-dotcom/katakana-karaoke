const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const { sendCampaignEmail, buildClient, isEmail, cleanValue, nextFollowupISO, sleep } = require("./email");
const { buildClientsWorkbook, parseClientsWorkbook } = require("./clientsExcel");

const clean = (value = "") => value.toString().trim();
const madridDateKey = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const allowedStatus = new Set(["pending", "confirmed", "completed", "cancelled"]);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const clientsFilter = (query) => {
  const filter = {};
  const q = clean(query.q).slice(0, 120);
  if (q) filter.$or = [{ email: { $regex: escapeRegex(q), $options: "i" } }, { name: { $regex: escapeRegex(q), $options: "i" } }, { phone: { $regex: escapeRegex(q), $options: "i" } }];
  const source = clean(query.source).slice(0, 40);
  if (source) filter.source = source;
  if (query.subscribed === "true") filter.subscribed = true;
  if (query.subscribed === "false") filter.subscribed = false;
  return filter;
};

const createAdminRoutes = (db, authenticate, requireAdmin) => {
  const router = express.Router();
  router.use(authenticate, requireAdmin);

  router.get("/stats", async (_req, res) => {
    const today = madridDateKey(new Date());
    const [reservations, pending, artists, songs, clients, requestsToday] = await Promise.all([
      db.collection("reservations").countDocuments(), db.collection("reservations").countDocuments({ status: "pending" }),
      db.collection("artists").countDocuments(), db.collection("songs").estimatedDocumentCount(),
      db.collection("clients").countDocuments(), db.collection("songRequests").countDocuments({ dateKey: today, status: "queued" }),
    ]);
    res.json({ reservations, pending, artists, songs, clients, requestsToday });
  });
  router.put("/settings", async (req, res) => {
    const update = {
      heroTitle: clean(req.body.heroTitle).slice(0, 140), heroDescription: clean(req.body.heroDescription).slice(0, 240),
      heroVideoUrl: clean(req.body.heroVideoUrl).slice(0, 1000), heroImageUrl: clean(req.body.heroImageUrl).slice(0, 1000),
      logoUrl: clean(req.body.logoUrl).slice(0, 1000), updatedAt: new Date().toISOString(),
    };
    if (!update.heroTitle || !update.heroDescription || !update.heroImageUrl || !update.logoUrl) return res.status(400).json({ error: "Completa los campos obligatorios" });
    await db.collection("settings").updateOne({ id: "main" }, { $set: update });
    res.json({ settings: await db.collection("settings").findOne({ id: "main" }, { projection: { _id: 0 } }) });
  });

  router.get("/artists", async (_req, res) => res.json({ items: await db.collection("artists").find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray() }));
  router.post("/artists", async (req, res) => {
    const artist = { id: crypto.randomUUID(), artist: clean(req.body.artist).slice(0, 120), song: clean(req.body.song).slice(0, 160), description: clean(req.body.description).slice(0, 400), imageUrl: clean(req.body.imageUrl).slice(0, 1000), order: Number(req.body.order) || 0 };
    if (!artist.artist || !artist.song || !artist.imageUrl) return res.status(400).json({ error: "Artista, canción e imagen son obligatorios" });
    const responseArtist = { ...artist };
    await db.collection("artists").insertOne(artist); res.status(201).json({ artist: responseArtist });
  });
  router.put("/artists/:id", async (req, res) => {
    const update = { artist: clean(req.body.artist).slice(0, 120), song: clean(req.body.song).slice(0, 160), description: clean(req.body.description).slice(0, 400), imageUrl: clean(req.body.imageUrl).slice(0, 1000), order: Number(req.body.order) || 0 };
    const result = await db.collection("artists").findOneAndUpdate({ id: req.params.id }, { $set: update }, { returnDocument: "after", projection: { _id: 0 } });
    if (!result) return res.status(404).json({ error: "Artista no encontrado" }); res.json({ artist: result });
  });
  router.delete("/artists/:id", async (req, res) => { const result = await db.collection("artists").deleteOne({ id: req.params.id }); if (!result.deletedCount) return res.status(404).json({ error: "Artista no encontrado" }); res.status(204).end(); });

  router.get("/gallery", async (_req, res) => res.json({ items: await db.collection("gallery").find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray() }));
  router.post("/gallery", async (req, res) => { const item = { id: crypto.randomUUID(), imageUrl: clean(req.body.imageUrl).slice(0, 1000), alt: clean(req.body.alt).slice(0, 160), order: Number(req.body.order) || 0 }; if (!item.imageUrl) return res.status(400).json({ error: "La URL es obligatoria" }); const responseItem = { ...item }; await db.collection("gallery").insertOne(item); res.status(201).json({ item: responseItem }); });
  router.put("/gallery/:id", async (req, res) => { const update = { imageUrl: clean(req.body.imageUrl).slice(0, 1000), alt: clean(req.body.alt).slice(0, 160), order: Number(req.body.order) || 0 }; const result = await db.collection("gallery").findOneAndUpdate({ id: req.params.id }, { $set: update }, { returnDocument: "after", projection: { _id: 0 } }); if (!result) return res.status(404).json({ error: "Imagen no encontrada" }); res.json({ item: result }); });
  router.delete("/gallery/:id", async (req, res) => { const result = await db.collection("gallery").deleteOne({ id: req.params.id }); if (!result.deletedCount) return res.status(404).json({ error: "Imagen no encontrada" }); res.status(204).end(); });

  router.get("/reservations", async (req, res) => { const filter = allowedStatus.has(req.query.status) ? { status: req.query.status } : {}; res.json({ items: await db.collection("reservations").find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray() }); });
  router.patch("/reservations/:id", async (req, res) => { if (!allowedStatus.has(req.body.status)) return res.status(400).json({ error: "Estado no válido" }); const result = await db.collection("reservations").findOneAndUpdate({ id: req.params.id }, { $set: { status: req.body.status, updatedAt: new Date().toISOString() } }, { returnDocument: "after", projection: { _id: 0 } }); if (!result) return res.status(404).json({ error: "Reserva no encontrada" }); res.json({ reservation: result }); });
  router.delete("/reservations/:id", async (req, res) => { const result = await db.collection("reservations").deleteOne({ id: req.params.id }); if (!result.deletedCount) return res.status(404).json({ error: "Reserva no encontrada" }); res.status(204).end(); });

  // ---- Clientes ----
  router.get("/clients", async (req, res) => {
    const clients = db.collection("clients");
    const [items, total, subscribed] = await Promise.all([
      clients.find(clientsFilter(req.query), { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(5000).toArray(),
      clients.countDocuments(), clients.countDocuments({ subscribed: true }),
    ]);
    res.json({ items, total, subscribed, unsubscribed: total - subscribed });
  });
  router.get("/clients/export", async (req, res) => {
    const items = await db.collection("clients").find(clientsFilter(req.query), { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    const buffer = await buildClientsWorkbook(items);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="okume-clientes-${madridDateKey(new Date())}.xlsx"`);
    res.send(buffer);
  });
  router.post("/clients/import", (req, res, next) => upload.single("file")(req, res, (error) => (error ? res.status(400).json({ error: "Archivo no válido o demasiado grande (máx. 8 MB)" }) : next())), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Adjunta un archivo Excel (.xlsx)" });
    let rows;
    try { rows = await parseClientsWorkbook(req.file.buffer); } catch (_error) { return res.status(400).json({ error: "No se pudo leer el Excel. Usa el formato .xlsx" }); }
    const clients = db.collection("clients");
    const summary = { total: rows.length, created: 0, updated: 0, skipped: 0 };
    for (const row of rows) {
      const email = cleanValue(row.email).toLowerCase();
      if (!isEmail(email)) { summary.skipped += 1; continue; }
      const existing = await clients.findOne({ email });
      if (existing) {
        const patch = {};
        if (row.name && !existing.name) patch.name = cleanValue(row.name).slice(0, 80);
        if (row.phone && !existing.phone) patch.phone = cleanValue(row.phone).slice(0, 40);
        if (row.notes && !existing.notes) patch.notes = cleanValue(row.notes).slice(0, 300);
        if (typeof row.subscribed === "boolean" && row.subscribed !== (existing.subscribed !== false)) { patch.subscribed = row.subscribed; patch.nextFollowupAt = row.subscribed ? nextFollowupISO() : null; patch.unsubscribedAt = row.subscribed ? null : new Date().toISOString(); }
        if (Object.keys(patch).length) { await clients.updateOne({ email }, { $set: patch }); summary.updated += 1; } else summary.skipped += 1;
        continue;
      }
      const client = buildClient({ email, name: row.name, phone: row.phone, notes: row.notes, source: cleanValue(row.source).slice(0, 40) || "importado", subscribed: typeof row.subscribed === "boolean" ? row.subscribed : true });
      await clients.insertOne(client);
      summary.created += 1;
    }
    res.json(summary);
  });
  router.post("/clients", async (req, res) => {
    const email = clean(req.body.email).toLowerCase();
    if (!isEmail(email)) return res.status(400).json({ error: "Introduce un correo válido" });
    if (await db.collection("clients").findOne({ email })) return res.status(409).json({ error: "Este cliente ya existe" });
    const client = buildClient({ email, name: req.body.name, phone: req.body.phone, notes: req.body.notes, source: "manual", subscribed: req.body.subscribed !== false });
    const responseClient = { ...client };
    await db.collection("clients").insertOne(client);
    res.status(201).json({ client: responseClient });
  });
  router.put("/clients/:id", async (req, res) => {
    const existing = await db.collection("clients").findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ error: "Cliente no encontrado" });
    const subscribed = req.body.subscribed !== false;
    const update = { name: clean(req.body.name).slice(0, 80), phone: clean(req.body.phone).slice(0, 40), notes: clean(req.body.notes).slice(0, 300), subscribed };
    if (subscribed !== (existing.subscribed !== false)) { update.nextFollowupAt = subscribed ? nextFollowupISO() : null; update.unsubscribedAt = subscribed ? null : new Date().toISOString(); }
    const result = await db.collection("clients").findOneAndUpdate({ id: req.params.id }, { $set: update }, { returnDocument: "after", projection: { _id: 0 } });
    res.json({ client: result });
  });
  router.delete("/clients/:id", async (req, res) => { const result = await db.collection("clients").deleteOne({ id: req.params.id }); if (!result.deletedCount) return res.status(404).json({ error: "Cliente no encontrado" }); res.status(204).end(); });

  // ---- Campañas ----
  const campaignPayload = (body) => ({ subject: clean(body.subject).slice(0, 160), message: clean(body.message).slice(0, 5000), ctaText: clean(body.ctaText).slice(0, 60), ctaUrl: clean(body.ctaUrl).slice(0, 500) });
  router.get("/campaigns", async (_req, res) => res.json({ items: await db.collection("campaigns").find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(50).toArray() }));
  router.post("/campaigns/test", async (req, res) => {
    const payload = campaignPayload(req.body);
    if (!payload.subject || !payload.message) return res.status(400).json({ error: "Asunto y mensaje son obligatorios" });
    const to = clean(req.body.email).toLowerCase() || req.user.email;
    if (!isEmail(to)) return res.status(400).json({ error: "Correo de prueba no válido" });
    const ok = await sendCampaignEmail(db, { email: to, name: "Equipo Okume" }, payload);
    if (!ok) return res.status(502).json({ error: "Resend no pudo entregar la prueba" });
    res.json({ ok: true, to });
  });
  router.post("/campaigns", async (req, res) => {
    const payload = campaignPayload(req.body);
    if (!payload.subject || !payload.message) return res.status(400).json({ error: "Asunto y mensaje son obligatorios" });
    const source = clean(req.body.source).slice(0, 40);
    const filter = { subscribed: true, ...(source ? { source } : {}) };
    const recipients = await db.collection("clients").find(filter, { projection: { _id: 0, id: 1, email: 1, name: 1, unsubscribeToken: 1 } }).toArray();
    if (!recipients.length) return res.status(400).json({ error: "No hay clientes suscritos para esa audiencia" });
    const campaign = { id: crypto.randomUUID(), ...payload, source, total: recipients.length, sent: 0, failed: 0, status: "sending", createdAt: new Date().toISOString(), finishedAt: null };
    await db.collection("campaigns").insertOne({ ...campaign });
    res.status(202).json({ campaign });
    setImmediate(async () => {
      for (const contact of recipients) {
        const ok = await sendCampaignEmail(db, contact, payload);
        await db.collection("campaigns").updateOne({ id: campaign.id }, { $inc: ok ? { sent: 1 } : { failed: 1 } });
        if (ok) await db.collection("clients").updateOne({ id: contact.id }, { $set: { lastEmailAt: new Date().toISOString() } });
        await sleep(600);
      }
      await db.collection("campaigns").updateOne({ id: campaign.id }, { $set: { status: "done", finishedAt: new Date().toISOString() } });
    });
  });

  router.get("/song-requests", async (req, res) => {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "") ? req.query.date : madridDateKey(new Date());
    const items = await db.collection("songRequests").find({ dateKey: date }, { projection: { _id: 0 } }).sort({ status: 1, createdAt: 1 }).toArray();
    res.json({ items, date });
  });
  router.patch("/song-requests/:id", async (req, res) => {
    const status = req.body.status === "played" ? "played" : "queued";
    const result = await db.collection("songRequests").findOneAndUpdate({ id: req.params.id }, { $set: { status, playedAt: status === "played" ? new Date().toISOString() : null } }, { returnDocument: "after", projection: { _id: 0 } });
    if (!result) return res.status(404).json({ error: "Petición no encontrada" });
    res.json({ request: result });
  });
  router.delete("/song-requests/:id", async (req, res) => { const result = await db.collection("songRequests").deleteOne({ id: req.params.id }); if (!result.deletedCount) return res.status(404).json({ error: "Petición no encontrada" }); res.status(204).end(); });
  return router;
};

module.exports = { createAdminRoutes };
