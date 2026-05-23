import dotenv from "dotenv";
dotenv.config(); // must be first

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));

connectDB();

app.use("/api/food",  foodRouter);
app.use("/api/user",  userRouter);
app.use("/api/cart",  cartRouter);
app.use("/api/order", orderRouter);
app.use("/images",   express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API Working");
});

// global error handler — prevents unhandled errors from returning empty 500
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});