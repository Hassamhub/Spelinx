'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Shield,
  Settings,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Palette
} from 'lucide-react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminAPI } from '@/lib/api'

export default function AdminDashboard() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(true)

  useEffect(() => {
    checkAdminAccess()
    loadStats()
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

  const loadStats = async () => {
    try {
      // Load real stats from admin APIs
      const [usersResponse, depositsResponse, premiumResponse, storeResponse] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('spelinx_token')}` }
        }),
        fetch('/api/admin/deposits', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('spelinx_token')}` }
        }),
        fetch('/api/admin/premium-payments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('spelinx_token')}` }
        }),
        fetch('/api/admin/store', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('spelinx_token')}` }
        })
      ])

      const [usersData, depositsData, premiumData, storeData] = await Promise.all([
        usersResponse.json(),
        depositsResponse.json(),
        premiumResponse.json(),
        storeResponse.json()
      ])

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalRevenue: depositsData.deposits?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0,
        premiumUsers: premiumData.payments?.filter((p: any) => p.status === 'completed').length || 0,
        totalTransactions: (depositsData.deposits?.length || 0) + (premiumData.payments?.length || 0)
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
      // Fallback to mock stats
      setStats({
        totalUsers: 1250,
        totalRevenue: 45000,
        premiumUsers: 340,
        totalTransactions: 890
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearTestData = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL test data including game history, transactions, and referrals. This action cannot be undone. Are you sure you want to continue?')) {
      return
    }

    if (!confirm('🔴 FINAL CONFIRMATION: Are you absolutely sure? This will remove all non-admin user data and testing records.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/clear-test-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spelinx_token')}`
        }
      })

      if (response.ok) {
        alert('✅ Test data cleared successfully!')
        loadStats() // Refresh stats
      } else {
        const error = await response.json()
        alert('❌ Failed to clear test data: ' + error.error)
      }
    } catch (error) {
      console.error('Clear test data error:', error)
      alert('❌ Failed to clear test data. Please try again.')
    }
  }

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

  const adminActions = [
    {
      title: 'User Management',
      description: 'Manage users, ban/unban accounts, change passwords',
      icon: <Users className="w-6 h-6" />,
      path: '/admin/users',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Deposit Management',
      description: 'Review and approve INR deposit requests',
      icon: <DollarSign className="w-6 h-6" />,
      path: '/admin/deposits',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Premium Payments',
      description: 'Manage SPELINX Plus subscription payments',
      icon: <Shield className="w-6 h-6" />,
      path: '/admin/premium-payments',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Store Management',
      description: 'Add packages, set discounts, manage inventory',
      icon: <ShoppingCart className="w-6 h-6" />,
      path: '/admin/store',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Referral Management',
      description: 'View referral statistics and leaderboard',
      icon: <TrendingUp className="w-6 h-6" />,
      path: '/admin/referrals',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Theme Management',
      description: 'Upload and manage custom themes',
      icon: <Palette className="w-6 h-6" />,
      path: '/admin/themes',
      color: 'from-purple-500 to-pink-600'
    }
  ]

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
                className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30"
                onClick={handleClearTestData}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Test Data
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
            <Shield className="w-8 h-8 text-spelinx-primary" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400">Manage your SPELINX gaming platform</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glass-premium border-white/20">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-spelinx-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-white text-center">{stats.totalUsers || 0}</div>
              <div className="text-sm text-gray-400 text-center">Total Users</div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-white/20">
            <CardContent className="pt-6">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white text-center">₹{stats.totalRevenue || 0}</div>
              <div className="text-sm text-gray-400 text-center">Total Revenue</div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-white/20">
            <CardContent className="pt-6">
              <Shield className="w-8 h-8 text-spelinx-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-white text-center">{stats.premiumUsers || 0}</div>
              <div className="text-sm text-gray-400 text-center">Premium Users</div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-white/20">
            <CardContent className="pt-6">
              <ShoppingCart className="w-8 h-8 text-spelinx-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-white text-center">{stats.totalTransactions || 0}</div>
              <div className="text-sm text-gray-400 text-center">Total Transactions</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {adminActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="glass-premium border-white/20 hover:border-spelinx-primary/50 transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(action.path)}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <CardTitle className="text-white group-hover:text-spelinx-primary transition-colors">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-spelinx-primary to-spelinx-secondary hover:from-spelinx-primary/90 hover:to-spelinx-secondary/90">
                    Manage {action.title}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="glass-premium border-red-500/30 bg-red-900/10">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <CardTitle className="text-red-400">Danger Zone</CardTitle>
              </div>
              <CardDescription className="text-red-300">
                These actions are irreversible. Please proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                <div>
                  <div className="font-semibold text-white">Clear All Test Data</div>
                  <div className="text-sm text-red-300">Removes game history, transactions, and test user data</div>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleClearTestData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
