'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminAPI } from '@/lib/api'
import { Package, Palette, User, Crown, Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

interface StoreItem {
  _id?: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discountPercentage?: number
  discountExpiry?: string
  category: 'skins' | 'themes' | 'avatars' | 'premium'
  image?: string
  createdAt?: string
  isActive: boolean
}

export default function StoreManagement() {
  const router = useRouter()
  const [items, setItems] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'skins' | 'themes' | 'avatars' | 'premium'>('skins')
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null)
  const [newItem, setNewItem] = useState<StoreItem>({
    name: '',
    description: '',
    price: 0,
    category: selectedCategory,
    isActive: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [themeFile, setThemeFile] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Reset to first page when category or search changes
    setCurrentPage(1)
  }, [selectedCategory, searchTerm])

  useEffect(() => {
    // Update form category when selected category changes
    setNewItem(prev => ({ ...prev, category: selectedCategory }))
  }, [selectedCategory])

  useEffect(() => {
    loadStoreItems(currentPage, selectedCategory, searchTerm)
  }, [currentPage, selectedCategory, searchTerm])

  const loadStoreItems = async (page: number = currentPage, category: string = selectedCategory, search: string = searchTerm) => {
    try {
      setLoading(true)
      const response = await adminAPI.getStoreItems(page, 10, category, search)
      setItems(response.data.items || [])
      setTotalPages(response.data.totalPages || 1)
      setTotalItems(response.data.total || 0)
    } catch (error: any) {
      console.error('Failed to load store items:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        router.push('/login')
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.')
        router.push('/login')
      } else {
        toast.error('Failed to load store items')
        setItems([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    try {
      let imageUrl = ''

      if (imageFile) {
        // Upload image
        const formData = new FormData()
        formData.append('image', imageFile)

        const uploadResponse = await fetch('/api/upload/store-image', {
          method: 'POST',
          body: formData
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        } else {
          throw new Error('Failed to upload image')
        }
      }

      if (selectedCategory === 'themes') {
        // Use admin themes API for themes
        const themeData = {
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          scope: 'full_site', // Default scope
          previewUrl: imageUrl,
          themeFile: JSON.parse(themeFile || '{}')
        }
        await fetch('/api/admin/themes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(themeData)
        })
      } else {
        await adminAPI.createStoreItem({ ...newItem, image: imageUrl })
      }

      loadStoreItems()
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: selectedCategory,
        isActive: true
      })
      setImageFile(null)
      setImagePreview('')
      setThemeFile('')
      toast.success('Item added successfully!')
    } catch (error: any) {
      console.error('Failed to add item:', error)
      toast.error(error.response?.data?.error || 'Failed to add item')
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem?._id) return

    try {
      await adminAPI.updateStoreItem(editingItem._id, editingItem)
      loadStoreItems()
      setIsEditing(false)
      setEditingItem(null)
      toast.success('Item updated successfully!')
    } catch (error: any) {
      console.error('Failed to update item:', error)
      toast.error(error.response?.data?.error || 'Failed to update item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return

    try {
      await adminAPI.deleteStoreItem(itemId)
      loadStoreItems()
      toast.success('Item deleted successfully!')
    } catch (error: any) {
      console.error('Failed to delete item:', error)
      toast.error(error.response?.data?.error || 'Failed to delete item')
    }
  }

  const startEditing = (item: StoreItem) => {
    setEditingItem(item)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditingItem(null)
  }

  const categories = [
    { key: 'skins', label: 'Skins', icon: Palette, color: 'text-purple-400' },
    { key: 'themes', label: 'Themes', icon: Package, color: 'text-blue-400' },
    { key: 'avatars', label: 'Avatars', icon: User, color: 'text-green-400' },
    { key: 'premium', label: 'Premium', icon: Crown, color: 'text-yellow-400' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spelinx-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark">
      {/* Admin Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/20"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent"
            >
              SPELINX ADMIN
            </motion.div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => router.push('/admin/dashboard')}
              >
                Back to Dashboard
              </Button>
              <button
                onClick={() => {
                  localStorage.removeItem('spelinx_token');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 py-8" style={{ paddingTop: '120px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Package className="w-8 h-8 text-spelinx-primary" />
            <h1 className="text-3xl font-bold text-white">Store Management</h1>
          </div>
          <p className="text-gray-400">Manage SPELINX store items, skins, themes, avatars, and premium packages</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center space-x-4 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page when search changes
              }}
              className="pl-4 pr-4 py-2 w-full dark-select"
            />
          </div>

          <div className="text-sm text-gray-400">
            {totalItems} items total
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {categories.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => {
                setSelectedCategory(key as any)
                setCurrentPage(1) // Reset to first page when category changes
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                selectedCategory === key
                  ? 'bg-gradient-to-r from-spelinx-primary to-spelinx-secondary text-white shadow-lg shadow-spelinx-primary/25'
                  : 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-spelinx-primary/30 text-white hover:bg-spelinx-primary/20 hover:border-spelinx-primary/50 backdrop-blur-sm'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Item */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-premium rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-spelinx-primary" />
              Add New {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Item
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 dark-select"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-4 py-2 dark-select resize-none"
                  rows={3}
                  placeholder="Enter item description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price (INX)</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 dark-select"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={newItem.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setNewItem({ ...newItem, isActive: e.target.value === 'active' })}
                  className="w-full px-4 py-2 dark-select"
                >
                  <option value="active" className="dark-select-option">Active</option>
                  <option value="inactive" className="dark-select-option">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImageFile(file)
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setImagePreview(e.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-spelinx-secondary transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">
                        {imagePreview ? 'Image selected' : 'Click to upload image'}
                      </p>
                    </div>
                  </label>
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg mx-auto" />
                    </div>
                  )}
                </div>
              </div>

              {selectedCategory === 'themes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme JSON</label>
                  <textarea
                    value={themeFile}
                    onChange={(e) => setThemeFile(e.target.value)}
                    className="w-full px-4 py-2 dark-select resize-none"
                    rows={5}
                    placeholder='{"primary": "#ff0000", "secondary": "#00ff00"}'
                  />
                </div>
              )}

              <Button
                onClick={handleAddItem}
                className="w-full bg-gradient-to-r from-spelinx-primary to-spelinx-secondary hover:from-spelinx-primary/90 hover:to-spelinx-secondary/90 shadow-lg shadow-spelinx-primary/25"
                disabled={!newItem.name || !newItem.description || newItem.price <= 0 || (selectedCategory === 'themes' && !themeFile)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </motion.div>

          {/* Edit Item */}
          {isEditing && editingItem && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-premium rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Edit className="w-5 h-5 mr-2 text-spelinx-primary" />
                Edit Item
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-4 py-2 dark-select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full px-4 py-2 dark-select resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (INX)</label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 dark-select"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={editingItem.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 dark-select"
                  >
                    <option value="active" className="dark-select-option">Active</option>
                    <option value="inactive" className="dark-select-option">Inactive</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpdateItem}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-600/90 hover:to-green-700/90 shadow-lg shadow-green-500/25"
                    disabled={!editingItem?.name || !editingItem?.description || editingItem?.price <= 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    variant="outline"
                    className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-spelinx-primary/30 text-white hover:bg-spelinx-primary/20 hover:border-spelinx-primary/50 backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Items List */}
          {!isEditing && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-premium rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Current {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Items
              </h3>

              <div className="space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4 border border-spelinx-primary/20 hover:border-spelinx-primary/40 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-white">{item.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
                            item.isActive
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : 'bg-red-500/20 text-red-300 border-red-500/30'
                          }`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-spelinx-accent font-mono font-semibold">₹{item.price}</span>
                          <span className="text-xs text-gray-500">
                            Added: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-white/10"
                          onClick={() => startEditing(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDeleteItem(item._id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No items in this category yet</p>
                    <p className="text-sm">Add your first item using the form</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-sm text-gray-300 font-medium">
                Showing <span className="text-spelinx-primary font-semibold">{items.length}</span> of <span className="text-spelinx-accent font-semibold">{totalItems}</span> items
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-spelinx-primary/30 text-white hover:bg-spelinx-primary/20 hover:border-spelinx-primary/50 disabled:opacity-50 disabled:hover:bg-gray-800/50 transition-all duration-200"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={`min-w-[40px] transition-all duration-200 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-spelinx-primary to-spelinx-secondary text-white shadow-lg shadow-spelinx-primary/25"
                            : "bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-spelinx-primary/30 text-white hover:bg-spelinx-primary/20 hover:border-spelinx-primary/50"
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-spelinx-primary/30 text-white hover:bg-spelinx-primary/20 hover:border-spelinx-primary/50 disabled:opacity-50 disabled:hover:bg-gray-800/50 transition-all duration-200"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}