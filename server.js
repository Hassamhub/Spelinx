// backend/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import mongoose from "mongoose";

// Import routes
import rewardsRoutes from "./routes/rewards.js";
import walletRoutes from "./routes/wallet.js";
// import paymentsRoutes from "./routes/payments.js"; // Commented out - not used
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import gamesRoutes from "./routes/games.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import achievementsRoutes from "./routes/achievements.js";
import dailyRoutes from "./routes/daily.js";
import referralRoutes from "./routes/referral.js";
import premiumRoutes from "./routes/premium.js";
import spinningWheelRoutes from "./routes/spinning-wheel.js";

// Import proxy middleware
import { createProxyMiddleware } from 'http-proxy-middleware';

// Import models for socket
import Leaderboard from "./models/Leaderboard.js";
import { UserAchievement } from "./models/Achievement.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [process.env.FRONTEND_URL || 'https://spelinx.onrender.com']
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// --- Environment validation ---
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// --- MongoDB connection ---
import { connectDB } from "./config/db.js";
connectDB();

// --- Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [process.env.FRONTEND_URL || 'https://spelinx.onrender.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', (req, res, next) => {
  // Skip rate limiting for health checks
  if (req.path === '/api/health') {
    return next();
  }
  return limiter(req, res, next);
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// More lenient rate limiting for payment endpoints to allow retries
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 payment requests per 15 minutes
  message: 'Too many payment requests, please wait a few minutes and try again.',
});

app.use('/api/premium', paymentLimiter);
app.use('/api/wallet', paymentLimiter);

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/wallet", walletRoutes);
// app.use("/api/payment", paymentRoutes); // Commented out - not needed
app.use("/api/admin", adminRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/daily", dailyRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/spinning-wheel", spinningWheelRoutes);
// Note: Premium and spinning wheel routes are now protected by the global access control middleware

// --- Health check route ---
app.get("/api/health", (req, res) => {
  console.log("Health check endpoint hit");

  // Check MongoDB connection
  const mongooseState = mongoose.connection.readyState;
  const dbStatus = mongooseState === 1 ? "connected" : mongooseState === 2 ? "connecting" : "disconnected";

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "running",
    database: dbStatus,
    version: "1.0.0"
  });
});

// --- SOCKET.IO SETUP ---
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Join user room for personalized updates
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Real-time leaderboard updates
  socket.on("request-leaderboard", async (game) => {
    try {
      let leaderboard;
      if (game === 'global') {
        leaderboard = await Leaderboard.find({})
          .sort({ totalXP: -1 })
          .limit(10)
          .select("username totalXP totalINX level");
      } else {
        leaderboard = await Leaderboard.find({})
          .sort({ [`gameHighscores.${game}`]: -1 })
          .limit(10)
          .select(`username gameHighscores.${game}`);
      }
      socket.emit("leaderboard-update", { game, leaderboard });
    } catch (error) {
      console.error("Socket leaderboard error:", error);
    }
  });

  // Real-time achievement updates
  socket.on("check-achievements", async (userId) => {
    try {
      // Simplified achievement check
      const achievements = await UserAchievement.find({ userId })
        .populate("achievementId")
        .sort({ completedAt: -1 });

      socket.emit("achievements-update", achievements);
    } catch (error) {
      console.error("Socket achievements error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// --- Serve Next.js frontend ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Next.js from standard .next build
const nextBuildPath = path.join(__dirname, "./spelinx-frontend/.next");
console.log('Next.js build path:', nextBuildPath);

// List all files in the build directory for debugging
import('fs').then(fs => {
  if (fs.existsSync(nextBuildPath)) {
    console.log('Build directory contents:', fs.readdirSync(nextBuildPath).slice(0, 5));
  } else {
    console.error('Build directory does not exist:', nextBuildPath);
  }
}).catch(err => console.error('FS error:', err));

// Serve Next.js static assets
app.use('/_next', express.static(nextBuildPath));
app.use('/_next/static', express.static(path.join(nextBuildPath, 'static')));

// Serve the static exported homepage
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, "./spelinx-frontend/out/index.html");

  // Check if Next.js built the static export
  import('fs').then(fs => {
    if (fs.existsSync(htmlPath)) {
      console.log('Serving Next.js static export from:', htmlPath);
      res.sendFile(htmlPath);
    } else {
      // Show build status
      console.log('Static export not found, showing status');
      res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SPELINX - Build Status</title>
    <style>
        body {
            font-family: monospace;
            background: #1a1a1a;
            color: #00ff00;
            padding: 2rem;
            margin: 0;
        }
        .status {
            background: #000;
            padding: 1rem;
            border: 1px solid #00ff00;
            border-radius: 5px;
        }
        h1 { color: #00ff00; }
        p { margin: 0.5rem 0; }
        button {
            background: #00ff00;
            color: #000;
            border: none;
            padding: 0.5rem 1rem;
            cursor: pointer;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <h1>SPELINX Static Export Loading...</h1>
    <div class="status">
        <p>Build path: ${htmlPath}</p>
        <p>Directory exists: ${fs.existsSync(path.dirname(htmlPath))}</p>
        <p>Contents: ${fs.existsSync(path.dirname(htmlPath)) ? fs.readdirSync(path.dirname(htmlPath)).join(', ') : 'Directory not found'}</p>
        <p>Status: Next.js static export building...</p>
        <button onclick="location.reload()">Refresh</button>
    </div>
</body>
</html>`);
    }
  }).catch(err => {
    console.error('FS error:', err);
    res.status(500).send('Server error');
  });
});

// Handle all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    // Try to serve other Next.js pages or fallback to homepage
    const pagePath = path.join(__dirname, "./spelinx-frontend/.next/server/app", req.path + '.html');

    import('fs').then(fs => {
      if (fs.existsSync(pagePath)) {
        res.sendFile(pagePath);
      } else {
        // For SPA routing, redirect to homepage which will handle client-side routing
        res.redirect('/');
      }
    }).catch(err => {
      console.error('FS error:', err);
      res.status(500).send('Server error');
    });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3000; // Unified port for frontend and backend
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌐 Production URL: ${process.env.RENDER_EXTERNAL_URL || 'https://spelinx-web.onrender.com'}`);
});