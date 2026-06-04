import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter  from "./routes/foodRoute.js";
import userRouter  from "./routes/userRoute.js";
import cartRouter  from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();

app.use(express.json());
const allowedOrigins = [
  'http://localhost:5173',
  'https://food-dev-vs43.vercel.app',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : []),
]

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}));

connectDB();

app.use("/api/food",  foodRouter);
app.use("/api/user",  userRouter);
app.use("/api/cart",  cartRouter);
app.use("/api/order", orderRouter);
app.use("/images",    express.static("uploads"));

app.get("/", (req, res) => res.send("API Working"));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server started on port ${port}`));

export default app;
