import dotenv from "dotenv";
dotenv.config();

import express    from "express";
import cors       from "cors";
import path       from "path";
import { fileURLToPath } from "url";
import { connectDB }  from "./config/db.js";
import foodRouter     from "./routes/foodRoute.js";
import userRouter     from "./routes/userRoute.js";
import cartRouter     from "./routes/cartRoute.js";
import orderRouter    from "./routes/orderRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((s) => s.trim())
    : []),
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

connectDB();

app.use("/api/food",  foodRouter);
app.use("/api/user",  userRouter);
app.use("/api/cart",  cartRouter);
app.use("/api/order", orderRouter);

// Serve uploaded images — use absolute path so it works in serverless too
app.use("/images", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.send("API Working"));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

// Only listen in local dev — Vercel/serverless handles this via export default
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
}

export default app;
