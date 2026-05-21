import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) return next(errorHandler(401, "Unauthorized"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, "Forbidden"));
    req.user = user; // { id, role }
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user) return next(errorHandler(401, "Unauthorized"));
  if (req.user.role !== "admin") return next(errorHandler(403, "Admin access required"));
  next();
};
