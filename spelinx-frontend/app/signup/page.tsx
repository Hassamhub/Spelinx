'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'

export default function SignupPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.register({ username, email, password })
      localStorage.setItem('spelinx_token', response.data.token)
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark'
        : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
    }`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-md mx-auto">
          <div className="glass-premium rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent mb-2">
                Join SPELINX
              </h1>
              <p className="text-gray-400">Create your account and start gaming</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                  placeholder="Create a password"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spelinx-primary"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-center">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-spelinx-primary to-spelinx-secondary hover:from-spelinx-primary/90 hover:to-spelinx-secondary/90"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="text-spelinx-primary hover:text-spelinx-primary/80">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}