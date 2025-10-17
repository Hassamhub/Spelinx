import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Authentication middleware
export const verifyToken = (req, res, next) => {
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
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'admin' && !user.isAdmin)) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ error: "Server error" });
  }
};