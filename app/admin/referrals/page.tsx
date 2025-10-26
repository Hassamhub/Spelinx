'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { adminAPI } from '@/lib/api'
import { Users, Check, X, Search, Filter, RefreshCw, AlertCircle, CheckCircle, Clock, UserCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Referral {
  _id: string
  referrerId: {
    _id: string
    username: string
    email: string
    avatar?: string
  }
  refereeId: {
    _id: string
    username: string
    email: string
    avatar?: string
  }
  status: 'pending' | 'completed'
  rewardGiven: boolean
  rewardType: string
  referredAt: string
  createdAt: string
}

export default function AdminReferralsPage() {
  const router = useRouter()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [processingReward, setProcessingReward] = useState<string | null>(null)

  useEffect(() => {
    loadReferrals()
  }, [selectedStatus, searchTerm])

  const loadReferrals = async () => {
    try {
      setLoading(true)
      // Get all referrals (in a real app, you'd want pagination)
      const response = await fetch('/api/admin/referrals/all')
      const data = await response.json()

      if (response.ok) {
        let filteredReferrals = data.referrals || []

        // Filter by status
        if (selectedStatus !== 'all') {
          filteredReferrals = filteredReferrals.filter((r: Referral) => r.status === selectedStatus)
        }

        // Filter by search term
        if (searchTerm) {
          filteredReferrals = filteredReferrals.filter((r: Referral) =>
            r.referrerId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.refereeId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.referrerId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.refereeId.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }

        setReferrals(filteredReferrals)
      } else {
        setReferrals([])
      }
    } catch (error: any) {
      console.error('Failed to load referrals:', error)
      toast.error('Failed to load referrals')
      setReferrals([])
    } finally {
      setLoading(false)
    }
  }

  const processReferralReward = async (referralId: string, refereeId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingReward(referralId)

      if (action === 'approve') {
        const response = await fetch('/api/referral/reward', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refereeId })
        })

        if (response.ok) {
          toast.success('Referral reward processed successfully!')
          loadReferrals()
        } else {
          const error = await response.json()
          toast.error(error.error || 'Failed to process referral reward')
        }
      } else {
        // For reject, you could implement a rejection system
        toast.error('Rejection system not implemented yet')
      }
    } catch (error: any) {
      console.error('Failed to process referral:', error)
      toast.error('Failed to process referral')
    } finally {
      setProcessingReward(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (referral: Referral) => {
    const isCompleted = referral.status === 'completed'
    const hasReward = referral.rewardGiven

    if (isCompleted && hasReward) {
      return (
        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
          Rewarded
        </span>
      )
    } else if (isCompleted) {
      return (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
          Completed
        </span>
      )
    } else {
      return (
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
          Pending
        </span>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spelinx-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark">
      {/* Admin Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/20"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent"
            >
              SPELINX ADMIN
            </motion.div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => router.push('/admin/dashboard')}
              >
                Back to Dashboard
              </Button>
              <button
                onClick={() => {
                  localStorage.removeItem('spelinx_token');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 py-8" style={{ paddingTop: '120px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-spelinx-primary" />
            <h1 className="text-3xl font-bold text-white">Referral Management</h1>
          </div>
          <p className="text-gray-400">Manage user referrals, rewards, and track referral program performance</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center space-x-4 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-spelinx-primary/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary focus:ring-2 focus:ring-spelinx-primary/20 backdrop-blur-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-spelinx-primary/30 rounded-lg text-white focus:outline-none focus:border-spelinx-primary focus:ring-2 focus:ring-spelinx-primary/20 backdrop-blur-sm"
            >
              <option value="all" className="bg-gray-800 text-white">All Referrals</option>
              <option value="pending" className="bg-gray-800 text-white">Pending</option>
              <option value="completed" className="bg-gray-800 text-white">Completed</option>
            </select>
          </div>

          <Button
            onClick={loadReferrals}
            variant="outline"
            className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-spelinx-primary/30 text-white hover:bg-spelinx-primary/20 hover:border-spelinx-primary/50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Referrals Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-premium rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-6">Recent Referrals</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Referrer</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Referee</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <motion.tr
                    key={referral._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {referral.referrerId.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{referral.referrerId.username}</div>
                          <div className="text-gray-400 text-sm">{referral.referrerId.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-spelinx-secondary to-spelinx-accent rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {referral.refereeId.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{referral.refereeId.username}</div>
                          <div className="text-gray-400 text-sm">{referral.refereeId.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(referral.status)}
                        {getStatusBadge(referral)}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-400">
                      {new Date(referral.referredAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {referral.status === 'pending' && !referral.rewardGiven && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => processReferralReward(referral._id, referral.refereeId._id, 'approve')}
                              disabled={processingReward === referral._id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {processingReward === referral._id ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => processReferralReward(referral._id, referral.refereeId._id, 'reject')}
                              className="border-red-500 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {referral.status === 'completed' && referral.rewardGiven && (
                          <span className="text-green-400 text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Reward Given
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {referrals.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No referrals found</p>
                <p className="text-sm">Referrals will appear here when users sign up with referral codes</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
        >
          <div className="glass-premium rounded-xl p-6 border border-white/20 text-center">
            <Users className="w-8 h-8 text-spelinx-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{referrals.length}</div>
            <div className="text-sm text-gray-400">Total Referrals</div>
          </div>

          <div className="glass-premium rounded-xl p-6 border border-white/20 text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {referrals.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>

          <div className="glass-premium rounded-xl p-6 border border-white/20 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {referrals.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>

          <div className="glass-premium rounded-xl p-6 border border-white/20 text-center">
            <UserCheck className="w-8 h-8 text-spelinx-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {referrals.filter(r => r.rewardGiven).length}
            </div>
            <div className="text-sm text-gray-400">Rewarded</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}