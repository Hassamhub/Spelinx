'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeCache } from '@/lib/themeCache'

interface LeaderboardEntry {
  _id: string
  username: string
  referralCount: number
}

export default function ReferralLeaderboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isLazyLoading, setIsLazyLoading] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000 && !isLazyLoading && !loading) {
        setIsLazyLoading(true)
        setTimeout(() => setIsLazyLoading(false), 1000)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLazyLoading, loading])

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      // Check cache first
      const cached = ThemeCache.get('leaderboard')
      if (cached) {
        setLeaderboard((cached as any).leaderboard)
        setLoading(false)
        return
      }

      const response = await fetch('/api/referrals/leaderboard')
      const data = await response.json()
      if (data.success) {
        setLeaderboard(data.leaderboard)
        // Cache the response
        ThemeCache.set('leaderboard', data)
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
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
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                <h1 className="text-4xl font-bold text-white">Referral Leaderboard</h1>
              </div>
              <p className="text-gray-400">
                Top referrers by number of successful referrals
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-white/5 border-white/10">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="w-6 h-6" />
                    </div>
                  ))}
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        index < 3
                          ? 'bg-gradient-to-r from-spelinx-primary/20 to-spelinx-secondary/20 border-spelinx-primary/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                          index === 0
                            ? 'bg-yellow-400 text-black'
                            : index === 1
                            ? 'bg-gray-300 text-black'
                            : index === 2
                            ? 'bg-orange-400 text-black'
                            : 'bg-spelinx-primary text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{entry.username}</p>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Users className="w-4 h-4 mr-1" />
                            {entry.referralCount} referrals
                          </div>
                        </div>
                      </div>
                      {index < 3 && (
                        <Trophy className={`w-6 h-6 ${
                          index === 0
                            ? 'text-yellow-400'
                            : index === 1
                            ? 'text-gray-300'
                            : 'text-orange-400'
                        }`} />
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No referrals yet</h3>
                  <p className="text-gray-400">
                    Be the first to appear on the leaderboard by referring friends!
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}