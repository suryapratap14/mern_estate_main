import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
  try {
    const payload = { ...req.body, userRef: req.user?.id || req.body.userRef };
    const listing = await Listing.create(payload);
    return res.status(201).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};


export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found!"));

    if (req.user?.id !== listing.userRef.toString() && req.user?.role !== "admin") {
      return next(errorHandler(401, "You can only delete your own listings!"));
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Listing has been deleted!" });
  } catch (error) {
    next(error);
  }
};


export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found!"));

    if (req.use?.id !== listing.userRef.toString() && req.user?.role !== "admin") {
      return next(errorHandler(401, "You can only update your own listings!"));
    }

    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updatedListing });
  } catch (error) {
    next(error);
  }
};


export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found!"));
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};


export const getListings = async (req, res, next) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit || "9"));
    const startIndex = Math.max(0, parseInt(req.query.startIndex || "0"));

    const filters = {};

    // type filter
    if (req.query.type && req.query.type !== "all") {
      filters.type = req.query.type;
    }

    // boolean filters
    if (req.query.offer === "true") filters.offer = true;
    if (req.query.parking === "true") filters.parking = true;
    if (req.query.furnished === "true") filters.furnished = true;

    // search term on name (can be extended to description)
    if (req.query.searchTerm) {
      filters.name = { $regex: req.query.searchTerm, $options: "i" };
    }

    // sort + order
    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1; // default desc

    const listings = await Listing.find(filters)
      .sort({ [sortField]: sortOrder })
      .skip(startIndex)
      .limit(limit);

    return res.status(200).json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
};


export const getUserListings = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    if (!req.user) return next(errorHandler(401, "Unauthorized"));
    if (req.user.id !== userId && req.user.role !== "admin") {
      return next(errorHandler(403, "Access denied"));
    }

    const listings = await Listing.find({ userRef: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
};

// Admin: get all listings

export const adminGetAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
};
