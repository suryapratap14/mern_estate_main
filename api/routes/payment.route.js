import express from "express";
import { savePayment, getPaymentsForUser, adminGetAllPayments } from "../controllers/payment.controller.js";
import { verifyToken, verifyAdmin } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/save", savePayment);
router.get("/user/:userId", verifyToken, getPaymentsForUser);

// admin
router.get("/all", verifyToken, verifyAdmin, adminGetAllPayments);

export default router;
