'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Footer from '@/components/Footer'
import { storeAPI, premiumAPI } from '@/lib/api'
import { Upload, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeCache } from '@/lib/themeCache'
import { toast } from 'react-hot-toast'

interface Theme {
  _id: string
  name: string
  description: string
  previewUrl?: string
  themeFile: Record<string, string>
  scope: 'full_site' | 'games_only'
  active: boolean
  purchasedAt: string
}

interface StoreItem {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discountPercentage?: number
  category: string
  image?: string
  isPremium?: boolean
  period?: string
  savings?: string
  type?: string
  owned?: boolean
}


export default function StorePage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [items, setItems] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [proofImage, setProofImage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userThemes, setUserThemes] = useState<Theme[]>([])
  const [isLazyLoading, setIsLazyLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        await loadUserThemes()
        await loadStoreItems()
      } catch (e) {
        console.error('Store load error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedCategory])

  // Lazy loading implementation
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000 && !isLazyLoading && !loading) {
        // Load more items when near bottom
        setIsLazyLoading(true)
        setTimeout(() => setIsLazyLoading(false), 1000)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLazyLoading, loading])

  const loadUserThemes = async () => {
    try {
      const token = localStorage.getItem('spelinx_token')
      if (token) {
        const response = await fetch('/api/user/themes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setUserThemes(data.themes)
        }
      }
    } catch (error) {
      console.error('Failed to load user themes:', error)
    }
  }

  const loadStoreItems = async () => {
    try {
      if (selectedCategory === 'themes') {
        // Check cache using ThemeCache utility
        const cached = ThemeCache.get('themes')
        if (cached) {
          setItems((cached as any).themes?.map((theme: any) => ({
            _id: theme._id,
            name: theme.name,
            description: theme.description,
            price: theme.price,
            category: 'themes',
            image: theme.previewUrl,
            themeFile: theme.themeFile,
            scope: theme.scope,
            owned: userThemes.some(ut => ut._id === theme._id)
          })) || [])
          return
        }

        const response = await fetch('/api/themes')
        const data = await response.json()
        // Cache the response using ThemeCache
        ThemeCache.set('themes', data)

        setItems(data.themes.map((theme: any) => ({
          _id: theme._id,
          name: theme.name,
          description: theme.description,
          price: theme.price,
          category: 'themes',
          image: theme.previewUrl,
          themeFile: theme.themeFile,
          scope: theme.scope,
          owned: userThemes.some(ut => ut._id === theme._id)
        })) || [])
      } else {
        const response = await storeAPI.getItems(selectedCategory !== 'all' ? selectedCategory : undefined)
        setItems(response.data.items || [])
      }
    } catch (error) {
      console.error('Failed to load store items:', error)
    }
  }


  const handlePurchase = async (itemId: string) => {
    try {
      const item = items.find(i => i._id === itemId)
      let response

      if (item?.isPremium && item.type) {
        // Premium subscription
        response = await premiumAPI.initiatePayment(item.type as any)
      } else if (item?.category === 'themes') {
        // Theme purchase
        response = await fetch(`/api/themes/buy/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('spelinx_token')}`
          }
        })
        if (!response.ok) throw new Error('Purchase failed')
        response = await response.json()
      } else {
        // Regular store item
        response = await storeAPI.purchaseItem(itemId, 'wallet')
      }

      setSelectedPlan(response.data.paymentDetails || response.paymentDetails)
      setShowPaymentModal(true)
    } catch (error: any) {
      console.error('Purchase failed:', error)
      if (error.response?.status === 401) {
        toast.error('Please login to purchase items')
        window.location.href = '/login'
      } else {
        toast.error('Purchase failed. Please try again.')
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setProofImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitProof = async () => {
    if (!proofImage || !selectedPlan) {
      toast.error('Please select a payment proof image')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('spelinx_token')
      if (!token) {
        toast.error('Please login first')
        return
      }

      const planType = selectedPlan.type || 'store'

      const response = await fetch('/api/premium/submit-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionId: selectedPlan.transactionId,
          proofImage,
          planType,
          amount: selectedPlan.amount
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Payment proof submitted successfully! Admin will verify within 2-3 hours.')
        setShowPaymentModal(false)
        setProofImage('')
        setSelectedPlan(null)
      } else {
        toast.error(data.error || 'Failed to submit proof. Please try again.')
      }
    } catch (error) {
      console.error('Submit proof error:', error)
      toast.error('Failed to submit proof. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = ['all', 'skins', 'themes', 'avatars', 'premium']

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
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark' : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'}`}>

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
              SPELINX Store
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Customize your gaming experience with premium skins, themes, and exclusive items!
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  onTouchStart={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full capitalize transition-all duration-300 min-h-[44px] min-w-[44px] touch-manipulation ${
                    selectedCategory === category
                      ? 'bg-spelinx-primary text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Store Items Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {loading ? (
              // Enhanced skeleton loaders
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="glass-premium rounded-2xl p-6 border border-white/20">
                  <div className="text-center">
                    <Skeleton className="w-24 h-24 mx-auto mb-4 rounded-full" />
                    <Skeleton className="h-6 mb-2 w-3/4 mx-auto" />
                    <Skeleton className="h-4 mb-4 w-full" />
                    <Skeleton className="h-4 mb-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-premium rounded-2xl p-6 border border-white/20 hover:border-spelinx-primary/50 transition-all duration-300"
                >
                  <div className="text-center relative">
                    {item.image && (
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-spelinx-primary to-spelinx-secondary flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                    )}
                    {item.owned && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">Owned</div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                    <p className="text-gray-400 mb-4">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {item.isPremium ? (
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-spelinx-accent">₹{item.price}</span>
                            <span className="text-sm text-gray-400">{item.period}</span>
                            {item.savings && (
                              <span className="text-xs text-spelinx-accent font-semibold">{item.savings}</span>
                            )}
                          </div>
                        ) : (
                          <>
                            {item.discountPercentage && item.discountPercentage > 0 ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 line-through">{item.originalPrice} INX</span>
                                <span className="text-2xl font-bold text-spelinx-accent">{item.price} INX</span>
                                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                  -{item.discountPercentage}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-2xl font-bold text-spelinx-accent">{item.price} INX</span>
                            )}
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handlePurchase(item._id)}
                        onTouchStart={() => handlePurchase(item._id)}
                        disabled={item.owned}
                        className={`px-6 py-2 rounded-full text-white font-semibold hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px] touch-manipulation ${
                          item.owned
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-spelinx-primary to-spelinx-secondary hover:shadow-lg'
                        }`}
                      >
                        {item.owned ? 'Owned' : (item.isPremium ? 'Choose Plan' : 'Purchase')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

          {items.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-2xl font-bold text-white mb-2">No items found</h3>
              <p className="text-gray-400">Check back later for new items!</p>
            </motion.div>
          )}
          </motion.div>
        </div>
      </motion.main>

      <Footer />

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Complete Payment</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setProofImage('')
                  setSelectedPlan(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Item Details */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">{selectedPlan.itemName}</h4>
              <p className="text-spelinx-secondary font-bold text-xl">₹{selectedPlan.amount}</p>
              <p className="text-gray-400 text-sm">{selectedPlan.category}</p>
            </div>

            {/* QR Code Display */}
            <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-8 mb-6 text-center shadow-lg border border-gray-200">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-spelinx-primary/10 to-spelinx-secondary/10 rounded-xl"></div>
                <div className="relative w-56 h-56 bg-white mx-auto mb-4 flex items-center justify-center rounded-2xl shadow-inner border-4 border-gray-100 overflow-hidden">
                  <div
                    className="block cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPlan.qrData).then(() => {
                        toast.success('UPI payment link copied! Paste in your UPI app to pay.')
                      }).catch(() => {
                        window.location.href = selectedPlan.qrData
                      })
                    }}
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedPlan.qrData)}&color=1A1A1A&bgcolor=FFFFFF&margin=4`}
                      alt="UPI QR Code - Click to open UPI app"
                      className="w-44 h-44 object-contain rounded-lg hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-gray-800 font-semibold text-sm">PAYMENT READY</p>
                </div>

                <div className="mb-3">
                  <p className="text-gray-600 font-medium text-xs mb-1">Merchant</p>
                  <p className="text-gray-800 font-semibold text-sm">{selectedPlan.merchantName}</p>
                </div>

                <p className="text-gray-600 font-medium mb-1 text-xs">UPI ID</p>
                <p className="text-gray-800 font-mono text-sm bg-white px-3 py-2 rounded-lg border break-all mb-3">{selectedPlan.upiId}</p>

                <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-3">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-green-600 text-lg">₹{selectedPlan.amount}</span>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500 mb-2">📱 Tap QR code or copy UPI ID</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedPlan.upiId)}
                    className="text-xs bg-spelinx-primary text-white px-3 py-1 rounded-full hover:bg-spelinx-primary/90 transition-colors"
                  >
                    Copy UPI ID
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
              <h5 className="text-blue-400 font-semibold mb-3">💰 Payment Instructions</h5>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <p className="text-sm text-gray-300">Click the QR code above to copy the payment link, or copy the UPI ID manually</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <p className="text-sm text-gray-300">Open your UPI app (Google Pay, PhonePe, Paytm, etc.)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <p className="text-sm text-gray-300">Paste the copied UPI payment link or enter UPI ID: <span className="font-mono text-blue-300 bg-blue-900/30 px-2 py-1 rounded">{selectedPlan.upiId}</span></p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                  <p className="text-sm text-gray-300">Verify the amount is ₹{selectedPlan.amount} and confirm payment</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</div>
                  <p className="text-sm text-gray-300">Take a screenshot of the successful payment confirmation</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">6</div>
                  <p className="text-sm text-gray-300">Upload the screenshot below and submit for verification</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-500/30">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPlan.qrData).then(() => {
                        toast.success('UPI payment link copied! Paste in your UPI app to pay.')
                      }).catch(() => {
                        navigator.clipboard.writeText(selectedPlan.upiId).then(() => {
                          toast.success('UPI ID copied! Use this in your UPI app.')
                        })
                      })
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    📋 Copy Payment Link
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedPlan.upiId)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    🔢 Copy UPI ID Only
                  </button>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                📸 Upload Payment Proof
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="proof-upload"
                />
                <label
                  htmlFor="proof-upload"
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-spelinx-secondary transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">
                      {proofImage ? 'Proof image selected' : 'Click to upload payment screenshot'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Transaction ID */}
            <div className="bg-gray-800 rounded-xl p-3 mb-6">
              <p className="text-xs text-gray-400 mb-1">Transaction ID</p>
              <p className="text-xs text-gray-300 font-mono break-all">{selectedPlan.transactionId}</p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitProof}
              disabled={!proofImage || isSubmitting}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                proofImage && !isSubmitting
                  ? 'bg-gradient-to-r from-spelinx-primary to-spelinx-secondary hover:from-spelinx-primary/90 hover:to-spelinx-secondary/90 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              ⏰ Admin will verify within 2-3 hours
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
