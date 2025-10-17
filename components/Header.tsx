'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sun, Moon, User, Settings, LogOut } from 'lucide-react'

interface HeaderProps {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
}

export default function Header({ isDarkMode, setIsDarkMode }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/20"
      style={{ transform: 'translateY(0px)' }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent"
          >
            <Link href="/">SPELINX</Link>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-spelinx-primary transition-colors font-medium relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/games" className="text-white hover:text-spelinx-primary transition-colors font-medium relative group">
              Games
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/store" className="text-white hover:text-spelinx-primary transition-colors font-medium relative group">
              Store
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/leaderboard" className="text-white hover:text-spelinx-primary transition-colors font-medium relative group">
              Leaderboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-white hover:text-spelinx-primary transition-colors font-medium relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full glass hover:glow-effect transition-all duration-300"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-400" />
              )}
            </motion.button>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-full glass hover:glow-effect transition-all duration-300"
              >
                <User className="w-5 h-5 text-white" />
              </motion.button>

              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 glass-dark rounded-lg shadow-xl border border-white/10 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">Guest User</p>
                    <p className="text-xs text-gray-400">Please login to access features</p>
                  </div>
                  <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <button onClick={() => {
                    // Handle logout logic here
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }} className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}