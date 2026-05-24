import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

// ======================
// COOKIE OPTIONS
// ======================

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ======================
// USER SIGNUP
// ======================

export const signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return next(errorHandler(400, "Missing fields"));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(errorHandler(409, "Email already in use"));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// USER SIGNIN
// ======================

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(errorHandler(400, "Missing fields"));
    }

    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }

    const validPassword = bcrypt.compareSync(
      password,
      validUser.password
    );

    if (!validPassword) {
      return next(errorHandler(401, "Wrong credentials"));
    }

    const token = jwt.sign(
      {
        id: validUser._id,
        role: validUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .cookie("access_token", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        data: rest,
      });

  } catch (error) {
    next(error);
  }
};

// ======================
// GOOGLE AUTH
// ======================

export const google = async (req, res, next) => {
  try {
    const { name, email, photo } = req.body;

    if (!email) {
      return next(errorHandler(400, "Email is required"));
    }

    let user = await User.findOne({ email });

    // EXISTING USER

    if (user) {

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      const { password: pass, ...rest } = user._doc;

      return res
        .cookie("access_token", token, cookieOptions)
        .status(200)
        .json({
          success: true,
          data: rest,
        });
    }

    // CREATE NEW USER

    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

    const newUser = new User({
      username:
        name.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-4),

      email,
      password: hashedPassword,
      avatar: photo,
      role: "user",
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const { password: pass, ...rest } = newUser._doc;

    res
      .cookie("access_token", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        data: rest,
      });

  } catch (error) {
    next(error);
  }
};

// ======================
// SIGN OUT
// ======================

export const signOut = async (req, res, next) => {
  try {

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });

  } catch (error) {
    next(error);
  }
};