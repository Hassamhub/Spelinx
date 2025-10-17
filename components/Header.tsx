'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sun, Moon, User, Settings, LogOut, Users } from 'lucide-react'

interface HeaderProps {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
}

export default function Header({ isDarkMode, setIsDarkMode }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('spelinx_token')
    const userData = localStorage.getItem('spelinx_user')
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        isDarkMode
          ? 'bg-black/80 border-white/20'
          : 'bg-white/80 border-gray-300'
      }`}
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
            <Link href="/" className={`hover:text-spelinx-primary transition-colors font-medium relative group ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/games" className={`hover:text-spelinx-primary transition-colors font-medium relative group ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Games
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/store" className={`hover:text-spelinx-primary transition-colors font-medium relative group ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Store
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/leaderboard" className={`hover:text-spelinx-primary transition-colors font-medium relative group ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Leaderboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {isLoggedIn && (
              <Link href="/referral" className={`hover:text-spelinx-primary transition-colors font-medium relative group ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Referral
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            <Link href="/about" className={`hover:text-spelinx-primary transition-colors font-medium relative group ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
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
              className={`p-2 rounded-full glass hover:glow-effect transition-all duration-300 ${
                isDarkMode ? '' : 'bg-gray-100'
              }`}
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
                className={`flex items-center space-x-2 p-2 rounded-full glass hover:glow-effect transition-all duration-300 ${
                  isDarkMode ? '' : 'bg-gray-100'
                }`}
              >
                <User className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
              </motion.button>

              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border overflow-hidden ${
                    isDarkMode
                      ? 'glass-dark border-white/10'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {isLoggedIn ? (
                    <>
                      <div className={`px-4 py-3 border-b ${
                        isDarkMode ? 'border-white/10' : 'border-gray-200'
                      }`}>
                        <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{user?.username || 'User'}</p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{user?.email || ''}</p>
                      </div>
                      <Link href="/dashboard" className={`flex items-center px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                        isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
                      }`}>
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link href="/referral" className={`flex items-center px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                        isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
                      }`}>
                        <Users className="w-4 h-4 mr-2" />
                        Referral
                      </Link>
                      <Link href="/settings" className={`flex items-center px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                        isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
                      }`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <button onClick={() => {
                        localStorage.removeItem('spelinx_token');
                        localStorage.removeItem('spelinx_user');
                        window.location.href = '/';
                      }} className={`flex items-center w-full px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                        isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
                      }`}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={`px-4 py-3 border-b ${
                        isDarkMode ? 'border-white/10' : 'border-gray-200'
                      }`}>
                        <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Not logged in</p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Login to access all features</p>
                      </div>
                      <Link href="/login" className={`block px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                        isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
                      }`}>
                        Login
                      </Link>
                      <Link href="/signup" className={`block px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                        isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
                      }`}>
                        Sign Up
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}