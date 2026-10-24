import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Log from "../models/Log.js";

await mongoose.connect(process.env.MONGO_URI);
const email = "demo@rechersion.app";
let user = await User.findOne({ email });
if (!user)
  user = await User.create({
    name: "Demo User", email,
    passwordHash: await bcrypt.hash("demo1234", 10),
    consentGivenAt: new Date(),
  });
await Log.deleteMany({ userId: user._id });

const DAY = 86400000, TOTAL = 120;
const starts = [5, 45, 74, 118]; // irregular cycle gaps: 40, 29, 44
const flowPattern = ["heavy", "heavy", "medium", "light", "light"];
const rnd = (a, b) => Math.round(a + Math.random() * (b - a));
const docs = [];

for (let idx = 0; idx < TOTAL; idx++) {
  if (idx % 5 === 4) continue; // she skips some days
  const date = new Date(Date.now() - (TOTAL - 1 - idx) * DAY);
  date.setHours(12, 0, 0, 0);
  const s = starts.find((st) => idx >= st && idx - st < 5);
  const offset = s !== undefined ? idx - s : -1;
  const symptoms = [];
  if (offset >= 0 && offset <= 2) symptoms.push({ name: "cramps", severity: rnd(7, 9), bodyArea: "lower abdomen" });
  if (offset < 0 && idx % 3 === 0) symptoms.push({ name: "fatigue", severity: rnd(4, 6), bodyArea: null });
  docs.push({
    userId: user._id, date, symptoms,
    flow: offset >= 0 ? flowPattern[offset] : "none",
    mood: offset >= 0 && offset <= 3 || idx % 7 === 0 ? "low" : "okay",
    sleepHours: +(5 + Math.random() * 1.5).toFixed(1),
    notes: "", rawText: "",
  });
}
await Log.insertMany(docs);
console.log(`Seeded ${docs.length} logs for ${email} (password: demo1234)`);
await mongoose.disconnect();