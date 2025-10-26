'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Search,
  User,
  Ban,
  CheckCircle,
  Edit,
  Key,
  Crown,
  Shield,
  MoreVertical,
  Mail,
  Calendar
} from 'lucide-react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminAPI } from '@/lib/api'

interface UserData {
  _id: string
  username: string
  email: string
  role: string
  isAdmin: boolean
  isPremium: boolean
  isBanned: boolean
  banReason?: string
  lastLogin?: string
  createdAt: string
  premiumExpiresAt?: string
  avatar?: string
  theme?: string
  level: number
  xp: number
  walletBalance: number
  totalEarnings: number
  loginCount: number
  referralCode?: string
  referredBy?: string
}

export default function UsersManagement() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isAdmin, setIsAdmin] = useState(true)

  useEffect(() => {
    checkAdminAccess()
    loadUsers()
  }, [])

  const checkAdminAccess = () => {
    const token = localStorage.getItem('spelinx_token')
    const userData = localStorage.getItem('spelinx_user')

    if (!token || !userData) {
      setIsAdmin(false)
      router.push('/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      if (!user.isAdmin) {
        setIsAdmin(false)
        router.push('/')
        return
      }
      setIsAdmin(true)
    } catch (error) {
      setIsAdmin(false)
      router.push('/login')
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getUsers()
      setUsers(response.data.users || [])
    } catch (error: any) {
      console.error('Failed to load users:', error)
      if (error.response?.status === 401) {
        router.push('/login')
      } else if (error.response?.status === 403) {
        router.push('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId: string, currentBanStatus: boolean, username: string) => {
    const action = currentBanStatus ? 'unban' : 'ban'
    const actionText = currentBanStatus ? 'unban' : 'ban'

    if (!confirm(`Are you sure you want to ${actionText} ${username || 'Unknown'}?`)) {
      return
    }

    const reason = currentBanStatus ? '' : prompt('Enter ban reason:')

    if (!currentBanStatus && (!reason || reason.trim().length < 5)) {
      alert('Ban reason is required (minimum 5 characters)')
      return
    }

    try {
      const response = await adminAPI.banUser(userId, currentBanStatus ? '' : (reason || ''))
      // Update local state immediately
      const updatedUser = response.data.user

      // Update the user in the local state with all existing fields
      setUsers(users.map(u =>
        u._id === updatedUser._id
          ? { ...u, ...updatedUser }
          : u
      ))
      alert(`User ${username || 'Unknown'} ${actionText}ned successfully!`)
    } catch (error) {
      console.error(`Failed to ${actionText} user:`, error)
      alert(`Failed to ${actionText} user`)
    }
  }

  const handleChangePassword = async (userId: string, username: string) => {
    const newPassword = prompt(`Enter new password for ${username || 'Unknown'}:`)

    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    if (!confirm(`Are you sure you want to change the password for ${username || 'Unknown'}?`)) {
      return
    }

    try {
      await adminAPI.changePassword(userId, newPassword)
      alert('Password changed successfully!')
    } catch (error) {
      console.error('Failed to change password:', error)
      alert('Failed to change password')
    }
  }

  const handleMakeAdmin = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to make ${username || 'Unknown'} an admin?`)) {
      return
    }

    try {
      await adminAPI.updateUser(userId, { isAdmin: true })
      loadUsers() // Refresh data
      alert(`User ${username || 'Unknown'} is now an admin!`)
    } catch (error) {
      console.error('Failed to make admin:', error)
      alert('Failed to make admin')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())

    let matchesFilter = false
    switch (statusFilter) {
      case 'all':
        matchesFilter = true
        break
      case 'banned':
        matchesFilter = user.isBanned
        break
      case 'premium':
        matchesFilter = user.isPremium
        break
      case 'admin':
        matchesFilter = user.isAdmin
        break
      case 'active':
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        matchesFilter = !user.isBanned && user.lastLogin ? new Date(user.lastLogin) > oneDayAgo : false
        break
      case 'live':
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        matchesFilter = user.lastLogin ? new Date(user.lastLogin) > thirtyDaysAgo : false
        break
      default:
        matchesFilter = true
    }

    return matchesSearch && matchesFilter
  })

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-red-200">You don't have permission to access this page.</p>
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
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <button
                onClick={() => {
                  localStorage.removeItem('spelinx_token');
                  localStorage.removeItem('spelinx_user');
                  window.location.href = '/';
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
            <ArrowLeft
              className="w-6 h-6 text-spelinx-primary cursor-pointer"
              onClick={() => router.push('/admin/dashboard')}
            />
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
          <p className="text-gray-400">Manage users, permissions, and account status</p>
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
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-spelinx-primary"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="premium">Premium</option>
            <option value="admin">Admins</option>
            <option value="live">Live Users (Last 30 Days)</option>
          </select>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-premium rounded-2xl p-6 border border-white/20"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">User</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Premium</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Level</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">XP</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Wallet Balance</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Last Login</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {(user.username || 'User').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-white">{user.username || 'Unknown'}</div>
                          <div className="text-sm text-gray-400 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {user.isAdmin ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                          User
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {user.isBanned ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {user.isPremium ? (
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm">
                            {user.premiumExpiresAt
                              ? new Date(user.premiumExpiresAt).toLocaleDateString()
                              : 'Lifetime'
                            }
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-white font-semibold">{user.level || 1}</td>
                    <td className="py-4 px-4 text-white font-semibold">{(user.xp || 0).toLocaleString()}</td>
                    <td className="py-4 px-4 text-white font-semibold">₹{(user.walletBalance || 0).toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {!user.isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={user.isBanned
                                ? "text-green-400 hover:text-green-300"
                                : "text-red-400 hover:text-red-300"
                              }
                              onClick={() => handleBanUser(user._id, user.isBanned, user.username || 'Unknown')}
                            >
                              {user.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-yellow-400 hover:text-yellow-300"
                              onClick={() => handleChangePassword(user._id, user.username || 'Unknown')}
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-400 hover:text-purple-300"
                              onClick={() => handleMakeAdmin(user._id, user.username || 'Unknown')}
                            >
                              <Crown className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-400">
              No users found matching your criteria
            </div>
          )}
        </motion.div>

        {/* User Details Modal */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Username</label>
                    <p className="text-white text-lg">{selectedUser.username || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Email</label>
                    <p className="text-white">{selectedUser.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Role</label>
                    <p className="text-white">{selectedUser.isAdmin ? 'Administrator' : 'User'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Status</label>
                    <p className={`font-medium ${selectedUser.isBanned ? 'text-red-400' : 'text-green-400'}`}>
                      {selectedUser.isBanned ? 'Banned' : 'Active'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Premium Status</label>
                    <p className="text-white">
                      {selectedUser.isPremium ? 'Premium Member' : 'Regular User'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Level</label>
                    <p className="text-white">{selectedUser.level || 1}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">XP</label>
                    <p className="text-white">{(selectedUser.xp || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Wallet Balance</label>
                    <p className="text-white">₹{(selectedUser.walletBalance || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Total Earnings</label>
                    <p className="text-white">₹{(selectedUser.totalEarnings || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Login Count</label>
                    <p className="text-white">{selectedUser.loginCount || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Referral Code</label>
                    <p className="text-white">{selectedUser.referralCode || 'None'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Referred By</label>
                    <p className="text-white">{selectedUser.referredBy || 'None'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Joined</label>
                    <p className="text-gray-300">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Last Login</label>
                    <p className="text-gray-300">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</p>
                  </div>
                </div>

                {selectedUser.isBanned && selectedUser.banReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-300">Ban Reason</label>
                    <p className="text-red-300 bg-red-900/20 rounded-lg p-3">{selectedUser.banReason}</p>
                  </div>
                )}

                {selectedUser.lastLogin && (
                  <div>
                    <label className="text-sm font-medium text-gray-300">Last Login</label>
                    <p className="text-gray-300">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  {!selectedUser.isAdmin && (
                    <>
                      <Button
                        onClick={() => handleBanUser(selectedUser._id, selectedUser.isBanned, selectedUser.username || 'Unknown')}
                        variant={selectedUser.isBanned ? "default" : "destructive"}
                        className={selectedUser.isBanned ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {selectedUser.isBanned ? 'Unban User' : 'Ban User'}
                      </Button>
                      <Button
                        onClick={() => handleChangePassword(selectedUser._id, selectedUser.username || 'Unknown')}
                        variant="outline"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                      <Button
                        onClick={() => handleMakeAdmin(selectedUser._id, selectedUser.username || 'Unknown')}
                        variant="outline"
                        className="bg-purple-600/20 border-purple-500/50 text-purple-400 hover:bg-purple-600/30"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Make Admin
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}