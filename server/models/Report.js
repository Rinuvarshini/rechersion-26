import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    periodDays: Number,
    summary: String,
    flags: [{ title: String, evidence: String, discuss: String }],
    stats: mongoose.Schema.Types.Mixed,
    doctorQuestions: [String],
    usedAI: Boolean,
    shareToken: { type: String, index: true },
    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);