import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import logRoutes from "./routes/logs.js";
import reportRoutes from "./routes/reports.js";
import meRoutes from "./routes/me.js";

const app = express();
app.set("trust proxy", 1); // needed behind Render's proxy

const allowed = (process.env.CLIENT_URL || "")
  .split(",").map((s) => s.trim()).filter(Boolean)
  .concat("http://localhost:5173");
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowed.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS")),
  })
);
app.use(express.json({ limit: "100kb" }));

// Keeps one user from burning the free Gemini quota
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a minute and try again." },
});
app.use("/api/logs/parse", aiLimiter);
app.use("/api/reports/generate", aiLimiter);

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/me", meRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`Server on ${PORT}`)));