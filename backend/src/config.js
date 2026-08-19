const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable ${name}`);
  return value;
};

module.exports = {
  mongoUrl: required("MONGO_URL"),
  dbName: required("DB_NAME"),
  port: Number(required("NODE_PORT")),
  jwtSecret: required("JWT_SECRET"),
  adminEmail: required("ADMIN_EMAIL").toLowerCase(),
  adminPasswordHash: required("ADMIN_PASSWORD_HASH"),
  corsOrigins: required("CORS_ORIGINS"),
};