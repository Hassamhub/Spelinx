'use client'

import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Crown } from 'lucide-react'

const leaderboardData = [
  {
    rank: 1,
    name: 'ProGamer2024',
    avatar: '👑',
    score: 15420,
    games: 89,
    winRate: 94,
    badge: 'Champion'
  },
  {
    rank: 2,
    name: 'SnakeMaster',
    avatar: '🐍',
    score: 14850,
    games: 76,
    winRate: 91,
    badge: 'Master'
  },
  {
    rank: 3,
    name: 'PuzzleQueen',
    avatar: '🧩',
    score: 14200,
    games: 82,
    winRate: 88,
    badge: 'Expert'
  },
  {
    rank: 4,
    name: 'TetrisKing',
    avatar: '🧱',
    score: 13890,
    games: 71,
    winRate: 85,
    badge: 'Advanced'
  },
  {
    rank: 5,
    name: 'WordWizard',
    avatar: '📚',
    score: 13250,
    games: 65,
    winRate: 82,
    badge: 'Skilled'
  }
]

const weeklyRewards = [
  { rank: 1, reward: '500 INX + Premium Badge', color: 'from-yellow-400 to-yellow-600' },
  { rank: 2, reward: '300 INX + Rare Skin', color: 'from-gray-300 to-gray-500' },
  { rank: 3, reward: '200 INX + Special Avatar', color: 'from-orange-400 to-orange-600' },
  { rank: '4-10', reward: '100 INX', color: 'from-blue-400 to-blue-600' },
  { rank: '11-50', reward: '50 INX', color: 'from-green-400 to-green-600' }
]

export default function Leaderboard() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-spelinx-accent to-yellow-400 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Compete with players worldwide and climb the ranks to earn exclusive rewards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Trophy className="w-6 h-6 text-spelinx-accent mr-2" />
                Top Players
              </h3>

              <div className="space-y-4">
                {leaderboardData.map((player, index) => (
                  <motion.div
                    key={player.rank}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    className={`glass-dark rounded-xl p-4 transition-all duration-300 ${
                      player.rank <= 3 ? 'hover:glow-effect' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rank & Badge */}
                        <div className="flex items-center space-x-3">
                          <div className={`text-2xl ${
                            player.rank === 1 ? 'text-yellow-400' :
                            player.rank === 2 ? 'text-gray-400' :
                            player.rank === 3 ? 'text-orange-600' : 'text-white'
                          } font-bold min-w-[2rem]`}>
                            #{player.rank}
                          </div>
                          <div className="text-3xl">{player.avatar}</div>
                        </div>

                        {/* Player Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-white">{player.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              player.badge === 'Champion' ? 'bg-yellow-500/20 text-yellow-400' :
                              player.badge === 'Master' ? 'bg-purple-500/20 text-purple-400' :
                              player.badge === 'Expert' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {player.badge}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>Games: {player.games}</span>
                            <span>Win Rate: {player.winRate}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-spelinx-primary">
                          {player.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">points</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Weekly Rewards */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Crown className="w-6 h-6 text-spelinx-accent mr-2" />
                Weekly Rewards
              </h3>

              <div className="space-y-4">
                {weeklyRewards.map((reward, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="glass-dark rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${reward.color} flex items-center justify-center text-white text-sm font-bold`}>
                        {reward.rank === 1 ? <Trophy className="w-4 h-4" /> :
                         reward.rank === 2 ? <Medal className="w-4 h-4" /> :
                         reward.rank === 3 ? <Award className="w-4 h-4" /> :
                         '#'}
                      </div>
                      <span className="text-sm font-semibold text-gray-300">
                        Rank {reward.rank}
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium">
                      {reward.reward}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                viewport={{ once: true }}
                className="mt-6 p-4 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary rounded-lg text-center"
              >
                <div className="text-white font-semibold">Weekly Reset</div>
                <div className="text-white/80 text-sm">Every Monday</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}