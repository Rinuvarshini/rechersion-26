import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    symptoms: [
      {
        name: String,
        severity: { type: Number, min: 0, max: 10 },
        bodyArea: String,
      },
    ],
    flow: { type: String, enum: ["none", "light", "medium", "heavy", null], default: null },
    mood: String,
    sleepHours: Number,
    notes: String,
    rawText: String,
  },
  { timestamps: true }
);

export default mongoose.model("Log", logSchema);