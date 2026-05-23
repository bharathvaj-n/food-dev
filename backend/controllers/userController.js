import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ── Helper: create signed JWT ──────────────────────────────────────────────
const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── POST /api/user/register ────────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    // 3. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // 4. Check duplicate email
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // 5. Hash password and save
    const hashed = await bcrypt.hash(password, 10);
    const user   = new userModel({ name, email, password: hashed });
    await user.save();

    // 6. Return JWT
    const token = createToken(user._id);
    res.status(201).json({ success: true, token });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/user/login ───────────────────────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Return JWT
    const token = createToken(user._id);
    res.status(200).json({ success: true, token });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { registerUser, loginUser };
