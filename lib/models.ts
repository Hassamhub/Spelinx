// User model
export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  level: number;
  xp: number;
  walletBalance: number;
  totalEarnings: number;
  referralCode: string;
  referredBy?: string;
  isPremium: boolean;
  premiumExpiresAt?: Date;
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
  referredId: string;
  referralCode: string;
  rewardEarned: number;
  createdAt: Date;
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
  type: 'deposit' | 'withdrawal' | 'game_reward' | 'referral_reward' | 'premium_payment';
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