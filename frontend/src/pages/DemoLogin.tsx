import React, { useEffect, useState } from 'react'
import { loginAsDemo } from '../lib/apiClient'
import { setTokens } from '../lib/auth'
import { trackPageView } from '../lib/analytics'
import { useNavigate } from 'react-router-dom'

export default function DemoLogin() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    trackPageView('/demo/login')
  }, [])

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      const { data } = await loginAsDemo()
      setTokens(data.access, data.refresh)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error logging in:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container max-w-md mx-auto px-4">
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-4 text-center">Demo Dashboard</h1>
          <p className="text-gray-600 text-center mb-8">
            Accede como usuario invitado para explorar el dashboard. Solo lectura.
          </p>
          
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Entrando...' : 'Entrar como Invitado'}
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-6">
            Esta es una cuenta de demostración. Los datos son públicos.
          </p>
        </div>
      </div>
    </div>
  )
}
