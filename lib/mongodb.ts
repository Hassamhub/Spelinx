import mongoose from 'mongoose';

// Define Mongoose schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0 },
  totalDeposits: { type: Number, default: 0 },
  totalWithdrawals: { type: Number, default: 0 },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ReferralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  rewardEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const GameHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameType: { type: String, required: true },
  score: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  rewardEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'game_reward', 'referral_reward', 'premium_payment'],
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

// Create models
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
export const Referral = mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
export const GameHistory = mongoose.models.GameHistory || mongoose.model('GameHistory', GameHistorySchema);
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

// Database connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spelinx';

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('Connected to MongoDB');

    // Create admin user if it doesn't exist
    await createAdminUserIfNotExists();
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