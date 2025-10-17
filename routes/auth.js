// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

const router = express.Router();

// Authentication middleware
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Admin check middleware
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// --- UPDATE USERNAME ---
router.post("/update-username", verifyToken, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.username = username;
    await user.save();

    res.json({ message: "Username updated successfully", username: user.username });
  } catch (err) {
    console.error("Update username error:", err.message);
    res.status(500).json({ error: "Failed to update username" });
  }
});

// --- UPDATE EMAIL ---
router.post("/update-email", verifyToken, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const exists = await User.findOne({ email });
    if (exists && exists._id.toString() !== req.user.id)
      return res.status(400).json({ error: "Email already in use" });

    const user = await User.findById(req.user.id);
    user.email = email;
    await user.save();

    res.json({ message: "Email updated successfully", email: user.email });
  } catch (err) {
    console.error("Update email error:", err.message);
    res.status(500).json({ error: "Failed to update email" });
  }
});

// --- UPDATE PASSWORD ---
router.post("/update-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ error: "Both old and new passwords required" });

    const user = await User.findById(req.user.id);
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ error: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err.message);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    // Create default wallet
    const wallet = new Wallet({ userId: newUser._id });
    await wallet.save();

    res.status(201).json({
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
      wallet: { inx: wallet.inx, xp: wallet.xp, level: wallet.level },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ error: "Account is banned", reason: user.banReason });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isAdmin: user.isAdmin,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt
      },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "1h" }
    );

    // Update login tracking
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    const walletDoc = await Wallet.findOne({ userId: user._id });
    const wallet = walletDoc || { inx: 0, xp: 0, level: 1, lastCheckIn: null };

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        avatar: user.avatar,
        theme: user.theme,
        banner: user.banner
      },
      wallet: { inx: wallet.inx, xp: wallet.xp, level: wallet.level, lastCheckIn: wallet.lastCheckIn ?? null },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// PROFILE
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const wallet = await Wallet.findOne({ userId: user._id }) || { inx: 0, xp: 0, level: 1, lastCheckIn: null };

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        premiumType: user.premiumType,
        avatar: user.avatar,
        theme: user.theme,
        banner: user.banner,
        isBanned: user.isBanned,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      },
      wallet,
    });
  } catch (err) {
    console.error("❌ Profile error:", err.message);
    res.status(500).json({ error: "Server error while fetching profile" });
  }
});

export { verifyToken, isAdmin };
export default router;
