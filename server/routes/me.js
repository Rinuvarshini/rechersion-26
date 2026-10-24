import { Router } from "express";
import bcrypt from "bcryptjs";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Log from "../models/Log.js";
import Report from "../models/Report.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  const user = await User.findById(req.userId).select("name email language consentGivenAt");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// Deletes all logs and reports (this also kills any shared links). Account stays.
router.delete("/data", async (req, res) => {
  const logs = await Log.deleteMany({ userId: req.userId });
  const reports = await Report.deleteMany({ userId: req.userId });
  res.json({ deletedLogs: logs.deletedCount, deletedReports: reports.deletedCount });
});

// Deletes everything including the account. Needs the password.
router.delete("/", async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || !(await bcrypt.compare(req.body?.password || "", user.passwordHash)))
    return res.status(401).json({ error: "Wrong password" });
  await Log.deleteMany({ userId: req.userId });
  await Report.deleteMany({ userId: req.userId });
  await User.deleteOne({ _id: req.userId });
  res.json({ deleted: true });
});

export default router;