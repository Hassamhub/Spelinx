'use client'

import { motion } from 'framer-motion'
import { Crown, Zap, Shield, Star, Check, X, Upload } from 'lucide-react'
import { useState } from 'react'

const premiumFeatures = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'No Ads',
    description: 'Enjoy an uninterrupted gaming experience'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: '2x Rewards',
    description: 'Earn double INX points on all activities'
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: 'Early Access',
    description: 'Be the first to play new games and features'
  },
  {
    icon: <Crown className="w-6 h-6" />,
    title: 'Exclusive Content',
    description: 'Access premium skins, themes, and avatars'
  }
]

const plans = [
  {
    name: 'Monthly',
    price: '₹499',
    period: '30 days',
    features: ['All Premium Features', 'Cancel Anytime', '24/7 Support'],
    popular: false,
    type: 'monthly'
  },
  {
    name: 'Quarterly',
    price: '₹1,200',
    period: '90 days',
    features: ['All Premium Features', '3 Months Access', 'Priority Support', 'Exclusive Events'],
    popular: false,
    savings: 'Save 10%',
    type: 'quarterly'
  },
  {
    name: 'Semi-Annual',
    price: '₹2,200',
    period: '180 days',
    features: ['All Premium Features', '6 Months Access', 'VIP Support', 'Monthly Tournaments'],
    popular: false,
    savings: 'Save 15%',
    type: 'semiAnnual'
  },
  {
    name: 'Yearly',
    price: '₹3,999',
    period: '365 days',
    features: ['All Premium Features', 'Full Year Access', 'Priority Support', 'Exclusive Events', 'Beta Access'],
    popular: true,
    savings: 'Save 20%',
    type: 'yearly'
  },
  {
    name: 'Lifetime',
    price: '₹10,000',
    period: 'Lifetime',
    features: ['All Premium Features', 'Forever Access', 'Legendary Status', 'All Future Features'],
    popular: false,
    savings: 'Save 60%',
    type: 'lifetime'
  }
]

