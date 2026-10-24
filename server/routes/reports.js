import { Router } from "express";
import crypto from "crypto";
import auth from "../middleware/auth.js";
import Log from "../models/Log.js";
import Report from "../models/Report.js";
import { analyze } from "../services/patterns.js";
import { summarizeForDoctor } from "../services/llm.js";

const router = Router();
const DISCLAIMER =
  "This report is generated from the patient's own logs. It is not a diagnosis. Patterns are suggestions to discuss with a qualified doctor.";

// PUBLIC: doctor opens the shared link (no login)
router.get("/share/:token", async (req, res) => {
  const r = await Report.findOne({ shareToken: req.params.token, expiresAt: { $gt: new Date() } });
  if (!r) return res.status(404).json({ error: "Link expired or not found" });
  res.json({
    generatedAt: r.createdAt, periodDays: r.periodDays, summary: r.summary,
    flags: r.flags, stats: r.stats, doctorQuestions: r.doctorQuestions,
    expiresAt: r.expiresAt, disclaimer: DISCLAIMER,
  });
});

router.use(auth);

function fallback(stats, flags) {
  const top = stats.topSymptoms.map((s) => `${s.name} (${s.days} days)`).join(", ") || "none recorded";
  return {
    summary: `Over this period the patient made ${stats.totalLogs} log entries. Most frequent symptoms: ${top}.${
      stats.avgCycleLength ? ` Average cycle length: ${stats.avgCycleLength} days.` : ""
    }${stats.avgSleep ? ` Average sleep: ${stats.avgSleep} hours.` : ""}`,
    doctorQuestions: flags.map((f) => f.discuss),
  };
}

router.post("/generate", async (req, res) => {
  try {
    const days = Math.min(365, Math.max(7, Number(req.body.days) || 90));
    const from = new Date(Date.now() - days * 86400000);
    const logs = await Log.find({ userId: req.userId, date: { $gte: from } }).sort({ date: 1 });
    if (logs.length < 3) return res.status(400).json({ error: "Add at least 3 logs first" });

    const { flags, stats } = analyze(logs);
    let ai, usedAI = false;
    try {
      ai = await summarizeForDoctor({ periodDays: days, stats, flags });
      usedAI = true;
    } catch (e) {
      console.error("Summary AI failed, using fallback:", e.message);
      ai = fallback(stats, flags);
    }
    const report = await Report.create({
      userId: req.userId, periodDays: days, summary: ai.summary,
      flags, stats, doctorQuestions: ai.doctorQuestions, usedAI,
    });
    res.status(201).json({ ...report.toObject(), disclaimer: DISCLAIMER });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not generate report" });
  }
});

router.get("/latest", async (req, res) => {
  const r = await Report.findOne({ userId: req.userId }).sort({ createdAt: -1 });
  if (!r) return res.status(404).json({ error: "No report yet" });
  res.json({ ...r.toObject(), disclaimer: DISCLAIMER });
});

// Creates a 24-hour read-only link only when she chooses to share
router.post("/:id/share", async (req, res) => {
  const r = await Report.findOne({ _id: req.params.id, userId: req.userId });
  if (!r) return res.status(404).json({ error: "Report not found" });
  r.shareToken = crypto.randomBytes(16).toString("hex");
  r.expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
  await r.save();
  res.json({ shareToken: r.shareToken, expiresAt: r.expiresAt });
});

export default router;