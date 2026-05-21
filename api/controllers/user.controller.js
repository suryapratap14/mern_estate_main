import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import Listing from "../models/listing.model.js";

// Test route
export const test = (req, res) => res.json({ message: "Test route working!" });

// Update own user
export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(errorHandler(401, "You can only update your own account!"));

    if (req.body.password) req.body.password = bcrypt.hashSync(req.body.password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json({ success: true, data: rest });

  } catch (error) {
    next(error);
  }
};

// Delete own user
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(errorHandler(401, "You can only delete your own account!"));

    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json({ success: true, message: "User has been deleted!" });

  } catch (error) {
    next(error);
  }
};

// Get own listings
export const getUserListings = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(errorHandler(401, "You can only view your own listings!"));

    const listings = await Listing.find({ userRef: req.params.id });
    res.status(200).json({ success: true, data: listings });

  } catch (error) {
    next(error);
  }
};

// Get single user info
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, "User not found!"));

    const { password, ...rest } = user._doc;
    res.status(200).json({ success: true, data: rest });

  } catch (error) {
    next(error);
  }
};


// Get all users (admin)
export const adminGetAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// Delete user by admin
export const adminDeleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted by admin" });
  } catch (error) {
    next(error);
  }
};
