'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeCache } from '@/lib/themeCache'

interface Theme {
  _id: string
  name: string
  description: string
  previewUrl?: string
  themeFile: Record<string, string>
  scope: 'full_site' | 'games_only'
  active: boolean
  purchasedAt: string
}

export default function MyThemesPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null)
  const [previewTimeout, setPreviewTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isLazyLoading, setIsLazyLoading] = useState(false)

  // Lazy loading implementation
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

  // Helper function to apply theme variables
  const applyThemeVariables = (themeFile: any) => {
    for (const [key, value] of Object.entries(themeFile)) {
      if (typeof value === 'object' && value !== null) {
        if (key === 'colors' || key === 'fonts') {
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            document.documentElement.style.setProperty(`--${nestedKey}`, String(nestedValue));
          }
        }
      } else {
        document.documentElement.style.setProperty(`--${key}`, String(value));
      }
    }
  };

  useEffect(() => {
    loadUserThemes()
    // Sync active theme from localStorage on mount
    const activeThemeId = localStorage.getItem('activeTheme')
    if (activeThemeId) {
      const cachedThemeData = localStorage.getItem(`theme_${activeThemeId}`)
      if (cachedThemeData) {
        try {
          const themeObj = JSON.parse(cachedThemeData)
          applyThemeVariables(themeObj)
        } catch (e) {
          console.error('Error applying cached theme:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    // Update localStorage when themes change
    if (themes.length > 0) {
      const activeTheme = themes.find(t => t.active)
      if (activeTheme) {
        localStorage.setItem('activeTheme', activeTheme._id)
        applyThemeVariables(activeTheme.themeFile)
      }
    }
  }, [themes])

  const loadUserThemes = async () => {
    try {
      const token = localStorage.getItem('spelinx_token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      // Check cache first
      const cached = ThemeCache.get(`user_themes_${token}`)
      if (cached) {
        const cachedThemes = (cached as any).themes
        setThemes(cachedThemes)
        
        // Cache theme data in localStorage for immediate access
        cachedThemes.forEach((theme: any) => {
          localStorage.setItem(`theme_${theme._id}`, JSON.stringify(theme.themeFile))
        })
        setLoading(false)
        return
      }

      const response = await fetch('/api/user/themes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setThemes(data.themes)

        // Cache the response
        ThemeCache.set(`user_themes_${token}`, data)

        // Cache theme data in localStorage for immediate access
        data.themes.forEach((theme: any) => {
          localStorage.setItem(`theme_${theme._id}`, JSON.stringify(theme.themeFile))
        })
      } else {
        console.error('Failed to load themes')
      }
    } catch (error) {
      console.error('Error loading themes:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyTheme = async (themeId: string) => {
    try {
      const token = localStorage.getItem('spelinx_token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`/api/user/themes/apply/${themeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)

        // Apply theme to DOM and cache it
        const theme = themes.find(t => t._id === themeId)
        if (theme) {
          applyThemeVariables(theme.themeFile);

          // Cache theme data and set as active
          localStorage.setItem(`theme_${themeId}`, JSON.stringify(theme.themeFile));
          localStorage.setItem('activeTheme', themeId);
        }

        // Reload themes to update active status
        loadUserThemes()
      } else {
        console.error('Failed to apply theme')
      }
    } catch (error) {
      console.error('Error applying theme:', error)
    }
  }

  const previewTheme = (themeId: string) => {
    const theme = themes.find(t => t._id === themeId)
    if (!theme) return

    // Clear any existing timeout
    if (previewTimeout) {
      clearTimeout(previewTimeout)
    }

    // Apply theme temporarily
    applyThemeVariables(theme.themeFile);
    setPreviewThemeId(themeId)

    // Set timeout to revert
    const timeout = setTimeout(() => {
      // Revert to active theme
      const activeTheme = themes.find(t => t.active)
      if (activeTheme) {
        applyThemeVariables(activeTheme.themeFile);
      }
      setPreviewThemeId(null)
    }, 10000)

    setPreviewTimeout(timeout)
  }

  const revertPreview = () => {
    if (previewTimeout) {
      clearTimeout(previewTimeout)
    }
    // Revert to active theme
    const activeTheme = themes.find(t => t.active)
    if (activeTheme) {
      applyThemeVariables(activeTheme.themeFile);
    }
    setPreviewThemeId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark">
        <Header isDarkMode={true} setIsDarkMode={() => {}} />
        <div className="container mx-auto px-6 py-8 pt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass-premium rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                  <Skeleton className="w-24 h-24 mx-auto mb-4 rounded-full" />
                  <Skeleton className="h-6 mb-2 w-3/4 mx-auto" />
                  <Skeleton className="h-4 mb-4 w-full" />
                  <Skeleton className="h-4 mb-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

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
              My Themes
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Manage and apply your purchased themes
            </p>
          </motion.div>

          {themes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-white mb-2">No themes purchased</h3>
              <p className="text-gray-400">Visit the store to buy your first theme!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme, index) => (
                <motion.div
                  key={theme._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-premium rounded-2xl p-6 border border-white/20 hover:border-spelinx-primary/50 transition-all duration-300"
                >
                  <div className="text-center">
                    {theme.previewUrl && (
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-spelinx-primary to-spelinx-secondary flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-2">{theme.name}</h3>
                    <p className="text-gray-400 mb-4">{theme.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${theme.scope === 'full_site' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                        {theme.scope}
                      </span>
                      {theme.active && (
                        <span className="px-2 py-1 rounded-full text-xs bg-spelinx-primary text-white">Active</span>
                      )}
                      {previewThemeId === theme._id && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300">Preview</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {previewThemeId === theme._id ? (
                        <Button
                          onClick={revertPreview}
                          onTouchStart={revertPreview}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white min-h-[44px] touch-manipulation"
                        >
                          Revert
                        </Button>
                      ) : (
                        <Button
                          onClick={() => previewTheme(theme._id)}
                          onTouchStart={() => previewTheme(theme._id)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white min-h-[44px] touch-manipulation"
                        >
                          Preview
                        </Button>
                      )}
                      <Button
                        onClick={() => applyTheme(theme._id)}
                        onTouchStart={() => applyTheme(theme._id)}
                        className="flex-1 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary hover:from-spelinx-primary/90 hover:to-spelinx-secondary/90 min-h-[44px] touch-manipulation"
                      >
                        {theme.active ? 'Active' : 'Apply'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.main>

      <Footer />
    </div>
  )
}