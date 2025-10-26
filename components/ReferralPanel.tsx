'use client'

import { motion } from 'framer-motion'
import { Copy, Users, DollarSign, Gift, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ReferralStats {
  referralLink: string
  referralCode: string
  referralCount: number
  completedReferrals: number
  credits: number
  totalRewards: number
  availableBalance: number
}

export default function ReferralPanel() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadReferralStats()
  }, [])

  const loadReferralStats = async () => {
    try {
      const token = localStorage.getItem('spelinx_token')
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {}

      const response = await fetch('/api/referrals/my', { headers })
      const data = await response.json()

      if (response.ok) {
        setStats({
          referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://spelinx.com'}/signup?ref=${data.referralCode}`,
          referralCode: data.referralCode,
          referralCount: data.referralCount,
          completedReferrals: data.referralCount,
          credits: 0,
          totalRewards: data.referralCount * 100,
          availableBalance: data.referralCount * 100
        })
      } else {
        // Fallback for non-authenticated users
        setStats({
          referralLink: `https://spelinx.com/signup?ref=SPELINX123`,
          referralCode: 'SPELINX123',
          referralCount: 0,
          completedReferrals: 0,
          credits: 0,
          totalRewards: 0,
          availableBalance: 0
        })
      }
    } catch (error) {
      console.error('Failed to load referral stats:', error)
      setStats({
        referralLink: `https://spelinx.com/signup?ref=SPELINX123`,
        referralCode: 'SPELINX123',
        referralCount: 0,
        completedReferrals: 0,
        credits: 0,
        totalRewards: 0,
        availableBalance: 0
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

  const copyReferralLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareReferralLink = () => {
    if (stats?.referralLink) {
      if (navigator.share) {
        navigator.share({
          title: 'Join SPELINX with my referral!',
          text: 'Sign up for SPELINX using my referral code and get bonus rewards!',
          url: stats.referralLink
        })
      } else {
        copyReferralLink()
      }
    }
  }

  if (loading) {
    return (
      <div className="glass-premium rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spelinx-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-premium rounded-2xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-spelinx-primary" />
          <h3 className="text-xl font-bold text-white">Referral Program</h3>
        </div>
        <Link
          href="/referral"
          className="text-spelinx-primary hover:text-spelinx-primary/80 transition-colors"
        >
          View Full Details →
        </Link>
      </div>

      {/* Referral Code Section */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Your Referral Code</h4>
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-1 bg-gray-800/50 rounded-lg px-4 py-3 border border-gray-600">
            <span className="text-lg font-mono text-spelinx-accent">{stats?.referralCode}</span>
          </div>
          <button
            onClick={copyReferralCode}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-spelinx-primary hover:bg-spelinx-primary/90 text-white'
            }`}
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={copyReferralLink}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-200"
          >
            <Copy className="w-4 h-4 inline mr-2" />
            Copy Link
          </button>
          <button
            onClick={shareReferralLink}
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/20 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4 inline mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <Users className="w-6 h-6 text-spelinx-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats?.referralCount || 0}</div>
          <div className="text-sm text-gray-400">Total Referrals</div>
        </div>

        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats?.completedReferrals || 0}</div>
          <div className="text-sm text-gray-400">Successful</div>
        </div>

        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <DollarSign className="w-6 h-6 text-spelinx-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats?.totalRewards || 0}</div>
          <div className="text-sm text-gray-400">Earned (INX)</div>
        </div>

        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <Gift className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats?.credits || 0}</div>
          <div className="text-sm text-gray-400">Available Credits</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Progress to Theme Unlock</span>
          <span className="text-sm text-gray-400">{stats?.completedReferrals || 0}/5</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-spelinx-primary to-spelinx-secondary h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((stats?.completedReferrals || 0) / 5 * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Invite 5 friends to unlock a premium theme!
        </p>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Link
          href="/referral"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-200"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Full Referral Dashboard
        </Link>
      </div>
    </motion.div>
  )
}