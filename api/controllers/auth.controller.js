import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

// User Signup
export const signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password)
      return next(errorHandler(400, "Missing fields"));

    const exists = await User.findOne({ email });
    if (exists) return next(errorHandler(409, "Email already in use"));

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user" // default role = user
    });

    await newUser.save();
    res.status(201).json({ success: true, data: { message: "User created" } });

  } catch (error) {
    next(error);
  }
};

// User Signin
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(errorHandler(400, "Missing fields"));

    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(404, "User not found"));

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials"));

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pass, ...rest } = user._doc;

    // Send full user object including role
    res.cookie("access_token", token, { httpOnly: true, sameSite: "lax" })
      .status(200)
      .json({ success: true, data: rest });

  } catch (error) {
    next(error);
  }
};

// Google OAuth signin
export const google = async (req, res, next) => {
  try {
    const { email, name, photo } = req.body;
    if (!email) return next(errorHandler(400, "Missing email"));

    let user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
      const { password: pass, ...rest } = user._doc;
      return res.cookie("access_token", token, { httpOnly: true, sameSite: "lax" })
        .status(200)
        .json({ success: true, data: rest });
    }

    console.log(getAuth().currentUser);

    // Create new user if doesn't exist
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

    const newUser = new User({
      username: name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4),
      email,
      password: hashedPassword,
      avatar: photo,
      role: "user"
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const { password: pass, ...rest } = newUser._doc;

    res.cookie("access_token", token, { httpOnly: true, sameSite: "lax" })
      .status(200)
      .json({ success: true, data: rest });

  } catch (error) {
    next(error);
  }
};

// Signout
export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json({ success: true, message: "User has been logged out!" });
  } catch (error) {
    next(error);
  }
};
