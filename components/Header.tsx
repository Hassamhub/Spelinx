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

  useEffect(() => {
    // Close menu on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest('.user-menu')) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

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
            <Link href="/" className={`hover:text-spelinx-primary transition-colors font-medium relative group min-h-[44px] flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/games" className={`hover:text-spelinx-primary transition-colors font-medium relative group min-h-[44px] flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Games
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/store" className={`hover:text-spelinx-primary transition-colors font-medium relative group min-h-[44px] flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Store
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/leaderboard" className={`hover:text-spelinx-primary transition-colors font-medium relative group min-h-[44px] flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Games Leaderboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/referrals/leaderboard" className={`hover:text-spelinx-primary transition-colors font-medium relative group min-h-[44px] flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Referral Leaderboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {isLoggedIn && (
              <Link href="/my-themes" className={`hover:text-spelinx-primary transition-colors font-medium relative group min-h-[44px] flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                My Themes
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            {isLoggedIn && (
              <Link href="/referral" className={`hover:text-spelinx-primary transition-colors font-medium relative group min-h-[44px] flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Referral
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            <Link href="/about" className={`hover:text-spelinx-primary transition-colors font-medium relative group min-h-[44px] flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spelinx-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onTouchStart={(e) => {
                e.preventDefault()
                setIsMenuOpen(!isMenuOpen)
              }}
              className={`p-2 rounded-full glass hover:glow-effect transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isDarkMode ? '' : 'bg-gray-100'
              }`}
            >
              <motion.div className="flex flex-col space-y-1">
                <motion.div
                  animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 5 : 0 }}
                  className={`w-4 h-0.5 ${isDarkMode ? 'bg-white' : 'bg-gray-900'} transition-all`}
                />
                <motion.div
                  animate={{ opacity: isMenuOpen ? 0 : 1 }}
                  className={`w-4 h-0.5 ${isDarkMode ? 'bg-white' : 'bg-gray-900'} transition-all`}
                />
                <motion.div
                  animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -5 : 0 }}
                  className={`w-4 h-0.5 ${isDarkMode ? 'bg-white' : 'bg-gray-900'} transition-all`}
                />
              </motion.div>
            </motion.button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              onTouchStart={(e) => {
                e.preventDefault()
                setIsDarkMode(!isDarkMode)
              }}
              className={`p-2 rounded-full glass hover:glow-effect transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center ${
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
            <div className="relative user-menu">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onTouchStart={(e) => {
                  e.preventDefault()
                  setIsMenuOpen(!isMenuOpen)
                }}
                className={`flex items-center space-x-2 p-2 rounded-full glass hover:glow-effect transition-all duration-300 min-h-[44px] min-w-[44px] justify-center ${
                  isDarkMode ? '' : 'bg-gray-100'
                }`}
              >
                <img
                  src={user?.avatar || "/assets/default-avatar.svg"}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full object-cover"
                />
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t ${
              isDarkMode ? 'border-white/20' : 'border-gray-300'
            }`}
          >
            <div className="px-6 py-4 space-y-4">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className={`block hover:text-spelinx-primary transition-colors font-medium min-h-[44px] flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Home
              </Link>
              <Link href="/games" onClick={() => setIsMenuOpen(false)} className={`block hover:text-spelinx-primary transition-colors font-medium min-h-[44px] flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Games
              </Link>
              <Link href="/store" onClick={() => setIsMenuOpen(false)} className={`block hover:text-spelinx-primary transition-colors font-medium min-h-[44px] flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Store
              </Link>
              <Link href="/leaderboard" onClick={() => setIsMenuOpen(false)} className={`block hover:text-spelinx-primary transition-colors font-medium min-h-[44px] flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Games Leaderboard
              </Link>
              <Link href="/referrals/leaderboard" onClick={() => setIsMenuOpen(false)} className={`block hover:text-spelinx-primary transition-colors font-medium min-h-[44px] flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Referral Leaderboard
              </Link>
              {isLoggedIn && (
                <Link href="/my-themes" onClick={() => setIsMenuOpen(false)} className={`block hover:text-spelinx-primary transition-colors font-medium min-h-[44px] flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  My Themes
                </Link>
              )}
              {isLoggedIn && (
                <Link href="/referral" onClick={() => setIsMenuOpen(false)} className={`block hover:text-spelinx-primary transition-colors font-medium min-h-[44px] flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Referral
                </Link>
              )}
              <Link href="/about" onClick={() => setIsMenuOpen(false)} className={`block hover:text-spelinx-primary transition-colors font-medium min-h-[44px] flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                About
              </Link>
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  )
}