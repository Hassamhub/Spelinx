import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spelinx_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout on 401 for non-admin endpoints
    if (error.response?.status === 401 && !error.config.url?.includes('/admin/')) {
      localStorage.removeItem('spelinx_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: { username: string; email: string; password: string; referralCode?: string }) =>
    api.post('/auth/signup', userData),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (data: any) => api.put('/auth/profile', data),
}

export const gameAPI = {
  getGames: () => api.get('/games'),

  playGame: (gameId: string, move: any) =>
    api.post(`/games/${gameId}/play`, move),

  getGameHistory: (gameId: string) =>
    api.get(`/games/${gameId}/history`),

  getLeaderboard: (gameId?: string) =>
    api.get(`/leaderboard${gameId ? `?game=${gameId}` : ''}`),
}

export const premiumAPI = {
  getStatus: () => api.get('/premium/status'),

  initiatePayment: (type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiAnnual' | 'yearly' | 'lifetime') =>
    api.post('/premium/initiate-payment', { type }),

  submitProof: (transactionId: string, proofImage: string, planType: string) =>
    api.post('/premium/submit-proof', { transactionId, proofImage, planType }),

  spinWheel: () => api.post('/spinning-wheel/spin'),

  customizeProfile: (customization: any) =>
    api.post('/premium/customize', customization),

  getFeatures: () => api.get('/premium/features'),
}

export const storeAPI = {
  getItems: (category?: string) =>
    api.get(`/store${category ? `?category=${category}` : ''}`),

  purchaseItem: (itemId: string, paymentMethod: string) =>
    api.post('/store/purchase', { itemId, paymentMethod }),

  getTransactionHistory: () => api.get('/store/transactions'),
}

export const walletAPI = {
  getWallet: () => api.get('/wallet'),

  initiateDeposit: (inrAmount: number) =>
    api.post('/wallet/deposit-initiate', { inrAmount }),

  submitDepositProof: (transactionId: string, proofImage: string, inrAmount: number) =>
    api.post('/wallet/deposit-submit-proof', { transactionId, proofImage, inrAmount }),

  updateWallet: (updates: any) => api.post('/wallet', updates),

  getTransactions: () => api.get('/wallet/transactions'),
}

export const referralAPI = {
  getReferralCode: () => api.get('/referral/code'),

  getReferrals: () => api.get('/referral/list'),

  claimCommission: (commissionId: string) =>
    api.post('/referral/claim-commission', { commissionId }),
}

export const dailyAPI = {
  checkIn: () => api.post('/daily/check-in'),

  getStreak: () => api.get('/daily/streak'),
}

export const adminAPI = {
  getUsers: (page = 1, limit = 10) =>
    api.get(`/admin/users?page=${page}&limit=${limit}`),

  banUser: (userId: string, reason: string) =>
    api.post(`/admin/users/${userId}/ban`, { ban: reason.includes('Banned'), reason }),

  updateUser: (userId: string, updates: any) =>
    api.put(`/admin/users/${userId}`, updates),

  changePassword: (userId: string, newPassword: string) =>
    api.post(`/admin/users/${userId}/change-password`, { newPassword }),

  getStats: () => api.get('/admin/stats'),

  getPayments: () => api.get('/admin/payments'),

  getDeposits: () => api.get('/admin/deposits'),

  approveDeposit: (depositId: string, notes?: string) =>
    api.post(`/admin/deposits/${depositId}/approve`, { notes }),

  rejectDeposit: (depositId: string, notes: string) =>
    api.post(`/admin/deposits/${depositId}/reject`, { notes }),

  getPremiumPayments: () => api.get('/admin/premium-payments'),

  approvePremiumPayment: (paymentId: string, notes?: string) =>
    api.post(`/admin/premium-payments/${paymentId}/approve`, { notes }),

  rejectPremiumPayment: (paymentId: string, notes: string) =>
    api.post(`/admin/premium-payments/${paymentId}/reject`, { notes }),

  getSalesStats: (period: 'week' | 'month' | 'year' = 'month') =>
    api.get(`/admin/sales-stats?period=${period}`),

  getUserStats: (userId: string) =>
    api.get(`/admin/users/${userId}/stats`),
}

export default api