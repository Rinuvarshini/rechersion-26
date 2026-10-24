import { Router } from "express";
import auth from "../middleware/auth.js";
import Log from "../models/Log.js";
import { parseSymptoms } from "../services/llm.js";
import { analyze } from "../services/patterns.js";

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

// Chart data for the dashboard
router.get("/stats", async (req, res) => {
  const days = Math.min(365, Math.max(7, Number(req.query.days) || 90));
  const from = new Date(Date.now() - days * 86400000);
  const logs = await Log.find({ userId: req.userId, date: { $gte: from } }).sort({ date: 1 });

  const FLOW = { none: 0, light: 1, medium: 2, heavy: 3 };
  const series = logs.map((l) => {
    const pain = (l.symptoms || [])
      .filter((s) => /pain|cramp|ache/i.test(s.name || ""))
      .map((s) => s.severity ?? 0);
    return {
      date: l.date.toISOString().slice(0, 10),
      pain: pain.length ? Math.max(...pain) : 0,
      sleepHours: l.sleepHours ?? null,
      flow: l.flow,
      flowLevel: FLOW[l.flow] ?? null,
      mood: l.mood || null,
      symptoms: (l.symptoms || []).map((s) => s.name),
    };
  });

  const { stats } = analyze(logs);
  res.json({ days, series, summary: stats });
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