const express = require("express");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { upsertClient, sendFollowupEmail } = require("./email");

const clean = (value = "") => value.toString().trim();
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const madridDateKey = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const normalize = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createPublicRoutes = (db, config, authenticate) => {
  const router = express.Router();
  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false });

  router.get("/health", (_req, res) => res.json({ ok: true, service: "okume-express" }));
  router.post("/auth/login", loginLimiter, async (req, res) => {
    const email = clean(req.body.email).toLowerCase();
    const password = clean(req.body.password);
    const user = await db.collection("users").findOne({ email, active: true });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "Credenciales incorrectas" });
    const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: "8h", issuer: "okume-karaoke" });
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  });
  router.get("/auth/me", authenticate, (req, res) => res.json({ user: req.user }));

  router.get("/site", async (_req, res) => {
    const [settings, artists, gallery, songCount] = await Promise.all([
      db.collection("settings").findOne({ id: "main" }, { projection: { _id: 0 } }),
      db.collection("artists").find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray(),
      db.collection("gallery").find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray(),
      db.collection("songs").estimatedDocumentCount(),
    ]);
    res.json({ settings, artists, gallery, songCount });
  });

  router.get("/songs", async (req, res) => {
    const query = clean(req.query.q).slice(0, 100);
    const artist = clean(req.query.artist).slice(0, 120);
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(60, Math.max(12, Number.parseInt(req.query.limit, 10) || 30));
    const filter = artist ? { artist } : query ? { search: { $regex: escapeRegex(normalize(query)) } } : {};
    const [items, total] = await Promise.all([
      db.collection("songs").find(filter, { projection: { _id: 0, search: 0 } }).sort({ artist: 1, title: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
      db.collection("songs").countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  });

  router.post("/reservations", async (req, res) => {
    const people = Number(req.body.people);
    const reservation = {
      id: crypto.randomUUID(), name: clean(req.body.name).slice(0, 80), people,
      date: clean(req.body.date), time: clean(req.body.time), contact: clean(req.body.contact).slice(0, 120),
      email: clean(req.body.email).toLowerCase().slice(0, 160),
      notes: clean(req.body.notes).slice(0, 500), status: "pending", createdAt: new Date().toISOString(),
    };
    if (!reservation.name || !reservation.date || !reservation.time || !reservation.contact || !Number.isInteger(people) || people < 1 || people > 40) {
      return res.status(400).json({ error: "Revisa los datos de la reserva" });
    }
    const responseReservation = { ...reservation };
    await db.collection("reservations").insertOne(reservation);
    const marketingEmail = isEmail(reservation.email) ? reservation.email : (isEmail(reservation.contact.toLowerCase()) ? reservation.contact.toLowerCase() : "");
    if (marketingEmail) upsertClient(db, { email: marketingEmail, name: reservation.name, source: "reserva" }).catch(() => {});
    return res.status(201).json({ reservation: responseReservation });
  });

  router.post("/song-requests", async (req, res) => {
    const email = clean(req.body.email).toLowerCase().slice(0, 160);
    const title = clean(req.body.title).slice(0, 200);
    const artist = clean(req.body.artist).slice(0, 200);
    const name = clean(req.body.name).slice(0, 80);
    if (!isEmail(email) || !title) return res.status(400).json({ error: "Introduce un correo válido y una canción" });
    const now = new Date();
    const request = { id: crypto.randomUUID(), email, name, title, artist, songId: clean(req.body.songId).slice(0, 80), status: "queued", playedAt: null, dateKey: madridDateKey(now), createdAt: now.toISOString() };
    await db.collection("songRequests").insertOne({ ...request });
    upsertClient(db, { email, name, source: "cancion" }).catch(() => {});
    return res.status(201).json({ request });
  });

  router.post("/cron/followup", async (req, res) => {
    // Cron endpoints must ack 2xx immediately; enqueue/background the actual work.
    const secret = process.env.WEBHOOK_CRON_SECRET || "";
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const a = Buffer.from(token);
    const b = Buffer.from(secret);
    if (!secret || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: "No autorizado" });
    res.status(202).json({ ok: true });
    setImmediate(async () => {
      try {
        const cutoff = new Date(Date.now() - 130 * 3600 * 1000).toISOString();
        const due = await db.collection("clients").find({ welcomeSentAt: { $ne: null, $lte: cutoff }, followupSentAt: null }).limit(200).toArray();
        for (const client of due) {
          const ok = await sendFollowupEmail(db, client);
          if (ok) await db.collection("clients").updateOne({ id: client.id }, { $set: { followupSentAt: new Date().toISOString() } });
        }
      } catch (error) {
        console.error("[cron] followup error", error?.message || error);
      }
    });
  });
  return router;
};

module.exports = { createPublicRoutes };