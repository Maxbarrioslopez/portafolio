import React from 'react'
import { trackPageView, trackFormSubmit } from '../lib/analytics'
import { useEffect } from 'react'

export default function Quote() {
  useEffect(() => {
    trackPageView('/quote')
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    trackFormSubmit('/quote', 'quote_request')
  }

  return (
    <div className="py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-12">Cotizador</h1>
        <form onSubmit={handleSubmit} className="card p-8">
          <p>Formulario de cotización</p>
        </form>
      </div>
    </div>
  )
}
