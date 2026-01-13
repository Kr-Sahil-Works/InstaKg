import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";

/* ================= SIGNUP ================= */
export const signup = async (req, res) => {
  try {
    let { fullName, username, password, confirmPassword, gender } = req.body;

    if (!fullName || !username || !password || !confirmPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    username = username.toLowerCase().trim();

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: "Username exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 14);

    const user = await User.create({
      fullName,
      username,
      password: hashedPassword,
      gender,
    });

    generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const username = req.body.username?.toLowerCase().trim();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= LOGOUT ================= */
export const logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
