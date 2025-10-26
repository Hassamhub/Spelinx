'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Palette, Bell, Shield, Save, Users } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

interface UserProfile {
  name: string
  email: string
  avatar?: string
  theme?: string
  referralCode?: string
}

interface Settings {
  theme: string
  notifications: boolean
  soundEffects: boolean
  animations: boolean
}

interface Theme {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
}

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    notifications: true,
    soundEffects: true,
    animations: true
  })
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [themes, setThemes] = useState<Theme[]>([])
  const [loadingThemes, setLoadingThemes] = useState(true)
  const [avatars, setAvatars] = useState<Theme[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(true)

  useEffect(() => {
    loadUserProfile()
    loadSettings()
    loadThemes()
    loadAvatars()
  }, [])

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('spelinx_token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const userTheme = data.user.theme || 'default'
        setUser({
          name: data.user.username,
          email: data.user.email,
          avatar: data.user.avatar,
          theme: userTheme,
          referralCode: data.user.referralCode
        })
        applyTheme(userTheme)
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        setIsDarkMode(parsed.theme === 'dark')
      } catch (error) {
        console.error('Failed to parse settings:', error)
      }
    }
  }

  const loadThemes = async () => {
    try {
      const response = await fetch('/api/store?category=themes')
      const data = await response.json()
      if (data.success) {
        setThemes(data.items)
      }
    } catch (error) {
      console.error('Failed to load themes:', error)
    } finally {
      setLoadingThemes(false)
    }
  }

  const loadAvatars = async () => {
    try {
      const token = localStorage.getItem('spelinx_token')
      const response = await fetch('/api/user/avatars', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      })
      const data = await response.json()
      if (response.ok && (data.items || data.avatars)) {
        setAvatars(data.items || data.avatars)
      } else {
        setAvatars([])
      }
    } catch (error) {
      console.error('Failed to load avatars:', error)
      setAvatars([])
    } finally {
      setLoadingAvatars(false)
    }
  }

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateProfile = async () => {
    setIsUpdating(true)
    try {
      const token = localStorage.getItem('spelinx_token')
      if (!token) {
        alert('Please login first')
        return
      }

      // Get form values
      const usernameInput = document.querySelector('input[placeholder="Enter username"]') as HTMLInputElement
      const emailInput = document.querySelector('input[placeholder="Enter email"]') as HTMLInputElement
      const themeSelect = document.querySelector('select') as HTMLSelectElement
      const avatarSelect = document.querySelector('select[defaultValue]') as HTMLSelectElement
      const avatarInput = document.querySelector('input[placeholder="Enter custom avatar URL"]') as HTMLInputElement

      const selectedTheme = themeSelect?.value

      // Check if the selected theme is a premium theme and if user has purchased it
      if (selectedTheme && selectedTheme !== 'default' && selectedTheme !== 'dark' && selectedTheme !== 'light') {
        // For premium themes, redirect to store for purchase
        alert(`To use ${selectedTheme}, please purchase it from the store.`)
        window.location.href = '/store?category=themes'
        return
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: usernameInput?.value,
          email: emailInput?.value,
          theme: selectedTheme,
          avatar: avatarSelect?.value === 'custom' ? avatarInput?.value : avatarSelect?.value
        })
      })

      if (response.ok) {
        alert('Profile updated successfully!')
        // Sync localStorage with DB
        const updatedSettings = { ...settings, theme: selectedTheme || 'default' }
        localStorage.setItem('settings', JSON.stringify(updatedSettings))
        setSettings(updatedSettings)
        loadUserProfile() // Reload profile
        applyTheme(selectedTheme || 'default')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const applyTheme = (theme: string) => {
    const root = document.documentElement
    switch (theme) {
      case 'dark':
        setIsDarkMode(true)
        root.style.setProperty('--theme-primary', '#8B5CF6')
        root.style.setProperty('--theme-secondary', '#F59E0B')
        root.style.setProperty('--theme-accent', '#EF4444')
        break
      case 'light':
        setIsDarkMode(false)
        root.style.setProperty('--theme-primary', '#8B5CF6')
        root.style.setProperty('--theme-secondary', '#F59E0B')
        root.style.setProperty('--theme-accent', '#EF4444')
        break
      case 'Dark Nebula Theme':
        setIsDarkMode(true)
        root.style.setProperty('--theme-primary', '#9333EA')
        root.style.setProperty('--theme-secondary', '#7C3AED')
        root.style.setProperty('--theme-accent', '#EC4899')
        break
      case 'Cyber Green Theme':
        setIsDarkMode(true)
        root.style.setProperty('--theme-primary', '#10B981')
        root.style.setProperty('--theme-secondary', '#059669')
        root.style.setProperty('--theme-accent', '#34D399')
        break
      case 'Ocean Blue Theme':
        setIsDarkMode(false)
        root.style.setProperty('--theme-primary', '#3B82F6')
        root.style.setProperty('--theme-secondary', '#1D4ED8')
        root.style.setProperty('--theme-accent', '#60A5FA')
        break
      default:
        setIsDarkMode(true)
        root.style.setProperty('--theme-primary', '#8B5CF6')
        root.style.setProperty('--theme-secondary', '#F59E0B')
        root.style.setProperty('--theme-accent', '#EF4444')
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem('settings', JSON.stringify(settings))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spelinx-primary"></div>
      </div>
    )
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
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              Account Settings
            </h1>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Profile Settings */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center mb-6">
                  <User className="w-6 h-6 text-spelinx-primary mr-3" />
                  <h2 className="text-xl font-bold text-white">Profile</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Username</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 dark-select"
                      placeholder="Enter username"
                      defaultValue={user?.name || ''}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 dark-select"
                      placeholder="Enter email"
                      defaultValue={user?.email || ''}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Theme</label>
                    <select
                      className="w-full px-4 py-3 dark-select"
                      defaultValue={user?.theme || 'default'}
                    >
                      <option value="default" className="bg-gray-800 text-white">Default</option>
                      <option value="dark" className="bg-gray-800 text-white">Dark</option>
                      <option value="light" className="bg-gray-800 text-white">Light</option>
                      {themes.map((theme) => (
                        <option key={theme._id} value={theme.name} className="bg-gray-800 text-white">
                          {theme.name} (₹{theme.price})
                        </option>
                      ))}
                    </select>
                    <p className="text-gray-400 text-sm mt-1">
                      Premium themes require purchase from the store.
                    </p>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Avatar</label>
                    <select
                      className="w-full px-4 py-3 dark-select mb-2"
                      defaultValue={user?.avatar || ''}
                      onChange={(e) => {
                        const avatarInput = document.querySelector('input[placeholder="Enter custom avatar URL"]') as HTMLInputElement
                        if (e.target.value === 'custom') {
                          avatarInput.style.display = 'block'
                          avatarInput.focus()
                        } else {
                          avatarInput.style.display = 'none'
                          avatarInput.value = e.target.value
                        }
                      }}
                    >
                      <option value="" className="bg-gray-800 text-white">Default Avatar</option>
                      {avatars.map((avatar) => (
                        <option key={avatar._id} value={avatar.image || avatar._id} className="bg-gray-800 text-white">
                          {avatar.name}
                        </option>
                      ))}
                      <option value="custom" className="bg-gray-800 text-white">Custom URL</option>
                    </select>
                    <input
                      type="text"
                      className="w-full px-4 py-3 dark-select hidden"
                      placeholder="Enter custom avatar URL"
                      defaultValue=""
                    />
                    <p className="text-gray-400 text-sm mt-1">
                      Select a purchased avatar or enter a custom URL.
                    </p>
                  </div>

                  <button
                    onClick={updateProfile}
                    disabled={isUpdating}
                    className="w-full py-3 bg-spelinx-primary hover:bg-spelinx-primary/90 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </motion.div>

              {/* Referral Settings */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center mb-6">
                  <Users className="w-6 h-6 text-spelinx-primary mr-3" />
                  <h2 className="text-xl font-bold text-white">Referral Program</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Your Referral Code</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-center"
                        value={user?.referralCode || 'Loading...'}
                        readOnly
                      />
                      <button
                        onClick={() => {
                          if (user?.referralCode) {
                            navigator.clipboard.writeText(user.referralCode)
                            alert('Referral code copied to clipboard!')
                          }
                        }}
                        className="px-4 py-3 bg-spelinx-primary hover:bg-spelinx-primary/90 rounded-lg text-white font-semibold transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Share this code with friends to earn referral rewards!
                    </p>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Referral Link</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                        value={user?.referralCode ? `${window.location.origin}/signup?ref=${user.referralCode}` : 'Loading...'}
                        readOnly
                      />
                      <button
                        onClick={() => {
                          if (user?.referralCode) {
                            const link = `${window.location.origin}/signup?ref=${user.referralCode}`
                            navigator.clipboard.writeText(link)
                            alert('Referral link copied to clipboard!')
                          }
                        }}
                        className="px-4 py-3 bg-spelinx-primary hover:bg-spelinx-primary/90 rounded-lg text-white font-semibold transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Share this link with friends to invite them with your referral code.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Appearance Settings */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center mb-6">
                  <Palette className="w-6 h-6 text-spelinx-primary mr-3" />
                  <h2 className="text-xl font-bold text-white">Appearance</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Dark Mode</span>
                    <button
                      onClick={() => {
                        const newMode = !isDarkMode
                        setIsDarkMode(newMode)
                        updateSetting('theme', newMode ? 'dark' : 'light')
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDarkMode ? 'bg-spelinx-primary' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDarkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white">Animations</span>
                    <button
                      onClick={() => updateSetting('animations', !settings.animations)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.animations ? 'bg-spelinx-primary' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.animations ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Notification Settings */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center mb-6">
                  <Bell className="w-6 h-6 text-spelinx-primary mr-3" />
                  <h2 className="text-xl font-bold text-white">Notifications</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Push Notifications</span>
                    <button
                      onClick={() => updateSetting('notifications', !settings.notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications ? 'bg-spelinx-primary' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white">Sound Effects</span>
                    <button
                      onClick={() => updateSetting('soundEffects', !settings.soundEffects)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.soundEffects ? 'bg-spelinx-primary' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Security Settings */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center mb-6">
                  <Shield className="w-6 h-6 text-spelinx-primary mr-3" />
                  <h2 className="text-xl font-bold text-white">Security</h2>
                </div>

                <div className="space-y-4">
                  <button className="w-full py-3 bg-spelinx-secondary hover:bg-spelinx-secondary/90 rounded-lg text-white font-semibold transition-colors">
                    Change Password
                  </button>

                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors">
                    Enable 2FA
                  </button>

                  <button className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition-colors">
                    Download My Data
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Save Settings */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center mt-8"
            >
              <button
                onClick={saveSettings}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-spelinx-primary to-spelinx-secondary hover:from-spelinx-primary/90 hover:to-spelinx-secondary/90 rounded-lg text-white font-semibold transition-all duration-300 glow-effect"
              >
                <Save className="w-5 h-5 mr-2" />
                Save All Settings
              </button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
