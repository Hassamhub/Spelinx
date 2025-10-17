'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { storeAPI } from '@/lib/api'

interface StoreItem {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
}

export default function StorePage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [items, setItems] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadStoreItems()
  }, [selectedCategory])

  const loadStoreItems = async () => {
    try {
      const response = await storeAPI.getItems(selectedCategory !== 'all' ? selectedCategory : undefined)
      setItems(response.data || [])
    } catch (error) {
      console.error('Failed to load store items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (itemId: string) => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('spelinx_token')
      if (!token) {
        alert('Please login to purchase items')
        window.location.href = '/login'
        return
      }

      await storeAPI.purchaseItem(itemId, 'wallet')
      alert('Purchase successful!')
      loadStoreItems() // Refresh items
    } catch (error: any) {
      console.error('Purchase failed:', error)
      if (error.response?.status === 401) {
        alert('Please login to purchase items')
        window.location.href = '/login'
      } else if (error.response?.status === 402) {
        alert('Insufficient balance. Please add funds to your wallet.')
      } else {
        alert('Purchase failed. Please try again.')
      }
    }
  }

  const categories = ['all', 'skins', 'themes', 'avatars', 'premium']

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
                  className={`px-4 py-2 rounded-full capitalize transition-all duration-300 ${
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
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-premium rounded-2xl p-6 border border-white/20 hover:border-spelinx-primary/50 transition-all duration-300"
              >
                <div className="text-center">
                  {item.image && (
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-spelinx-primary to-spelinx-secondary flex items-center justify-center">
                      <span className="text-2xl">🎨</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-gray-400 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-spelinx-accent">{item.price} INX</span>
                    <button
                      onClick={() => handlePurchase(item._id)}
                      className="px-6 py-2 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-full text-white font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Purchase
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Transaction History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-premium rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Recent Transactions
            </h3>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">🎨</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">Neon Glow Skin</div>
                      <div className="text-xs text-gray-400">Purchased 2 hours ago</div>
                    </div>
                  </div>
                  <div className="text-spelinx-accent font-bold">-50 INX</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">👑</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">SPELINX Plus Monthly</div>
                      <div className="text-xs text-gray-400">Purchased 1 day ago</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">+25 INX Bonus</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">🎯</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">Daily Check-in Bonus</div>
                      <div className="text-xs text-gray-400">Received 2 days ago</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">+10 INX</div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/20 transition-colors">
                View All Transactions
              </button>
            </div>
          </motion.div>

          {items.length === 0 && (
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
        </div>
      </motion.main>

      <Footer />
    </div>
  )
}
