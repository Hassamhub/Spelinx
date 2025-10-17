'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import GameGrid from '@/components/GameGrid'
import Footer from '@/components/Footer'

export default function GamesPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)

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
              SPELINX Games
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose from our collection of premium games and start playing to earn rewards!
            </p>
          </motion.div>

          <GameGrid />
        </div>
      </motion.main>

      <Footer />
    </div>
  )
}
