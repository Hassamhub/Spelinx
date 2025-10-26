'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Palette, Upload, Save, Eye, Trash2 } from 'lucide-react'
import Header from '@/components/Header'
import toast from 'react-hot-toast'

interface Theme {
  _id: string
  name: string
  description: string
  price: number
  scope: 'full_site' | 'games_only'
  previewUrl?: string
  isActive: boolean
  createdAt: string
}

export default function AdminThemesPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isAdmin, setIsAdmin] = useState(true)
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    scope: 'full_site',
    previewImage: null as File | null,
    themeFile: null as File | null
  })

  useEffect(() => {
    checkAdminAccess()
    loadThemes()
  }, [])

  const checkAdminAccess = () => {
    const token = localStorage.getItem('spelinx_token')
    const userData = localStorage.getItem('spelinx_user')

    if (!token || !userData) {
      setIsAdmin(false)
      router.push('/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      if (!user.isAdmin) {
        setIsAdmin(false)
        router.push('/')
        return
      }
      setIsAdmin(true)
    } catch (error) {
      setIsAdmin(false)
      router.push('/login')
    }
  }

  const loadThemes = async () => {
    try {
      const response = await fetch('/api/admin/themes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('spelinx_token')}` }
      })
      const data = await response.json()
      if (data.success) {
        setThemes(data.themes)
      }
    } catch (error) {
      console.error('Failed to load themes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    setFormData(prev => ({ ...prev, [name]: files?.[0] || null }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const uploadData = new FormData()
      uploadData.append('name', formData.name)
      uploadData.append('description', formData.description)
      uploadData.append('price', formData.price)
      uploadData.append('scope', formData.scope)

      if (formData.previewImage) {
        uploadData.append('previewImage', formData.previewImage)
      }

      if (formData.themeFile) {
        uploadData.append('themeFile', formData.themeFile)
      }

      const response = await fetch('/api/themes/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('spelinx_token')}` },
        body: uploadData
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Theme uploaded successfully!')
        loadThemes()
        setFormData({ name: '', description: '', price: '', scope: 'full_site', previewImage: null, themeFile: null })
      } else {
        alert('Failed to upload theme: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload theme. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-red-200">You don't have permission to access this page.</p>
        </div>
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
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Palette className="w-8 h-8 text-spelinx-primary mr-3" />
                <h1 className="text-4xl font-bold text-white">Theme Management</h1>
              </div>
              <p className="text-gray-400">
                Upload and manage custom themes for the platform
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6">Upload New Theme</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Theme Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 dark-select"
                      placeholder="Enter theme name"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 dark-select"
                      placeholder="Describe the theme"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 dark-select"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Scope</label>
                    <select
                      name="scope"
                      value={formData.scope}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 dark-select"
                    >
                      <option value="full_site">Full Site</option>
                      <option value="games_only">Games Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Preview Image</label>
                    <input
                      type="file"
                      name="previewImage"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="w-full px-4 py-3 dark-select"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Theme JSON File</label>
                    <input
                      type="file"
                      name="themeFile"
                      onChange={handleFileChange}
                      accept=".json"
                      required
                      className="w-full px-4 py-3 dark-select"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3 bg-spelinx-primary hover:bg-spelinx-primary/90 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <Upload className="w-5 h-5 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Upload Theme
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Themes List */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6">Existing Themes</h2>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spelinx-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {themes.map((theme) => (
                      <motion.div
                        key={theme._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{theme.name}</h3>
                          <p className="text-gray-400 text-sm">{theme.description}</p>
                          <p className="text-spelinx-primary text-sm">₹{theme.price} - {theme.scope}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {theme.previewUrl && (
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-2 text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}