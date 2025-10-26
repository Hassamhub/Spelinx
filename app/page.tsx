'use client'

import { useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import GameGrid from '../components/GameGrid'
import PremiumSection from '../components/PremiumSection'
import StoreSection from '../components/StoreSection'
import Leaderboard from '../components/Leaderboard'
import Footer from '../components/Footer'

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  return (
    <div className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${
      isDarkMode
        ? 'bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark'
        : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
    }`}>
      {/* Enhanced Glassmorphism Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-animated opacity-20"></div>

        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-spelinx-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-32 right-16 w-96 h-96 bg-spelinx-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-64 h-64 bg-spelinx-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-8 w-48 h-48 bg-spelinx-primary/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.5s' }}></div>

        {/* Glass overlay */}
        <div className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-br from-spelinx-primary/5 via-transparent to-spelinx-secondary/5"></div>
      </div>

      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <main className="relative z-10">
        <Hero />
        <GameGrid />
        <PremiumSection />
        <StoreSection />
        <Leaderboard />
      </main>

      <Footer />
    </div>
  )
}
