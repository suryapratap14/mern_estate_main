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

// Connect to mongo
mongoose.connect(process.env.MONGO)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB Connection Error:", err));


const __dirname = path.resolve();


app.use(cors({
  origin: process.env.CLIENT_ORIGIN || true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/payment", paymentRouter);


app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});


// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "client/dist");
  app.use(express.static(clientPath));
  app.get("*", (req, res) => res.sendFile(path.join(clientPath, "index.html")));
}

// Error handler (last middleware)
app.use((err, req, res, next) => {
  console.error("Error middleware:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, statusCode, message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
