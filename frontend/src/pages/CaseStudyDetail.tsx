import React from 'react'
import { trackPageView } from '../lib/analytics'
import { useEffect } from 'react'

export default function CaseStudyDetail() {
  useEffect(() => {
    trackPageView(window.location.pathname)
  }, [])

  return (
    <div className="py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Case Study Detail</h1>
        <p>Página de detalle del case study</p>
      </div>
    </div>
  )
}
