'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const games = [
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game with modern twist',
    icon: '🐍',
    category: 'Arcade',
    players: '2.1K',
    rating: 4.8,
    difficulty: ['Easy', 'Medium', 'Hard', 'Master'],
    premium: false
  },
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    description: 'Strategic mind game',
    icon: '⭕',
    category: 'Strategy',
    players: '1.8K',
    rating: 4.6,
    difficulty: ['Easy', 'Medium', 'Hard', 'Master'],
    premium: false
  },
  {
    id: '2048',
    name: '2048',
    description: 'Number puzzle game',
    icon: '🔢',
    category: 'Puzzle',
    players: '3.2K',
    rating: 4.9,
    difficulty: ['Easy', 'Medium', 'Hard', 'Master'],
    premium: false
  },
  {
    id: 'tetris',
    name: 'Tetris',
    description: 'Classic block stacking game',
    icon: '🧱',
    category: 'Puzzle',
    players: '4.1K',
    rating: 4.7,
    difficulty: ['Easy', 'Medium', 'Hard', 'Master'],
    premium: false
  },
  {
    id: 'crossword',
    name: 'Crossword',
    description: 'Word puzzle challenge',
    icon: '📝',
    category: 'Puzzle',
    players: '1.5K',
    rating: 4.5,
    difficulty: ['Easy', 'Medium', 'Hard', 'Master'],
    premium: false
  },
  {
    id: 'guesstheflag',
    name: 'Guess the Flag',
    description: 'Test your geography knowledge',
    icon: '🏁',
    category: 'Trivia',
    players: '2.8K',
    rating: 4.6,
    difficulty: ['Easy', 'Medium', 'Hard', 'Master'],
    premium: false
  }
]

export default function GameGrid() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent">
              Featured Games
            </span>
          </h2>
          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Discover our collection of premium games designed for endless entertainment
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className="glass-premium border-white/20 hover:glow-premium transition-all duration-500 cursor-pointer h-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl sm:text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {game.icon}
                    </div>
                    {game.premium && (
                      <div className="bg-gradient-to-r from-spelinx-secondary to-spelinx-accent text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                        PREMIUM
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-gradient transition-all duration-300">
                    {game.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm sm:text-base">
                    {game.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Game Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="flex items-center space-x-1 bg-white/5 rounded-full px-2 py-1">
                        <Star className="w-4 h-4 text-spelinx-accent fill-current" />
                        <span className="text-sm text-gray-300 font-medium">{game.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-white/5 rounded-full px-2 py-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300 font-medium">{game.players}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start space-y-1">
                      <div className="text-xs text-gray-400 font-medium">Difficulty</div>
                      <div className="flex flex-wrap gap-1">
                        {game.difficulty.map((level, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-gradient-to-r from-spelinx-primary/20 to-spelinx-secondary/20 rounded-full text-white font-medium border border-white/10">
                            {level}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category Badge and Play Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-spelinx-primary font-semibold bg-gradient-to-r from-spelinx-primary/10 to-spelinx-secondary/10 px-3 py-1 rounded-full border border-spelinx-primary/20">
                      {game.category}
                    </span>

                    <Link href={`/games/${game.id}`}>
                      <Button
                        variant="gradient"
                        size="sm"
                        className="group/btn hover:scale-105 transition-transform duration-200 min-h-[44px] min-w-[44px] touch-manipulation"
                      >
                        <Play className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                        Play
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-10 sm:mt-12"
        >
          <Link href="/games">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-3 sm:py-4 glass rounded-lg text-white font-semibold hover:glow-effect transition-all duration-300 min-h-[44px] min-w-[44px]"
            >
              View All Games
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}