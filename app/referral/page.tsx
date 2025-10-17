'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { authAPI } from '@/lib/api'
import { Copy, Users, DollarSign, Gift, TrendingUp, CheckCircle, Crown } from 'lucide-react'

interface ReferralStats {
  referralCode: string
  totalReferrals: number
  activeReferrals: number
  totalEarnings: number
  availableBalance: number
  recentReferrals: Array<{
    username: string
    joinedAt: string
    isPremium: boolean
    earnings: number
  }>
}

export default function ReferralPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadReferralStats()
  }, [])

  const loadReferralStats = async () => {
    try {
      const response = await authAPI.getReferralStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load referral stats:', error)
      // Set demo data if API fails
      setStats({
        referralCode: 'SPELINX123',
        totalReferrals: 24,
        activeReferrals: 18,
        totalEarnings: 450,
        availableBalance: 225,
        recentReferrals: [
          { username: 'gamer_pro', joinedAt: '2024-01-15', isPremium: true, earnings: 25 },
          { username: 'puzzle_master', joinedAt: '2024-01-14', isPremium: false, earnings: 10 },
          { username: 'snake_champ', joinedAt: '2024-01-13', isPremium: true, earnings: 25 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareReferralLink = () => {
    const referralLink = `https://spelinx.vercel.app/signup?ref=${stats?.referralCode}`
    navigator.clipboard.writeText(referralLink)
    alert('Referral link copied to clipboard!')
  }

  const getReferralUrl = () => {
    return `https://spelinx.vercel.app/signup?ref=${stats?.referralCode}`
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

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark'
        : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
    }`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 pt-24"
      >
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent mb-4">
              Referral Program
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Earn INX rewards by inviting friends to join SPELINX! Get bonus rewards when your referrals become premium members.
            </p>
          </motion.div>

          {/* Referral Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-premium rounded-2xl p-8 border border-white/20 mb-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Your Referral Code</h2>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="bg-white/10 rounded-lg px-6 py-3">
                  <span className="text-2xl font-mono text-spelinx-accent">{stats?.referralCode}</span>
                </div>
                <button
                  onClick={copyReferralCode}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-spelinx-primary hover:bg-spelinx-primary/80 text-white'
                  }`}
                >
                  <Copy className="w-5 h-5 inline mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={shareReferralLink}
                  className="px-6 py-3 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Share Referral Link
                </button>
                <a
                  href={getReferralUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/20 transition-colors text-center"
                >
                  Preview Link
                </a>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass-premium rounded-xl p-6 border border-white/20 text-center">
              <Users className="w-8 h-8 text-spelinx-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats?.totalReferrals || 0}</div>
              <div className="text-sm text-gray-400">Total Referrals</div>
            </div>

            <div className="glass-premium rounded-xl p-6 border border-white/20 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats?.activeReferrals || 0}</div>
              <div className="text-sm text-gray-400">Active Referrals</div>
            </div>

            <div className="glass-premium rounded-xl p-6 border border-white/20 text-center">
              <DollarSign className="w-8 h-8 text-spelinx-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats?.totalEarnings || 0}</div>
              <div className="text-sm text-gray-400">Total Earnings</div>
            </div>

            <div className="glass-premium rounded-xl p-6 border border-white/20 text-center">
              <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats?.availableBalance || 0}</div>
              <div className="text-sm text-gray-400">Available Balance</div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* How it Works */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-premium rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-spelinx-primary" />
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-spelinx-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-white">Share Your Code</h4>
                    <p className="text-gray-400 text-sm">Send your referral code or link to friends</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-spelinx-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-white">Friend Signs Up</h4>
                    <p className="text-gray-400 text-sm">They sign up using your referral code</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-spelinx-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-white">Earn Rewards</h4>
                    <p className="text-gray-400 text-sm">Get 10 INX per signup, 25 INX if they go premium</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <div>
                    <h4 className="font-semibold text-white">Withdraw Earnings</h4>
                    <p className="text-gray-400 text-sm">Convert earnings to real cash withdrawals</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Referrals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-premium rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-spelinx-primary" />
                Recent Referrals
              </h3>
              <div className="space-y-4">
                {stats?.recentReferrals?.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {referral.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{referral.username}</div>
                        <div className="text-xs text-gray-400">{referral.joinedAt}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-spelinx-accent">+{referral.earnings} INX</div>
                      {referral.isPremium && (
                        <Crown className="w-4 h-4 text-yellow-400 mx-auto mt-1" />
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No referrals yet</p>
                    <p className="text-sm">Start sharing your referral code!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <div className="glass-premium rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Start Earning Today!</h3>
              <p className="text-gray-300 mb-6">
                Share your referral code with friends and family. The more people you bring to SPELINX, the more you earn!
              </p>
              <button
                onClick={copyReferralCode}
                className="px-8 py-4 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-xl text-white font-semibold hover:shadow-lg transition-all duration-300"
              >
                Copy Referral Code
              </button>
            </div>
          </motion.div>
        </div>
      </motion.main>

      <Footer />
    </div>
  )
}