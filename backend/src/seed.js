const fs = require("fs");
const path = require("path");
const { artists, galleryUrls, settings } = require("./defaults");

const seedDatabase = async (db, config) => {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("songs").createIndex({ search: 1 }),
    db.collection("reservations").createIndex({ createdAt: -1 }),
  ]);

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