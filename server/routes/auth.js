import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, language, consent } = req.body;
    if (!name || !email || !password || password.length < 6)
      return res.status(400).json({ error: "Name, email and a password of 6+ characters are required" });
    if (!consent) return res.status(400).json({ error: "Consent is required" });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, passwordHash, language, consentGivenAt: new Date(),
    });
    res.status(201).json({ token: sign(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.passwordHash)))
      return res.status(401).json({ error: "Invalid credentials" });
    res.json({ token: sign(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;