export default function PremiumSection() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [proofImage, setProofImage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const handlePurchase = async (planType: string, retryCount = 0) => {
    setIsProcessing(true)
    try {
      // Get user token
      const token = localStorage.getItem('spelinx_token')
      if (!token) {
        alert('Please login to purchase premium plans')
        window.location.href = '/login'
        return
      }

      // Call initiate payment API with timeout and retry logic
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch('/api/premium/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: planType }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        // Handle non-JSON responses (like HTML error pages)
        throw new Error('Server returned invalid response. Please try again.')
      }

      if (response.ok) {
        const paymentDetails = data.paymentDetails;
        // Find the plan details
        const plan = plans.find(p => p.type === planType);
        setSelectedPlan({ ...plan, ...paymentDetails });
        setShowPaymentModal(true);
      } else {
        // Handle specific error cases
        if (response.status === 429) {
          alert('Too many payment requests. Please wait 5 minutes before trying again.')
        } else if (data.error === 'Invalid token' || response.status === 403) {
          alert('Your session has expired. Please login again.')
          localStorage.removeItem('spelinx_token')
          window.location.href = '/login'
        } else if (response.status >= 500) {
          // Server error - retry once
          if (retryCount < 1) {
            console.log('Server error, retrying...')
            setTimeout(() => handlePurchase(planType, retryCount + 1), 2000)
            return
          }
          alert('Server temporarily unavailable. Please try again in a few minutes.')
        } else {
          alert(data.error || 'Payment initiation failed. Please try again.')
        }
      }
    } catch (error: any) {
      console.error('Purchase error:', error)

      if (error.name === 'AbortError') {
        alert('Request timed out. Please check your connection and try again.')
      } else if (retryCount < 1) {
        // Network error - retry once
        console.log('Network error, retrying...')
        setTimeout(() => handlePurchase(planType, retryCount + 1), 2000)
        return
      } else {
        alert('Network error. Please check your connection and try again.')
      }
    } finally {
      setIsProcessing(false)
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

  const handleSubmitProof = async (retryCount = 0) => {
    if (!proofImage) {
      alert('Please select a payment proof image')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('spelinx_token')

      // Call submit proof API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout for file upload

      const response = await fetch('/api/premium/submit-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionId: selectedPlan.transactionId,
          proofImage,
          planType: selectedPlan.type
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error('Server returned invalid response. Please try again.')
      }

      if (response.ok) {
        alert('Payment proof submitted successfully! Admin will verify within 2-3 hours.')
        setShowPaymentModal(false)
        setProofImage('')
        setSelectedPlan(null)
      } else {
        // Handle specific error cases
        if (response.status === 429) {
          alert('Too many payment requests. Please wait 5 minutes before trying again.')
        } else if (response.status >= 500 && retryCount < 1) {
          // Server error - retry once
          console.log('Server error, retrying...')
          setTimeout(() => handleSubmitProof(retryCount + 1), 3000)
          return
        } else {
          alert(data.error || 'Failed to submit proof. Please try again.')
        }
      }
    } catch (error: any) {
      console.error('Submit proof error:', error)

      if (error.name === 'AbortError') {
        alert('Request timed out. Please try again with a smaller image.')
      } else if (retryCount < 1) {
        // Network error - retry once
        console.log('Network error, retrying...')
        setTimeout(() => handleSubmitProof(retryCount + 1), 3000)
        return
      } else {
        alert('Failed to submit proof. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-black/20">
        <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-spelinx-secondary to-spelinx-accent text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Crown className="w-4 h-4" />
            <span>SPELINX PLUS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-spelinx-secondary to-spelinx-accent bg-clip-text text-transparent">
              Unlock Premium Gaming
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Elevate your gaming experience with exclusive features and enhanced rewards
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="glass rounded-xl p-6 text-center group hover:glow-effect transition-all duration-300"
            >
              <div className="text-spelinx-secondary mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-spelinx-secondary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto items-end">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'md:scale-105 lg:scale-110' : ''} flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-spelinx-secondary to-spelinx-accent text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-xl border-2 border-white/30 backdrop-blur-sm">
                    ⭐ Most Popular
                  </div>
                </div>
              )}

              <div className={`glass rounded-2xl p-8 min-h-[500px] flex flex-col justify-between hover:glow-effect transition-all duration-300 ${
                plan.popular ? 'border-2 border-spelinx-secondary' : ''
              }`}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-spelinx-secondary mb-1">{plan.price}</div>
                  <div className="text-gray-400 text-sm">{plan.period}</div>
                  {plan.savings && (
                    <div className="text-spelinx-accent text-sm font-semibold mt-2">{plan.savings}</div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-spelinx-secondary flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePurchase(plan.type)}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'gradient-border group'
                      : 'glass hover:glow-effect'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {plan.popular ? (
                    <div className="bg-gradient-to-r from-spelinx-secondary to-spelinx-accent rounded-[10px] py-4 -m-1">
                      <span className="text-white">
                        {isProcessing ? 'Processing...' : 'Get Started'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-white">
                      {isProcessing ? 'Processing...' : 'Choose Plan'}
                    </span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Spinning Wheel Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🎡</div>
            <h3 className="text-2xl font-bold text-white mb-2">Daily Spinning Wheel</h3>
            <p className="text-gray-300 mb-4">
              Premium members get exclusive access to our daily spinning wheel with amazing rewards!
            </p>
            <div className="text-spelinx-secondary font-semibold">
              Available only for SPELINX Plus members
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Payment Modal */}
    {showPaymentModal && selectedPlan && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Complete Payment</h3>
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setProofImage('');
                setSelectedPlan(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Plan Details */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <h4 className="text-lg font-semibold text-white mb-2">{selectedPlan.name}</h4>
            <p className="text-spelinx-secondary font-bold text-xl">{selectedPlan.price}</p>
            <p className="text-gray-400 text-sm">{selectedPlan.period}</p>
          </div>

          {/* Enhanced QR Code Display */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-8 mb-6 text-center shadow-lg border border-gray-200">
            <div className="relative">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-spelinx-primary/10 to-spelinx-secondary/10 rounded-xl"></div>

              {/* QR Code Container */}
              <div className="relative w-56 h-56 bg-white mx-auto mb-4 flex items-center justify-center rounded-2xl shadow-inner border-4 border-gray-100 overflow-hidden">
                {selectedPlan.qrData ? (
                  <>
                    {/* Corner decorations */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-spelinx-primary rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-spelinx-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-spelinx-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-spelinx-primary rounded-br-lg"></div>

                    <div
                      className="block cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        // Copy UPI URI to clipboard for manual opening
                        navigator.clipboard.writeText(selectedPlan.qrData).then(() => {
                          alert('UPI payment link copied! Open your UPI app and paste this link:\n\n' + selectedPlan.qrData);
                        }).catch(() => {
                          // Fallback - try to open directly
                          window.location.href = selectedPlan.qrData;
                        });
                      }}
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedPlan.qrData)}&color=1A1A1A&bgcolor=FFFFFF&margin=4`}
                        alt="UPI QR Code - Click to open UPI app"
                        className="w-44 h-44 object-contain rounded-lg hover:scale-105 transition-transform"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-spelinx-primary to-spelinx-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Generating QR Code...</p>
                    <p className="text-gray-400 text-sm mt-1">📱 Scan with UPI app</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info Card */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-gray-800 font-semibold text-sm">PAYMENT READY</p>
              </div>

              {/* Merchant Info */}
              <div className="mb-3">
                <p className="text-gray-600 font-medium text-xs mb-1">Merchant</p>
                <p className="text-gray-800 font-semibold text-sm">{selectedPlan.merchantName || 'SPELINX Gaming'}</p>
              </div>

              {/* UPI ID */}
              <p className="text-gray-600 font-medium mb-1 text-xs">UPI ID</p>
              <p className="text-gray-800 font-mono text-sm bg-white px-3 py-2 rounded-lg border break-all mb-3">{selectedPlan.upiId}</p>

              {/* Amount */}
              <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-3">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-green-600 text-lg">₹{selectedPlan.amount}</span>
              </div>

              {/* QR Instructions */}
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

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-blue-500/30">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPlan.qrData).then(() => {
                      alert('✅ UPI payment link copied!\n\n📱 Paste this in your UPI app to pay:\n' + selectedPlan.qrData);
                    }).catch(() => {
                      navigator.clipboard.writeText(selectedPlan.upiId).then(() => {
                        alert('✅ UPI ID copied!\n\n📱 Use this in your UPI app: ' + selectedPlan.upiId);
                      });
                    });
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
            onClick={() => handleSubmitProof()}
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
  </>
  )
}