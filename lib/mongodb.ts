import mongoose from 'mongoose';

// Define Mongoose schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  theme: { type: String },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, required: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for faster lookups
UserSchema.index({ referredBy: 1 });

const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0 },
  totalDeposits: { type: Number, default: 0 },
  totalWithdrawals: { type: Number, default: 0 },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for faster lookups
WalletSchema.index({ userId: 1 });

const GameHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameType: { type: String, required: true },
  score: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  rewardEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for faster lookups
GameHistorySchema.index({ userId: 1 });
GameHistorySchema.index({ gameType: 1 });

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'game_reward', 'referral_reward', 'premium_payment', 'store_payment'],
    required: true
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: { type: String },
  paymentProof: { type: String },
  proofImage: { type: String }, // For premium payment proofs
  submittedAt: { type: Date },
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  verifiedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for faster lookups
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ transactionId: 1 });
TransactionSchema.index({ type: 1 });

const ReferralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  refereeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredAt: { type: Date, default: Date.now },
  rewardGiven: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  rewardType: { type: String, default: 'credits' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for faster lookups
ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ refereeId: 1 });

const ReferralConfigSchema = new mongoose.Schema({
  rewardPerReferral: { type: Number, default: 100 },
  themeUnlockAfter: { type: Number, default: 5 },
  bonusCredits: { type: Number, default: 50 },
  rewardType: {
    type: String,
    enum: ['credits', 'theme', 'badge'],
    default: 'credits'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  details: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for faster lookups
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });

const ThemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  previewUrl: { type: String },
  themeFile: { type: mongoose.Schema.Types.Mixed }, // JSON object with color variables
  price: { type: Number, required: true, min: 0 },
  scope: {
    type: String,
    enum: ['full_site', 'games_only'],
    default: 'full_site'
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserThemesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme', required: true },
  active: { type: Boolean, default: false },
  purchasedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for faster lookups
UserThemesSchema.index({ userId: 1 });
UserThemesSchema.index({ themeId: 1 });

const ThemeSaleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme', required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  purchasedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const StoreItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  discountPercentage: { type: Number, min: 0, max: 100 },
  discountExpiry: { type: Date },
  category: {
    type: String,
    enum: ['skins', 'themes', 'avatars', 'premium'],
    required: true
  },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
export const Referral = mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
export const ReferralConfig = mongoose.models.ReferralConfig || mongoose.model('ReferralConfig', ReferralConfigSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export const GameHistory = mongoose.models.GameHistory || mongoose.model('GameHistory', GameHistorySchema);
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
export const StoreItem = mongoose.models.StoreItem || mongoose.model('StoreItem', StoreItemSchema);
export const Theme = mongoose.models.Theme || mongoose.model('Theme', ThemeSchema);
export const UserThemes = mongoose.models.UserThemes || mongoose.model('UserThemes', UserThemesSchema);
export const ThemeSale = mongoose.models.ThemeSale || mongoose.model('ThemeSale', ThemeSaleSchema);

// Database connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spelinx';

export async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, options);

    // Wait for connection to be ready
    await new Promise<void>((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
      }
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Create default admin user
async function createAdminUserIfNotExists() {
  try {
    const adminExists = await User.findOne({ isAdmin: true });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('admin123', 10);

    const adminUser = new User({
      username: 'admin',
      email: 'admin@spelinx.com',
      password: hashedPassword,
      isAdmin: true,
      referralCode: 'SPELINXADMIN'
    });

    await adminUser.save();
    console.log('Admin user created with email: admin@spelinx.com and password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

export default connectDB;