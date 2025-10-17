'use client'

import { useState, useEffect } from 'react'

interface DevSafetyProviderProps {
  children: React.ReactNode
}

export function DevSafetyProvider({ children }: DevSafetyProviderProps) {
  const [isLocked, setIsLocked] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if dev safety is already bypassed
    const devSafetyBypassed = localStorage.getItem('dev_safety_bypassed')
    if (devSafetyBypassed === 'true') {
      setIsAuthenticated(true)
      return
    }

    // Check if it's exactly Oct 20, 2025 or later
    const currentDate = new Date()
    const lockDate = new Date('2025-10-20T00:00:00Z') // October 20, 2025 UTC

    if (currentDate >= lockDate) {
      setIsLocked(true)
    } else {
      setIsAuthenticated(true)
    }
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Obfuscated master key - DO NOT SHARE
    const DEV_PASSWORD = 'SPELINX_MASTER_KEY_zidifm32ncKN2XXEYDH7M'

    if (password === DEV_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('dev_safety_bypassed', 'true')
      setError('')
    } else {
      setError('Incorrect password. Access denied.')
      setPassword('')
    }
  }

  if (!isAuthenticated && isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="glass-dark rounded-2xl p-8 border border-red-500/30 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-2">Developer Access Required</h1>
            <p className="text-red-200 mb-6">
              This application is currently under development maintenance.
              Please enter the developer password to continue.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter developer password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-400"
                required
              />

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Unlock Application
              </button>
            </form>

            <div className="mt-6 text-xs text-gray-400">
              <p>This security measure prevents unauthorized access during development.</p>
              <p className="mt-2">Contact the development team if you need access.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}