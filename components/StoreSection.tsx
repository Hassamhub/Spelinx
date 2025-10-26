'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Crown, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

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
}

export default function StoreSection() {
  const [items, setItems] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStoreItems = async () => {
      try {
        // Load non-premium items only for home page
        const [skinsResponse, themesResponse, avatarsResponse] = await Promise.all([
          fetch('/api/store?category=skins'),
          fetch('/api/themes'),
          fetch('/api/store?category=avatars')
        ])

        const skinsData = await skinsResponse.json()
        const themesData = await themesResponse.json()
        const avatarsData = await avatarsResponse.json()

        if (skinsData.success && themesData.success && avatarsData.success) {
          const themesItems = (themesData.themes || []).map((theme: any) => ({
            _id: theme._id,
            name: theme.name,
            description: theme.description,
            price: theme.price,
            category: 'themes',
            image: theme.previewUrl,
            themeFile: theme.themeFile,
            scope: theme.scope
          }))
          const allItems = [
            ...(skinsData.items || []),
            ...themesItems,
            ...(avatarsData.items || [])
          ]
          // Show only first 6 items for home page
          setItems(allItems.slice(0, 6))
        }
      } catch (error) {
        console.error('Failed to load store items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStoreItems()
  }, [])

  const handlePurchase = async (itemId: string) => {
    // Redirect to store page for purchase
    window.location.href = '/store'
  }

  return (
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
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <ShoppingBag className="w-4 h-4" />
            <span>SPELINX STORE</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent">
              Customize Your Experience
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Discover premium skins, themes, avatars, and exclusive items to enhance your gaming journey
          </p>
          <Link
            href="/store"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Explore Store
          </Link>
        </motion.div>

        {/* Store Items Grid */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spelinx-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 text-center group hover:glow-effect transition-all duration-300"
              >
                {/* Item Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-spelinx-primary to-spelinx-secondary flex items-center justify-center">
                  {item.category === 'themes' && <Star className="w-8 h-8 text-white" />}
                  {item.category === 'avatars' && <Crown className="w-8 h-8 text-white" />}
                  {item.category === 'skins' && <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>}
                  {item.category === 'premium' && <Crown className="w-8 h-8 text-yellow-400" />}
                </div>

                {/* Item Details */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-spelinx-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Price */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {item.isPremium ? (
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-spelinx-accent">₹{item.price}</span>
                      <span className="text-xs text-gray-400">{item.period}</span>
                      {item.savings && (
                        <span className="text-xs text-green-400 font-semibold">{item.savings}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      {item.discountPercentage && item.discountPercentage > 0 ? (
                        <>
                          <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                          <span className="text-2xl font-bold text-spelinx-accent">₹{item.price}</span>
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                            -{item.discountPercentage}%
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-spelinx-accent">₹{item.price}</span>
                      )}
                    </>
                  )}
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(item._id)}
                  className="w-full py-2 px-4 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  {item.isPremium ? 'Choose Plan' : 'Purchase'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/store"
            className="inline-flex items-center px-8 py-3 border border-spelinx-primary text-spelinx-primary font-semibold rounded-full hover:bg-spelinx-primary hover:text-white transition-all duration-300"
          >
            View All Items
          </Link>
        </motion.div>
      </div>
    </section>
  )
}