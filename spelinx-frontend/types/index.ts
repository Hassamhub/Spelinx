// User Types
export interface User {
  _id: string
  username: string
  email: string
  avatar?: string
  theme?: string
  isPremium: boolean
  premiumExpiresAt?: Date
  inxBalance: number
  totalGamesPlayed: number
  totalWins: number
  currentStreak: number
  bestStreak: number
  isBanned: boolean
  banReason?: string
  lastLogin: Date
  createdAt: Date
  role: 'user' | 'admin'
}

// Game Types
export interface Game {
  _id: string
  name: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  maxScore?: number
  description: string
  icon: string
  isActive: boolean
  premiumOnly: boolean
}

// Game History Types
export interface GameHistory {
  _id: string
  userId: string
  gameId: string
  score: number
  result: 'win' | 'loss' | 'draw'
  duration: number
  moves?: any[]
  playedAt: Date
}

// Leaderboard Types
export interface LeaderboardEntry {
  _id: string
  userId: string
  username: string
  avatar?: string
  gameId?: string
  score: number
  rank: number
  gamesPlayed: number
  winRate: number
  lastPlayed: Date
}

// Premium Types
export interface PremiumPlan {
  name: string
  price: number
  duration: number // in months
  features: string[]
  popular?: boolean
}

export interface SpinningWheelResult {
  reward: string
  inxAmount?: number
  itemId?: string
  multiplier?: number
}

// Store Types
export interface StoreItem {
  _id: string
  name: string
  description: string
  category: 'skin' | 'theme' | 'avatar' | 'banner'
  price: number
  premiumPrice?: number
  imageUrl: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isActive: boolean
  stock?: number
}

export interface Transaction {
  _id: string
  userId: string
  type: 'purchase' | 'reward' | 'withdrawal' | 'deposit'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  itemId?: string
  createdAt: Date
}

// Referral Types
export interface Referral {
  _id: string
  referrerId: string
  referredId: string
  status: 'pending' | 'completed'
  commission: number
  claimed: boolean
  createdAt: Date
  completedAt?: Date
}

// Daily Check-in Types
export interface DailyClaim {
  _id: string
  userId: string
  day: number
  streakBonus: number
  claimedAt: Date
}

export interface DailyStreak {
  currentStreak: number
  longestStreak: number
  lastClaim: Date
  nextClaimAvailable: Date
  canClaimToday: boolean
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface ProfileUpdateForm {
  username?: string
  email?: string
  avatar?: string
  theme?: string
}

// Admin Types
export interface AdminStats {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  totalGames: number
  totalRevenue: number
  recentSignups: number
  bannedUsers: number
}

// Theme Types
export interface Theme {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
}