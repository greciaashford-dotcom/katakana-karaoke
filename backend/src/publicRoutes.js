const express = require("express");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const clean = (value = "") => value.toString().trim();
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
      notes: clean(req.body.notes).slice(0, 500), status: "pending", createdAt: new Date().toISOString(),
    };
    if (!reservation.name || !reservation.date || !reservation.time || !reservation.contact || !Number.isInteger(people) || people < 1 || people > 40) {
      return res.status(400).json({ error: "Revisa los datos de la reserva" });
    }
    const responseReservation = { ...reservation };
    await db.collection("reservations").insertOne(reservation);
    return res.status(201).json({ reservation: responseReservation });
  });
  return router;
};

module.exports = { createPublicRoutes };