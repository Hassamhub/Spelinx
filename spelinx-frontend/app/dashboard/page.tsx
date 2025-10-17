'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { authAPI } from '../../../../lib/api'
import { User, Trophy, Coins, Calendar, Settings, LogOut } from 'lucide-react'

interface UserProfile {
  _id: string
  username: string
  email: string
  isPremium: boolean
  totalGamesPlayed: number
  totalScore: number
  level: number
  inx: number
  joinedAt: string
  lastLogin: string
}

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      setUser(response.data)
    } catch (error) {
      console.error('Failed to load profile:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // Ensure user data has default values to prevent undefined errors
  const safeUser = user ? {
    ...user,
    totalScore: user.totalScore || 0,
    totalGamesPlayed: user.totalGamesPlayed || 0,
    inx: user.inx || 0,
    level: user.level || 1
  } : null

  const handleLogout = () => {
    localStorage.removeItem('spelinx_token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark">
        <Header isDarkMode={true} setIsDarkMode={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spelinx-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark'
        : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
    }`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.username}!</h1>
            <p className="text-gray-400">Here's your gaming dashboard and statistics</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-premium rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">🏆</div>
                <Trophy className="w-6 h-6 text-spelinx-accent" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{safeUser?.totalScore.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Score</div>
            </div>

            <div className="glass-premium rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">🎮</div>
                <User className="w-6 h-6 text-spelinx-primary" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{safeUser?.totalGamesPlayed}</div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>

            <div className="glass-premium rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">💎</div>
                <Coins className="w-6 h-6 text-spelinx-secondary" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{safeUser?.inx.toLocaleString()}</div>
              <div className="text-sm text-gray-400">INX Balance</div>
            </div>

            <div className="glass-premium rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">⭐</div>
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">Level {safeUser?.level}</div>
              <div className="text-sm text-gray-400">Current Level</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="glass-premium rounded-xl p-6 border border-white/20 mb-6">
                <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <div className="bg-white/10 rounded-lg px-4 py-3 text-white">{user.username}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <div className="bg-white/10 rounded-lg px-4 py-3 text-white">{user.email}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Member Since</label>
                    <div className="bg-white/10 rounded-lg px-4 py-3 text-white">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Last Login</label>
                    <div className="bg-white/10 rounded-lg px-4 py-3 text-white">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Account Status</label>
                  <div className="flex items-center space-x-2">
                    {user.isPremium ? (
                      <>
                        <div className="bg-gradient-to-r from-spelinx-primary to-spelinx-secondary text-white px-3 py-1 rounded-full text-sm font-bold">
                          SPELINX Plus
                        </div>
                        <span className="text-gray-400 text-sm">Premium Member</span>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">
                          Free Account
                        </div>
                        <a
                          href="/premium"
                          className="text-spelinx-primary hover:text-spelinx-primary/80 text-sm underline"
                        >
                          Upgrade to Premium
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity Placeholder */}
              <div className="glass-premium rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Recent games and achievements will appear here</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="glass-premium rounded-xl p-6 border border-white/20 mb-6">
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>

                <div className="space-y-3">
                  <a
                    href="/games"
                    className="w-full bg-spelinx-primary hover:bg-spelinx-primary/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    🎮 Play Games
                  </a>

                  <a
                    href="/leaderboard"
                    className="w-full bg-spelinx-secondary hover:bg-spelinx-secondary/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    🏆 View Leaderboard
                  </a>

                  <a
                    href="/store"
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-white/20 flex items-center justify-center"
                  >
                    🛒 Visit Store
                  </a>

                  {!user.isPremium && (
                    <a
                      href="/premium"
                      className="w-full bg-gradient-to-r from-spelinx-primary to-spelinx-secondary hover:from-spelinx-primary/90 hover:to-spelinx-secondary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                      👑 Go Premium
                    </a>
                  )}
                </div>
              </div>

              {/* Account Settings */}
              <div className="glass-premium rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Account</h3>

                <div className="space-y-3">
                  <button className="w-full text-left text-gray-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-400 hover:text-red-300 py-2 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
