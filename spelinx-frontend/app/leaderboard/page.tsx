'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Target
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LeaderboardEntry {
  id: string
  username: string
  avatar?: string
  score: number
  gamesPlayed: number
  winRate: number
  rank: number
  isPremium: boolean
}

const leaderboardData = [
  {
    id: '1',
    username: 'ProGamer2024',
    avatar: '👑',
    score: 15420,
    gamesPlayed: 89,
    winRate: 94,
    rank: 1,
    isPremium: true
  },
  {
    id: '2',
    username: 'SnakeMaster',
    avatar: '🐍',
    score: 14850,
    gamesPlayed: 76,
    winRate: 91,
    rank: 2,
    isPremium: true
  },
  {
    id: '3',
    username: 'PuzzleQueen',
    avatar: '🧩',
    score: 14200,
    gamesPlayed: 82,
    winRate: 88,
    rank: 3,
    isPremium: true
  },
  {
    id: '4',
    username: 'TetrisKing',
    avatar: '🧱',
    score: 13890,
    gamesPlayed: 71,
    winRate: 85,
    rank: 4,
    isPremium: false
  },
  {
    id: '5',
    username: 'WordWizard',
    avatar: '📚',
    score: 13250,
    gamesPlayed: 65,
    winRate: 82,
    rank: 5,
    isPremium: false
  }
]

const weeklyRewards = [
  { rank: 1, reward: '500 INX + Premium Badge', icon: '🏆' },
  { rank: 2, reward: '300 INX + Rare Skin', icon: '🥈' },
  { rank: 3, reward: '200 INX + Special Avatar', icon: '🥉' },
  { rank: '4-10', reward: '100 INX', icon: '⭐' },
  { rank: '11-50', reward: '50 INX', icon: '🎯' }
]

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('global')
  const [isDarkMode, setIsDarkMode] = useState(true)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark">
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div className="container mx-auto px-6 py-20">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-spelinx-secondary to-spelinx-accent text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Trophy className="w-4 h-4" />
            <span>LEADERBOARD</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent">
              Top Players
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Compete with players worldwide and climb the ranks to earn exclusive rewards
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="glass rounded-lg p-1 flex space-x-1">
            {['global', 'weekly', 'monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-spelinx-primary to-spelinx-secondary text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="glass-premium border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Trophy className="w-5 h-5 mr-2 text-spelinx-primary" />
                  Global Leaderboard
                </CardTitle>
                <CardDescription>
                  Top players ranked by total score and win rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboardData.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg glass hover:glow-premium transition-all duration-300 ${
                        index < 3 ? 'border border-white/30' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(player.rank)}
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{player.avatar}</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white">{player.username}</span>
                              {player.isPremium && (
                                <Crown className="w-4 h-4 text-spelinx-secondary" />
                              )}
                            </div>
                            <div className="text-sm text-gray-400">
                              {player.gamesPlayed} games • {player.winRate}% win rate
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-spelinx-accent">
                          {player.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">points</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Rewards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-premium border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Calendar className="w-5 h-5 mr-2 text-spelinx-secondary" />
                  Weekly Rewards
                </CardTitle>
                <CardDescription>
                  Compete for exclusive weekly prizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyRewards.map((reward, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-3 glass rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{reward.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white">Rank #{reward.rank}</div>
                          <div className="text-xs text-gray-400">{reward.reward}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <div className="text-sm text-gray-400 mb-2">
                    Weekly Reset
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-spelinx-primary">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-semibold">Every Monday</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="glass-premium border-white/20 text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-spelinx-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-sm text-gray-400">Active Players</div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-white/20 text-center">
            <CardContent className="pt-6">
              <Target className="w-8 h-8 text-spelinx-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-sm text-gray-400">Games</div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-white/20 text-center">
            <CardContent className="pt-6">
              <Star className="w-8 h-8 text-spelinx-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">4.9</div>
              <div className="text-sm text-gray-400">Rating</div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-white/20 text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-400">Online</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}