import express from "express";
import { google, signin, signOut, signup } from "../controllers/auth.controller.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/signout", signOut);

// Optional: one-time admin creation (protected by SECRET_ADMIN_CREATION)
router.post("/create-admin", async (req, res, next) => {
  try {
    const { secret, username, email, password } = req.body;
    if (secret !== process.env.SECRET_ADMIN_CREATION)
      return res.status(403).json({ success: false, message: "Forbidden" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: "Email exists" });

    const hashed = bcrypt.hashSync(password, 10);
    const user = new User({ username, email, password: hashed, role: "admin" });
    await user.save();

    res.status(201).json({ success: true, message: "Admin created", data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
