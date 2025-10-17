'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, CreditCard, Upload, History, DollarSign, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

interface Transaction {
  _id: string
  type: string
  amount: number
  currency: string
  method: string
  status: string
  description: string
  createdAt: string
  transactionId: string
}

interface WalletData {
  balance: number
  inx: number
}

export default function WalletPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [upiId, setUpiId] = useState('')
  const [txnId, setTxnId] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadWalletData()
    loadTransactions()
  }, [])

  const loadWalletData = async () => {
    try {
      const token = localStorage.getItem('spelinx_token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const userData = await response.json()
        setWallet({
          balance: userData.balance || 0,
          inx: userData.inx || 0
        })
      }
    } catch (error) {
      console.error('Failed to load wallet:', error)
    }
  }

  const loadTransactions = async () => {
    try {
      const token = localStorage.getItem('spelinx_token')
      if (!token) return

      const response = await fetch('/api/payment/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || !txnId || !screenshot) {
      alert('Please fill all fields and upload a screenshot')
      return
    }

    setIsProcessing(true)

    try {
      const token = localStorage.getItem('spelinx_token')
      if (!token) {
        alert('Please login first')
        return
      }

      const formData = new FormData()
      formData.append('amount', depositAmount)
      formData.append('txnId', txnId)
      formData.append('screenshot', screenshot)

      const response = await fetch('/api/payment/submit-deposit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        alert('Deposit submitted successfully! It will be verified within 24 hours.')
        setDepositAmount('')
        setTxnId('')
        setScreenshot(null)
        loadTransactions()
      } else {
        alert(data.error || 'Deposit submission failed')
      }
    } catch (error) {
      console.error('Deposit error:', error)
      alert('Deposit submission failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || !upiId) {
      alert('Please fill all fields')
      return
    }

    setIsProcessing(true)

    try {
      const token = localStorage.getItem('spelinx_token')
      if (!token) {
        alert('Please login first')
        return
      }

      const response = await fetch('/api/payment/request-withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          upiId
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Withdrawal request submitted successfully! It will be processed within 24-48 hours.')
        setWithdrawAmount('')
        setUpiId('')
        loadTransactions()
      } else {
        alert(data.error || 'Withdrawal request failed')
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
      alert('Withdrawal request failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spelinx-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark">
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              My Wallet
            </h1>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass-premium rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-400 mr-3" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Balance</h3>
                      <p className="text-gray-400 text-sm">Available funds</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  ₹{wallet?.balance?.toLocaleString() || '0'}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-premium rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Coins className="w-8 h-8 text-yellow-400 mr-3" />
                    <div>
                      <h3 className="text-lg font-bold text-white">INX Points</h3>
                      <p className="text-gray-400 text-sm">Gaming currency</p>
                    </div>
                  </div>
                  <ArrowDownRight className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {wallet?.inx?.toLocaleString() || '0'} INX
                </div>
              </motion.div>
            </div>

            {/* Transaction Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Transaction Form */}
              <div className="lg:col-span-1">
                <div className="glass-premium rounded-2xl p-6 border border-white/20">
                  <div className="flex mb-6">
                    <button
                      onClick={() => setActiveTab('deposit')}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                        activeTab === 'deposit'
                          ? 'bg-spelinx-primary text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                        activeTab === 'withdraw'
                          ? 'bg-spelinx-secondary text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Withdraw
                    </button>
                  </div>

                  {activeTab === 'deposit' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Amount (₹)</label>
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                          min="10"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">UPI Transaction ID</label>
                        <input
                          type="text"
                          value={txnId}
                          onChange={(e) => setTxnId(e.target.value)}
                          placeholder="Enter UPI transaction ID"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Payment Screenshot</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:bg-spelinx-primary file:text-white file:border-none file:rounded file:px-3 file:py-1 file:mr-3"
                        />
                      </div>

                      <button
                        onClick={handleDeposit}
                        disabled={isProcessing}
                        className="w-full py-3 bg-spelinx-primary hover:bg-spelinx-primary/90 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Submit Deposit
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Amount (₹)</label>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                          min="100"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                        />
                      </div>

                      <button
                        onClick={handleWithdraw}
                        disabled={isProcessing}
                        className="w-full py-3 bg-spelinx-secondary hover:bg-spelinx-secondary/90 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Wallet className="w-4 h-4 mr-2" />
                            Request Withdrawal
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction History */}
              <div className="lg:col-span-2">
                <div className="glass-premium rounded-2xl p-6 border border-white/20 h-full">
                  <div className="flex items-center mb-6">
                    <History className="w-6 h-6 text-spelinx-primary mr-3" />
                    <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No transactions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {transactions.map((transaction) => (
                        <motion.div
                          key={transaction._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              transaction.type === 'deposit'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {transaction.type === 'deposit' ? (
                                <ArrowUpRight className="w-5 h-5" />
                              ) : (
                                <ArrowDownRight className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{transaction.description}</p>
                              <p className="text-gray-400 text-sm">
                                {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.transactionId}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={`font-bold ${
                              transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount}
                            </p>
                            <p className={`text-sm ${
                              transaction.status === 'completed' ? 'text-green-400' :
                              transaction.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {transaction.status}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}