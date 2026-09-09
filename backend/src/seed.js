const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { artists, galleryUrls, settings } = require("./defaults");
const { FOLLOWUP_HOURS } = require("./email");

const migrateClients = async (db) => {
  const clients = db.collection("clients");
  await clients.updateMany({ subscribed: { $exists: false } }, { $set: { subscribed: true, unsubscribedAt: null } });
  const legacy = await clients.find({ $or: [{ unsubscribeToken: { $exists: false } }, { nextFollowupAt: { $exists: false } }] }).toArray();
  for (const c of legacy) {
    const base = c.followupSentAt || c.welcomeSentAt || c.createdAt || new Date().toISOString();
    await clients.updateOne({ id: c.id }, { $set: {
      unsubscribeToken: c.unsubscribeToken || crypto.randomUUID(),
      nextFollowupAt: c.nextFollowupAt || (c.subscribed === false ? null : new Date(new Date(base).getTime() + FOLLOWUP_HOURS * 3600 * 1000).toISOString()),
      lastFollowupAt: c.lastFollowupAt || c.followupSentAt || null, lastEmailAt: c.lastEmailAt || c.followupSentAt || c.welcomeSentAt || null,
      followupCount: c.followupCount || (c.followupSentAt ? 1 : 0), phone: c.phone || "", notes: c.notes || "",
    } });
  }
};

const seedDatabase = async (db, config) => {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("songs").createIndex({ search: 1 }),
    db.collection("reservations").createIndex({ createdAt: -1 }),
    db.collection("clients").createIndex({ email: 1 }, { unique: true }),
    db.collection("clients").createIndex({ unsubscribeToken: 1 }),
    db.collection("clients").createIndex({ subscribed: 1, nextFollowupAt: 1 }),
    db.collection("songRequests").createIndex({ dateKey: 1, createdAt: 1 }),
  ]);
  await migrateClients(db);

  await db.collection("users").updateOne(
    { email: config.adminEmail },
    { $setOnInsert: { id: "admin-primary", email: config.adminEmail, passwordHash: config.adminPasswordHash, role: "admin", active: true, createdAt: new Date().toISOString() } },
    { upsert: true },
  );
  await db.collection("settings").updateOne({ id: "main" }, { $setOnInsert: settings }, { upsert: true });
  if ((await db.collection("artists").estimatedDocumentCount()) === 0) await db.collection("artists").insertMany(artists);
  if ((await db.collection("gallery").estimatedDocumentCount()) === 0) {
    await db.collection("gallery").insertMany(galleryUrls.map((imageUrl, order) => ({ id: `gallery-${order + 1}`, imageUrl, alt: `Noche en Okume Karaoke ${order + 1}`, order })));
  }
  if ((await db.collection("songs").estimatedDocumentCount()) === 0) {
    const songs = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "songs.json"), "utf8"));
    for (let index = 0; index < songs.length; index += 5000) await db.collection("songs").insertMany(songs.slice(index, index + 5000), { ordered: false });
  }
};

module.exports = { seedDatabase };