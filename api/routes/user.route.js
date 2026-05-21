import express from "express";
import {
  deleteUser, test, updateUser, getUserListings, getUser,
  adminGetAllUsers, adminDeleteUser
} from "../controllers/user.controller.js";
import { verifyToken, verifyAdmin } from "../utils/verifyUser.js";

const router = express.Router();

// User routes
router.get("/test", test);
router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/listings/:id", verifyToken, getUserListings);
router.get("/:id", verifyToken, getUser);

// Admin routes
router.get("/admin/all", verifyToken, verifyAdmin, adminGetAllUsers);
router.delete("/admin/delete/:id", verifyToken, verifyAdmin, adminDeleteUser);

export default router;
