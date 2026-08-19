const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { MongoClient } = require("mongodb");
const config = require("./src/config");
const { seedDatabase } = require("./src/seed");
const { createAuth } = require("./src/auth");
const { createPublicRoutes } = require("./src/publicRoutes");
const { createAdminRoutes } = require("./src/adminRoutes");

const start = async () => {
  const client = new MongoClient(config.mongoUrl);
  await client.connect();
  const db = client.db(config.dbName);
  await seedDatabase(db, config);

  const app = express();
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: config.corsOrigins === "*" ? "*" : config.corsOrigins.split(","), credentials: false }));
  app.use(express.json({ limit: "1mb" }));
  const { authenticate, requireAdmin } = createAuth(db, config.jwtSecret);
  app.use("/api", createPublicRoutes(db, config, authenticate));
  app.use("/api/admin", createAdminRoutes(db, authenticate, requireAdmin));
  app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: "Ha ocurrido un error inesperado" }); });

  const server = app.listen(config.port, "0.0.0.0", () => console.log(`Okume Express activo en ${config.port}`));
  const shutdown = () => server.close(() => client.close().finally(() => process.exit(0)));
  process.on("SIGTERM", shutdown); process.on("SIGINT", shutdown);
};

start().catch((error) => { console.error(error); process.exit(1); });