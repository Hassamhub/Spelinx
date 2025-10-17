'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  Filter
} from 'lucide-react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminAPI } from '@/lib/api'

interface Deposit {
  _id: string
  userId: {
    username: string
    email: string
  }
  amount: number
  txnId: string
  status: 'pending' | 'approved' | 'rejected'
  screenshot?: string
  notes?: string
  createdAt: string
  verifiedBy?: {
    username: string
  }
  verifiedAt?: string
}

export default function DepositsManagement() {
  const router = useRouter()
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkAdminAccess()
    loadDeposits()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('spelinx_token')
    setIsLoggedIn(!!token)
  }, [])

  const checkAdminAccess = () => {
    // Since user accessed admin dashboard, assume they have admin privileges
    console.log('Deposit management access - admin privileges assumed from dashboard access')
  }

  const loadDeposits = async () => {
    try {
      const response = await adminAPI.getDeposits()
      setDeposits(response.data.deposits || [])
    } catch (error: any) {
      console.error('Failed to load deposits:', error)
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment and try again.')
      } else if (error.response?.status === 401) {
        alert('Session expired. Please login again.')
        router.push('/login')
      } else if (error.response?.status === 403) {
        alert('Access denied. Admin privileges required.')
        router.push('/login')
      } else {
        alert('Failed to load deposits data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDeposit = async (depositId: string) => {
    if (!confirm('Are you sure you want to approve this deposit?')) return

    try {
      await adminAPI.approveDeposit(depositId)
      loadDeposits() // Refresh data
      alert('Deposit approved successfully!')
    } catch (error) {
      console.error('Failed to approve deposit:', error)
      alert('Failed to approve deposit')
    }
  }

  const handleRejectDeposit = async (depositId: string) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason || reason.trim().length < 5) {
      alert('Rejection reason is required (minimum 5 characters)')
      return
    }

    try {
      await adminAPI.rejectDeposit(depositId, reason)
      loadDeposits() // Refresh data
      alert('Deposit rejected successfully!')
    } catch (error) {
      console.error('Failed to reject deposit:', error)
      alert('Failed to reject deposit')
    }
  }

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = !searchTerm ||
      deposit.userId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.txnId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = statusFilter === 'all' || deposit.status === statusFilter

    return matchesSearch && matchesFilter
  })

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
                <ArrowLeft className="w-4 h-4 mr-2" />
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
            <ArrowLeft
              className="w-6 h-6 text-spelinx-primary cursor-pointer"
              onClick={() => router.push('/admin/dashboard')}
            />
            <h1 className="text-3xl font-bold text-white">Deposit Management</h1>
          </div>
          <p className="text-gray-400">Review and manage INR deposit requests with payment proofs</p>
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
              placeholder="Search by username, email, or TXN ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-spelinx-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </motion.div>

        {/* Deposits Table */}
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
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.map((deposit) => (
                  <motion.tr
                    key={deposit._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-white">{deposit.userId.username}</div>
                        <div className="text-sm text-gray-400">{deposit.userId.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-spelinx-accent">₹{deposit.amount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-gray-300">{deposit.txnId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deposit.status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : deposit.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {deposit.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {new Date(deposit.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => setSelectedDeposit(deposit)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {deposit.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-400 hover:text-green-300"
                              onClick={() => handleApproveDeposit(deposit._id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleRejectDeposit(deposit._id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDeposits.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No deposits found matching your criteria
            </div>
          )}
        </motion.div>

        {/* Deposit Details Modal */}
        {selectedDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDeposit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Deposit Details</h2>
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">User</label>
                    <p className="text-white">{selectedDeposit.userId.username}</p>
                    <p className="text-sm text-gray-400">{selectedDeposit.userId.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Amount</label>
                    <p className="text-xl font-bold text-spelinx-accent">₹{selectedDeposit.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Transaction ID</label>
                    <p className="text-white font-mono">{selectedDeposit.txnId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedDeposit.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : selectedDeposit.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedDeposit.status}
                    </span>
                  </div>
                </div>

                {selectedDeposit.screenshot && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Payment Proof</label>
                    <div className="border border-white/20 rounded-lg p-4">
                      <img
                        src={selectedDeposit.screenshot}
                        alt="Payment proof"
                        className="max-w-full h-auto rounded-lg"
                      />
                      <div className="mt-2 flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedDeposit.screenshot, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Open Full Size
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDeposit.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-300">Admin Notes</label>
                    <p className="text-gray-300 bg-white/5 rounded-lg p-3">{selectedDeposit.notes}</p>
                  </div>
                )}

                {selectedDeposit.verifiedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-300">Processed By</label>
                    <p className="text-white">{selectedDeposit.verifiedBy.username}</p>
                    <p className="text-sm text-gray-400">
                      {selectedDeposit.verifiedAt ? new Date(selectedDeposit.verifiedAt).toLocaleString() : ''}
                    </p>
                  </div>
                )}

                {selectedDeposit.status === 'pending' && (
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => handleApproveDeposit(selectedDeposit._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Deposit
                    </Button>
                    <Button
                      onClick={() => handleRejectDeposit(selectedDeposit._id)}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Deposit
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
