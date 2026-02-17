import React from 'react'
import { trackPageView, trackFormSubmit } from '../lib/analytics'
import { useEffect } from 'react'

export default function Contact() {
  useEffect(() => {
    trackPageView('/contact')
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    trackFormSubmit('/contact', 'contact')
  }

  return (
    <div className="py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-12">Contacto</h1>
        <form onSubmit={handleSubmit} className="card p-8">
          <p>Formulario de contacto</p>
        </form>
      </div>
    </div>
  )
}
