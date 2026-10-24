import { Router } from "express";
import auth from "../middleware/auth.js";
import Log from "../models/Log.js";
import { parseSymptoms } from "../services/llm.js";

const router = Router();
router.use(auth);

// Extract structured data from free text. Does NOT save.
router.post("/parse", async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Text is required" });
  if (text.length > 1000) return res.status(400).json({ error: "Text too long" });
  try {
    const parsed = await parseSymptoms(text);
    res.json({ parsed, rawText: text });
  } catch (e) {
    console.error("Parse failed:", e.message);
    res.status(502).json({ error: "Could not understand that. Please use the manual form." });
  }
});

// Save a confirmed log
router.post("/", async (req, res) => {
  try {
    const { date, symptoms, flow, mood, sleepHours, notes, rawText } = req.body;
    const log = await Log.create({
      userId: req.userId,
      date: date ? new Date(date) : new Date(),
      symptoms, flow, mood, sleepHours, notes, rawText,
    });
    res.status(201).json(log);
  } catch (e) {
    res.status(400).json({ error: "Invalid log data" });
  }
});

// Fetch logs for the dashboard
router.get("/", async (req, res) => {
  const { from, to } = req.query;
  const filter = { userId: req.userId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const logs = await Log.find(filter).sort({ date: 1 });
  res.json(logs);
});

export default router;