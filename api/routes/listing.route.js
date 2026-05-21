// routes/listing.route.js
import express from "express";
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
  adminGetAllListings,
  getUserListings,
} from "../controllers/listing.controller.js";
import { verifyToken, verifyAdmin } from "../utils/verifyUser.js";

const router = express.Router();

// Public
router.get("/get/:id", getListing);
router.get("/get", getListings);

// Authenticated (create/update/delete)
router.post("/create", verifyToken, createListing);
router.post("/update/:id", verifyToken, updateListing);
router.delete("/delete/:id", verifyToken, deleteListing);

// Get listings of a specific user (authenticated)
router.get("/user/:userId", verifyToken, getUserListings);

// Admin route
router.get("/admin/all", verifyToken, verifyAdmin, adminGetAllListings);

export default router;
