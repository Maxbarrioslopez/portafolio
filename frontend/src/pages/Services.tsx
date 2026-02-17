import React from 'react'
import { trackPageView } from '../lib/analytics'
import { useEffect } from 'react'

export default function Services() {
  useEffect(() => {
    trackPageView('/services')
  }, [])

  return (
    <div className="py-12">
      <div className="container max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-12">Servicios</h1>
        <p>Página de servicios</p>
      </div>
    </div>
  )
}
