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
  Crown
} from 'lucide-react'
import Header from '../components/Header'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { adminAPI } from '../lib/api'

interface PremiumPayment {
  _id: string
  userId: {
    username: string
    email: string
  }
  planType: string
  amount: number
  transactionId: string
  status: 'submitted' | 'approved' | 'rejected'
  paymentProof?: string
  adminNotes?: string
  submittedAt: string
  reviewedBy?: {
    username: string
  }
  reviewedAt?: string
}

export default function PremiumPaymentsManagement() {
  const router = useRouter()
  const [payments, setPayments] = useState<PremiumPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<PremiumPayment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkAdminAccess()
    loadPayments()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('spelinx_token')
    setIsLoggedIn(!!token)
  }, [])

  const checkAdminAccess = () => {
    // Since user accessed admin dashboard, assume they have admin privileges
    console.log('Premium payment management access - admin privileges assumed from dashboard access')
  }

  const loadPayments = async () => {
    try {
      const response = await adminAPI.getPremiumPayments()
      setPayments(response.data.payments || [])
    } catch (error: any) {
      console.error('Failed to load premium payments:', error)
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment and try again.')
      } else if (error.response?.status === 401) {
        alert('Session expired. Please login again.')
        router.push('/login')
      } else if (error.response?.status === 403) {
        alert('Access denied. Admin privileges required.')
        router.push('/login')
      } else {
        alert('Failed to load premium payment data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to approve this premium payment?')) return

    try {
      await adminAPI.approvePremiumPayment(paymentId)
      loadPayments() // Refresh data
      alert('Premium payment approved successfully!')
    } catch (error) {
      console.error('Failed to approve premium payment:', error)
      alert('Failed to approve premium payment')
    }
  }

  const handleRejectPayment = async (paymentId: string) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason || reason.trim().length < 5) {
      alert('Rejection reason is required (minimum 5 characters)')
      return
    }

    try {
      await adminAPI.rejectPremiumPayment(paymentId, reason)
      loadPayments() // Refresh data
      alert('Premium payment rejected successfully!')
    } catch (error) {
      console.error('Failed to reject premium payment:', error)
      alert('Failed to reject premium payment')
    }
  }

  const getPlanDisplayName = (planType: string) => {
    const plans = {
      daily: 'Daily Plan',
      weekly: 'Weekly Plan',
      monthly: 'Monthly Plan',
      quarterly: 'Quarterly Plan',
      semiAnnual: 'Semi-Annual Plan',
      yearly: 'Yearly Plan',
      lifetime: 'Lifetime Plan'
    }
    return plans[planType as keyof typeof plans] || planType
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm ||
      payment.userId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = statusFilter === 'all' || payment.status === statusFilter

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
            <Crown className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Premium Payment Management</h1>
          </div>
          <p className="text-gray-400">Review and manage SPELINX Plus premium subscription payment proofs</p>
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
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </motion.div>

        {/* Payments Table */}
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
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Plan</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-white">{payment.userId.username}</div>
                        <div className="text-sm text-gray-400">{payment.userId.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                        {getPlanDisplayName(payment.planType)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-spelinx-accent">₹{payment.amount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-gray-300">{payment.transactionId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : payment.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {new Date(payment.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payment.status === 'submitted' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-400 hover:text-green-300"
                              onClick={() => handleApprovePayment(payment._id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleRejectPayment(payment._id)}
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

          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No premium payments found matching your criteria
            </div>
          )}
        </motion.div>

        {/* Payment Details Modal */}
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Premium Payment Details</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">User</label>
                    <p className="text-white">{selectedPayment.userId.username}</p>
                    <p className="text-sm text-gray-400">{selectedPayment.userId.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Plan Type</label>
                    <p className="text-lg font-bold text-yellow-400">{getPlanDisplayName(selectedPayment.planType)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Amount</label>
                    <p className="text-xl font-bold text-spelinx-accent">₹{selectedPayment.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Transaction ID</label>
                    <p className="text-white font-mono">{selectedPayment.transactionId}</p>
                  </div>
                </div>

                {selectedPayment.paymentProof && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Payment Proof</label>
                    <div className="border border-white/20 rounded-lg p-4">
                      <img
                        src={selectedPayment.paymentProof}
                        alt="Payment proof"
                        className="max-w-full h-auto rounded-lg"
                      />
                      <div className="mt-2 flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedPayment.paymentProof, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Open Full Size
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Status</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPayment.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : selectedPayment.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Submitted</label>
                    <p className="text-gray-300">{new Date(selectedPayment.submittedAt).toLocaleString()}</p>
                  </div>
                </div>

                {selectedPayment.adminNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-300">Admin Notes</label>
                    <p className="text-gray-300 bg-white/5 rounded-lg p-3">{selectedPayment.adminNotes}</p>
                  </div>
                )}

                {selectedPayment.reviewedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-300">Processed By</label>
                    <p className="text-white">{selectedPayment.reviewedBy.username}</p>
                    <p className="text-sm text-gray-400">
                      {selectedPayment.reviewedAt ? new Date(selectedPayment.reviewedAt).toLocaleString() : ''}
                    </p>
                  </div>
                )}

                {selectedPayment.status === 'submitted' && (
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => handleApprovePayment(selectedPayment._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Payment
                    </Button>
                    <Button
                      onClick={() => handleRejectPayment(selectedPayment._id)}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Payment
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
