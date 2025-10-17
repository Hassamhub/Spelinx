'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminAPI } from '@/lib/api'
import { Package, Palette, User, Crown, Plus, Edit, Trash2, Save, X } from 'lucide-react'

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
    category: 'skins',
    isActive: true
  })

  useEffect(() => {
    loadStoreItems()
  }, [selectedCategory])

  const loadStoreItems = async () => {
    try {
      // For demo purposes, load static data since API isn't implemented
      const demoItems: StoreItem[] = [
        {
          _id: '1',
          name: 'Neon Glow Skin',
          description: 'Bright neon effects for your interface',
          price: 50,
          category: 'skins' as const,
          createdAt: '2024-01-15',
          isActive: true
        },
        {
          _id: '2',
          name: 'Dark Knight Theme',
          description: 'Complete dark theme with special effects',
          price: 75,
          category: 'themes' as const,
          createdAt: '2024-01-14',
          isActive: true
        },
        {
          _id: '3',
          name: 'Pixel Master Avatar',
          description: 'Retro pixel art avatar collection',
          price: 30,
          category: 'avatars' as const,
          createdAt: '2024-01-13',
          isActive: true
        },
        {
          _id: '4',
          name: 'SPELINX Plus Monthly',
          description: 'Premium membership with exclusive benefits',
          price: 199,
          category: 'premium' as const,
          createdAt: '2024-01-12',
          isActive: true
        }
      ]
      setItems(demoItems.filter(item => item.category === selectedCategory))
    } catch (error) {
      console.error('Failed to load store items:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    try {
      // For demo purposes, just reload data since API isn't implemented
      loadStoreItems()
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: 'skins',
        isActive: true
      })
      alert('Item added successfully! (Demo mode)')
    } catch (error) {
      console.error('Failed to add item:', error)
      alert('Failed to add item')
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem?._id) return

    try {
      // For demo purposes, just reload data since API isn't implemented
      loadStoreItems()
      setIsEditing(false)
      setEditingItem(null)
      alert('Item updated successfully! (Demo mode)')
    } catch (error) {
      console.error('Failed to update item:', error)
      alert('Failed to update item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      // For demo purposes, just reload data since API isn't implemented
      loadStoreItems()
      alert('Item deleted successfully! (Demo mode)')
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Failed to delete item')
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

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {categories.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                selectedCategory === key
                  ? 'bg-spelinx-primary text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
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
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary resize-none"
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
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                  placeholder="0"
                  min="0"
                />
              </div>

              <Button
                onClick={handleAddItem}
                className="w-full bg-gradient-to-r from-spelinx-primary to-spelinx-secondary hover:from-spelinx-primary/90 hover:to-spelinx-secondary/90"
                disabled={!newItem.name || !newItem.description || newItem.price <= 0}
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
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (INX)</label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                    min="0"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpdateItem}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-600/90 hover:to-green-700/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-spelinx-accent font-mono">{item.price} INX</span>
                          <span className="text-xs text-gray-500">
                            Added: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => startEditing(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
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
        </div>
      </div>
    </div>
  )
}