import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.access_token;

  console.log("TOKEN:", token);

  if (!token) return next(errorHandler(401, "Unauthorized"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("JWT ERROR:", err);
      return next(errorHandler(403, "Forbidden"));
    }

    console.log("REQ.USER:", user);

    req.user = user;
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user) return next(errorHandler(401, "Unauthorized"));
  if (req.user.role !== "admin") return next(errorHandler(403, "Admin access required"));
  next();
};
