import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Shield, Waves } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { user, signIn } = useAuth()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/'

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await signIn(email, password)
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-ocean-800 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
              <Waves className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            HUB Nazionale
          </h1>
          <h2 className="text-xl text-blue-200 mb-4">
            Capitanerie di Porto
          </h2>
          <p className="text-gray-300 text-sm">
            Sistema di Gestione Verbali e Analytics
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="nome.cognome@guardiacostiera.it"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Accesso in corso...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Accedi
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-xs text-gray-300 text-center mb-4">
              Account di dimostrazione:
            </p>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setEmail('admin@maricogecap.it')
                  setPassword('admin123')
                }}
                className="w-full text-left p-2 bg-white/10 rounded text-white hover:bg-white/20 transition-colors duration-200"
              >
                🏛️ MARICOGECAP - admin@maricogecap.it
              </button>
              <button
                onClick={() => {
                  setEmail('direttore@dm.palermo.it')
                  setPassword('direttore123')
                }}
                className="w-full text-left p-2 bg-white/10 rounded text-white hover:bg-white/20 transition-colors duration-200"
              >
                🏢 Direzione Marittima Palermo
              </button>
              <button
                onClick={() => {
                  setEmail('comandante@cp.portoempedocle.it')
                  setPassword('comandante123')
                }}
                className="w-full text-left p-2 bg-white/10 rounded text-white hover:bg-white/20 transition-colors duration-200"
              >
                ⚓ Capitaneria Porto Empedocle
              </button>
              <button
                onClick={() => {
                  setEmail('responsabile@ucm.licata.it')
                  setPassword('responsabile123')
                }}
                className="w-full text-left p-2 bg-white/10 rounded text-white hover:bg-white/20 transition-colors duration-200"
              >
                🏢 UCM Licata
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Sistema sviluppato per le Capitanerie di Porto italiane
          </p>
          <p className="text-xs text-gray-500 mt-1">
            © 2024 - Tutti i diritti riservati
          </p>
        </div>
      </div>
    </div>
  )
}
