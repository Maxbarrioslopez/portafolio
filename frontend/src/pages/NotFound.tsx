import React from 'react'
import { useEffect } from 'react'
import { trackPageView } from '../lib/analytics'

export default function NotFound() {
  useEffect(() => {
    trackPageView('/404')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600">Página no encontrada</p>
      </div>
    </div>
  )
}
