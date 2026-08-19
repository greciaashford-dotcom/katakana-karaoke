const jwt = require("jsonwebtoken");

const createAuth = (db, jwtSecret) => {
  const authenticate = async (req, res, next) => {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (!token) return res.status(401).json({ error: "Sesión requerida" });
      const payload = jwt.verify(token, jwtSecret);
      const user = await db.collection("users").findOne(
        { id: payload.sub, active: true },
        { projection: { _id: 0, passwordHash: 0 } },
      );
      if (!user) return res.status(401).json({ error: "Sesión no válida" });
      req.user = user;
      return next();
    } catch (_error) {
      return res.status(401).json({ error: "Sesión caducada o no válida" });
    }
  };

  const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") return res.status(403).json({ error: "Acceso denegado" });
    return next();
  };

  return { authenticate, requireAdmin };
};

module.exports = { createAuth };