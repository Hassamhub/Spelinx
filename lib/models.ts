// User model
export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  theme?: string;
  font?: string;
  level: number;
  xp: number;
  walletBalance: number;
  totalEarnings: number;
  referralCode?: string;
  referredBy?: string;
  referralCount: number;
  credits: number;
  isPremium: boolean;
  premiumExpiresAt?: Date;
  isAdmin: boolean;
  isBanned: boolean;
  banReason?: string;
  lastLogin?: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Wallet model
export interface Wallet {
  _id?: string;
  userId: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactions: string[]; // Array of transaction IDs
  createdAt: Date;
  updatedAt: Date;
}

// Referral model
export interface Referral {
  _id?: string;
  referrerId: string;
  refereeId: string;
  referredAt: Date;
  rewardGiven: boolean;
  status: 'pending' | 'completed';
  rewardType: string;
  createdAt: Date;
  updatedAt: Date;
}

// ReferralConfig model
export interface ReferralConfig {
  _id?: string;
  rewardPerReferral: number;
  themeUnlockAfter: number;
  bonusCredits: number;
  rewardType: 'credits' | 'theme' | 'badge';
  createdAt: Date;
  updatedAt: Date;
}

// AuditLog model
export interface AuditLog {
  _id?: string;
  userId?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Theme model
export interface Theme {
  _id?: string;
  name: string;
  description: string;
  previewUrl?: string;
  themeFile: Record<string, string>; // JSON object with color variables
  price: number;
  scope: 'full_site' | 'games_only';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// UserThemes model
export interface UserThemes {
  _id?: string;
  userId: string;
  themeId: string;
  active: boolean;
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ThemeSale model
export interface ThemeSale {
  _id?: string;
  userId: string;
  themeId: string;
  amount: number;
  transactionId: string;
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// GameHistory model
export interface GameHistory {
  _id?: string;
  userId: string;
  gameType: string;
  score: number;
  duration: number; // in seconds
  completed: boolean;
  rewardEarned: number;
  createdAt: Date;
}

// Transaction model
export interface Transaction {
  _id?: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'game_reward' | 'referral_reward' | 'premium_payment' | 'store_payment';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  paymentProof?: string;
  createdAt: Date;
  updatedAt: Date;
}

// PremiumPaymentProof model (embedded in Transaction)
export interface PremiumPaymentProof {
  transactionId: string;
  proofImage: string;
  submittedAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
}