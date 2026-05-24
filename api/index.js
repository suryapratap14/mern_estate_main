import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import paymentRouter from "./routes/payment.route.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

const __dirname = path.resolve();

// Middleware
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mern-estate-main-orcin.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/payment", paymentRouter);

// Production frontend
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "client", "dist");

  app.use(express.static(clientPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// Error Middleware
app.use((err, req, res, next) => {
  console.log(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});