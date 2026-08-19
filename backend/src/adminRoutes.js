const express = require("express");
const crypto = require("crypto");

const clean = (value = "") => value.toString().trim();
const allowedStatus = new Set(["pending", "confirmed", "completed", "cancelled"]);

const createAdminRoutes = (db, authenticate, requireAdmin) => {
  const router = express.Router();
  router.use(authenticate, requireAdmin);

  router.get("/stats", async (_req, res) => {
    const [reservations, pending, artists, songs] = await Promise.all([
      db.collection("reservations").countDocuments(), db.collection("reservations").countDocuments({ status: "pending" }),
      db.collection("artists").countDocuments(), db.collection("songs").estimatedDocumentCount(),
    ]);
    res.json({ reservations, pending, artists, songs });
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
  return router;
};

module.exports = { createAdminRoutes };